import { products } from '@/lib/products'
import type { Product } from '@/lib/products'

export interface ParsedItem {
  product: Product
  quantity: number
  originalText: string
}

export interface ParseResult {
  items: ParsedItem[]
  unmatched: string[]
}

// Build a compact catalog for the AI prompt
function buildCatalogSummary(): string {
  return products
    .filter(p => p.available !== false)
    .map(p => `- id:"${p.id}" | "${p.name}" | ${p.price} ${p.unit} | ${p.category}`)
    .join('\n')
}

// Lazy Gemini init — returns null if key not set
function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!key) return null
  const { GoogleGenerativeAI } = require('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(key)
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
}

// Fuzzy fallback: simple keyword matching
function fuzzyParse(text: string): ParseResult {
  const lowerText = text.toLowerCase()
  const availableProducts = products.filter(p => p.available !== false)
  const matched: ParsedItem[] = []

  for (const product of availableProducts) {
    const nameParts = product.name.toLowerCase().split(/\s+/)
    const significant = nameParts.filter(w => w.length > 3)
    const matchCount = significant.filter(w => lowerText.includes(w)).length
    if (matchCount >= Math.min(2, significant.length)) {
      const qtyMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:oz|lb|lbs|tin|tins|jar|jars|bottle|bottles|ea|each|g|gram|grams)?/i)
      const quantity = qtyMatch ? parseFloat(qtyMatch[1]) : 1
      matched.push({ product, quantity, originalText: product.name })
    }
  }

  return { items: matched, unmatched: [] }
}

export async function parseOrderText(text: string): Promise<ParseResult> {
  const model = getGeminiClient()

  if (!model) {
    return fuzzyParse(text)
  }

  const catalog = buildCatalogSummary()

  const prompt = `You are an order assistant for TBGC, a luxury food distributor.
A wholesale client has written a natural-language order. Extract each product and quantity.

PRODUCT CATALOG (only match from this list):
${catalog}

CLIENT ORDER TEXT:
"${text}"

Instructions:
- Extract each product mention and match it to the closest catalog item
- If quantity is not specified, default to 1
- Return ONLY valid JSON, no markdown, no explanation
- Use this exact format:
{
  "items": [
    { "productId": "kaluga-hybrid-1oz", "quantity": 3, "originalText": "3 tins kaluga caviar" }
  ],
  "unmatched": ["beluga caviar 5oz (no 5oz tin available)"]
}
- "unmatched" = things mentioned that have no close match in the catalog
- Prefer exact SKU matches over approximate ones`

  try {
    const result = await model.generateContent(prompt)
    const raw = result.response.text()
    const cleaned = raw.replace(/```(?:json)?/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    const items: ParsedItem[] = []
    for (const item of parsed.items || []) {
      const product = products.find(p => p.id === item.productId)
      if (product) {
        items.push({
          product,
          quantity: Math.max(1, Math.round(item.quantity)),
          originalText: item.originalText || product.name,
        })
      }
    }

    return { items, unmatched: parsed.unmatched || [] }
  } catch {
    return fuzzyParse(text)
  }
}
