import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { getOrganizationByUserId } from '@/lib/db/organizations'

// PATCH /api/distributor/items/[id]
// Mark an order item as fulfilled (or un-fulfill it).
// Body: { fulfilled: boolean }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const org = await getOrganizationByUserId(userId)
  if (!org || !org.isDistributor) {
    return NextResponse.json({ error: 'Forbidden — not a distributor account.' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const fulfilled = body.fulfilled !== false // default to true

  // Ensure the item belongs to this distributor
  const item = await prisma.orderItem.findUnique({
    where: { id },
    select: { id: true, distributorOrgId: true, order: { select: { orderNumber: true } } },
  })

  if (!item || item.distributorOrgId !== org.id) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  }

  const updated = await prisma.orderItem.update({
    where: { id },
    data: { distributorFulfilledAt: fulfilled ? new Date() : null },
  })

  await prisma.auditEvent.create({
    data: {
      entityType: 'OrderItem',
      entityId: id,
      action: fulfilled ? 'distributor_fulfilled' : 'distributor_unfulfilled',
      userId,
      metadata: { orderNumber: item.order.orderNumber, distributorOrgId: org.id },
    },
  })

  return NextResponse.json({ success: true, distributorFulfilledAt: updated.distributorFulfilledAt })
}
