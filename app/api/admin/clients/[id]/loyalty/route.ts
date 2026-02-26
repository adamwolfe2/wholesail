import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'
import { getLoyaltyStatus } from '@/lib/loyalty'
import { z } from 'zod'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params

    const org = await prisma.organization.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const status = await getLoyaltyStatus(id)

    // Fetch recent loyalty audit events
    const events = await prisma.auditEvent.findMany({
      where: {
        entityType: 'Organization',
        entityId: id,
        action: { in: ['loyalty_points_earned', 'loyalty_points_redeemed', 'loyalty_points_adjusted'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ ...status, events })
  } catch (error) {
    console.error('Error fetching loyalty status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const adjustSchema = z.object({
  adjustment: z.number().int(),
  note: z.string().min(1),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json()
    const parsed = adjustSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsed.error.issues }, { status: 400 })
    }

    const { adjustment, note } = parsed.data

    const org = await prisma.organization.findUnique({
      where: { id },
      select: { loyaltyPoints: true, lifetimeLoyaltyPoints: true },
    })
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Calculate new points balance, never below 0
    const newPoints = Math.max(0, org.loyaltyPoints + adjustment)
    const actualAdjustment = newPoints - org.loyaltyPoints

    // Only increment lifetime points for positive adjustments
    const lifetimeDelta = adjustment > 0 ? adjustment : 0

    await prisma.$transaction([
      prisma.organization.update({
        where: { id },
        data: {
          loyaltyPoints: newPoints,
          lifetimeLoyaltyPoints: { increment: lifetimeDelta },
        },
      }),
      prisma.auditEvent.create({
        data: {
          entityType: 'Organization',
          entityId: id,
          action: 'loyalty_points_adjusted',
          userId,
          metadata: {
            adjustment: actualAdjustment,
            requestedAdjustment: adjustment,
            note,
            previousBalance: org.loyaltyPoints,
            newBalance: newPoints,
          },
        },
      }),
    ])

    const status = await getLoyaltyStatus(id)
    return NextResponse.json({ success: true, ...status })
  } catch (error) {
    console.error('Error adjusting loyalty points:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
