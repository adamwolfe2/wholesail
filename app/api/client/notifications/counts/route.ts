// Deprecated: use /api/client/notifications/count instead.
// This route is kept for backward compatibility and proxies to the canonical endpoint.
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
      select: {
        organizationId: true,
        organization: { select: { isWholesaler: true, isDistributor: true } },
      },
    })

    if (!user?.organizationId) {
      return NextResponse.json({ unreadMessages: 0, newDrops: 0, unreadCount: 0, isWholesaler: false, isDistributor: false })
    }

    const orgId = user.organizationId
    const isWholesaler = user.organization?.isWholesaler ?? false
    const isDistributor = user.organization?.isDistributor ?? false
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const now = new Date()

    const [unreadMessages, newDrops, unreadCount] = await Promise.all([
      prisma.message.count({
        where: {
          conversation: { organizationId: orgId },
          senderRole: 'staff',
          readAt: null,
        },
      }),
      prisma.productDrop.count({
        where: {
          isPublic: true,
          dropDate: { lte: now },
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.notification.count({
        where: { userId, read: false },
      }),
    ])

    return NextResponse.json({ unreadMessages, newDrops, unreadCount, isWholesaler, isDistributor })
  } catch (error) {
    console.error('GET /api/client/notifications/counts error:', error)
    return NextResponse.json({ unreadMessages: 0, newDrops: 0, unreadCount: 0 })
  }
}
