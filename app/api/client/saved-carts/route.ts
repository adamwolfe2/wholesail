import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const savedCartItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
})

const createCartSchema = z.object({
  name: z.string().optional(),
  items: z.array(savedCartItemSchema).min(1),
})

export async function GET() {
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
      return NextResponse.json({ carts: [] })
    }

    const carts = await prisma.savedCart.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: { slug: true, unit: true, category: true, price: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ carts })
  } catch (error) {
    console.error('Error fetching saved carts:', error)
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
    const parsed = createCartSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 })
    }

    const { name, items } = parsed.data

    const cart = await prisma.savedCart.create({
      data: {
        name: name ?? null,
        organizationId: user.organizationId,
        userId,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json({ cart }, { status: 201 })
  } catch (error) {
    console.error('Error saving cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
