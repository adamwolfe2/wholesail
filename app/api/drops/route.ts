import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { publicApiLimiter, checkRateLimit, getIp } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  // Rate limit: 60 requests per IP per minute
  const { allowed } = await checkRateLimit(publicApiLimiter, getIp(req))
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

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
