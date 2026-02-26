import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { getOrganizationByUserId } from '@/lib/db/organizations'

// GET /api/distributor/items
// Returns all OrderItems assigned to this distributor, grouped by order.
// Used as the task list in the distributor fulfillment portal.
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const org = await getOrganizationByUserId(userId)
  if (!org || !org.isDistributor) {
    return NextResponse.json({ error: 'Forbidden — not a distributor account.' }, { status: 403 })
  }

  const items = await prisma.orderItem.findMany({
    where: { distributorOrgId: org.id },
    select: {
      id: true,
      name: true,
      quantity: true,
      unitPrice: true,
      total: true,
      distributorFulfilledAt: true,
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          createdAt: true,
          notes: true,
          organization: {
            select: { name: true, contactPerson: true, email: true, phone: true },
          },
          shippingAddress: {
            select: { street: true, city: true, state: true, zip: true },
          },
        },
      },
    },
    orderBy: [
      { distributorFulfilledAt: 'asc' },  // unfulfilled first (null sorts first with asc)
      { order: { createdAt: 'desc' } },
    ],
  })

  return NextResponse.json({ items })
}
