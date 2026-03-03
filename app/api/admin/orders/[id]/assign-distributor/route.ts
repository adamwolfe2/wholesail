import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  distributorOrgId: z.string().nullable(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
  }

  const { distributorOrgId } = parsed.data

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  }

  // Validate the distributor org exists and is a distributor
  if (distributorOrgId) {
    const distOrg = await prisma.organization.findUnique({
      where: { id: distributorOrgId },
      select: { id: true, isDistributor: true },
    })
    if (!distOrg || !distOrg.isDistributor) {
      return NextResponse.json({ error: 'Organization is not a registered distributor.' }, { status: 422 })
    }
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: { distributorOrgId },
    }),
    prisma.auditEvent.create({
      data: {
        entityType: 'Order',
        entityId: id,
        action: 'distributor_assigned',
        userId,
        metadata: { distributorOrgId },
      },
    }),
  ])

  return NextResponse.json({ success: true, distributorOrgId })
}
