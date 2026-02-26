import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const drops = await prisma.productDrop.findMany({
      orderBy: { dropDate: 'asc' },
      include: {
        _count: { select: { alerts: true } },
        product: { select: { name: true } },
      },
    })
    return NextResponse.json({ drops })
  } catch (err) {
    console.error('GET /api/admin/drops error:', err)
    return NextResponse.json({ error: 'Failed to fetch drops' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAdmin()
  if (error) return error

  try {
    const body = await req.json().catch(() => ({}))
    const {
      title,
      category,
      dropDate,
      description,
      productId,
      isPublic,
      priceNote,
      quantityTotal,
      activeUntil,
      featured,
    } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!dropDate) {
      return NextResponse.json({ error: 'Drop date is required' }, { status: 400 })
    }

    const drop = await prisma.productDrop.create({
      data: {
        title: title.trim(),
        category: category?.trim() || null,
        dropDate: new Date(dropDate),
        description: description?.trim() || null,
        productId: productId || null,
        isPublic: isPublic !== false,
        priceNote: priceNote?.trim() || null,
        quantityTotal: quantityTotal != null ? Number(quantityTotal) : null,
        activeUntil: activeUntil ? new Date(activeUntil) : null,
        featured: Boolean(featured),
      },
      include: {
        _count: { select: { alerts: true } },
        product: { select: { name: true } },
      },
    })

    await prisma.auditEvent.create({
      data: { entityType: 'ProductDrop', entityId: drop.id, action: 'created', userId },
    })

    return NextResponse.json({ drop }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/drops error:', err)
    return NextResponse.json({ error: 'Failed to create drop' }, { status: 500 })
  }
}
