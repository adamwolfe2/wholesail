import { NextResponse } from 'next/server'
import { requireAdminOrRep } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'
import { calculateHealthScore } from '@/lib/client-health'

export interface ClientHealthRow {
  orgId: string
  orgName: string
  score: number
  label: 'Champion' | 'Healthy' | 'At Risk' | 'Dormant'
  daysSinceLastOrder: number | null
  ordersLast12Months: number
  avgOrderValue: number
}

/**
 * GET /api/admin/clients/health-scores
 * Returns RFM health scores for every organization.
 */
export async function GET() {
  const { error } = await requireAdminOrRep()
  if (error) return error

  try {
    const now = new Date()
    const twelveMonthsAgo = new Date(now)
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    // Fetch all orgs (just id + name — lightweight)
    const orgs = await prisma.organization.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: 1000, // safety cap; realistic for any wholesale business
    })

    if (orgs.length === 0) {
      return NextResponse.json({ scores: [], summary: { Champion: 0, Healthy: 0, 'At Risk': 0, Dormant: 0 } })
    }

    const orgIds = orgs.map((o) => o.id)

    // ── Last order date per org — single DISTINCT ON query, no full table scan ─
    type LastOrderRow = { organizationId: string; createdAt: Date }
    const lastOrderRows = await prisma.$queryRaw<LastOrderRow[]>`
      SELECT DISTINCT ON ("organizationId") "organizationId", "createdAt"
      FROM "Order"
      WHERE "organizationId" = ANY(${orgIds}::text[])
        AND status != 'CANCELLED'
      ORDER BY "organizationId", "createdAt" DESC
    `
    const lastOrderMap = new Map(lastOrderRows.map((r) => [r.organizationId, r.createdAt]))

    // ── Orders last 12 months per org ──────────────────────────────────────
    const recentOrderGroups = await prisma.order.groupBy({
      by: ['organizationId'],
      where: {
        organizationId: { in: orgIds },
        status: { not: 'CANCELLED' },
        createdAt: { gte: twelveMonthsAgo },
      },
      _count: { id: true },
      _sum: { total: true },
    })

    const recentCountMap = new Map<string, number>()
    const recentTotalMap = new Map<string, number>()
    for (const g of recentOrderGroups) {
      recentCountMap.set(g.organizationId, g._count.id)
      recentTotalMap.set(g.organizationId, Number(g._sum.total ?? 0))
    }

    // ── All-time AOV per org (for monetary component) ──────────────────────
    const allTimeGroups = await prisma.order.groupBy({
      by: ['organizationId'],
      where: {
        organizationId: { in: orgIds },
        status: { not: 'CANCELLED' },
      },
      _count: { id: true },
      _sum: { total: true },
    })

    const allTimeCountMap = new Map<string, number>()
    const allTimeTotalMap = new Map<string, number>()
    for (const g of allTimeGroups) {
      allTimeCountMap.set(g.organizationId, g._count.id)
      allTimeTotalMap.set(g.organizationId, Number(g._sum.total ?? 0))
    }

    // ── Compute median AOV across all clients that have orders ─────────────
    const aovValues: number[] = []
    for (const orgId of orgIds) {
      const count = allTimeCountMap.get(orgId) ?? 0
      const total = allTimeTotalMap.get(orgId) ?? 0
      if (count > 0) {
        aovValues.push(total / count)
      }
    }

    let medianAov = 0
    if (aovValues.length > 0) {
      const sorted = [...aovValues].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      medianAov =
        sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid]
    }

    // ── Build scores ───────────────────────────────────────────────────────
    const summary = { Champion: 0, Healthy: 0, 'At Risk': 0, Dormant: 0 }

    const scores: ClientHealthRow[] = orgs.map((org) => {
      const lastDate = lastOrderMap.get(org.id) ?? null
      const daysSinceLastOrder =
        lastDate === null
          ? null
          : Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

      const ordersLast12Months = recentCountMap.get(org.id) ?? 0
      const recentTotal = recentTotalMap.get(org.id) ?? 0
      const avgOrderValue =
        ordersLast12Months > 0 ? recentTotal / ordersLast12Months : 0

      const health = calculateHealthScore({
        daysSinceLastOrder,
        ordersLast12Months,
        avgOrderValue,
        medianAovAllClients: medianAov,
      })

      summary[health.label] += 1

      return {
        orgId: org.id,
        orgName: org.name,
        score: health.score,
        label: health.label,
        daysSinceLastOrder,
        ordersLast12Months,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      }
    })

    return NextResponse.json({ scores, summary })
  } catch (err) {
    console.error('[health-scores] DB error:', err)
    return NextResponse.json(
      { error: 'Failed to compute health scores' },
      { status: 500 }
    )
  }
}
