import type { Tool } from '@anthropic-ai/sdk/resources/messages'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { cachedTool, invalidateToolCache } from '@/lib/ai/tool-cache'
import {
  sendWelcomePartnerEmail,
  sendWholesaleRejectionEmail,
  sendApplicationStatusEmail,
  sendTierUpgradeEmail,
} from '@/lib/email'
import { clerkClient } from '@clerk/nextjs/server'
import { portalConfig } from '@/lib/portal-config'

type ToolInput = Record<string, unknown>
type ToolContext = { userId: string }

// ---------------------------------------------------------------------------
// Client/org executor functions
// ---------------------------------------------------------------------------

export const clientExecutors: Record<string, (input: ToolInput, ctx: ToolContext) => Promise<unknown>> = {
  search_clients: async (input) => {
    const query = String(input.query ?? '')
    const limit = Number(input.limit ?? 5)

    const orgs = await prisma.organization.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { contactPerson: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        _count: { select: { orders: true } },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    const orgIds = orgs.map(o => o.id)
    const spendData = await prisma.order.groupBy({
      by: ['organizationId'],
      where: { organizationId: { in: orgIds }, status: { not: 'CANCELLED' } },
      _sum: { total: true },
    })
    const spendMap = new Map(spendData.map(s => [s.organizationId, Number(s._sum.total ?? 0)]))

    return orgs.map(o => ({
      id: o.id,
      name: o.name,
      email: o.email,
      phone: o.phone,
      contactPerson: o.contactPerson,
      tier: o.tier,
      isWholesaler: o.isWholesaler,
      isDistributor: o.isDistributor,
      paymentTerms: o.paymentTerms,
      orderCount: o._count.orders,
      totalSpend: formatCurrency(spendMap.get(o.id) ?? 0),
      loyaltyPoints: o.loyaltyPoints,
      link: `/admin/clients/${o.id}`,
    }))
  },

  get_client_detail: async (input) => {
    const orgId = String(input.orgId)
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        orders: { orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, orderNumber: true, status: true, total: true, createdAt: true } },
        invoices: { where: { status: { in: ['PENDING', 'OVERDUE'] } }, select: { invoiceNumber: true, status: true, total: true, dueDate: true } },
        members: { select: { name: true, email: true, role: true } },
        clientNotes: { orderBy: { createdAt: 'desc' }, take: 3, select: { content: true } },
      },
    })

    if (!org) return { error: 'Client not found' }

    return {
      id: org.id, name: org.name, email: org.email, phone: org.phone,
      contactPerson: org.contactPerson, tier: org.tier, isWholesaler: org.isWholesaler,
      paymentTerms: org.paymentTerms,
      creditLimit: org.creditLimit ? formatCurrency(org.creditLimit) : null,
      loyaltyPoints: org.loyaltyPoints, notes: org.notes,
      recentOrders: org.orders.map(o => ({ ...o, total: formatCurrency(o.total), link: `/admin/orders/${o.id}` })),
      outstandingInvoices: org.invoices.map(i => ({ ...i, total: formatCurrency(i.total) })),
      members: org.members,
      recentNotes: org.clientNotes.map(n => n.content),
      link: `/admin/clients/${org.id}`,
    }
  },

  update_client_tier: async (input, ctx) => {
    const orgId = String(input.orgId)
    const tier = String(input.tier).toUpperCase()
    const validTiers = ['NEW', 'REPEAT', 'VIP']
    if (!validTiers.includes(tier)) return { error: `Invalid tier "${tier}". Valid: ${validTiers.join(', ')}` }

    const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { name: true, email: true, contactPerson: true, tier: true } })
    if (!org) return { error: `Client not found: ${orgId}` }
    if (org.tier === tier) return { message: `${org.name} is already on ${tier} tier` }

    await prisma.organization.update({ where: { id: orgId }, data: { tier: tier as 'NEW' | 'REPEAT' | 'VIP' } })
    await prisma.auditEvent.create({
      data: { entityType: 'Organization', entityId: orgId, action: 'tier_updated', userId: ctx.userId, metadata: { previousTier: org.tier, newTier: tier } },
    })

    if (org.email && (tier === 'REPEAT' || tier === 'VIP')) {
      sendTierUpgradeEmail({ name: org.contactPerson || org.name, email: org.email, businessName: org.name, newTier: tier, totalSpend: 0 }).catch(() => {})
    }

    return { success: true, name: org.name, previousTier: org.tier, newTier: tier, link: `/admin/clients/${orgId}` }
  },

  update_client: async (input, ctx) => {
    const orgId = String(input.orgId)
    const fields: Record<string, unknown> = {}

    if (input.paymentTerms !== undefined) fields.paymentTerms = String(input.paymentTerms)
    if (input.creditLimit !== undefined) fields.creditLimit = input.creditLimit === null ? null : Number(input.creditLimit)
    if (input.notes !== undefined) fields.notes = String(input.notes)

    if (Object.keys(fields).length === 0) return { error: 'No fields provided. Supported: paymentTerms, creditLimit, notes' }

    const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } })
    if (!org) return { error: `Client not found: ${orgId}` }

    await prisma.organization.update({ where: { id: orgId }, data: fields })
    await prisma.auditEvent.create({
      data: { entityType: 'Organization', entityId: orgId, action: 'client_updated_by_ai', userId: ctx.userId, metadata: fields as Prisma.InputJsonValue },
    })

    return { success: true, name: org.name, updated: Object.keys(fields), link: `/admin/clients/${orgId}` }
  },

  add_client_note: async (input, ctx) => {
    const orgId = String(input.orgId)
    const content = String(input.content ?? '')
    if (!content.trim()) return { error: 'Note content cannot be empty' }

    const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } })
    if (!org) return { error: `Client not found: ${orgId}` }

    await prisma.clientNote.create({ data: { organizationId: orgId, authorId: ctx.userId, content: content.trim() } })
    return { success: true, addedTo: org.name, link: `/admin/clients/${orgId}` }
  },

  get_wholesale_applications: async (input) => {
    const status = String(input.status ?? 'PENDING')

    const apps = await prisma.wholesaleApplication.findMany({
      where: status === 'all' ? {} : { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return {
      count: apps.length,
      applications: apps.map(a => ({
        businessName: a.businessName, contactName: a.contactName,
        email: a.email, phone: a.phone,
        businessType: a.businessType, monthlyVolume: a.monthlyVolume,
        status: a.status, submittedAt: a.createdAt.toISOString().split('T')[0],
        link: `/admin/wholesale/${a.id}`,
      })),
    }
  },

  review_wholesale_application: async (input, ctx) => {
    const appId = String(input.applicationId)
    const action = String(input.action ?? '') as 'approve' | 'reject' | 'waitlist'
    const notes = input.notes ? String(input.notes) : null

    if (!['approve', 'reject', 'waitlist'].includes(action)) {
      return { error: 'action must be "approve", "reject", or "waitlist"' }
    }

    const app = await prisma.wholesaleApplication.findUnique({ where: { id: appId } })
    if (!app) return { error: `Application not found: ${appId}` }
    if (app.status === 'APPROVED') return { error: 'Application is already approved' }

    if (action === 'approve') {
      const isDistributorApplicant = app.businessType?.toLowerCase() === 'distributor'
      const org = await prisma.organization.create({
        data: {
          name: app.businessName, contactPerson: app.contactName,
          email: app.email, phone: app.phone, website: app.website,
          isWholesaler: !isDistributorApplicant, isDistributor: isDistributorApplicant,
          tier: 'VIP', paymentTerms: 'Net-30',
        },
      })

      await prisma.wholesaleApplication.update({
        where: { id: appId },
        data: { status: 'APPROVED', convertedOrgId: org.id, reviewNotes: notes, reviewedById: ctx.userId, reviewedAt: new Date() },
      })
      await prisma.auditEvent.create({
        data: { entityType: 'WholesaleApplication', entityId: appId, action: 'wholesale_approved', userId: ctx.userId, metadata: { organizationId: org.id } },
      })

      sendWelcomePartnerEmail({ name: app.contactName, email: app.email, businessName: app.businessName }).catch(() => {})
      clerkClient().then(clerk =>
        clerk.invitations.createInvitation({
          emailAddress: app.email,
          publicMetadata: { organizationId: org.id, organizationName: org.name, role: 'CLIENT' },
          redirectUrl: portalConfig.appUrl + '/sign-up',
        }).catch(() => {})
      ).catch(() => {})

      return {
        success: true, action: 'approved', businessName: app.businessName,
        orgId: org.id, isDistributor: isDistributorApplicant,
        note: 'Welcome email sent. Portal invite dispatched.',
        clientLink: `/admin/clients/${org.id}`,
      }
    }

    const statusMap = { reject: 'REJECTED', waitlist: 'WAITLISTED' } as const
    await prisma.wholesaleApplication.update({
      where: { id: appId },
      data: { status: statusMap[action as 'reject' | 'waitlist'], reviewNotes: notes, reviewedById: ctx.userId, reviewedAt: new Date() },
    })

    if (action === 'reject') {
      sendWholesaleRejectionEmail({ contactName: app.contactName, businessName: app.businessName, email: app.email }).catch(() => {})
    } else {
      sendApplicationStatusEmail({ contactName: app.contactName, businessName: app.businessName, email: app.email, status: 'WAITLISTED' }).catch(() => {})
    }

    return { success: true, action, businessName: app.businessName, link: `/admin/wholesale/${appId}` }
  },

  get_distributors: async () => {
    const distributors = await prisma.organization.findMany({
      where: { isDistributor: true },
      select: {
        id: true, name: true, email: true, distributorCcEmail: true,
        _count: { select: { suppliedProducts: true, distributorItems: true } },
      },
      take: 200,
    })
    return distributors.map(d => ({
      id: d.id, name: d.name, email: d.email,
      ccEmail: d.distributorCcEmail,
      productsAssigned: d._count.suppliedProducts,
      totalItemsFulfilled: d._count.distributorItems,
      link: `/admin/clients/${d.id}`,
    }))
  },

  get_lapsed_clients: async (input) => {
    const daysSince = Number(input.daysSince ?? 30)
    return cachedTool(`tool:get_lapsed_clients:${daysSince}`, 900, async () => {
    const cutoff = new Date(Date.now() - daysSince * 24 * 60 * 60 * 1000)

    const orgs = await prisma.organization.findMany({
      where: { isWholesaler: true },
      select: {
        id: true, name: true, email: true, phone: true, contactPerson: true, tier: true,
        orders: {
          where: { status: { not: 'CANCELLED' } },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true, orderNumber: true, total: true },
        },
      },
      take: 1000,
    })

    const lapsed = orgs
      .filter(o => o.orders.length === 0 || o.orders[0].createdAt < cutoff)
      .sort((a, b) => {
        const aDate = a.orders[0]?.createdAt.getTime() ?? 0
        const bDate = b.orders[0]?.createdAt.getTime() ?? 0
        return aDate - bDate
      })

    return {
      count: lapsed.length,
      daysSince,
      clients: lapsed.map(o => ({
        id: o.id,
        name: o.name,
        email: o.email,
        phone: o.phone,
        contactPerson: o.contactPerson,
        tier: o.tier,
        lastOrderDate: o.orders[0]?.createdAt.toISOString().split('T')[0] ?? 'Never',
        lastOrderNumber: o.orders[0]?.orderNumber ?? null,
        daysSinceLastOrder: o.orders[0]
          ? Math.floor((Date.now() - o.orders[0].createdAt.getTime()) / (1000 * 60 * 60 * 24))
          : null,
        link: `/admin/clients/${o.id}`,
      })),
    }
    })
  },

  get_client_lifetime_value: async (input) => {
    const orgId = String(input.orgId)
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        name: true, tier: true, loyaltyPoints: true, createdAt: true, paymentTerms: true,
        orders: {
          where: { status: { not: 'CANCELLED' } },
          select: { total: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
        invoices: {
          where: { status: { in: ['PENDING', 'OVERDUE'] } },
          select: { total: true, status: true, dueDate: true },
        },
      },
    })
    if (!org) return { error: 'Client not found' }

    const orders = org.orders
    const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0)
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0
    const lastOrder = orders[orders.length - 1]
    const firstOrder = orders[0]
    const daysSinceLast = lastOrder ? Math.floor((Date.now() - lastOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : null
    const clientAgeDays = Math.floor((Date.now() - org.createdAt.getTime()) / (1000 * 60 * 60 * 24))

    let avgDaysBetweenOrders: number | null = null
    if (orders.length >= 2) {
      const gaps = orders.slice(1).map((o, i) => (o.createdAt.getTime() - orders[i].createdAt.getTime()) / 86400000)
      avgDaysBetweenOrders = Math.round(gaps.reduce((a, b) => a + b) / gaps.length)
    }

    const outstanding = org.invoices.reduce((s, i) => s + Number(i.total), 0)

    return {
      name: org.name, tier: org.tier, loyaltyPoints: org.loyaltyPoints,
      totalRevenue: formatCurrency(totalRevenue),
      orderCount: orders.length,
      avgOrderValue: formatCurrency(avgOrderValue),
      avgDaysBetweenOrders,
      firstOrderDate: firstOrder?.createdAt.toISOString().split('T')[0] ?? 'None',
      lastOrderDate: lastOrder?.createdAt.toISOString().split('T')[0] ?? 'None',
      daysSinceLastOrder: daysSinceLast,
      clientAgeDays,
      outstandingBalance: formatCurrency(outstanding),
      link: `/admin/clients/${orgId}`,
    }
  },

  get_credit_utilization: async (input) => {
    const { threshold = 80 } = input as { threshold?: number }
    type UtilRow = { id: string; name: string; email: string; creditLimit: string; outstanding: string }
    const rows = await prisma.$queryRaw<UtilRow[]>`
      SELECT o.id, o.name, o.email,
             o."creditLimit"::text AS "creditLimit",
             COALESCE(SUM(i.total), 0)::text AS outstanding
      FROM "Organization" o
      LEFT JOIN "Invoice" i
        ON i."organizationId" = o.id
        AND i.status IN ('PENDING', 'OVERDUE')
      WHERE o."creditLimit" IS NOT NULL
      GROUP BY o.id, o.name, o.email, o."creditLimit"
    `
    const results = rows.map((r) => {
      const limit = Number(r.creditLimit)
      const used = Number(r.outstanding)
      const pct = limit > 0 ? Math.round((used / limit) * 100) : 0
      return { name: r.name, email: r.email, creditLimit: limit, outstanding: used, utilizationPct: pct, link: `/admin/clients/${r.id}` }
    })
    const flagged = results.filter(r => r.utilizationPct >= threshold).sort((a, b) => b.utilizationPct - a.utilizationPct)
    return { threshold, flaggedCount: flagged.length, clients: flagged }
  },
}

// ---------------------------------------------------------------------------
// Client-related Anthropic tool definitions
// ---------------------------------------------------------------------------

export const clientToolDefinitions: Tool[] = [
  {
    name: 'search_clients',
    description: 'Search client organizations by name, email, or contact. Use this FIRST before any action that needs an orgId. Natural triggers: any client name, "find [name]", "look up [business]", "the [hotel/restaurant] account".',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Name, email, or contact to search for' },
        limit: { type: 'number', description: 'Max results (default 5)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_client_detail',
    description: 'Full client profile: contact info, recent orders, outstanding invoices, notes, members. Use after search_clients. Triggers: "tell me about [client]", "what\'s their account look like?", "[client]\'s history".',
    input_schema: {
      type: 'object' as const,
      properties: {
        orgId: { type: 'string', description: 'The organization ID' },
      },
      required: ['orgId'],
    },
  },
  {
    name: 'update_client_tier',
    description: 'Change a client\'s pricing tier (NEW, REPEAT, or VIP). Sends a tier upgrade email to the client. Use the orgId from search_clients.',
    input_schema: {
      type: 'object' as const,
      properties: {
        orgId: { type: 'string', description: 'The organization ID' },
        tier: { type: 'string', enum: ['NEW', 'REPEAT', 'VIP'] },
      },
      required: ['orgId', 'tier'],
    },
  },
  {
    name: 'update_client',
    description: 'Update a client\'s payment terms, credit limit, or internal notes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        orgId: { type: 'string', description: 'The organization ID' },
        paymentTerms: { type: 'string', enum: ['COD', 'Net-15', 'Net-30', 'Net-45', 'Net-60', 'Net-90'] },
        creditLimit: { type: 'number', description: 'Credit limit in dollars, or null to remove' },
        notes: { type: 'string', description: 'Internal notes (replaces existing notes)' },
      },
      required: ['orgId'],
    },
  },
  {
    name: 'add_client_note',
    description: 'Add an internal note to a client\'s account. Notes are visible to all staff. Great for logging calls, issues, or context.',
    input_schema: {
      type: 'object' as const,
      properties: {
        orgId: { type: 'string', description: 'The organization ID' },
        content: { type: 'string', description: 'The note text to add' },
      },
      required: ['orgId', 'content'],
    },
  },
  {
    name: 'get_wholesale_applications',
    description: 'Partner / wholesale applications awaiting review. Use for "any new applications?", "who applied?", "pending signups", "review applications".',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED', 'all'], description: 'Filter by status (default: PENDING)' },
      },
    },
  },
  {
    name: 'review_wholesale_application',
    description: 'Approve, reject, or waitlist a wholesale partner application. On approve: creates the org, sends welcome email, and dispatches Clerk portal invite. On reject/waitlist: sends status email.',
    input_schema: {
      type: 'object' as const,
      properties: {
        applicationId: { type: 'string', description: 'The WholesaleApplication ID (from get_wholesale_applications)' },
        action: { type: 'string', enum: ['approve', 'reject', 'waitlist'] },
        notes: { type: 'string', description: 'Optional internal review notes' },
      },
      required: ['applicationId', 'action'],
    },
  },
  {
    name: 'get_distributors',
    description: 'List all distributor organizations with their assigned product count. Use before assign_distributor_to_product to get valid distributor IDs.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'get_lapsed_clients',
    description: 'Find partners who haven\'t placed an order in X days. Use for "who hasn\'t ordered lately?", "who might be churning?", "lapsed clients", "who should I follow up with?", "inactive accounts".',
    input_schema: {
      type: 'object' as const,
      properties: {
        daysSince: { type: 'number', description: 'Days since last order (default 30). Try 14 for recent lapse, 60 for long-term.' },
      },
    },
  },
  {
    name: 'get_client_lifetime_value',
    description: 'Deep analysis of a single client: total spend, order count, average order value, days since last order, order frequency. Use for "what\'s [client] worth?", "tell me more about [client]", "are they a good customer?".',
    input_schema: {
      type: 'object' as const,
      properties: {
        orgId: { type: 'string', description: 'Organization ID (use search_clients to get this first)' },
      },
      required: ['orgId'],
    },
  },
  {
    name: 'get_credit_utilization',
    description: 'Find clients who are using a high percentage of their credit limit. Returns clients at or above the threshold. Use for "who is near their credit limit?", "credit utilization", "high credit usage", "clients close to limit".',
    input_schema: {
      type: 'object' as const,
      properties: {
        threshold: { type: 'number', description: 'Utilization % threshold (default 80). Returns clients at or above this level.' },
      },
    },
  },
]
