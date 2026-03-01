import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// ---------------------------------------------------------------------------
// Simple IP-based rate limit: max 30 requests per minute
// ---------------------------------------------------------------------------
const ipRateMap = new Map<string, number[]>()
const IP_WINDOW_MS = 60 * 1000
const IP_MAX = 30

function isIpLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (ipRateMap.get(ip) ?? []).filter(ts => now - ts < IP_WINDOW_MS)
  if (timestamps.length >= IP_MAX) return true
  timestamps.push(now)
  ipRateMap.set(ip, timestamps)
  if (ipRateMap.size > 10000) {
    for (const [k, ts] of ipRateMap.entries()) {
      if (ts.filter(t => now - t < IP_WINDOW_MS).length === 0) ipRateMap.delete(k)
    }
  }
  return false
}

// ---------------------------------------------------------------------------
// Normalization helpers (mirrors /api/claim logic)
// ---------------------------------------------------------------------------
function normalizeOrgName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^(the|le|la|les|el|los|las)\s+/i, '')
    .replace(/[''`\u2018\u2019\u201A\u201B]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeEmail(raw: string): string {
  const lower = raw.toLowerCase().trim()
  const atIdx = lower.indexOf('@')
  if (atIdx === -1) return lower
  const local = lower.slice(0, atIdx).replace(/\+.*$/, '')
  return `${local}@${lower.slice(atIdx + 1)}`
}

// ---------------------------------------------------------------------------
// Scoring
// Business name: 60 pts max
// Email: 30 pts max
// Phone: 10 pts max
// Match threshold to appear in results: 10 pts
// ---------------------------------------------------------------------------
const IMPORT_EMAIL_RE = /^noemail\+[^@]+@wholesail-import.local$/i

function scoreOrg(
  org: { id: string; name: string; email: string; phone: string | null },
  query: string,
  emailInput: string,
  phoneInput: string,
): number {
  let score = 0

  // --- Business name scoring (60 pts) ---
  if (query.trim().length >= 2) {
    const normQ = normalizeOrgName(query)
    const normStored = normalizeOrgName(org.name)

    if (normQ.length >= 2) {
      if (normStored === normQ) {
        // Exact normalized match
        score += 60
      } else if (normQ.length >= 4 && (normStored.includes(normQ) || normQ.includes(normStored))) {
        // Contains match — score by overlap ratio
        const overlapLen = Math.min(normQ.length, normStored.length)
        const maxLen = Math.max(normQ.length, normStored.length)
        score += Math.round(50 * (overlapLen / maxLen))
      } else {
        // Word-based match
        const words = normQ.split(' ').filter(w => w.length >= 3)
        if (words.length >= 1) {
          const matchedWords = words.filter(w => normStored.includes(w))
          if (matchedWords.length > 0) {
            score += Math.round(40 * (matchedWords.length / words.length))
          }
        }
      }
    }
  }

  // --- Email scoring (30 pts) ---
  if (emailInput.trim().length >= 4) {
    const normInputEmail = normalizeEmail(emailInput)
    const normStoredEmail = normalizeEmail(org.email)

    if (!IMPORT_EMAIL_RE.test(org.email)) {
      if (normStoredEmail === normInputEmail) {
        score += 30
      } else {
        // Partial domain match
        const inputDomain = normInputEmail.split('@')[1] ?? ''
        const storedDomain = normStoredEmail.split('@')[1] ?? ''
        if (inputDomain.length >= 4 && storedDomain === inputDomain) {
          score += 10
        }
      }
    }
  }

  // --- Phone scoring (10 pts) ---
  if (phoneInput.trim().length >= 7 && org.phone) {
    const inputDigits = phoneInput.replace(/\D/g, '')
    const storedDigits = org.phone.replace(/\D/g, '')
    if (inputDigits.length >= 7) {
      const last7input = inputDigits.slice(-7)
      const last7stored = storedDigits.slice(-7)
      if (last7input === last7stored) {
        score += 10
      }
    }
  }

  return score
}

// ---------------------------------------------------------------------------
// GET /api/claim/search
// Params: q (business name query), email, phone
// Returns: top 5 matches with name + score (no PII like email/phone)
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  if (isIpLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') ?? '').trim()
  const email = (searchParams.get('email') ?? '').trim()
  const phone = (searchParams.get('phone') ?? '').trim()

  // Need at least one meaningful input
  if (q.length < 2 && email.length < 4 && phone.length < 7) {
    return NextResponse.json({ results: [] })
  }

  const allOrgs = await prisma.organization.findMany({
    select: { id: true, name: true, email: true, phone: true },
  })

  const scored = allOrgs
    .map(org => ({ id: org.id, name: org.name, score: scoreOrg(org, q, email, phone) }))
    .filter(r => r.score >= 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  return NextResponse.json({ results: scored })
}
