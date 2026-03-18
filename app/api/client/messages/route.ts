import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { clientWriteLimiter, checkRateLimit } from '@/lib/rate-limit'

async function getOrgId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true, name: true },
  })
  return user
}

// GET /api/client/messages — list conversations for the org
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await getOrgId(userId)
    if (!user?.organizationId) return NextResponse.json({ conversations: [] })

    const conversations = await prisma.conversation.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { lastMessageAt: 'desc' },
      take: 100,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true, senderRole: true },
        },
        _count: {
          select: {
            messages: {
              where: { senderRole: { not: 'client' }, readAt: null },
            },
          },
        },
      },
    })

    const result = conversations.map((c) => ({
      id: c.id,
      subject: c.subject,
      isOpen: c.isOpen,
      lastMessageAt: c.lastMessageAt,
      lastMessage: c.messages[0]?.content ?? '',
      unreadCount: c._count.messages,
      createdAt: c.createdAt,
    }))

    return NextResponse.json({ conversations: result })
  } catch (err) {
    console.error('GET /api/client/messages error:', err)
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 })
  }
}

// POST /api/client/messages — start a new conversation
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = await checkRateLimit(clientWriteLimiter, userId)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 })
    }

    const user = await getOrgId(userId)
    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const { subject, message } = body

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
    }

    const conversation = await prisma.conversation.create({
      data: {
        subject: subject.trim(),
        organizationId: user.organizationId,
        lastMessageAt: new Date(),
        messages: {
          create: {
            senderId: userId,
            senderName: user.name ?? 'Client',
            senderRole: 'client',
            content: message.trim(),
          },
        },
      },
    })

    return NextResponse.json({ conversation }, { status: 201 })
  } catch (err) {
    console.error('POST /api/client/messages error:', err)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
