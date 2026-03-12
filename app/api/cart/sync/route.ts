import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const cartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().positive(),
  unit: z.string(),
  category: z.string(),
})

const syncSchema = z.object({
  items: z.array(cartItemSchema),
})

// POST /api/cart/sync — upsert cart for logged-in user
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ ok: true }) // silently no-op for anonymous

  try {
    const body = await req.json().catch(() => ({}))
    const parsed = syncSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 })
    }

    const { items } = parsed.data

    // Find org for this user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    })

    if (!user?.organizationId) {
      // User has no org yet — skip silently (they haven't placed an order yet)
      return NextResponse.json({ ok: true })
    }

    const existing = await prisma.savedCart.findFirst({
      where: { userId, organizationId: user.organizationId },
      select: { id: true },
    })

    if (items.length === 0) {
      // Empty cart — delete the saved cart if it exists
      if (existing) {
        await prisma.savedCartItem.deleteMany({ where: { cartId: existing.id } })
        await prisma.savedCart.delete({ where: { id: existing.id } })
      }
      return NextResponse.json({ ok: true })
    }

    if (existing) {
      // Update existing cart — replace all items
      await prisma.$transaction([
        prisma.savedCartItem.deleteMany({ where: { cartId: existing.id } }),
        prisma.savedCart.update({
          where: { id: existing.id },
          data: {
            // Reset abandonment email flag when cart is actively updated
            lastAbandonmentEmailAt: null,
            items: {
              create: items.map((item) => ({
                productId: item.id,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.price,
              })),
            },
          },
        }),
      ])
    } else {
      // Resolve product IDs — items from localStorage use slug or DB id
      const productIds = items.map((item) => item.id)
      const products = await prisma.product.findMany({
        where: { OR: [{ id: { in: productIds } }, { slug: { in: productIds } }] },
        select: { id: true, slug: true },
      })
      const productByIdOrSlug = new Map<string, string>()
      for (const p of products) {
        productByIdOrSlug.set(p.id, p.id)
        if (p.slug) productByIdOrSlug.set(p.slug, p.id)
      }
      const resolvedItems = items.map((item) => ({
        ...item,
        productId: productByIdOrSlug.get(item.id) ?? item.id,
      }))

      await prisma.savedCart.create({
        data: {
          userId,
          organizationId: user.organizationId,
          items: {
            create: resolvedItems.map((item) => ({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.price,
            })),
          },
        },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Cart sync error:', err)
    return NextResponse.json({ error: 'Cart sync failed' }, { status: 500 })
  }
}

// DELETE /api/cart/sync — clear cart on checkout
export async function DELETE(_req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ ok: true })

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    })

    if (user?.organizationId) {
      const cart = await prisma.savedCart.findFirst({
        where: { userId, organizationId: user.organizationId },
        select: { id: true },
      })
      if (cart) {
        await prisma.savedCartItem.deleteMany({ where: { cartId: cart.id } })
        await prisma.savedCart.delete({ where: { id: cart.id } })
      }
    }
  } catch (err) {
    console.error('Cart clear error:', err)
  }

  return NextResponse.json({ ok: true })
}
