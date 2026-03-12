import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrRep } from '@/lib/auth/require-admin'
import { z } from 'zod'
import { aiCallLimiter, checkRateLimit } from '@/lib/rate-limit'

const schema = z.object({ website: z.string().url() })

interface FirecrawlResponse {
  success: boolean
  data?: {
    markdown?: string
    metadata?: {
      title?: string
      description?: string
      ogImage?: string
      ogTitle?: string
      ogDescription?: string
      [key: string]: unknown
    }
  }
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAdminOrRep()
  if (error) return error

  const { allowed } = await checkRateLimit(aiCallLimiter, userId)
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Valid website URL required' }, { status: 400 })
  }

  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Website enrichment not configured' }, { status: 503 })
  }

  try {
    const fcRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ url: parsed.data.website, formats: ['markdown'], onlyMainContent: true }),
    })

    if (!fcRes.ok) {
      return NextResponse.json({ error: 'Could not fetch website' }, { status: 502 })
    }

    const result: FirecrawlResponse = await fcRes.json()
    if (!result.success || !result.data) {
      return NextResponse.json({ error: 'Could not extract website data' }, { status: 422 })
    }

    const meta = result.data.metadata || {}
    const content = result.data.markdown || ''

    return NextResponse.json({
      companyName: clean(String(meta.ogTitle || meta.title || '')),
      description: clean(String(meta.ogDescription || meta.description || '')).slice(0, 280),
      phone: extractPhone(content),
      city: extractCity(content),
    })
  } catch (err) {
    console.error('Lead enrich error:', err)
    return NextResponse.json({ error: 'Enrichment failed' }, { status: 500 })
  }
}

function clean(t: string) {
  return t.replace(/\s+/g, ' ').trim()
}

function extractPhone(c: string) {
  const m = c.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
  return m ? m[0] : null
}

function extractCity(c: string) {
  const m = c.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)*),\s*([A-Z]{2})\b/)
  return m ? `${m[1]}, ${m[2]}` : null
}
