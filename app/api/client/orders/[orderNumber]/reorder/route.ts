import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getOrderByNumber } from '@/lib/db/orders'
import { getOrganizationByUserId } from '@/lib/db/organizations'

// POST /api/client/orders/[orderNumber]/reorder
// Returns the order items in a cart-compatible format so the client can
// call addItem() for each one without re-fetching the full order.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderNumber } = await params
    const order = await getOrderByNumber(orderNumber)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Org scope check — users may only reorder their own org's orders
    const org = await getOrganizationByUserId(userId)
    if (!org || order.organizationId !== org.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Map order items to a cart-compatible shape
    const cartItems = order.items.map((item) => ({
      id: item.product?.slug ?? item.id,
      name: item.name,
      // unitPrice and product.price are Decimal — coerce to number
      price: Number(item.product?.price ?? item.unitPrice),
      unit: item.product?.unit ?? 'each',
      category: item.product?.category ?? 'Other',
      quantity: item.quantity,
    }))

    return NextResponse.json({ items: cartItems })
  } catch (error) {
    console.error('Error processing reorder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
