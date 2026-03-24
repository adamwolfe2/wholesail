import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/require-admin'
import { LeadStatus } from '@prisma/client'
import { parseCursorParams, buildPrismaCursorArgs, buildCursorResponse } from '@/lib/pagination'

const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  source: z.string().optional().default('website'),
  notes: z.string().optional().nullable(),
  status: z.nativeEnum(LeadStatus).optional().default('NEW'),
})

const VALID_LEAD_STATUSES = new Set<string>(Object.values(LeadStatus))

function isValidLeadStatus(value: string): value is LeadStatus {
  return VALID_LEAD_STATUSES.has(value)
}

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAdmin()
  if (error) return error

  void userId

  const { searchParams } = new URL(req.url)
  const rawStatus = searchParams.get('status')
  const status: LeadStatus | null = rawStatus && isValidLeadStatus(rawStatus) ? rawStatus : null
  if (rawStatus && !status) {
    return NextResponse.json({ error: `Invalid status. Must be one of: ${[...VALID_LEAD_STATUSES].join(', ')}` }, { status: 400 })
  }
  const { cursor, take } = parseCursorParams(req)

  try {
    const leads = await prisma.lead.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      ...buildPrismaCursorArgs(cursor, take),
    })
    const { data, nextCursor, hasMore } = buildCursorResponse(leads, take)
    return NextResponse.json({ leads: data, nextCursor, hasMore })
  } catch (err) {
    console.error('GET /api/admin/leads error:', err)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAdmin()
  if (error) return error

  try {
    const body = await req.json().catch(() => ({}))
    const parsed = createLeadSchema.safeParse(body)

    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { name, email, phone, company, source, notes, status } = parsed.data

    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        source,
        notes: notes?.trim() || null,
        status,
      },
    })

    await prisma.auditEvent.create({
      data: { entityType: 'Lead', entityId: lead.id, action: 'created', userId },
    })

    return NextResponse.json({ lead }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/leads error:', err)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}
