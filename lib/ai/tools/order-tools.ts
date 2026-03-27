import type { Tool } from '@anthropic-ai/sdk/resources/messages'
import type { OrderStatus, Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { cachedTool, invalidateToolCache } from '@/lib/ai/tool-cache'
import { updateOrderStatus } from '@/lib/db/orders'

type ToolInput = Record<string, unknown>
type ToolContext = { userId: string }

// ---------------------------------------------------------------------------
// Order executor functions
// ---------------------------------------------------------------------------

export const orderExecutors: Record<string, (input: ToolInput, ctx: ToolContext) => Promise<unknown>> = {
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
      items: o.items.map(i => `${i.name} x ${i.quantity}`),
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
      items: o.items.map(i => `${i.name} x ${i.quantity}`),
      createdAt: o.createdAt.toISOString().split('T')[0],
      awaitingConfirmation: !o.adminConfirmedAt && ['CONFIRMED', 'PACKED', 'SHIPPED'].includes(o.status),
      link: `/admin/orders/${o.id}`,
    }))
  },

  admin_confirm_order: async (input, ctx) => {
    if (input.all) {
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
    await invalidateToolCache('tool:get_platform_summary', 'tool:get_revenue_report:this_month', 'tool:get_revenue_report:today', 'tool:get_action_items', 'tool:get_order_trends')
    return {
      success: true,
      orderNumber: order.orderNumber,
      previousStatus: order.status,
      newStatus: updated.status,
      link: `/admin/orders/${order.id}`,
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

  generate_invoice: async (input, ctx) => {
    const { sendInvoiceEmail } = await import('@/lib/email')
    const identifier = String(input.identifier ?? input.orderId ?? '')
    const isOrderNumber = identifier.startsWith('ORD-')

    const order = await prisma.order.findFirst({
      where: isOrderNumber ? { orderNumber: identifier } : { id: identifier },
      include: { organization: { select: { name: true, email: true, contactPerson: true, paymentTerms: true } }, invoice: { select: { invoiceNumber: true } } },
    })
    if (!order) return { error: `Order not found: ${identifier}` }
    if (order.invoice) return { message: `Invoice ${order.invoice.invoiceNumber} already exists for ${order.orderNumber}`, link: `/admin/invoices` }

    const dueDate = new Date()
    const terms = order.organization.paymentTerms ?? 'Net-30'
    const match = terms.match(/Net-(\d+)/i)
    if (match) dueDate.setDate(dueDate.getDate() + parseInt(match[1], 10))

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

    if (order.organization.email) {
      sendInvoiceEmail({
        invoiceNumber, customerName: order.organization.contactPerson || order.organization.name,
        customerEmail: order.organization.email, total: Number(order.total),
        dueDate: dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      }).catch(() => {})
    }

    await invalidateToolCache('tool:get_outstanding_invoices:both', 'tool:get_outstanding_invoices:PENDING', 'tool:get_platform_summary')

    return {
      success: true, invoiceNumber, orderNumber: order.orderNumber,
      total: formatCurrency(order.total), dueDate: dueDate.toISOString().split('T')[0],
      emailSent: Boolean(order.organization.email),
      link: `/admin/invoices`,
    }
  },

  send_invoice_reminder: async (input, ctx) => {
    const { sendInvoiceEmail } = await import('@/lib/email')
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
    })
  },

  navigate_to: async (input) => {
    return { path: String(input.path), label: String(input.label) }
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
}

// ---------------------------------------------------------------------------
// Order-related Anthropic tool definitions
// ---------------------------------------------------------------------------

export const orderToolDefinitions: Tool[] = [
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
    name: 'get_order_trends',
    description: 'Period-over-period comparison: this week vs last week, this month vs last month, new clients, revenue change %. Use for "how are we doing?", "compare to last month", "are we growing?", "revenue trend".',
    input_schema: { type: 'object' as const, properties: {} },
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
]
