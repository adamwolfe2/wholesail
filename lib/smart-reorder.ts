import { prisma } from '@/lib/db'

export interface OverdueReorder {
  orgId: string
  orgName: string
  avgCadenceDays: number
  daysSinceLastOrder: number
  overdueDays: number
  lastOrderDate: Date
  topProducts: string[]
}

export async function getOverdueReorders(): Promise<OverdueReorder[]> {
  // Cap to 2 years — older orders don't meaningfully affect cadence calculation
  const twoYearsAgo = new Date()
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

  const orders = await prisma.order.findMany({
    where: {
      status: { not: 'CANCELLED' },
      createdAt: { gte: twoYearsAgo },
    },
    select: {
      organizationId: true,
      createdAt: true,
      organization: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: 2000, // safety cap; date filter is the primary bound
  })

  // Group orders by org
  const orgOrders = new Map<string, { name: string; dates: Date[] }>()
  for (const order of orders) {
    const existing = orgOrders.get(order.organizationId)
    if (existing) {
      existing.dates.push(order.createdAt)
    } else {
      orgOrders.set(order.organizationId, {
        name: order.organization.name,
        dates: [order.createdAt],
      })
    }
  }

  const now = new Date()
  const results: OverdueReorder[] = []

  for (const [orgId, { name, dates }] of orgOrders) {
    // Need at least 3 orders to compute a meaningful cadence
    if (dates.length < 3) continue

    // Compute gaps between consecutive orders (in days)
    const gaps: number[] = []
    for (let i = 1; i < dates.length; i++) {
      const diffMs = dates[i].getTime() - dates[i - 1].getTime()
      gaps.push(diffMs / (1000 * 60 * 60 * 24))
    }

    const avgCadenceDays = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
    const lastOrderDate = dates[dates.length - 1]
    const daysSinceLastOrder = Math.floor(
      (now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Overdue threshold: 1.5x average cadence
    if (daysSinceLastOrder <= avgCadenceDays * 1.5) continue

    const overdueDays = daysSinceLastOrder - avgCadenceDays

    results.push({
      orgId,
      orgName: name,
      avgCadenceDays,
      daysSinceLastOrder,
      overdueDays,
      lastOrderDate,
      topProducts: [], // filled below
    })
  }

  if (results.length === 0) return []

  // Fetch top products per overdue org — single batched query instead of N+1 loop
  const overdueOrgIds = results.map((r) => r.orgId)
  const orgItemMap = new Map<string, string[]>()

  const allOrgItems = await prisma.orderItem.findMany({
    where: {
      order: {
        organizationId: { in: overdueOrgIds },
        status: { not: 'CANCELLED' },
      },
    },
    select: {
      name: true,
      quantity: true,
      order: { select: { organizationId: true } },
    },
  })

  // Group by orgId + product name in memory, then take top 3 by quantity
  const orgProductTotals = new Map<string, Map<string, number>>()
  for (const item of allOrgItems) {
    const orgId = item.order.organizationId
    if (!orgProductTotals.has(orgId)) orgProductTotals.set(orgId, new Map())
    const productMap = orgProductTotals.get(orgId)!
    productMap.set(item.name, (productMap.get(item.name) ?? 0) + item.quantity)
  }
  for (const [orgId, productMap] of orgProductTotals) {
    orgItemMap.set(
      orgId,
      Array.from(productMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name)
    )
  }

  // Attach top products and sort by overdueDays desc
  for (const result of results) {
    result.topProducts = orgItemMap.get(result.orgId) ?? []
  }

  return results
    .sort((a, b) => b.overdueDays - a.overdueDays)
    .slice(0, 20)
}
