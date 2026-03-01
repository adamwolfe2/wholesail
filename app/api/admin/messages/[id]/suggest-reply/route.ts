import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrRep } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminOrRep()
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { conversationId } = body

    const targetId = conversationId ?? id

    // Fetch last 10 messages in the conversation
    const messages = await prisma.message.findMany({
      where: { conversationId: targetId },
      orderBy: { createdAt: 'asc' },
      take: -10,
      select: {
        senderRole: true,
        senderName: true,
        content: true,
      },
    })

    if (!messages.length) {
      return NextResponse.json({
        replies: [
          'Thank you for reaching out. How can I assist you today?',
          'Hi! Happy to help — what can I do for you?',
          'Thanks for your message. Please let me know how I can help.',
        ],
      })
    }

    // If no Gemini key, return generic placeholders
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        replies: [
          'Thank you for your message. I will follow up with you shortly.',
          "Hi! Great to hear from you. I'll get back to you soon with more details.",
          'Noted — I will look into this and send you an update as soon as possible.',
        ],
      })
    }

    const conversationText = messages
      .map((m) => {
        const role = m.senderRole === 'staff' ? 'STAFF' : m.senderRole === 'client' ? 'CLIENT' : 'SYSTEM'
        return `${role}: ${m.content}`
      })
      .join('\n')

    const prompt = `You are an AI assistant helping a luxury food sales rep at Wholesail respond to a client message. Wholesail distributes wholesale food products to restaurants, hotels, and food service operators.

Based on this conversation, generate 3 different reply options:
1. Professional & concise
2. Warm & personal
3. Solution-focused (addresses any request/question directly)

Each reply should be 1-3 sentences max. Return JSON: { "replies": ["...", "...", "..."] }

Conversation (newest last):
${conversationText}`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
          },
        }),
      }
    )

    if (!geminiRes.ok) {
      console.error('Gemini API error:', geminiRes.status, await geminiRes.text())
      return NextResponse.json({
        replies: [
          'Thank you for your message. I will follow up with you shortly.',
          "Hi! Great to hear from you. I'll get back to you soon with more details.",
          'Noted — I will look into this and send you an update as soon as possible.',
        ],
      })
    }

    const geminiData = await geminiRes.json()
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    // Parse JSON out of the response (may be wrapped in markdown code fences)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    const replies: string[] = Array.isArray(parsed.replies) ? parsed.replies.slice(0, 3) : []

    if (replies.length === 0) {
      throw new Error('Empty replies array from Gemini')
    }

    return NextResponse.json({ replies })
  } catch (err) {
    console.error('POST /api/admin/messages/[id]/suggest-reply error:', err)
    // Always return something usable
    return NextResponse.json({
      replies: [
        'Thank you for your message. I will follow up with you shortly.',
        "Hi! Great to hear from you. I'll get back to you soon with more details.",
        'Noted — I will look into this and send you an update as soon as possible.',
      ],
    })
  }
}
