import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { getOrganizationByUserId } from '@/lib/db/organizations'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const org = await getOrganizationByUserId(userId)
  if (!org) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const { orderNumber } = await params

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      id: true,
      organizationId: true,
      distributorConfirmedAt: true,
      clientConfirmedAt: true,
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  }

  // Must be the client's own order
  if (order.organizationId !== org.id) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  if (order.clientConfirmedAt) {
    return NextResponse.json({ error: 'Already confirmed.' }, { status: 409 })
  }

  const now = new Date()

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { clientConfirmedAt: now },
    }),
    prisma.auditEvent.create({
      data: {
        entityType: 'Order',
        entityId: order.id,
        action: 'client_confirmed_delivery',
        userId,
        metadata: { confirmedAt: now.toISOString() },
      },
    }),
  ])

  return NextResponse.json({
    success: true,
    updates: { clientConfirmedAt: now.toISOString() },
  })
}
