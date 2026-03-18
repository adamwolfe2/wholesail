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
  clients: z.array(ClientSchema).min(1, 'clients array must not be empty').max(5000, 'Maximum 5000 clients per import'),
})

const MAX_IMPORT_SIZE = 500

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

    if (clients.length > MAX_IMPORT_SIZE) {
      return NextResponse.json(
        { error: `Import size exceeds maximum of ${MAX_IMPORT_SIZE} clients. Please split your file into smaller batches.` },
        { status: 400 }
      )
    }
    let created = 0
    let updated = 0
    const errors: string[] = []

    // Pre-fetch all existing phones in one query to avoid N+1
    const allPhoneDigits = clients
      .map(c => c.phone.replace(/\D/g, ''))
      .filter(d => d.length >= 10)

    const existingOrgs = allPhoneDigits.length > 0
      ? await prisma.organization.findMany({
          where: {
            OR: allPhoneDigits.flatMap(d => [
              { phone: d },
              { phone: `+1${d}` },
              { phone: `1${d}` },
            ]),
          },
          select: { id: true, phone: true },
        })
      : []

    // Build a lookup map from digit-normalized phone → org id
    const phoneToOrgId = new Map<string, string>()
    for (const org of existingOrgs) {
      const digits = org.phone.replace(/\D/g, '')
      phoneToOrgId.set(digits, org.id)
      phoneToOrgId.set(digits.replace(/^1/, ''), org.id) // strip leading country code
    }

    for (const client of clients) {
      try {
        // Normalize phone for lookup — strip all non-digits for comparison
        const phoneDigits = client.phone.replace(/\D/g, '')
        if (phoneDigits.length < 10) {
          errors.push(`Skipped "${client.name}": phone "${client.phone}" is not a valid 10-digit US number`)
          continue
        }

        // Find existing org by pre-fetched phone map
        const existingId = phoneToOrgId.get(phoneDigits) ?? phoneToOrgId.get(phoneDigits.replace(/^1/, ''))
        const existing = existingId ? { id: existingId } : null

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
