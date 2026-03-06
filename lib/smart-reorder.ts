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
  // Fetch recent non-cancelled orders (capped to last 200 per analysis window)
  const orders = await prisma.order.findMany({
    where: { status: { not: 'CANCELLED' } },
    select: {
      organizationId: true,
      createdAt: true,
      organization: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
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

  for (const [orgId, { name, dates: rawDates }] of orgOrders) {
    // Need at least 3 orders to compute a meaningful cadence
    if (rawDates.length < 3) continue

    // Sort ascending (needed since we fetch orders DESC for recency)
    const dates = rawDates.slice().sort((a, b) => a.getTime() - b.getTime())

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

  // Fetch top products for ALL overdue orgs in one raw query (avoid N+1 per-org groupBy)
  const overdueOrgIds = results.map((r) => r.orgId)
  const orgItemMap = new Map<string, string[]>()

  const perOrgItems = await prisma.$queryRaw<Array<{ organizationId: string; name: string; totalQty: bigint }>>`
    SELECT oi.name, o."organizationId", SUM(oi.quantity)::bigint AS "totalQty"
    FROM "OrderItem" oi
    JOIN "Order" o ON o.id = oi."orderId"
    WHERE o."organizationId" = ANY(${overdueOrgIds}::text[])
      AND o.status != 'CANCELLED'
    GROUP BY o."organizationId", oi.name
    ORDER BY o."organizationId", "totalQty" DESC
  `

  // Partition per org, keep top 3
  for (const row of perOrgItems) {
    const existing = orgItemMap.get(row.organizationId)
    if (!existing) {
      orgItemMap.set(row.organizationId, [row.name])
    } else if (existing.length < 3) {
      existing.push(row.name)
    }
  }

  // Attach top products and sort by overdueDays desc
  for (const result of results) {
    result.topProducts = orgItemMap.get(result.orgId) ?? []
  }

  return results
    .sort((a, b) => b.overdueDays - a.overdueDays)
    .slice(0, 20)
}
