import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const standingOrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
})

const createSchema = z.object({
  name: z.string().min(1),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']),
  nextRunDate: z.string().min(1),
  items: z.array(standingOrderItemSchema).min(1),
})

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.standingOrder.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: { select: { name: true, slug: true, price: true, unit: true, marketRate: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching standing orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 })
    }

    const { name, frequency, nextRunDate, items } = parsed.data

    const order = await prisma.standingOrder.create({
      data: {
        name,
        organizationId: user.organizationId,
        userId,
        frequency,
        nextRunDate: new Date(nextRunDate),
        isActive: true,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: { include: { product: { select: { name: true } } } } },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Error creating standing order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
