import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

// PATCH /api/client/conversations/[id]/read
// Marks all unread staff messages in this conversation as read by the client
export async function PATCH(
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
    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization' }, { status: 400 })
    }

    const { id } = await params

    // Verify this conversation belongs to the user's org
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { organizationId: true },
    })
    if (!conversation || conversation.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Mark all unread staff/system messages as read
    const result = await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderRole: { not: 'client' },
        readAt: null,
      },
      data: { readAt: new Date() },
    })

    return NextResponse.json({ marked: result.count })
  } catch (err) {
    console.error('PATCH /api/client/conversations/[id]/read error:', err)
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
  }
}
