import { prisma } from '@/lib/db'

// 1 point per $1 spent. Points are integers.
export const POINTS_PER_DOLLAR = 1
export const POINTS_PER_DOLLAR_REDEMPTION = 100 // 100 points = $1 discount

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'

export interface LoyaltyStatus {
  currentPoints: number
  lifetimePoints: number
  dollarValue: number // currentPoints / 100, rounded to 2 decimal places
  tier: LoyaltyTier
}

function getTier(lifetimePoints: number): LoyaltyTier {
  if (lifetimePoints >= 10000) return 'Platinum'
  if (lifetimePoints >= 2000) return 'Gold'
  if (lifetimePoints >= 500) return 'Silver'
  return 'Bronze'
}

export async function awardLoyaltyPoints(
  orgId: string,
  orderTotal: number,
  orderId: string
): Promise<void> {
  const points = Math.floor(orderTotal * POINTS_PER_DOLLAR)
  if (points <= 0) return

  await prisma.$transaction([
    prisma.organization.update({
      where: { id: orgId },
      data: {
        loyaltyPoints: { increment: points },
        lifetimeLoyaltyPoints: { increment: points },
      },
    }),
    prisma.auditEvent.create({
      data: {
        entityType: 'Organization',
        entityId: orgId,
        action: 'loyalty_points_earned',
        metadata: { points, orderId, orderTotal },
      },
    }),
  ])
}

export async function redeemLoyaltyPoints(
  orgId: string,
  points: number
): Promise<number> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { loyaltyPoints: true },
  })
  if (!org) throw new Error('Organization not found')

  const actualPoints = Math.min(points, org.loyaltyPoints)
  const dollarDiscount = actualPoints / POINTS_PER_DOLLAR_REDEMPTION

  if (actualPoints > 0) {
    await prisma.$transaction([
      prisma.organization.update({
        where: { id: orgId },
        data: { loyaltyPoints: { decrement: actualPoints } },
      }),
      prisma.auditEvent.create({
        data: {
          entityType: 'Organization',
          entityId: orgId,
          action: 'loyalty_points_redeemed',
          metadata: { points: actualPoints, dollarDiscount },
        },
      }),
    ])
  }

  return dollarDiscount
}

export async function getLoyaltyStatus(orgId: string): Promise<LoyaltyStatus> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { loyaltyPoints: true, lifetimeLoyaltyPoints: true },
  })
  if (!org) throw new Error('Organization not found')

  const currentPoints = org.loyaltyPoints
  const lifetimePoints = org.lifetimeLoyaltyPoints
  const dollarValue = Math.round((currentPoints / POINTS_PER_DOLLAR_REDEMPTION) * 100) / 100
  const tier = getTier(lifetimePoints)

  return { currentPoints, lifetimePoints, dollarValue, tier }
}
