import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { getOrganizationByUserId } from '@/lib/db/organizations'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const org = await getOrganizationByUserId(userId)
  if (!org || !org.isDistributor) {
    return NextResponse.json({ error: 'Forbidden — not a distributor account.' }, { status: 403 })
  }

  const orders = await prisma.order.findMany({
    where: { distributorOrgId: org.id },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
      adminConfirmedAt: true,
      distributorConfirmedAt: true,
      clientConfirmedAt: true,
      organization: { select: { name: true, contactPerson: true, phone: true } },
      items: { select: { name: true, quantity: true, unitPrice: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({ orders })
}
