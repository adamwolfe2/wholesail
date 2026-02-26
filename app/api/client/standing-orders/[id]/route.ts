import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  nextRunDate: z.string().optional(),
  name: z.string().optional(),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']).optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1)
    .optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.standingOrder.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { isActive, nextRunDate, name, frequency, items } = parsed.data

    // If items are being replaced, use a transaction to delete + recreate
    let updated
    if (items) {
      updated = await prisma.$transaction(async (tx) => {
        await tx.standingOrderItem.deleteMany({ where: { standingOrderId: id } })
        return tx.standingOrder.update({
          where: { id },
          data: {
            ...(isActive !== undefined ? { isActive } : {}),
            ...(nextRunDate ? { nextRunDate: new Date(nextRunDate) } : {}),
            ...(name ? { name } : {}),
            ...(frequency ? { frequency } : {}),
            items: {
              create: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
            },
          },
          include: {
            items: { include: { product: { select: { name: true, slug: true } } } },
          },
        })
      })
    } else {
      updated = await prisma.standingOrder.update({
        where: { id },
        data: {
          ...(isActive !== undefined ? { isActive } : {}),
          ...(nextRunDate ? { nextRunDate: new Date(nextRunDate) } : {}),
          ...(name ? { name } : {}),
          ...(frequency ? { frequency } : {}),
        },
      })
    }

    return NextResponse.json({ order: updated })
  } catch (error) {
    console.error('Error updating standing order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.standingOrder.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.standingOrder.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting standing order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
