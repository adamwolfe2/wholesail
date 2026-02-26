import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/require-admin'
import { LeadStatus } from '@prisma/client'
import { z } from 'zod'

const leadStatusValues = Object.values(LeadStatus) as [LeadStatus, ...LeadStatus[]]

const patchLeadSchema = z.object({
  status: z.enum(leadStatusValues).optional(),
  notes: z.string().max(5000).nullable().optional(),
  name: z.string().min(1).max(200).optional(),
  phone: z.string().max(50).nullable().optional(),
  restaurant: z.string().max(200).nullable().optional(),
  source: z.string().max(100).nullable().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const parsed = patchLeadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }
    const { status, notes, name, phone, restaurant, source } = parsed.data

    const data: Record<string, unknown> = {}
    if (status !== undefined) data.status = status
    if (notes !== undefined) data.notes = notes
    if (name !== undefined) data.name = name
    if (phone !== undefined) data.phone = phone
    if (restaurant !== undefined) data.restaurant = restaurant
    if (source !== undefined) data.source = source

    const lead = await prisma.lead.update({ where: { id }, data })

    await prisma.auditEvent.create({
      data: { entityType: 'Lead', entityId: id, action: 'updated', userId },
    })

    return NextResponse.json({ lead })
  } catch (err) {
    console.error('PATCH /api/admin/leads/[id] error:', err)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdmin()
  if (error) return error

  void req

  try {
    const { id } = await params
    await prisma.lead.delete({ where: { id } })

    await prisma.auditEvent.create({
      data: { entityType: 'Lead', entityId: id, action: 'deleted', userId },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/leads/[id] error:', err)
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}
