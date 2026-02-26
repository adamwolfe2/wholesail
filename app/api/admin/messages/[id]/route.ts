import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrRep } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { isConfigured as blooConfigured, sendMessage as blooSend, toE164 } from '@/lib/integrations/blooio'

// GET /api/admin/messages/[id] — load full thread + mark client messages read
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminOrRep()
  if (error) return error

  try {
    const { id } = await params
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        organization: { select: { name: true, id: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Mark client messages as read
    await prisma.message.updateMany({
      where: { conversationId: id, senderRole: 'client', readAt: null },
      data: { readAt: new Date() },
    })

    return NextResponse.json({ conversation })
  } catch (err) {
    console.error('GET /api/admin/messages/[id] error:', err)
    return NextResponse.json({ error: 'Failed to load thread' }, { status: 500 })
  }
}

// POST /api/admin/messages/[id] — staff reply
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdminOrRep()
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { content } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { isOpen: true, organization: { select: { phone: true, name: true } } },
    })
    if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!conversation.isOpen) {
      return NextResponse.json({ error: 'Conversation is closed' }, { status: 400 })
    }

    const staff = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    })

    const now = new Date()
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: id,
          senderId: userId,
          senderName: staff?.name ?? 'TBGC Team',
          senderRole: 'staff',
          content: content.trim(),
        },
      }),
      prisma.conversation.update({
        where: { id },
        // Claim this conversation for the rep — pauses AI for 24h
        data: { lastMessageAt: now, repClaimedAt: now },
      }),
    ])

    // Send Bloo.io iMessage — await so we can surface delivery status to UI
    const e164 = conversation.organization.phone ? toE164(conversation.organization.phone) : null
    let iMessageStatus: 'sent' | 'failed' | 'not_configured' = 'not_configured'
    if (blooConfigured() && e164) {
      const blooResult = await blooSend({ to: e164, message: content.trim() })
        .catch((err) => { console.error('Bloo.io reply error:', err); return null })
      iMessageStatus = blooResult?.success ? 'sent' : 'failed'
    }

    return NextResponse.json({ message, iMessageStatus }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/messages/[id] error:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

// PATCH /api/admin/messages/[id] — close/reopen conversation, or release AI claim
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminOrRep()
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const parsed = z
      .object({
        isOpen: z.boolean().optional(),
        repClaimedAt: z.null().optional(),
      })
      .safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (parsed.data.isOpen !== undefined) updateData.isOpen = parsed.data.isOpen
    if ('repClaimedAt' in parsed.data) updateData.repClaimedAt = null

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const conversation = await prisma.conversation.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ conversation })
  } catch (err) {
    console.error('PATCH /api/admin/messages/[id] error:', err)
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 })
  }
}
