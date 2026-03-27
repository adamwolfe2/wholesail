import type { Tool } from '@anthropic-ai/sdk/resources/messages'
import { prisma } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { cachedTool } from '@/lib/ai/tool-cache'

type ToolInput = Record<string, unknown>
type ToolContext = { userId: string }

// ---------------------------------------------------------------------------
// Analytics/reporting executor functions
// ---------------------------------------------------------------------------

export const analyticsExecutors: Record<string, (input: ToolInput, ctx: ToolContext) => Promise<unknown>> = {
  get_platform_summary: async () => {
    return cachedTool('tool:get_platform_summary', 300, async () => {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const [totalOrgs, totalOrders, pendingOrders, revenueMonth, revenueAll, pendingInv, overdueInv, recentOrders, partners, distributors] =
        await Promise.all([
          prisma.organization.count(),
          prisma.order.count(),
          prisma.order.count({ where: { status: 'PENDING' } }),
          prisma.order.aggregate({ where: { createdAt: { gte: startOfMonth }, status: { not: 'CANCELLED' } }, _sum: { total: true } }),
          prisma.order.aggregate({ where: { status: { not: 'CANCELLED' } }, _sum: { total: true } }),
          prisma.invoice.count({ where: { status: 'PENDING' } }),
          prisma.invoice.count({ where: { status: 'OVERDUE' } }),
          prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
          prisma.organization.count({ where: { isWholesaler: true } }),
          prisma.organization.count({ where: { isDistributor: true } }),
        ])

      return {
        clients: { total: totalOrgs, partners, distributors },
        orders: { total: totalOrders, last30Days: recentOrders, pending: pendingOrders },
        revenue: {
          thisMonth: formatCurrency(revenueMonth._sum.total ?? 0),
          allTime: formatCurrency(revenueAll._sum.total ?? 0),
        },
        invoices: { pending: pendingInv, overdue: overdueInv },
      }
    })
  },

  get_revenue_report: async (input) => {
    const period = String(input.period ?? 'this_month')
    const ttl = period === 'all_time' ? 1800 : 300
    return cachedTool(`tool:get_revenue_report:${period}`, ttl, async () => {
      const now = new Date()
      let startDate: Date

      switch (period) {
        case 'today': startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break
        case 'this_week': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break
        case 'this_month': startDate = new Date(now.getFullYear(), now.getMonth(), 1); break
        case 'last_month': startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); break
        case 'this_year': startDate = new Date(now.getFullYear(), 0, 1); break
        default: startDate = new Date(0)
      }

      const endDate = period === 'last_month' ? new Date(now.getFullYear(), now.getMonth(), 0) : now

      const [agg, topOrgs] = await Promise.all([
        prisma.order.aggregate({
          where: { createdAt: { gte: startDate, lte: endDate }, status: { not: 'CANCELLED' } },
          _sum: { total: true }, _count: true,
        }),
        prisma.order.groupBy({
          by: ['organizationId'],
          where: { createdAt: { gte: startDate, lte: endDate }, status: { not: 'CANCELLED' } },
          _sum: { total: true }, _count: true,
          orderBy: { _sum: { total: 'desc' } },
          take: 5,
        }),
      ])

      const orgIds = topOrgs.map(o => o.organizationId)
      const orgs = await prisma.organization.findMany({ where: { id: { in: orgIds } }, select: { id: true, name: true } })
      const orgMap = Object.fromEntries(orgs.map(o => [o.id, o.name]))

      const total = Number(agg._sum.total ?? 0)
      const count = agg._count

      return {
        period, revenue: formatCurrency(total), orderCount: count,
        avgOrderValue: count > 0 ? formatCurrency(total / count) : '$0.00',
        topClients: topOrgs.map(o => ({
          name: orgMap[o.organizationId] ?? 'Unknown',
          orders: o._count,
          revenue: formatCurrency(o._sum.total ?? 0),
          link: `/admin/clients/${o.organizationId}`,
        })),
      }
    })
  },

  get_action_items: async () => {
    return cachedTool('tool:get_action_items', 120, async () => {
    const [
      pendingOrders,
      ordersNeedingConfirm,
      overdueInvoices,
      pendingApplications,
      unreadMessages,
      lowStock,
      productsWithoutDistributor,
      orgsWithNoMembers,
      distributorCount,
      openTasks,
    ] = await Promise.all([
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { adminConfirmedAt: null, status: { in: ['CONFIRMED', 'PACKED', 'SHIPPED'] } } }),
      prisma.invoice.count({ where: { status: 'OVERDUE' } }),
      prisma.wholesaleApplication.count({ where: { status: 'PENDING' } }),
      prisma.message.count({ where: { senderRole: 'client', readAt: null } }),
      prisma.inventoryLevel.count({ where: { quantityOnHand: { lte: 5, gt: 0 } } }).catch(() => 0),
      prisma.product.count({ where: { available: true, distributorOrgId: null } }),
      prisma.organization.count({ where: { members: { none: {} } } }),
      prisma.organization.count({ where: { isDistributor: true } }),
      prisma.repTask.count({ where: { completedAt: null } }).catch(() => 0),
    ])

    const urgent: { label: string; link: string }[] = []
    const setup: { label: string; link: string }[] = []
    const info: { label: string; link: string }[] = []

    if (pendingOrders > 0) urgent.push({ label: `${pendingOrders} pending order${pendingOrders > 1 ? 's' : ''} awaiting confirmation`, link: '/admin/orders?status=PENDING' })
    if (ordersNeedingConfirm > 0) urgent.push({ label: `${ordersNeedingConfirm} order${ordersNeedingConfirm > 1 ? 's' : ''} need delivery confirmation (step 1 of 3)`, link: '/admin/orders' })
    if (overdueInvoices > 0) urgent.push({ label: `${overdueInvoices} overdue invoice${overdueInvoices > 1 ? 's' : ''} — send reminders`, link: '/admin/invoices' })
    if (pendingApplications > 0) urgent.push({ label: `${pendingApplications} partner application${pendingApplications > 1 ? 's' : ''} awaiting review`, link: '/admin/wholesale' })
    if (unreadMessages > 0) urgent.push({ label: `${unreadMessages} unread client message${unreadMessages > 1 ? 's' : ''}`, link: '/admin/messages' })
    if (openTasks > 0) urgent.push({ label: `${openTasks} open rep task${openTasks > 1 ? 's' : ''}`, link: '/admin/tasks' })

    if (distributorCount === 0) setup.push({ label: 'No distributors configured — go to a client org and enable isDistributor to set one up', link: '/admin/clients' })
    if (productsWithoutDistributor > 0) setup.push({ label: `${productsWithoutDistributor} active product${productsWithoutDistributor > 1 ? 's have' : ' has'} no distributor assigned — open each product to assign`, link: '/admin/products' })
    if (orgsWithNoMembers > 0) setup.push({ label: `${orgsWithNoMembers} partner org${orgsWithNoMembers > 1 ? 's have' : ' has'} no portal access — invite them from the client detail page`, link: '/admin/clients' })

    if (lowStock > 0) info.push({ label: `${lowStock} product${lowStock > 1 ? 's' : ''} running low on stock`, link: '/admin/inventory' })

    return {
      urgent,
      setup,
      info,
      summary: urgent.length === 0 && setup.length === 0
        ? 'Platform is in great shape — no urgent items or setup gaps!'
        : `${urgent.length} urgent item${urgent.length !== 1 ? 's' : ''}, ${setup.length} setup gap${setup.length !== 1 ? 's' : ''} found.`,
    }
    })
  },

  get_client_health: async (input) => {
    const { orgId } = input as { orgId?: string }
    const now = new Date()
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    if (orgId) {
      return cachedTool(`tool:get_client_health:${orgId}`, 300, async () => {
      const [org, orders90d, totalOrders, revenue] = await Promise.all([
        prisma.organization.findUnique({ where: { id: orgId }, select: { id: true, name: true, tier: true, loyaltyPoints: true, createdAt: true } }),
        prisma.order.count({ where: { organizationId: orgId, createdAt: { gte: ninetyDaysAgo }, status: { not: 'CANCELLED' } } }),
        prisma.order.count({ where: { organizationId: orgId, status: { not: 'CANCELLED' } } }),
        prisma.order.aggregate({ where: { organizationId: orgId, status: { not: 'CANCELLED' } }, _sum: { total: true } }),
      ])
      if (!org) return { error: 'Client not found' }
      const lastOrder = await prisma.order.findFirst({ where: { organizationId: orgId, status: { not: 'CANCELLED' } }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } })
      const daysSinceLast = lastOrder ? Math.floor((now.getTime() - lastOrder.createdAt.getTime()) / 86400000) : null
      const recencyScore = daysSinceLast === null ? 0 : daysSinceLast <= 7 ? 40 : daysSinceLast <= 14 ? 35 : daysSinceLast <= 30 ? 25 : daysSinceLast <= 60 ? 15 : 5
      const freqScore = Math.min(orders90d * 10, 30)
      const revScore = Math.min(Math.floor(Number(revenue._sum.total ?? 0) / 1000), 30)
      const score = recencyScore + freqScore + revScore
      const badge = score >= 80 ? 'Champion' : score >= 60 ? 'Healthy' : score >= 30 ? 'At Risk' : 'Dormant'
      return { name: org.name, score, badge, tier: org.tier, loyaltyPoints: org.loyaltyPoints, totalOrders, orders90d, totalRevenue: Number(revenue._sum.total ?? 0), daysSinceLast }
      })
    }

    return cachedTool('tool:get_client_health:portfolio', 3600, async () => {
    const orgs = await prisma.organization.findMany({
      where: { isWholesaler: true },
      select: { id: true, name: true, tier: true },
      take: 1000,
    })
    const scores = await Promise.all(orgs.map(async (org) => {
      const [orders90d, lastOrder, revenue] = await Promise.all([
        prisma.order.count({ where: { organizationId: org.id, createdAt: { gte: ninetyDaysAgo }, status: { not: 'CANCELLED' } } }),
        prisma.order.findFirst({ where: { organizationId: org.id, status: { not: 'CANCELLED' } }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
        prisma.order.aggregate({ where: { organizationId: org.id, status: { not: 'CANCELLED' } }, _sum: { total: true } }),
      ])
      const daysSinceLast = lastOrder ? Math.floor((now.getTime() - lastOrder.createdAt.getTime()) / 86400000) : null
      const recencyScore = daysSinceLast === null ? 0 : daysSinceLast <= 7 ? 40 : daysSinceLast <= 14 ? 35 : daysSinceLast <= 30 ? 25 : daysSinceLast <= 60 ? 15 : 5
      const freqScore = Math.min(orders90d * 10, 30)
      const revScore = Math.min(Math.floor(Number(revenue._sum.total ?? 0) / 1000), 30)
      const score = recencyScore + freqScore + revScore
      const badge = score >= 80 ? 'Champion' : score >= 60 ? 'Healthy' : score >= 30 ? 'At Risk' : 'Dormant'
      return { name: org.name, id: org.id, score, badge, tier: org.tier }
    }))
    const buckets = { Champion: 0, Healthy: 0, 'At Risk': 0, Dormant: 0 }
    scores.forEach(s => { buckets[s.badge as keyof typeof buckets]++ })
    const atRisk = scores.filter(s => s.badge === 'At Risk' || s.badge === 'Dormant').slice(0, 5)
    return { total: orgs.length, buckets, atRiskClients: atRisk }
    })
  },

  get_loyalty_summary: async (input) => {
    const { orgId } = input as { orgId?: string }
    if (orgId) {
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { name: true, loyaltyPoints: true, lifetimeLoyaltyPoints: true, tier: true },
      })
      if (!org) return { error: 'Client not found' }
      const tier = org.lifetimeLoyaltyPoints >= 5000 ? 'Platinum' : org.lifetimeLoyaltyPoints >= 2000 ? 'Gold' : org.lifetimeLoyaltyPoints >= 500 ? 'Silver' : 'Bronze'
      const nextThreshold = tier === 'Bronze' ? 500 : tier === 'Silver' ? 2000 : tier === 'Gold' ? 5000 : null
      return { name: org.name, currentPoints: org.loyaltyPoints, lifetimePoints: org.lifetimeLoyaltyPoints, loyaltyTier: tier, pointsValueDollars: (org.loyaltyPoints / 100).toFixed(2), nextTier: nextThreshold ? `${nextThreshold - org.lifetimeLoyaltyPoints} pts to next tier` : 'Platinum — top tier' }
    }
    const [totalPoints, totalLifetime, topOrgs] = await Promise.all([
      prisma.organization.aggregate({ _sum: { loyaltyPoints: true } }),
      prisma.organization.aggregate({ _sum: { lifetimeLoyaltyPoints: true } }),
      prisma.organization.findMany({ where: { loyaltyPoints: { gt: 0 } }, orderBy: { loyaltyPoints: 'desc' }, take: 10, select: { name: true, loyaltyPoints: true, lifetimeLoyaltyPoints: true } }),
    ])
    return {
      totalOutstandingPoints: totalPoints._sum.loyaltyPoints ?? 0,
      totalLifetimePoints: totalLifetime._sum.lifetimeLoyaltyPoints ?? 0,
      estimatedLiabilityDollars: ((totalPoints._sum.loyaltyPoints ?? 0) / 100).toFixed(2),
      topHolders: topOrgs.map(o => ({ name: o.name, points: o.loyaltyPoints, lifetime: o.lifetimeLoyaltyPoints })),
    }
  },

  get_referral_stats: async () => {
    const [total, converted, pending, topReferrers] = await Promise.all([
      prisma.referral.count().catch(() => 0),
      prisma.referral.count({ where: { status: 'CONVERTED' } }).catch(() => 0),
      prisma.referral.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prisma.referral.groupBy({ by: ['referrerId'], _count: { id: true }, where: { status: 'CONVERTED' }, orderBy: { _count: { id: 'desc' } }, take: 5 }).catch(() => []),
    ])
    const referrerIds = topReferrers.map((r: { referrerId: string; _count: { id: number } }) => r.referrerId)
    const referrerOrgs = referrerIds.length > 0
      ? await prisma.organization.findMany({ where: { id: { in: referrerIds } }, select: { id: true, name: true, referralCredits: true } })
      : []
    const orgMap = Object.fromEntries(referrerOrgs.map((o: { id: string; name: string; referralCredits: unknown }) => [o.id, o]))
    return {
      totalReferrals: total,
      converted,
      pending,
      conversionRate: total > 0 ? `${Math.round((converted / total) * 100)}%` : '0%',
      topReferrers: topReferrers.map((r: { referrerId: string; _count: { id: number } }) => ({
        name: orgMap[r.referrerId]?.name ?? 'Unknown',
        conversions: r._count.id,
        creditsEarned: formatCurrency(orgMap[r.referrerId]?.referralCredits ?? 0),
      })),
    }
  },

  get_smart_reorder_alerts: async (input) => {
    const { limit = 10 } = input as { limit?: number }
    const { getOverdueReorders } = await import('@/lib/smart-reorder')
    const overdue = await getOverdueReorders()
    const alerts = overdue.slice(0, limit).map((r) => ({
      client: r.orgName,
      email: '',
      avgCadenceDays: r.avgCadenceDays,
      daysSinceLastOrder: r.daysSinceLastOrder,
      daysOverdue: r.overdueDays,
      topProducts: r.topProducts,
      link: `/admin/clients/${r.orgId}`,
    }))
    return { count: alerts.length, alerts }
  },
}

