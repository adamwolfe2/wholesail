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
      select: { organizationId: true, organization: { select: { isWholesaler: true, isDistributor: true } } },
    })

    if (!user?.organizationId) {
      return NextResponse.json({ unreadMessages: 0, newDrops: 0, isWholesaler: false, isDistributor: false })
    }

    const orgId = user.organizationId
    const isWholesaler = user.organization?.isWholesaler ?? false
    const isDistributor = user.organization?.isDistributor ?? false
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const now = new Date()

    const [unreadMessages, newDrops] = await Promise.all([
      // Count unread messages from staff across all org conversations
      prisma.message.count({
        where: {
          conversation: { organizationId: orgId },
          senderRole: 'staff',
          readAt: null,
        },
      }),

      // Count product drops in the last 7 days that are public and have dropped
      prisma.productDrop.count({
        where: {
          isPublic: true,
          dropDate: { lte: now },
          createdAt: { gte: sevenDaysAgo },
        },
      }),
    ])

    return NextResponse.json({ unreadMessages, newDrops, isWholesaler, isDistributor })
  } catch (error) {
    console.error('GET /api/client/notifications/counts error:', error)
    // Return zeros gracefully on DB failure
    return NextResponse.json({ unreadMessages: 0, newDrops: 0 })
  }
}
