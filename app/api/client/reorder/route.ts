import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { notifyDistributorsForOrder } from '@/lib/db/orders'

const reorderSchema = z.object({
  orderId: z.string().optional(),
  orderNumber: z.string().optional(),
})

async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.order.count()
  return `ORD-${year}-${String(count + 1).padStart(4, '0')}`
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = reorderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { orderId, orderNumber } = parsed.data

    if (!orderId && !orderNumber) {
      return NextResponse.json({ error: 'orderId or orderNumber required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    // Find the source order
    const sourceOrder = await prisma.order.findFirst({
      where: {
        organizationId: user.organizationId,
        ...(orderId ? { id: orderId } : { orderNumber }),
      },
      include: {
        items: true,
      },
    })

    if (!sourceOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const newOrderNumber = await generateOrderNumber()

    // Fetch CURRENT prices and availability for all products (not stale prices from source order)
    const reorderProductIds = sourceOrder.items.map((i) => i.productId)
    const reorderProducts = await prisma.product.findMany({
      where: { id: { in: reorderProductIds } },
      select: { id: true, name: true, price: true, available: true, distributorOrgId: true },
    })
    const productMap = new Map(reorderProducts.map((p) => [p.id, p]))

    // Filter out unavailable products
    const unavailable = sourceOrder.items.filter((item) => {
      const product = productMap.get(item.productId)
      return !product || product.available === false
    })
    const availableItems = sourceOrder.items.filter((item) => {
      const product = productMap.get(item.productId)
      return product && product.available !== false
    })

    if (availableItems.length === 0) {
      return NextResponse.json(
        { error: 'All items from this order are currently unavailable', unavailable: unavailable.map((i) => i.name) },
        { status: 422 }
      )
    }

    const subtotal = availableItems.reduce((sum, item) => {
      const product = productMap.get(item.productId)!
      return sum + Number(product.price) * item.quantity
    }, 0)

    const newOrder = await prisma.order.create({
      data: {
        orderNumber: newOrderNumber,
        organizationId: user.organizationId,
        userId,
        status: 'PENDING',
        subtotal,
        tax: 0,
        deliveryFee: 0,
        total: subtotal,
        notes: unavailable.length > 0
          ? `Reorder of ${sourceOrder.orderNumber} (${unavailable.length} item(s) unavailable, omitted)`
          : `Reorder of ${sourceOrder.orderNumber}`,
        items: {
          create: availableItems.map((item) => {
            const product = productMap.get(item.productId)!
            return {
              productId: item.productId,
              name: product.name,
              quantity: item.quantity,
              unitPrice: product.price,
              total: Number(product.price) * item.quantity,
              distributorOrgId: product.distributorOrgId ?? null,
            }
          }),
        },
      },
    })

    // Notify distributors (fire-and-forget)
    const reorderOrg = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { name: true, email: true },
    })
    notifyDistributorsForOrder({
      orderId: newOrder.id,
      orderNumber: newOrderNumber,
      clientName: reorderOrg?.name ?? 'Client',
      clientEmail: reorderOrg?.email ?? null,
      deliveryAddress: null,
    }).catch(() => {})

    await prisma.auditEvent.create({
      data: {
        entityType: 'Order',
        entityId: newOrder.id,
        action: 'reorder_created',
        userId,
        metadata: { sourceOrderId: sourceOrder.id, sourceOrderNumber: sourceOrder.orderNumber },
      },
    })

    return NextResponse.json({ order: newOrder }, { status: 201 })
  } catch (error) {
    console.error('Error creating reorder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
