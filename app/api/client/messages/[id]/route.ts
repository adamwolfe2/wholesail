import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

// GET /api/client/messages/[id] — load full thread, mark staff messages as read
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    })
    if (!user?.organizationId) return NextResponse.json({ error: 'No organization' }, { status: 400 })

    const { id } = await params

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })

    if (!conversation || conversation.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Mark all staff/system messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderRole: { not: 'client' },
        readAt: null,
      },
      data: { readAt: new Date() },
    })

    return NextResponse.json({ conversation })
  } catch (err) {
    console.error('GET /api/client/messages/[id] error:', err)
    return NextResponse.json({ error: 'Failed to load thread' }, { status: 500 })
  }
}

// POST /api/client/messages/[id] — send a message in the thread
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, name: true },
    })
    if (!user?.organizationId) {
      return NextResponse.json(
        { error: 'Your account is not linked to an organization. Please contact support.' },
        { status: 400 }
      )
    }

    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { content } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // Verify conversation belongs to this org
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { organizationId: true, isOpen: true },
    })

    if (!conversation || conversation.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!conversation.isOpen) {
      return NextResponse.json({ error: 'This conversation is closed' }, { status: 400 })
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: id,
          senderId: userId,
          senderName: user.name ?? 'Client',
          senderRole: 'client',
          content: content.trim(),
        },
      }),
      prisma.conversation.update({
        where: { id },
        data: { lastMessageAt: new Date() },
      }),
    ])

    return NextResponse.json({ message }, { status: 201 })
  } catch (err) {
    console.error('POST /api/client/messages/[id] error:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
