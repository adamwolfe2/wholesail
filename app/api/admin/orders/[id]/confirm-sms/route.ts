import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, status: true, orderNumber: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Order is already ${order.status} — cannot confirm from this state` },
        { status: 409 }
      )
    }

    const confirmed = await prisma.order.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        adminConfirmedAt: new Date(),
      },
      select: { id: true, orderNumber: true, status: true },
    })

    return NextResponse.json({ order: confirmed })
  } catch (err) {
    console.error('confirm-sms route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
