import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const patchDropSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  category: z.string().max(100).nullable().optional(),
  dropDate: z.string().datetime().optional(),
  description: z.string().max(5000).nullable().optional(),
  productId: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
  priceNote: z.string().max(500).nullable().optional(),
  quantityTotal: z.number().int().min(0).nullable().optional(),
  quantitySold: z.number().int().min(0).optional(),
  activeUntil: z.string().datetime().nullable().optional(),
  featured: z.boolean().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const parsed = patchDropSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const {
      title,
      category,
      dropDate,
      description,
      productId,
      isPublic,
      priceNote,
      quantityTotal,
      quantitySold,
      activeUntil,
      featured,
    } = parsed.data

    const data: Record<string, unknown> = {}
    if (title !== undefined) data.title = title
    if (category !== undefined) data.category = category ?? null
    if (dropDate !== undefined) data.dropDate = new Date(dropDate)
    if (description !== undefined) data.description = description ?? null
    if (productId !== undefined) data.productId = productId ?? null
    if (isPublic !== undefined) data.isPublic = isPublic
    if (priceNote !== undefined) data.priceNote = priceNote ?? null
    if (quantityTotal !== undefined) data.quantityTotal = quantityTotal ?? null
    if (quantitySold !== undefined) data.quantitySold = quantitySold
    if (activeUntil !== undefined) data.activeUntil = activeUntil ? new Date(activeUntil) : null
    if (featured !== undefined) data.featured = featured

    const drop = await prisma.productDrop.update({
      where: { id },
      data,
      include: {
        _count: { select: { alerts: true } },
        product: { select: { name: true } },
      },
    })

    await prisma.auditEvent.create({
      data: { entityType: 'ProductDrop', entityId: id, action: 'updated', userId },
    })

    return NextResponse.json({ drop })
  } catch (err) {
    console.error('PATCH /api/admin/drops/[id] error:', err)
    return NextResponse.json({ error: 'Failed to update drop' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  void req

  try {
    const { id } = await params
    await prisma.productDrop.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/drops/[id] error:', err)
    return NextResponse.json({ error: 'Failed to delete drop' }, { status: 500 })
  }
}
