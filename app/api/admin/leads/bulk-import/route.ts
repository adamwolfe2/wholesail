import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrRep } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { pushContact, isConfigured } from '@/lib/integrations/emailbison'

const rowSchema = z.object({
  first_name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional().default(''),
  website: z.string().url().optional().catch(undefined),
})

const bodySchema = z.object({
  // Accept up to 500 rows per batch
  leads: z.array(z.record(z.string())).min(1).max(500),
})

// Normalize flexible CSV headers to canonical keys
function normalizeRow(raw: Record<string, string>): Record<string, string> {
  const norm: Record<string, string> = {}
  for (const [k, v] of Object.entries(raw)) {
    const key = k.toLowerCase().trim().replace(/[\s_\-]+/g, '_')
    norm[key] = String(v || '').trim()
  }
  return {
    first_name:
      norm.first_name || norm.firstname || norm.first || norm.name || norm.contact_name || '',
    email:
      norm.email || norm.email_address || norm.contact_email || '',
    company:
      norm.company || norm.company_name || norm.restaurant || norm.business || norm.business_name || '',
    website:
      norm.website || norm.website_url || norm.url || norm.domain || norm.site || '',
  }
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAdminOrRep()
  if (error) return error

  const body = await req.json().catch(() => ({}))
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input — send { leads: [...] }' }, { status: 400 })
  }

  const configured = isConfigured()
  let imported = 0
  let failed = 0
  let skipped = 0
  const errors: string[] = []

  for (const rawRow of parsed.data.leads) {
    const normalized = normalizeRow(rawRow)
    const rowParsed = rowSchema.safeParse(normalized)

    if (!rowParsed.success) {
      failed++
      const msg = `Invalid row (email: ${normalized.email || 'missing'}): ${rowParsed.error.issues[0]?.message}`
      errors.push(msg)
      continue
    }

    const { first_name, email, company, website } = rowParsed.data
    const emailLower = email.toLowerCase().trim()

    try {
      // Skip duplicates already in DB
      const existing = await prisma.lead.findFirst({
        where: { email: emailLower },
        select: { id: true },
      })
      if (existing) {
        skipped++
        continue
      }

      let emailBisonId: string | null = null
      if (configured) {
        try {
          const result = await pushContact({ email: emailLower, first_name, company, website })
          emailBisonId = result.id ?? null
        } catch (pushErr) {
          errors.push(
            `EmailBison push failed for ${emailLower}: ${pushErr instanceof Error ? pushErr.message : 'unknown'}`
          )
        }
      }

      await prisma.lead.create({
        data: {
          name: first_name,
          email: emailLower,
          restaurant: company || null,
          website: website || null,
          source: 'rep',
          emailBisonId,
          pushedAt: emailBisonId ? new Date() : null,
        },
      })

      imported++
    } catch (err) {
      failed++
      errors.push(`DB error for ${emailLower}: ${err instanceof Error ? err.message : 'unknown'}`)
    }
  }

  await prisma.auditEvent.create({
    data: {
      entityType: 'Lead',
      entityId: 'bulk',
      action: 'bulk_imported',
      userId,
      metadata: { imported, failed, skipped, configured },
    },
  })

  return NextResponse.json({ imported, failed, skipped, errors: errors.slice(0, 20) })
}
