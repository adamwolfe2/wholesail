import type { Tool } from '@anthropic-ai/sdk/resources/messages'
import type { OrderStatus, Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { cachedTool, invalidateToolCache } from '@/lib/ai/tool-cache'
import { updateOrderStatus } from '@/lib/db/orders'
import {
  sendWelcomePartnerEmail,
  sendWholesaleRejectionEmail,
  sendApplicationStatusEmail,
  sendTierUpgradeEmail,
  sendInvoiceEmail,
} from '@/lib/email'
import { clerkClient } from '@clerk/nextjs/server'
import { portalConfig } from '@/lib/portal-config'

// ---------------------------------------------------------------------------
// Tool execute functions (keyed by tool name)
// ---------------------------------------------------------------------------
type ToolInput = Record<string, unknown>
type ToolContext = { userId: string }

export const toolExecutors: Record<string, (input: ToolInput, ctx: ToolContext) => Promise<unknown>> = {
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

    // Compute totalSpend via aggregate instead of loading all order rows
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

  get_recent_orders: async (input) => {
    const limit = Number(input.limit ?? 10)
    const status = input.status as string | undefined

    const orders = await prisma.order.findMany({
      where: status ? { status: status as 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' } : undefined,
      include: { organization: { select: { name: true } }, items: { select: { name: true, quantity: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return orders.map(o => ({
      id: o.id, orderNumber: o.orderNumber, status: o.status,
      client: o.organization.name,
      total: formatCurrency(o.total),
      items: o.items.map(i => `${i.name} × ${i.quantity}`),
      createdAt: o.createdAt.toISOString().split('T')[0],
      checklist: {
        adminConfirmed: o.adminConfirmedAt !== null,
        distributor: o.distributorConfirmedAt !== null,
        client: o.clientConfirmedAt !== null,
      },
      link: `/admin/orders/${o.id}`,
    }))
  },

  get_order_detail: async (input) => {
    const identifier = String(input.identifier)
    const isOrderNumber = identifier.startsWith('ORD-')

    const order = await prisma.order.findFirst({
      where: isOrderNumber ? { orderNumber: identifier } : { id: identifier },
      include: {
        organization: { select: { name: true, email: true, phone: true } },
        items: true,
        payments: true,
        invoice: { select: { invoiceNumber: true, status: true, dueDate: true, total: true } },
        shipment: { select: { trackingNumber: true, carrier: true, status: true } },
        distributorOrg: { select: { name: true } },
      },
    })

    if (!order) return { error: 'Order not found' }

    return {
      id: order.id, orderNumber: order.orderNumber, status: order.status,
      client: order.organization,
      items: order.items.map(i => ({ name: i.name, qty: i.quantity, total: formatCurrency(i.total) })),
      total: formatCurrency(order.total),
      notes: order.notes, internalNotes: order.internalNotes,
      distributor: order.distributorOrg?.name ?? null,
      deliveryChecklist: {
        adminConfirmedAt: order.adminConfirmedAt?.toISOString() ?? null,
        distributorConfirmedAt: order.distributorConfirmedAt?.toISOString() ?? null,
        clientConfirmedAt: order.clientConfirmedAt?.toISOString() ?? null,
      },
      invoice: order.invoice ? { ...order.invoice, total: formatCurrency(order.invoice.total) } : null,
      shipment: order.shipment,
      createdAt: order.createdAt.toISOString().split('T')[0],
      link: `/admin/orders/${order.id}`,
    }
  },

  get_revenue_report: async (input) => {
    const period = String(input.period ?? 'this_month')
    // Cache all_time for 30min, other periods for 5min
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

  get_outstanding_invoices: async (input) => {
    const status = String(input.status ?? 'both')
    const limit = Number(input.limit ?? 20)
    return cachedTool(`tool:get_outstanding_invoices:${status}`, 300, async () => {
      const invoices = await prisma.invoice.findMany({
        where: status === 'both' ? { status: { in: ['PENDING', 'OVERDUE'] } } : { status: status as 'PENDING' | 'OVERDUE' },
        include: {
          organization: { select: { name: true, email: true, phone: true } },
          order: { select: { orderNumber: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: limit,
      })

      const totalAmt = invoices.reduce((s, i) => s + Number(i.total), 0)

      return {
        count: invoices.length,
        totalOutstanding: formatCurrency(totalAmt),
        invoices: invoices.map(i => ({
          invoiceNumber: i.invoiceNumber,
          orderNumber: i.order.orderNumber,
          client: i.organization.name,
          email: i.organization.email,
          phone: i.organization.phone,
          total: formatCurrency(i.total),
          status: i.status,
          dueDate: i.dueDate.toISOString().split('T')[0],
          daysOverdue: i.status === 'OVERDUE'
            ? Math.floor((Date.now() - i.dueDate.getTime()) / (1000 * 60 * 60 * 24))
            : 0,
        })),
      }
    })
  },

  get_products: async (input) => {
    const query = input.query ? String(input.query) : undefined
    const availableOnly = Boolean(input.availableOnly)
    const category = input.category ? String(input.category) : undefined

    const products = await prisma.product.findMany({
      where: {
        ...(availableOnly ? { available: true } : {}),
        ...(category ? { category: { contains: category, mode: 'insensitive' } } : {}),
        ...(query ? { OR: [{ name: { contains: query, mode: 'insensitive' } }, { category: { contains: query, mode: 'insensitive' } }] } : {}),
      },
      include: { inventoryLevel: { select: { quantityOnHand: true, quantityReserved: true, lowStockThreshold: true } } },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      take: 30,
    })

    return products.map(p => ({
      name: p.name, category: p.category,
      price: formatCurrency(p.price), unit: p.unit,
      available: p.available, marketRate: p.marketRate, coldChain: p.coldChainRequired,
      inventory: p.inventoryLevel
        ? { onHand: p.inventoryLevel.quantityOnHand, available: p.inventoryLevel.quantityOnHand - p.inventoryLevel.quantityReserved, lowStock: p.inventoryLevel.quantityOnHand < p.inventoryLevel.lowStockThreshold }
        : null,
      link: `/admin/products/${p.id}`,
    }))
  },

  get_low_stock_alerts: async () => {
    return cachedTool('tool:get_low_stock_alerts', 600, async () => {
      // Use raw SQL — Prisma can't compare two columns in a WHERE clause
      const low = await prisma.$queryRaw<Array<{
        id: string; quantityOnHand: number; quantityReserved: number; lowStockThreshold: number;
        name: string; category: string; productId: string;
      }>>`
        SELECT il.id, il."quantityOnHand", il."quantityReserved", il."lowStockThreshold",
               p.name, p.category, p.id AS "productId"
        FROM "InventoryLevel" il
        JOIN "Product" p ON p.id = il."productId"
        WHERE il."quantityOnHand" <= il."lowStockThreshold"
        ORDER BY il."quantityOnHand" ASC
      `

      return {
        count: low.length,
        items: low.map(l => ({
          product: l.name, category: l.category,
          onHand: l.quantityOnHand, reserved: l.quantityReserved, threshold: l.lowStockThreshold,
          link: `/admin/products/${l.productId}`,
        })),
      }
    })
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

  navigate_to: async (input) => {
    return { path: String(input.path), label: String(input.label) }
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

  // ---------------------------------------------------------------------------
  // WRITE TOOLS — AI Assistant can act on the platform
  // ---------------------------------------------------------------------------

  admin_confirm_order: async (input, ctx) => {
    if (input.all) {
      // Bulk confirm all orders awaiting step 1
      const orders = await prisma.order.findMany({
        where: { adminConfirmedAt: null, status: { in: ['CONFIRMED', 'PACKED', 'SHIPPED'] } },
        select: { id: true, orderNumber: true },
      })
      if (orders.length === 0) return { message: 'No orders need confirmation right now.' }

      await Promise.all(orders.map(o =>
        prisma.order.update({ where: { id: o.id }, data: { adminConfirmedAt: new Date() } })
      ))
      await prisma.auditEvent.createMany({
        data: orders.map(o => ({
          entityType: 'Order', entityId: o.id,
          action: 'admin_confirmed', userId: ctx.userId,
          metadata: { source: 'ai_assistant_bulk' },
        })),
      })
      await invalidateToolCache('tool:get_action_items')
      return {
        confirmed: orders.length,
        orders: orders.map(o => ({ orderNumber: o.orderNumber, link: `/admin/orders/${o.id}` })),
      }
    }

    const identifier = String(input.identifier ?? input.orderId ?? '')
    if (!identifier) return { error: 'Provide identifier (order number or ID) or all: true' }

    const isOrderNumber = identifier.startsWith('ORD-')
    const order = await prisma.order.findFirst({
      where: isOrderNumber ? { orderNumber: identifier } : { id: identifier },
      select: { id: true, orderNumber: true, adminConfirmedAt: true },
    })
    if (!order) return { error: `Order not found: ${identifier}` }
    if (order.adminConfirmedAt) return { message: `${order.orderNumber} was already confirmed on ${order.adminConfirmedAt.toLocaleDateString()}` }

    await prisma.order.update({ where: { id: order.id }, data: { adminConfirmedAt: new Date() } })
    await prisma.auditEvent.create({
      data: { entityType: 'Order', entityId: order.id, action: 'admin_confirmed', userId: ctx.userId, metadata: { source: 'ai_assistant' } },
    })
    await invalidateToolCache('tool:get_action_items')
    return { success: true, orderNumber: order.orderNumber, link: `/admin/orders/${order.id}` }
  },

  update_order_status: async (input, ctx) => {
    const identifier = String(input.identifier ?? input.orderId ?? '')
    const newStatus = String(input.newStatus ?? input.status ?? '')
    const validStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

    if (!identifier) return { error: 'Provide identifier (order number or ID)' }
    if (!validStatuses.includes(newStatus as OrderStatus)) {
      return { error: `Invalid status "${newStatus}". Valid: ${validStatuses.join(', ')}` }
    }

    const isOrderNumber = identifier.startsWith('ORD-')
    const order = await prisma.order.findFirst({
      where: isOrderNumber ? { orderNumber: identifier } : { id: identifier },
      select: { id: true, orderNumber: true, status: true },
    })
    if (!order) return { error: `Order not found: ${identifier}` }
    if (order.status === newStatus) return { message: `${order.orderNumber} is already ${newStatus}` }

    const updated = await updateOrderStatus(order.id, newStatus as OrderStatus, ctx.userId)
    // Invalidate caches affected by order status change
    await invalidateToolCache('tool:get_platform_summary', 'tool:get_revenue_report:this_month', 'tool:get_revenue_report:today', 'tool:get_action_items', 'tool:get_order_trends')
    return {
      success: true,
      orderNumber: order.orderNumber,
      previousStatus: order.status,
      newStatus: updated.status,
      link: `/admin/orders/${order.id}`,
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

    // Send tier upgrade email (fire-and-forget, only for REPEAT/VIP upgrades)
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

      // Welcome email + Clerk invite (fire-and-forget)
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

  update_product: async (input, ctx) => {
    const productId = String(input.productId)
    const fields: Record<string, unknown> = {}

    if (input.available !== undefined) fields.available = Boolean(input.available)
    if (input.price !== undefined) fields.price = Number(input.price)
    if (input.name !== undefined) fields.name = String(input.name)

    if (Object.keys(fields).length === 0) return { error: 'No fields provided. Supported: available (bool), price (number), name (string)' }

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { name: true } })
    if (!product) return { error: `Product not found: ${productId}` }

    await prisma.product.update({ where: { id: productId }, data: fields })
    await prisma.auditEvent.create({
      data: { entityType: 'Product', entityId: productId, action: 'product_updated_by_ai', userId: ctx.userId, metadata: fields as Prisma.InputJsonValue },
    })

    return { success: true, productName: product.name, updated: fields, link: `/admin/products/${productId}` }
  },

  assign_distributor_to_product: async (input, ctx) => {
    const productId = String(input.productId)
    const distributorOrgId = input.distributorOrgId ? String(input.distributorOrgId) : null

    if (distributorOrgId) {
      const dist = await prisma.organization.findFirst({ where: { id: distributorOrgId, isDistributor: true }, select: { name: true } })
      if (!dist) return { error: `No distributor found with ID: ${distributorOrgId}. Use get_distributors to see available distributors.` }
    }

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { name: true } })
    if (!product) return { error: `Product not found: ${productId}` }

    await prisma.product.update({ where: { id: productId }, data: { distributorOrgId } })
    await prisma.auditEvent.create({
      data: { entityType: 'Product', entityId: productId, action: 'distributor_assigned', userId: ctx.userId, metadata: { distributorOrgId } },
    })

    return {
      success: true, productName: product.name,
      distributorOrgId,
      message: distributorOrgId ? 'Distributor assigned.' : 'Distributor removed.',
      link: `/admin/products/${productId}`,
    }
  },

  generate_invoice: async (input, ctx) => {
    const identifier = String(input.identifier ?? input.orderId ?? '')
    const isOrderNumber = identifier.startsWith('ORD-')

    const order = await prisma.order.findFirst({
      where: isOrderNumber ? { orderNumber: identifier } : { id: identifier },
      include: { organization: { select: { name: true, email: true, contactPerson: true, paymentTerms: true } }, invoice: { select: { invoiceNumber: true } } },
    })
    if (!order) return { error: `Order not found: ${identifier}` }
    if (order.invoice) return { message: `Invoice ${order.invoice.invoiceNumber} already exists for ${order.orderNumber}`, link: `/admin/invoices` }

    // Calculate due date from org payment terms
    const dueDate = new Date()
    const terms = order.organization.paymentTerms ?? 'Net-30'
    const match = terms.match(/Net-(\d+)/i)
    if (match) dueDate.setDate(dueDate.getDate() + parseInt(match[1], 10))

    // Generate invoice number
    const year = new Date().getFullYear()
    const existingCount = await prisma.invoice.count({ where: { invoiceNumber: { startsWith: `INV-${year}-` } } })
    const invoiceNumber = `INV-${year}-${String(existingCount + 1).padStart(4, '0')}`

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber, orderId: order.id, organizationId: order.organizationId,
        dueDate, status: 'PENDING',
        subtotal: order.subtotal, tax: order.tax, total: order.total,
      },
    })
    await prisma.auditEvent.create({
      data: { entityType: 'Invoice', entityId: invoice.id, action: 'invoice_generated', userId: ctx.userId, metadata: { invoiceNumber, orderId: order.id } },
    })

    // Send invoice email (fire-and-forget)
    if (order.organization.email) {
      sendInvoiceEmail({
        invoiceNumber, customerName: order.organization.contactPerson || order.organization.name,
        customerEmail: order.organization.email, total: Number(order.total),
        dueDate: dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      }).catch(() => {})
    }

    // Invalidate invoice-related caches
    await invalidateToolCache('tool:get_outstanding_invoices:both', 'tool:get_outstanding_invoices:PENDING', 'tool:get_platform_summary')

    return {
      success: true, invoiceNumber, orderNumber: order.orderNumber,
      total: formatCurrency(order.total), dueDate: dueDate.toISOString().split('T')[0],
      emailSent: Boolean(order.organization.email),
      link: `/admin/invoices`,
    }
  },

  // ── ANALYTICS / INSIGHT TOOLS ───────────────────────────────────────────

  search_orders: async (input) => {
    const query = input.query ? String(input.query) : undefined
    const status = input.status ? String(input.status).toUpperCase() : undefined
    const limit = Number(input.limit ?? 15)
    const dateRange = input.dateRange ? String(input.dateRange) : undefined

    const now = new Date()
    let dateFilter: { gte: Date; lte?: Date } | undefined
    if (dateRange === 'today') dateFilter = { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) }
    else if (dateRange === 'this_week') dateFilter = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
    else if (dateRange === 'this_month') dateFilter = { gte: new Date(now.getFullYear(), now.getMonth(), 1) }
    else if (dateRange === 'last_month') {
      dateFilter = { gte: new Date(now.getFullYear(), now.getMonth() - 1, 1), lte: new Date(now.getFullYear(), now.getMonth(), 0) }
    }

    const orders = await prisma.order.findMany({
      where: {
        ...(status ? { status: status as 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' } : {}),
        ...(dateFilter ? { createdAt: dateFilter } : {}),
        ...(query ? {
          OR: [
            { orderNumber: { contains: query, mode: 'insensitive' } },
            { organization: { name: { contains: query, mode: 'insensitive' } } },
            { notes: { contains: query, mode: 'insensitive' } },
          ],
        } : {}),
      },
      include: {
        organization: { select: { name: true } },
        items: { select: { name: true, quantity: true }, take: 3 },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return orders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      client: o.organization.name,
      status: o.status,
      total: formatCurrency(o.total),
      items: o.items.map(i => `${i.name} × ${i.quantity}`),
      createdAt: o.createdAt.toISOString().split('T')[0],
      awaitingConfirmation: !o.adminConfirmedAt && ['CONFIRMED', 'PACKED', 'SHIPPED'].includes(o.status),
      link: `/admin/orders/${o.id}`,
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
        return aDate - bDate // oldest first
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
    }) // end cachedTool
  },

  get_top_products: async (input) => {
    const limit = Number(input.limit ?? 10)
    const metric = String(input.metric ?? 'revenue')
    return cachedTool(`tool:get_top_products:${metric}`, 900, async () => {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const allTimeRaw = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: { order: { status: { not: 'CANCELLED' } } },
        _sum: { total: true, quantity: true },
        orderBy: metric === 'volume' ? { _sum: { quantity: 'desc' } } : { _sum: { total: 'desc' } },
        take: limit,
      })

      const thisMonthRaw = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: { order: { status: { not: 'CANCELLED' }, createdAt: { gte: startOfMonth } } },
        _sum: { total: true, quantity: true },
        orderBy: metric === 'volume' ? { _sum: { quantity: 'desc' } } : { _sum: { total: 'desc' } },
        take: limit,
      })

      const allIds = [...new Set([...allTimeRaw.map(p => p.productId), ...thisMonthRaw.map(p => p.productId)])].filter((id): id is string => id !== null)
      const products = await prisma.product.findMany({
        where: { id: { in: allIds } },
        select: { id: true, name: true, category: true },
      })
      const productMap = Object.fromEntries(products.map(p => [p.id, p]))

      return {
        metric,
        allTime: allTimeRaw.map((p, i) => ({
          rank: i + 1,
          name: (p.productId ? productMap[p.productId]?.name : undefined) ?? 'Unknown',
          category: (p.productId ? productMap[p.productId]?.category : undefined) ?? null,
          revenue: formatCurrency(p._sum.total ?? 0),
          unitsSold: p._sum.quantity ?? 0,
        })),
        thisMonth: thisMonthRaw.map((p, i) => ({
          rank: i + 1,
          name: (p.productId ? productMap[p.productId]?.name : undefined) ?? 'Unknown',
          category: (p.productId ? productMap[p.productId]?.category : undefined) ?? null,
          revenue: formatCurrency(p._sum.total ?? 0),
          unitsSold: p._sum.quantity ?? 0,
        })),
      }
    })
  },

  get_order_trends: async () => {
    return cachedTool('tool:get_order_trends', 300, async () => {
    const now = new Date()
    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const [thisMonth, lastMonth, thisWeek, lastWeek, newClientsThisMonth, newClientsLastMonth] =
      await Promise.all([
        prisma.order.aggregate({ where: { createdAt: { gte: startThisMonth }, status: { not: 'CANCELLED' } }, _sum: { total: true }, _count: true }),
        prisma.order.aggregate({ where: { createdAt: { gte: startLastMonth, lte: endLastMonth }, status: { not: 'CANCELLED' } }, _sum: { total: true }, _count: true }),
        prisma.order.aggregate({ where: { createdAt: { gte: thisWeekStart }, status: { not: 'CANCELLED' } }, _sum: { total: true }, _count: true }),
        prisma.order.aggregate({ where: { createdAt: { gte: lastWeekStart, lt: thisWeekStart }, status: { not: 'CANCELLED' } }, _sum: { total: true }, _count: true }),
        prisma.organization.count({ where: { createdAt: { gte: startThisMonth } } }),
        prisma.organization.count({ where: { createdAt: { gte: startLastMonth, lte: endLastMonth } } }),
      ])

    const tmRev = Number(thisMonth._sum.total ?? 0)
    const lmRev = Number(lastMonth._sum.total ?? 0)
    const twRev = Number(thisWeek._sum.total ?? 0)
    const lwRev = Number(lastWeek._sum.total ?? 0)

    const pct = (a: number, b: number) => b > 0 ? `${((a - b) / b * 100) >= 0 ? '+' : ''}${((a - b) / b * 100).toFixed(1)}%` : 'N/A'

    return {
      thisMonth: { revenue: formatCurrency(tmRev), orders: thisMonth._count, newClients: newClientsThisMonth },
      lastMonth: { revenue: formatCurrency(lmRev), orders: lastMonth._count, newClients: newClientsLastMonth },
      monthOverMonth: { revenue: pct(tmRev, lmRev), orders: pct(thisMonth._count, lastMonth._count) },
      thisWeek: { revenue: formatCurrency(twRev), orders: thisWeek._count },
      lastWeek: { revenue: formatCurrency(lwRev), orders: lastWeek._count },
      weekOverWeek: { revenue: pct(twRev, lwRev), orders: pct(thisWeek._count, lastWeek._count) },
    }
    }) // end cachedTool
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

  // ── MORE WRITE TOOLS ─────────────────────────────────────────────────────

  send_invoice_reminder: async (input, ctx) => {
    let where: { organizationId?: string; invoiceNumber?: string; status?: { in: ('PENDING' | 'OVERDUE')[] } } = { status: { in: ['PENDING', 'OVERDUE'] } }

    if (input.invoiceNumber) {
      where = { invoiceNumber: String(input.invoiceNumber) }
    } else if (input.orgId) {
      where = { organizationId: String(input.orgId), status: { in: ['PENDING', 'OVERDUE'] } }
    } else {
      return { error: 'Provide invoiceNumber or orgId' }
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: { organization: { select: { name: true, email: true, contactPerson: true } } },
      orderBy: { dueDate: 'asc' },
      take: 100,
    })
    if (invoices.length === 0) return { message: 'No outstanding invoices found for that client.' }

    let sent = 0
    for (const inv of invoices) {
      if (!inv.organization.email) continue
      await sendInvoiceEmail({
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.organization.contactPerson || inv.organization.name,
        customerEmail: inv.organization.email,
        total: Number(inv.total),
        dueDate: inv.dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        isReminder: true,
      })
      await prisma.invoice.update({ where: { id: inv.id }, data: { reminderSentAt: new Date() } })
      sent++
    }

    await prisma.auditEvent.create({
      data: {
        entityType: 'Invoice', entityId: invoices[0].id,
        action: 'invoice_reminder_sent', userId: ctx.userId,
        metadata: { count: sent } as Prisma.InputJsonValue,
      },
    })
    return { success: true, remindersSent: sent, invoices: invoices.map(i => ({ invoiceNumber: i.invoiceNumber, client: i.organization.name })) }
  },

  create_task: async (input, ctx) => {
    const title = String(input.title ?? '').trim()
    if (!title) return { error: 'Task title required' }

    const orgId = input.orgId ? String(input.orgId) : null
    const priority = String(input.priority ?? 'NORMAL').toUpperCase()
    const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT']
    if (!validPriorities.includes(priority)) return { error: `Invalid priority. Valid: ${validPriorities.join(', ')}` }

    const dueDate = input.dueDate ? new Date(String(input.dueDate)) : null

    const task = await prisma.repTask.create({
      data: {
        repId: ctx.userId,
        organizationId: orgId,
        title,
        description: input.description ? String(input.description) : null,
        dueDate,
        priority,
      },
    })

    let orgName: string | null = null
    if (orgId) {
      const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } })
      orgName = org?.name ?? null
    }

    await invalidateToolCache('tool:get_action_items')
    return {
      success: true, taskId: task.id, title: task.title,
      dueDate: dueDate?.toISOString().split('T')[0] ?? null,
      priority,
      linkedClient: orgName,
      link: '/admin/tasks',
    }
  },

  add_order_note: async (input, ctx) => {
    const identifier = String(input.identifier ?? input.orderId ?? '')
    const note = String(input.note ?? input.content ?? '').trim()
    if (!identifier) return { error: 'Provide identifier (order number or ID)' }
    if (!note) return { error: 'Note content required' }

    const isOrderNumber = identifier.startsWith('ORD-')
    const order = await prisma.order.findFirst({
      where: isOrderNumber ? { orderNumber: identifier } : { id: identifier },
      select: { id: true, orderNumber: true, internalNotes: true },
    })
    if (!order) return { error: `Order not found: ${identifier}` }

    const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const newNote = `[${timestamp}] ${note}`
    const updatedNotes = order.internalNotes ? `${order.internalNotes}\n${newNote}` : newNote

    await prisma.order.update({ where: { id: order.id }, data: { internalNotes: updatedNotes } })
    await prisma.auditEvent.create({
      data: { entityType: 'Order', entityId: order.id, action: 'internal_note_added', userId: ctx.userId },
    })
    return { success: true, orderNumber: order.orderNumber, link: `/admin/orders/${order.id}` }
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
    }) // end cachedTool
  },

  // ── HEALTH & GROWTH TOOLS ─────────────────────────────────────────────────

  get_client_health: async (input) => {
    const { orgId } = input as { orgId?: string }
    const now = new Date()
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    if (orgId) {
      return cachedTool(`tool:get_client_health:${orgId}`, 300, async () => {
      // Single client health breakdown
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
      }) // end cachedTool
    }

    // Portfolio health summary — 60 min TTL (expensive N+1 across all orgs)
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
    }) // end cachedTool
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
    // Delegate to the optimised lib/smart-reorder.ts which uses a single $queryRaw
    // for the per-org top-products aggregation instead of N+1 per org.
    const { getOverdueReorders } = await import('@/lib/smart-reorder')
    const overdue = await getOverdueReorders()
    const alerts = overdue.slice(0, limit).map((r) => ({
      client: r.orgName,
      email: '',  // getOverdueReorders doesn't return email; safe default
      avgCadenceDays: r.avgCadenceDays,
      daysSinceLastOrder: r.daysSinceLastOrder,
      daysOverdue: r.overdueDays,
      topProducts: r.topProducts,
      link: `/admin/clients/${r.orgId}`,
    }))
    return { count: alerts.length, alerts }
  },

  get_credit_utilization: async (input) => {
    const { threshold = 80 } = input as { threshold?: number }
    // Single query: join orgs with credit limits to their outstanding invoice totals
    // using a raw SQL GROUP BY to avoid N+1 per org.
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
// Anthropic tool definitions (JSON Schema format)
// ---------------------------------------------------------------------------
export const anthropicTools: Tool[] = [
  {
    name: 'get_platform_summary',
    description: 'High-level platform overview: total clients, orders, revenue, invoices. Use for "how are we doing?", "give me the numbers", "platform status", "overview".',
    input_schema: { type: 'object' as const, properties: {} },
  },
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
    name: 'get_recent_orders',
    description: 'Most recent orders with status, client, total. Use for "any new orders?", "what came in today?", "show me pending orders", "what\'s in the pipeline?".',
    input_schema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'Max results (default 10)' },
        status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'], description: 'Filter by status' },
      },
    },
  },
  {
    name: 'get_order_detail',
    description: 'Get full details for a specific order by order number (ORD-XXXX-XXXX) or order ID.',
    input_schema: {
      type: 'object' as const,
      properties: {
        identifier: { type: 'string', description: 'Order number like ORD-2026-0001 or the order UUID' },
      },
      required: ['identifier'],
    },
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
    name: 'get_outstanding_invoices',
    description: 'All pending or overdue invoices with amounts and due dates. Use for "who owes me money?", "collections", "what\'s outstanding?", "cash flow", "overdue accounts", "unpaid invoices".',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', enum: ['PENDING', 'OVERDUE', 'both'], description: 'Which invoice statuses to include (default: both)' },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'get_products',
    description: 'Search the product catalog with pricing, availability, and inventory status.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search by name or category' },
        availableOnly: { type: 'boolean' },
        category: { type: 'string' },
      },
    },
  },
  {
    name: 'get_low_stock_alerts',
    description: 'Get all products at or below their low-stock threshold.',
    input_schema: { type: 'object' as const, properties: {} },
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
    name: 'navigate_to',
    description: 'Generate a link to any admin page.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'The path, e.g. /admin/orders' },
        label: { type: 'string', description: 'Human-readable link label' },
      },
      required: ['path', 'label'],
    },
  },
  {
    name: 'get_action_items',
    description: 'Get everything that needs attention right now: urgent operational items (pending orders, overdue invoices, unread messages, open tasks) AND platform setup gaps (products without distributors, orgs without portal access, missing distributor config). Call this when asked "what needs my attention", "what should I do today", or "platform health check".',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'get_distributors',
    description: 'List all distributor organizations with their assigned product count. Use before assign_distributor_to_product to get valid distributor IDs.',
    input_schema: { type: 'object' as const, properties: {} },
  },

  // ── WRITE TOOLS ──────────────────────────────────────────────────────────

  {
    name: 'admin_confirm_order',
    description: 'Confirm the admin delivery step 1 for an order (marks adminConfirmedAt). Pass identifier for a specific order, or all: true to confirm every order currently waiting. Use this when the admin says "confirm", "acknowledge", or "step 1".',
    input_schema: {
      type: 'object' as const,
      properties: {
        identifier: { type: 'string', description: 'Order number (ORD-XXXX-XXXX) or order ID' },
        all: { type: 'boolean', description: 'Set true to confirm ALL orders currently awaiting step 1' },
      },
    },
  },
  {
    name: 'update_order_status',
    description: 'Change an order\'s status. Valid statuses: PENDING, CONFIRMED, PACKED, SHIPPED, DELIVERED, CANCELLED. Also triggers Bloo.io iMessage notifications for SHIPPED and DELIVERED.',
    input_schema: {
      type: 'object' as const,
      properties: {
        identifier: { type: 'string', description: 'Order number (ORD-XXXX-XXXX) or order ID' },
        newStatus: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] },
      },
      required: ['identifier', 'newStatus'],
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
    name: 'update_product',
    description: 'Update a product\'s availability, price, or name. Use productId from get_products.',
    input_schema: {
      type: 'object' as const,
      properties: {
        productId: { type: 'string', description: 'The product ID (from get_products)' },
        available: { type: 'boolean', description: 'Toggle availability on/off' },
        price: { type: 'number', description: 'New price in dollars' },
        name: { type: 'string', description: 'New product name' },
      },
      required: ['productId'],
    },
  },
  {
    name: 'assign_distributor_to_product',
    description: 'Assign or remove a distributor from a product. This determines which distributor gets notified and fulfills that product\'s order items. Use get_distributors to get valid distributor IDs.',
    input_schema: {
      type: 'object' as const,
      properties: {
        productId: { type: 'string', description: 'The product ID (from get_products)' },
        distributorOrgId: { type: 'string', description: 'The distributor org ID, or null to remove the assignment' },
      },
      required: ['productId'],
    },
  },
  {
    name: 'generate_invoice',
    description: 'Create an invoice for an order and email it to the client. Uses the client\'s payment terms to set the due date. Fails gracefully if invoice already exists.',
    input_schema: {
      type: 'object' as const,
      properties: {
        identifier: { type: 'string', description: 'Order number (ORD-XXXX-XXXX) or order ID' },
      },
      required: ['identifier'],
    },
  },

  // ── ANALYTICS / INSIGHT TOOLS ────────────────────────────────────────────

  {
    name: 'search_orders',
    description: 'Search orders by client name, order number, status, or date range. Use when admin asks "find the [client] order", "show me orders this week", "any recent orders?", "what\'s shipping?", etc.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Client name, order number, or keyword to search for' },
        status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'], description: 'Filter by status' },
        dateRange: { type: 'string', enum: ['today', 'this_week', 'this_month', 'last_month'], description: 'Filter by date range' },
        limit: { type: 'number', description: 'Max results (default 15)' },
      },
    },
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
    name: 'get_top_products',
    description: 'Show bestselling products by revenue or volume. Use for "what\'s selling?", "best products", "top sellers", "what\'s not moving?", "slow movers".',
    input_schema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'Number of products to return (default 10)' },
        metric: { type: 'string', enum: ['revenue', 'volume'], description: 'Sort by revenue (dollars) or volume (units). Default: revenue' },
      },
    },
  },
  {
    name: 'get_order_trends',
    description: 'Period-over-period comparison: this week vs last week, this month vs last month, new clients, revenue change %. Use for "how are we doing?", "compare to last month", "are we growing?", "revenue trend".',
    input_schema: { type: 'object' as const, properties: {} },
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
    name: 'send_invoice_reminder',
    description: 'Send a payment reminder email to a client for their outstanding invoices. Use for "chase [client]", "remind them to pay", "send a reminder", "follow up on invoice". Shows the invoice as overdue/reminder.',
    input_schema: {
      type: 'object' as const,
      properties: {
        orgId: { type: 'string', description: 'Organization ID — sends reminders for all their outstanding invoices' },
        invoiceNumber: { type: 'string', description: 'Specific invoice number (e.g. INV-2026-0001)' },
      },
    },
  },
  {
    name: 'create_task',
    description: 'Create a follow-up task or reminder for yourself (or a rep). Use for "remind me to...", "create a task to...", "follow up with [client] on [date]", "set a reminder".',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'Short task title (required)' },
        description: { type: 'string', description: 'Optional longer description or context' },
        orgId: { type: 'string', description: 'Link this task to a specific client org (optional)' },
        dueDate: { type: 'string', description: 'Due date as ISO string or natural date like "2026-03-01"' },
        priority: { type: 'string', enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'], description: 'Default: NORMAL' },
      },
      required: ['title'],
    },
  },
  {
    name: 'add_order_note',
    description: 'Add an internal note to a specific order (visible to staff, not clients). Use for "note on that order", "add a note to [order]", "log that [client] wants early delivery", "internal note".',
    input_schema: {
      type: 'object' as const,
      properties: {
        identifier: { type: 'string', description: 'Order number (ORD-XXXX-XXXX) or order ID' },
        note: { type: 'string', description: 'The internal note to add' },
      },
      required: ['identifier', 'note'],
    },
  },

  // ── HEALTH, LOYALTY & GROWTH TOOLS ────────────────────────────────────────

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
