import type { Metadata } from "next";
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { MessagesAdminClient } from './messages-admin-client'

export const metadata: Metadata = { title: "Messages" };
export const dynamic = 'force-dynamic'

export default async function AdminMessagesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // Check that the user has at minimum a SALES_REP role
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  }).catch(() => null)

  if (!dbUser || !['ADMIN', 'OPS', 'SALES_REP'].includes(dbUser.role)) {
    redirect('/')
  }
  let conversations: ConversationRow[] = []

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
            messages: { where: { senderRole: 'client', readAt: null } },
          },
        },
      },
    })

    conversations = raw.map((c) => ({
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
  } catch {
    // DB not connected
  }

  return <MessagesAdminClient conversations={conversations} />
}

export interface ConversationRow {
  id: string
  subject: string
  isOpen: boolean
  orgId: string
  orgName: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  createdAt: string
  repClaimedAt?: string | null
}