// ---------------------------------------------------------------------------
// Analytics-related Anthropic tool definitions
// ---------------------------------------------------------------------------

export const analyticsToolDefinitions: Tool[] = [
  {
    name: 'get_platform_summary',
    description: 'High-level platform overview: total clients, orders, revenue, invoices. Use for "how are we doing?", "give me the numbers", "platform status", "overview".',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'get_revenue_report',
    description: 'Generate a revenue report for a time period with order count, total, AOV, and top clients.',
    input_schema: {
      type: 'object' as const,
      properties: {
        period: { type: 'string', enum: ['today', 'this_week', 'this_month', 'last_month', 'this_year', 'all_time'] },
      },
      required: ['period'],
    },
  },
  {
    name: 'get_action_items',
    description: 'Get everything that needs attention right now: urgent operational items (pending orders, overdue invoices, unread messages, open tasks) AND platform setup gaps (products without distributors, orgs without portal access, missing distributor config). Call this when asked "what needs my attention", "what should I do today", or "platform health check".',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'get_client_health',
    description: 'Get client health score using RFM (Recency/Frequency/Monetary) scoring. If orgId provided, returns detailed health breakdown for that client. Without orgId, returns portfolio-wide health distribution (Champion/Healthy/At Risk/Dormant counts) and top at-risk clients. Use for "who is at risk?", "health scores", "which clients might churn?", "is [client] a healthy account?".',
    input_schema: {
      type: 'object' as const,
      properties: {
        orgId: { type: 'string', description: 'Organization ID for single-client analysis. Omit for portfolio summary.' },
      },
    },
  },
  {
    name: 'get_loyalty_summary',
    description: 'Get loyalty points data. With orgId, shows a client\'s current points, lifetime points, tier (Bronze/Silver/Gold/Platinum), points value in dollars, and progress to next tier. Without orgId, shows total outstanding loyalty liability and top point holders. Use for "loyalty points", "how many points does [client] have?", "who has the most points?", "what\'s our loyalty liability?".',
    input_schema: {
      type: 'object' as const,
      properties: {
        orgId: { type: 'string', description: 'Organization ID for single-client loyalty detail. Omit for portfolio overview.' },
      },
    },
  },
  {
    name: 'get_referral_stats',
    description: 'Get referral program statistics: total referrals, conversion rate, pending referrals, top referrers and their earnings. Use for "referral program", "how is our referral program doing?", "who has referred the most clients?", "referral conversions".',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'get_smart_reorder_alerts',
    description: 'Find clients who are overdue for a reorder based on their historical ordering cadence. Returns clients who haven\'t reordered within 125% of their average order interval. Use for "who should reorder?", "reorder alerts", "clients due for replenishment", "proactive outreach list".',
    input_schema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'Max clients to return (default 10)' },
      },
    },
  },
]
