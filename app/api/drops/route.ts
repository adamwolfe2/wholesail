import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()
    const drops = await prisma.productDrop.findMany({
      where: {
        isPublic: true,
        OR: [{ activeUntil: null }, { activeUntil: { gt: now } }],
      },
      orderBy: { dropDate: 'desc' },
      include: {
        _count: { select: { alerts: true } },
        product: { select: { slug: true, name: true } },
      },
      take: 100,
    })
    return NextResponse.json({ drops })
  } catch (error) {
    console.error('GET /api/drops error:', error)
    return NextResponse.json({ drops: [] })
  }
}
