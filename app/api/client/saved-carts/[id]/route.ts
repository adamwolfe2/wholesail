import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

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
    const body = await request.json()
    const name: string | undefined = typeof body.name === 'string' ? body.name.trim() : undefined

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Verify ownership
    const cart = await prisma.savedCart.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!cart) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (cart.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.savedCart.update({
      where: { id },
      data: { name },
      select: { id: true, name: true },
    })

    return NextResponse.json({ cart: updated })
  } catch (error) {
    console.error('Error renaming saved cart:', error)
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

    // Verify ownership
    const cart = await prisma.savedCart.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!cart) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (cart.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.savedCart.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting saved cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
