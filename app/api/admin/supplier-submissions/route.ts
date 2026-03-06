import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'OPS')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const submissions = await prisma.supplierSubmission.findMany({
      include: {
        supplier: {
          select: { name: true, email: true, country: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('Error fetching supplier submissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
