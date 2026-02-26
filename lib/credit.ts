import { prisma } from '@/lib/db'

export interface CreditStatus {
  limit: number | null        // null = unlimited
  used: number               // sum of unpaid invoices (PENDING + OVERDUE)
  available: number | null   // null if unlimited
  utilizationPct: number | null
  isAtLimit: boolean
  isNearLimit: boolean       // >= 80% utilized
}

export async function getCreditStatus(orgId: string): Promise<CreditStatus> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      creditLimit: true,
      invoices: {
        where: {
          status: { in: ['PENDING', 'OVERDUE'] },
        },
        select: { total: true },
      },
    },
  })

  if (!org) {
    return {
      limit: null,
      used: 0,
      available: null,
      utilizationPct: null,
      isAtLimit: false,
      isNearLimit: false,
    }
  }

  const used = org.invoices.reduce((sum, inv) => {
    return sum + Number(inv.total)
  }, 0)

  const limit = org.creditLimit !== null ? Number(org.creditLimit) : null

  if (limit === null) {
    return {
      limit: null,
      used,
      available: null,
      utilizationPct: null,
      isAtLimit: false,
      isNearLimit: false,
    }
  }

  const available = Math.max(0, limit - used)
  const utilizationPct = limit > 0 ? (used / limit) * 100 : 0
  const isAtLimit = used >= limit
  const isNearLimit = utilizationPct >= 80

  return {
    limit,
    used,
    available,
    utilizationPct,
    isAtLimit,
    isNearLimit,
  }
}
