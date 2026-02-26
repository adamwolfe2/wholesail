import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const ClientSchema = z.object({
  name: z.string().min(1, 'name is required'),
  phone: z.string().min(1, 'phone is required'),
  contactPerson: z.string().optional().default(''),
  email: z.string().optional().default(''),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
})

const BodySchema = z.object({
  clients: z.array(ClientSchema).min(1, 'clients array must not be empty'),
})

// POST /api/admin/clients/bulk-import — upsert organizations from a CSV import
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await req.json().catch(() => ({}))
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { clients } = parsed.data
    let created = 0
    let updated = 0
    const errors: string[] = []

    for (const client of clients) {
      try {
        // Normalize phone for lookup — strip all non-digits for comparison
        const phoneDigits = client.phone.replace(/\D/g, '')
        if (phoneDigits.length < 10) {
          errors.push(`Skipped "${client.name}": phone "${client.phone}" is not a valid 10-digit US number`)
          continue
        }

        // Find existing org by phone (match on digits to handle formatting variants)
        const existing = await prisma.organization.findFirst({
          where: {
            OR: [
              { phone: client.phone },
              { phone: phoneDigits },
              { phone: `+1${phoneDigits}` },
              { phone: `1${phoneDigits}` },
            ],
          },
          select: { id: true },
        })

        if (existing) {
          // Update existing org
          await prisma.organization.update({
            where: { id: existing.id },
            data: {
              name: client.name,
              ...(client.contactPerson ? { contactPerson: client.contactPerson } : {}),
              ...(client.email ? { email: client.email } : {}),
              phone: client.phone,
            },
          })
          updated++
        } else {
          // Create new org
          await prisma.organization.create({
            data: {
              name: client.name,
              phone: client.phone,
              contactPerson: client.contactPerson || '',
              email: client.email || '',
            },
          })
          created++
        }
      } catch (rowErr) {
        console.error(`bulk-import row error for "${client.name}":`, rowErr)
        errors.push(`Failed to import "${client.name}": ${rowErr instanceof Error ? rowErr.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({ created, updated, errors })
  } catch (err) {
    console.error('POST /api/admin/clients/bulk-import error:', err)
    return NextResponse.json({ error: 'Failed to process import' }, { status: 500 })
  }
}
