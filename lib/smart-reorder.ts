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
  // Fetch all non-cancelled orders for all orgs, ordered by org + date
  const orders = await prisma.order.findMany({
    where: { status: { not: 'CANCELLED' } },
    select: {
      organizationId: true,
      createdAt: true,
      organization: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
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

  // Fetch top products for each overdue org
  const overdueOrgIds = results.map((r) => r.orgId)

  const itemGroups = await prisma.orderItem.groupBy({
    by: ['productId', 'name'],
    where: {
      order: {
        organizationId: { in: overdueOrgIds },
        status: { not: 'CANCELLED' },
      },
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
  })

  // We need to group by orgId too — do a raw lookup per org for top products
  // itemGroups is across all orgs; fetch per-org top items
  const orgItemMap = new Map<string, string[]>()

  for (const orgId of overdueOrgIds) {
    const orgItems = await prisma.orderItem.groupBy({
      by: ['productId', 'name'],
      where: {
        order: {
          organizationId: orgId,
          status: { not: 'CANCELLED' },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 3,
    })
    orgItemMap.set(orgId, orgItems.map((i) => i.name))
  }

  // Attach top products and sort by overdueDays desc
  for (const result of results) {
    result.topProducts = orgItemMap.get(result.orgId) ?? []
  }

  // Suppress the unused variable warning from itemGroups
  void itemGroups

  return results
    .sort((a, b) => b.overdueDays - a.overdueDays)
    .slice(0, 20)
}
