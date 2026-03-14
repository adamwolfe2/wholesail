import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/require-admin'
import { LeadStatus } from '@prisma/client'
import { parseCursorParams, buildPrismaCursorArgs, buildCursorResponse } from '@/lib/pagination'

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAdmin()
  if (error) return error

  void userId

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') as LeadStatus | null
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
    const { name, email, phone, restaurant, source, notes, status } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        restaurant: restaurant?.trim() || null,
        source: source || 'website',
        notes: notes?.trim() || null,
        status: (status as LeadStatus) || 'NEW',
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
