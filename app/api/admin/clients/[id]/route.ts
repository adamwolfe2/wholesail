import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, requireAdminOrRep } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// GET /api/admin/clients/[id] — full org profile
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminOrRep()
  if (error) return error

  const { id } = await params

  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      addresses: true,
      members: { select: { id: true, name: true, email: true, role: true } },
      clientNotes: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ org })
}

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  contactPerson: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  website: z.string().url().or(z.literal('')).optional(),
  paymentTerms: z.string().optional(),
  creditLimit: z.number().nonnegative().nullable().optional(),
  isWholesaler: z.boolean().optional(),
  isDistributor: z.boolean().optional(),
  distributorCcEmail: z.string().email().nullable().optional(),
  notes: z.string().optional(),
})

// PATCH /api/admin/clients/[id] — edit org fields
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdminOrRep()
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    // Build update payload — only include fields that were sent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: Record<string, any> = {}
    if (data.name !== undefined) update.name = data.name
    if (data.contactPerson !== undefined) update.contactPerson = data.contactPerson
    if (data.email !== undefined) update.email = data.email
    if (data.phone !== undefined) update.phone = data.phone
    if (data.website !== undefined) update.website = data.website || null
    if (data.paymentTerms !== undefined) update.paymentTerms = data.paymentTerms
    if (data.creditLimit !== undefined) update.creditLimit = data.creditLimit
    if (data.isWholesaler !== undefined) update.isWholesaler = data.isWholesaler
    if (data.isDistributor !== undefined) update.isDistributor = data.isDistributor
    if (data.distributorCcEmail !== undefined) update.distributorCcEmail = data.distributorCcEmail
    if (data.notes !== undefined) update.notes = data.notes

    const org = await prisma.organization.update({ where: { id }, data: update })

    await prisma.auditEvent.create({
      data: {
        entityType: 'Organization',
        entityId: id,
        action: 'org_updated',
        userId,
        metadata: { fields: Object.keys(update) },
      },
    })

    return NextResponse.json({ org })
  } catch (err) {
    const { captureWithContext } = await import("@/lib/sentry")
    captureWithContext(err, { route: "admin/clients/[id]", action: "patch" })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/clients/[id] — delete org (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params

    const org = await prisma.organization.findUnique({
      where: { id },
      select: { id: true, name: true, _count: { select: { orders: true } } },
    })

    if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (org._count.orders > 0) {
      return NextResponse.json(
        { error: `Cannot delete: organization has ${org._count.orders} order(s). Archive instead.` },
        { status: 409 }
      )
    }

    // Delete org (cascade removes addresses, clientNotes, conversations, members relation)
    await prisma.organization.delete({ where: { id } })

    await prisma.auditEvent.create({
      data: {
        entityType: 'Organization',
        entityId: id,
        action: 'org_deleted',
        userId,
        metadata: { name: org.name },
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    const { captureWithContext } = await import("@/lib/sentry")
    captureWithContext(err, { route: "admin/clients/[id]", action: "delete" })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
