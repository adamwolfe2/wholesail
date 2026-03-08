import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { parseOrderText } from '@/lib/ai/order-parser'
import { aiCallLimiter, checkRateLimit, getIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rl = await checkRateLimit(aiCallLimiter, getIp(req))
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const text = typeof body.text === 'string' ? body.text.trim() : ''

  if (!text || text.length < 3) {
    return NextResponse.json({ error: 'Order text required' }, { status: 400 })
  }

  if (text.length > 2000) {
    return NextResponse.json({ error: 'Order text too long (max 2000 chars)' }, { status: 400 })
  }

  try {
    const result = await parseOrderText(text)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Order parse error:', error)
    return NextResponse.json({ error: 'Failed to parse order' }, { status: 500 })
  }
}
