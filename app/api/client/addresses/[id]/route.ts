import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify the address belongs to the user's org
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    })

    const address = await prisma.address.findUnique({
      where: { id },
      select: { organizationId: true, type: true },
    })

    if (!address) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (address.organizationId !== user?.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Remove default from other addresses of same type, then set this one
    await prisma.$transaction([
      prisma.address.updateMany({
        where: { organizationId: address.organizationId, type: address.type },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id },
        data: { isDefault: true },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting default address:', error)
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    })

    const address = await prisma.address.findUnique({
      where: { id },
      select: { organizationId: true },
    })

    if (!address) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (address.organizationId !== user?.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.address.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
