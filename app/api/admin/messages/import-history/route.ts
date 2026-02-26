import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'
import { toE164, isConfigured as blooConfigured } from '@/lib/integrations/blooio'

const BLOOIO_BASE = 'https://backend.blooio.com/v2/api'

interface BlooMessage {
  id?: string
  message_id?: string
  text?: string
  body?: string
  content?: string
  direction: 'inbound' | 'outbound'
  created_at?: string
  timestamp?: string
  sent_at?: string
}

async function fetchBlooMessages(e164Phone: string): Promise<BlooMessage[]> {
  const apiKey = process.env.BLOOIO_API_KEY
  if (!apiKey) return []

  const chatId = encodeURIComponent(e164Phone)
  try {
    const res = await fetch(`${BLOOIO_BASE}/chats/${chatId}/messages?limit=100`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) return []
    const data = await res.json()
    // The API returns { messages: [...] } or just an array
    if (Array.isArray(data)) return data
    if (Array.isArray(data.messages)) return data.messages
    return []
  } catch {
    return []
  }
}

// POST /api/admin/messages/import-history — import Bloo.io conversation history for all orgs
export async function POST() {
  const { error } = await requireAdmin()
  if (error) return error

  if (!blooConfigured()) {
    return NextResponse.json(
      { error: 'Bloo.io is not configured. Set BLOOIO_API_KEY and BLOOIO_FROM_NUMBER.' },
      { status: 503 }
    )
  }

  try {
    const orgs = await prisma.organization.findMany({
      where: { phone: { not: '' } },
      select: { id: true, name: true, phone: true },
    })

    let imported = 0
    let orgsProcessed = 0

    for (const org of orgs) {
      const e164 = org.phone ? toE164(org.phone) : null
      if (!e164) continue

      // Skip if already imported for this org
      const existingImport = await prisma.conversation.findFirst({
        where: {
          organizationId: org.id,
          subject: { startsWith: 'Imported history' },
        },
        select: { id: true },
      })
      if (existingImport) continue

      const messages = await fetchBlooMessages(e164)
      if (messages.length === 0) continue

      orgsProcessed++

      // Create conversation + messages in one transaction
      await prisma.conversation.create({
        data: {
          subject: `Imported history — ${org.name}`,
          organizationId: org.id,
          isOpen: true,
          lastMessageAt: new Date(),
          messages: {
            create: messages.map((msg) => {
              // Normalize fields — Bloo.io API may vary
              const content =
                msg.text ?? msg.body ?? msg.content ?? ''
              const createdAt =
                msg.created_at ?? msg.timestamp ?? msg.sent_at
                  ? new Date(
                      msg.created_at ?? msg.timestamp ?? msg.sent_at ?? Date.now()
                    )
                  : new Date()
              const senderRole: string =
                msg.direction === 'inbound' ? 'client' : 'staff'
              const senderName =
                msg.direction === 'inbound' ? org.name : 'TBGC Team'

              return {
                senderName,
                senderRole,
                content: content || '[No text]',
                createdAt,
              }
            }),
          },
        },
      })

      imported++
    }

    return NextResponse.json({ imported, orgs: orgsProcessed })
  } catch (err) {
    console.error('POST /api/admin/messages/import-history error:', err)
    return NextResponse.json({ error: 'Failed to import history' }, { status: 500 })
  }
}
