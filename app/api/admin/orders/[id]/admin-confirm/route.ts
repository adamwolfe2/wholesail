import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, adminConfirmedAt: true },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  }

  if (order.adminConfirmedAt) {
    return NextResponse.json({ error: 'Already confirmed.' }, { status: 409 })
  }

  const now = new Date()

  await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: { adminConfirmedAt: now },
    }),
    prisma.auditEvent.create({
      data: {
        entityType: 'Order',
        entityId: id,
        action: 'admin_confirmed',
        userId,
        metadata: { confirmedAt: now.toISOString() },
      },
    }),
  ])

  return NextResponse.json({
    success: true,
    updates: { adminConfirmedAt: now.toISOString() },
  })
}
