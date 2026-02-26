import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { notifyDistributorsForOrder } from '@/lib/db/orders'

async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.order.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  })
  return `ORD-${year}-${String(count + 1).padStart(4, '0')}`
}

function getNextRunDate(
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY',
  fromDate: Date
): Date {
  const d = new Date(fromDate)
  switch (frequency) {
    case 'WEEKLY':   d.setDate(d.getDate() + 7);  break
    case 'BIWEEKLY': d.setDate(d.getDate() + 14); break
    case 'MONTHLY':  d.setMonth(d.getMonth() + 1); break
  }
  return d
}

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'Cron secret not configured' }, { status: 503 })
  }

  const authHeader = req.headers instanceof Headers ? req.headers.get('authorization') : null
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (bearerToken !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  try {
    const dueOrders = await prisma.standingOrder.findMany({
      where: {
        isActive: true,
        nextRunDate: { lte: today },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, price: true, distributorOrgId: true } },
          },
        },
        organization: { select: { phone: true, name: true, email: true } },
      },
    })

    type Result = {
      standingOrderId: string
      standingOrderName: string
      orderId?: string
      orderNumber?: string
      status: 'created' | 'skipped' | 'error'
      error?: string
    }

    const results: Result[] = []

    for (const so of dueOrders) {
      if (so.items.length === 0) {
        results.push({
          standingOrderId: so.id,
          standingOrderName: so.name,
          status: 'skipped',
          error: 'Standing order has no items',
        })
        continue
      }

      try {
        const lineItems = so.items.map((item) => ({
          productId: item.productId,
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: Number(item.product.price),
          total: item.quantity * Number(item.product.price),
          distributorOrgId: item.product.distributorOrgId ?? null,
        }))

        const subtotal = lineItems.reduce((sum, i) => sum + i.total, 0)
        const orderNumber = await generateOrderNumber()
        const nextRunDate = getNextRunDate(so.frequency, today)

        const order = await prisma.order.create({
          data: {
            orderNumber,
            organizationId: so.organizationId,
            userId: so.userId,
            status: 'PENDING',
            subtotal,
            tax: 0,
            deliveryFee: 0,
            total: subtotal,
            notes: `Auto-generated from standing order: ${so.name}`,
            items: { create: lineItems },
          },
        })

        await prisma.standingOrder.update({
          where: { id: so.id },
          data: { nextRunDate },
        })

        notifyDistributorsForOrder({
          orderId: order.id,
          orderNumber,
          clientName: so.organization?.name ?? 'Client',
          clientEmail: so.organization?.email ?? null,
          deliveryAddress: null,
        }).catch(() => {})

        await prisma.auditEvent.create({
          data: {
            entityType: 'Order',
            entityId: order.id,
            action: 'standing_order_processed',
            metadata: {
              standingOrderId: so.id,
              standingOrderName: so.name,
              orderNumber: order.orderNumber,
              frequency: so.frequency,
              nextRunDate: nextRunDate.toISOString(),
            },
          },
        })

        // SMS confirmation to client
        const orgPhone = so.organization?.phone
          ? (await import("@/lib/integrations/blooio")).toE164(so.organization.phone)
          : null
        if (orgPhone) {
          const { sendMessage } = await import("@/lib/integrations/blooio")
          const itemSummary = so.items
            .slice(0, 3)
            .map((i: { product: { name: string }; quantity: number }) => `${i.quantity}× ${i.product.name}`)
            .join(", ")
          const more = so.items.length > 3 ? ` +${so.items.length - 3} more` : ""
          sendMessage({
            to: orgPhone,
            message: `Your standing order "${so.name}" has been placed (${orderNumber}): ${itemSummary}${more}. ${process.env.OPS_NAME ?? 'Our team'} will confirm shortly. Reply STOP to skip next week's order.`,
          }).catch(console.error)
        }

        results.push({
          standingOrderId: so.id,
          standingOrderName: so.name,
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: 'created',
        })
      } catch (err) {
        console.error(`Failed to process standing order ${so.id}:`, err)
        results.push({
          standingOrderId: so.id,
          standingOrderName: so.name,
          status: 'error',
          error: String(err),
        })
      }
    }

    return NextResponse.json({
      processed: dueOrders.length,
      created: results.filter((r) => r.status === 'created').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
      errors: results.filter((r) => r.status === 'error').length,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Standing order processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
