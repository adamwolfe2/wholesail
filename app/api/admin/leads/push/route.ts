import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrRep } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { pushContact, isConfigured } from '@/lib/integrations/emailbison'

const schema = z.object({
  // If leadId is provided, we update an existing lead; otherwise create one
  leadId: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().optional().default(''),
  email: z.string().email(),
  company: z.string().optional().default(''),
  website: z.string().url().optional().or(z.literal('').transform(() => undefined)),
  phone: z.string().optional().default(''),
  // Enriched fields
  description: z.string().optional().default(''),
  city: z.string().optional().default(''),
})

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAdminOrRep()
  if (error) return error

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const { leadId, firstName, lastName, email, company, website, phone, description, city } = parsed.data
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  const configured = isConfigured()

  let emailBisonId: string | null = null
  let emailBisonError: string | null = null

  if (configured) {
    try {
      const result = await pushContact({
        email,
        first_name: firstName,
        last_name: lastName || undefined,
        company: company || undefined,
        website: website || undefined,
        phone: phone || undefined,
        description: description || undefined,
        city: city || undefined,
      })
      emailBisonId = result.id ?? null
    } catch (err) {
      emailBisonError = err instanceof Error ? err.message : 'Push failed'
      console.error('EmailBison push error:', err)
    }
  }

  const notesArr = [
    description && `Description: ${description}`,
    city && `City: ${city}`,
  ].filter(Boolean)

  let lead
  if (leadId) {
    lead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        website: website || null,
        ...(emailBisonId ? { emailBisonId, pushedAt: new Date() } : {}),
      },
    })
  } else {
    lead = await prisma.lead.create({
      data: {
        name: fullName,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        company: company || null,
        website: website || null,
        source: 'rep',
        notes: notesArr.join('\n') || null,
        emailBisonId,
        pushedAt: emailBisonId ? new Date() : null,
      },
    })
  }

  await prisma.auditEvent.create({
    data: {
      entityType: 'Lead',
      entityId: lead.id,
      action: emailBisonId ? 'pushed_to_campaign' : 'created',
      userId,
      metadata: { configured, emailBisonId },
    },
  })

  return NextResponse.json({ lead, emailBisonId, emailBisonError, configured }, { status: 201 })
}
