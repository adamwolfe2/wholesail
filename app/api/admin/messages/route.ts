import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrRep } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'
import { isConfigured as blooConfigured, sendMessage as blooSend, toE164 } from '@/lib/integrations/blooio'

// GET /api/admin/messages — all conversations across all orgs
// Returns { conversations: ConversationRow[] } matching the shape the client expects
export async function GET() {
  const { error } = await requireAdminOrRep()
  if (error) return error

  try {
    const raw = await prisma.conversation.findMany({
      orderBy: { lastMessageAt: 'desc' },
      include: {
        organization: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true, senderRole: true },
        },
        _count: {
          select: {
            // Unread = client messages that haven't been read by staff
            messages: { where: { senderRole: 'client', readAt: null } },
          },
        },
      },
    })

    const conversations = raw.map((c) => ({
      id: c.id,
      subject: c.subject,
      isOpen: c.isOpen,
      orgId: c.organization.id,
      orgName: c.organization.name,
      lastMessage: c.messages[0]?.content ?? '',
      lastMessageAt: c.lastMessageAt.toISOString(),
      unreadCount: c._count.messages,
      createdAt: c.createdAt.toISOString(),
      repClaimedAt: c.repClaimedAt?.toISOString() ?? null,
    }))

    return NextResponse.json({ conversations })
  } catch (err) {
    console.error('GET /api/admin/messages error:', err)
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 })
  }
}

// POST /api/admin/messages — start a new outbound conversation
export async function POST(req: NextRequest) {
  const { userId, error } = await requireAdminOrRep()
  if (error) return error

  try {
    const body = await req.json().catch(() => ({}))
    const { organizationId, subject, message } = body

    if (!organizationId?.trim()) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }
    if (!subject?.trim()) {
      return NextResponse.json({ error: 'subject is required' }, { status: 400 })
    }
    if (!message?.trim()) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, phone: true },
    })
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const staff = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    })

    const now = new Date()
    const [conversation] = await prisma.$transaction([
      prisma.conversation.create({
        data: {
          subject: subject.trim(),
          organizationId: org.id,
          isOpen: true,
          lastMessageAt: now,
          repClaimedAt: now,  // Claim on creation — rep is handling this thread
          messages: {
            create: {
              senderId: userId,
              senderName: staff?.name ?? 'TBGC Team',
              senderRole: 'staff',
              content: message.trim(),
            },
          },
        },
        include: {
          messages: true,
          organization: { select: { name: true, id: true } },
        },
      }),
    ])

    // Send Bloo.io iMessage — await so we can surface delivery status to UI
    const e164 = org.phone ? toE164(org.phone) : null
    let iMessageStatus: 'sent' | 'failed' | 'not_configured' = 'not_configured'
    if (blooConfigured() && e164) {
      const blooResult = await blooSend({ to: e164, message: message.trim() })
        .catch((err) => { console.error('Bloo.io new convo send error:', err); return null })
      iMessageStatus = blooResult?.success ? 'sent' : 'failed'
    }

    return NextResponse.json({ conversation, iMessageStatus }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/messages error:', err)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
