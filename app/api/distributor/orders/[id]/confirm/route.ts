import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { getOrganizationByUserId } from '@/lib/db/organizations'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const org = await getOrganizationByUserId(userId)
  if (!org || !org.isWholesaler) {
    return NextResponse.json({ error: 'Forbidden — not a distributor account.' }, { status: 403 })
  }

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      rockyConfirmedAt: true,
      distributorConfirmedAt: true,
      distributorOrgId: true,
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  }

  // Must be assigned to this distributor
  if (order.distributorOrgId !== org.id) {
    return NextResponse.json({ error: 'Forbidden — this order is not assigned to your organization.' }, { status: 403 })
  }

  // Rocky must have confirmed first
  if (!order.rockyConfirmedAt) {
    return NextResponse.json({ error: 'Admin must acknowledge the order first.' }, { status: 422 })
  }

  if (order.distributorConfirmedAt) {
    return NextResponse.json({ error: 'Already confirmed.' }, { status: 409 })
  }

  const now = new Date()

  await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: { distributorConfirmedAt: now },
    }),
    prisma.auditEvent.create({
      data: {
        entityType: 'Order',
        entityId: id,
        action: 'distributor_confirmed',
        userId,
        metadata: { confirmedAt: now.toISOString(), distributorOrgId: org.id },
      },
    }),
  ])

  return NextResponse.json({
    success: true,
    updates: { distributorConfirmedAt: now.toISOString() },
  })
}
