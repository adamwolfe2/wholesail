import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/db'

export interface ParsedOrderItem {
  productName: string
  quantity: number
  matchedProductId?: string
}

export interface ParsedOrder {
  items: ParsedOrderItem[]
  notes?: string
  confidence: 'high' | 'medium' | 'low'
}

export async function parseSmsOrder(
  messageText: string,
  orgId: string
): Promise<ParsedOrder | null> {
  const products = await prisma.product.findMany({
    where: { available: true },
    select: { id: true, name: true, slug: true, unit: true },
    take: 200,
  })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: `You parse wholesale order requests from SMS/text messages.
Extract product names and quantities. Return JSON only.
Available products: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, unit: p.unit })))}`,
    messages: [
      {
        role: 'user',
        content: `Parse this order message: "${messageText}"

Return JSON: { "items": [{"productName": "...", "quantity": N, "matchedProductId": "..." }], "notes": "...", "confidence": "high|medium|low" }
If this is not an order request, return { "items": [], "confidence": "low" }`,
      },
    ],
  })

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
    const parsed = JSON.parse(cleaned) as ParsedOrder
    if (parsed.confidence === 'low' || parsed.items.length === 0) return null
    return parsed
  } catch {
    return null
  }
}
