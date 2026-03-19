import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { BRAND_EMAIL } from '@/lib/brand'
import { getSiteUrl } from '@/lib/get-site-url'

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter: max 3 requests per email per hour.
// Keyed by lowercased email. Values are arrays of timestamps (ms).
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX = 3

function isRateLimited(email: string): boolean {
  const now = Date.now()
  const key = email.toLowerCase()
  const timestamps = (rateLimitMap.get(key) ?? []).filter(
    ts => now - ts < RATE_LIMIT_WINDOW_MS,
  )

  if (timestamps.length >= RATE_LIMIT_MAX) return true

  // Record this attempt
  timestamps.push(now)
  rateLimitMap.set(key, timestamps)

  // Periodic cleanup: remove entries that are entirely expired
  if (rateLimitMap.size > 5000) {
    for (const [k, ts] of rateLimitMap.entries()) {
      const active = ts.filter(t => now - t < RATE_LIMIT_WINDOW_MS)
      if (active.length === 0) {
        rateLimitMap.delete(k)
      } else {
        rateLimitMap.set(k, active)
      }
    }
  }

  return false
}

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------
const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  companyName: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
})

// Placeholder pattern used for clients imported without a known email
const IMPORT_EMAIL_RE = /^noemail\+[^@]+@wholesail-import.local$/i

// ---------------------------------------------------------------------------
// Fuzzy matching helpers
// ---------------------------------------------------------------------------

type OrgRecord = { id: string; name: string; email: string; phone: string | null }

/**
 * Normalize an org name for fuzzy comparison:
 * - lowercase
 * - strip leading articles (The, Le, La, L', etc.)
 * - collapse apostrophes and smart-quotes to nothing
 * - replace remaining punctuation/hyphens with spaces
 * - collapse whitespace
 */
function normalizeOrgName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^(the|le|la|les|el|los|las)\s+/i, '')
    .replace(/[''`''']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Normalize an email for matching:
 * - lowercase + trim (handles CSV import whitespace artifacts)
 * - strip Gmail-style + aliases: john+tbgc@gmail.com → john@gmail.com
 */
function normalizeEmail(raw: string): string {
  const lower = raw.toLowerCase().trim()
  const atIdx = lower.indexOf('@')
  if (atIdx === -1) return lower
  const local = lower.slice(0, atIdx).replace(/\+.*$/, '')
  const domain = lower.slice(atIdx + 1)
  return `${local}@${domain}`
}

/**
 * Fuzzy org name match against a candidate list.
 *
 * Priority:
 *   P1 — exact normalized match          ("Ritz-Carlton" === "Ritz Carlton")
 *   P2 — one normalized string contains  ("ritz carlton" ⊆ "ritz carlton los angeles")
 *        the other (min 4 chars)
 *   P3 — all significant words (≥3 chars) ("beverly hills hotel" words all in stored)
 *        from the input appear in stored
 *
 * Returns null if input is too short or no match found.
 */
function fuzzyFindOrg(orgs: OrgRecord[], input: string): OrgRecord | null {
  const trimmed = input.trim()
  if (trimmed.length < 2) return null

  const normInput = normalizeOrgName(trimmed)
  if (normInput.length < 2) return null

  // P1: exact normalized match
  for (const o of orgs) {
    if (normalizeOrgName(o.name) === normInput) return o
  }

  // P2: contains (both directions) — require at least 4 chars to avoid false positives
  if (normInput.length >= 4) {
    for (const o of orgs) {
      const normStored = normalizeOrgName(o.name)
      if (normStored.includes(normInput) || normInput.includes(normStored)) return o
    }
  }

  // P3: all significant words in input are present in stored name
  const words = normInput.split(' ').filter(w => w.length >= 3)
  if (words.length >= 2) {
    for (const o of orgs) {
      const normStored = normalizeOrgName(o.name)
      if (words.every(w => normStored.includes(w))) return o
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// POST /api/claim
// Public endpoint — no auth required. This IS the auth entry point.
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  // Parse + validate body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Invalid input.'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const { email, companyName, phone } = parsed.data
  const emailLower = email.toLowerCase().trim()
  const emailNorm = normalizeEmail(email)

  // Rate limit check
  if (isRateLimited(emailLower)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429 },
    )
  }

  let org: OrgRecord | null = null
  let claimEmail = email // the email address we'll use to send the Clerk invite

  // ---------------------------------------------------------------------------
  // Attempt 1a: exact email match (case-insensitive, trimmed) — DB query
  // ---------------------------------------------------------------------------
  org = await prisma.organization.findFirst({
    where: {
      email: { equals: emailLower, mode: 'insensitive' },
      NOT: { email: { startsWith: 'noemail+' } },
    },
    select: { id: true, name: true, email: true, phone: true },
  }) ?? null

  // ---------------------------------------------------------------------------
  // Attempt 1b: normalized email match (strips + aliases)
  // Only needed if the normalized form differs from the raw lowercase form
  // ---------------------------------------------------------------------------
  if (!org && emailNorm !== emailLower) {
    const candidateOrgs = await prisma.organization.findMany({
      where: {
        NOT: { email: { startsWith: 'noemail+' } },
      },
      select: { id: true, name: true, email: true, phone: true },
      take: 10,
    })
    org = candidateOrgs.find(o => normalizeEmail(o.email) === emailNorm) ?? null
  }

  // ---------------------------------------------------------------------------
  // Attempt 2: fuzzy company name match — use DB contains first, then fuzzy
  // ---------------------------------------------------------------------------
  if (!org && companyName && companyName.trim().length > 0) {
    // First try a targeted DB query
    const nameOrgs = await prisma.organization.findMany({
      where: { name: { contains: companyName.trim(), mode: 'insensitive' } },
      select: { id: true, name: true, email: true, phone: true },
      take: 10,
    })

    if (nameOrgs.length > 0) {
      // Use fuzzy matching on the narrowed set
      const matched = fuzzyFindOrg(nameOrgs, companyName)
      org = matched ?? nameOrgs[0]
    } else {
      // Broader fuzzy: extract significant words and search for any match
      const normInput = normalizeOrgName(companyName)
      const words = normInput.split(' ').filter(w => w.length >= 3)
      if (words.length > 0) {
        const broaderOrgs = await prisma.organization.findMany({
          where: { name: { contains: words[0], mode: 'insensitive' } },
          select: { id: true, name: true, email: true, phone: true },
          take: 10,
        })
        const matched = fuzzyFindOrg(broaderOrgs, companyName)
        if (matched) org = matched
      }
    }

    if (org) claimEmail = email
  }

  // ---------------------------------------------------------------------------
  // Attempt 3: phone number match — targeted DB query
  // ---------------------------------------------------------------------------
  if (!org && phone && phone.trim().length > 0) {
    const digits = phone.replace(/\D/g, '')
    if (digits.length >= 7) {
      const last10 = digits.slice(-10)
      const phoneOrgs = await prisma.organization.findMany({
        where: { phone: { contains: last10 } },
        select: { id: true, name: true, email: true, phone: true },
        take: 10,
      })
      org = phoneOrgs[0] ?? null
      if (org) claimEmail = email
    }
  }

  // Organization not found — generic response to prevent enumeration
  if (!org) {
    return NextResponse.json({ success: true, result: 'processed', message: "If a matching organization exists, we'll process your request." })
  }

  // ---------------------------------------------------------------------------
  // Check if a Clerk user already exists for this organization
  // ---------------------------------------------------------------------------
  const existingUser = await prisma.user.findFirst({
    where: { organizationId: org.id },
    select: { id: true },
  })

  if (existingUser) {
    // Account already claimed — return same generic response to prevent enumeration
    return NextResponse.json({ success: true, result: 'processed', message: "If a matching organization exists, we'll process your request." })
  }

  // ---------------------------------------------------------------------------
  // Send Clerk invitation
  // ---------------------------------------------------------------------------
  try {
    const clerk = await clerkClient()
    await clerk.invitations.createInvitation({
      emailAddress: claimEmail,
      publicMetadata: {
        role: 'CLIENT',
        organizationId: org.id,
        organizationName: org.name,
      },
      redirectUrl: getSiteUrl() + '/client-portal',
    })

    return NextResponse.json({ success: true, result: 'invited' })
  } catch (err: unknown) {
    // "already invited" from Clerk is not a fatal error — treat it as success
    const message = err instanceof Error ? err.message : ''
    if (
      message.toLowerCase().includes('already been invited') ||
      message.toLowerCase().includes('already invited')
    ) {
      return NextResponse.json({ success: true, result: 'invited' })
    }

    // Clerk rejected the email address itself
    if (
      message.toLowerCase().includes('invalid email') ||
      message.toLowerCase().includes('email address is invalid')
    ) {
      return NextResponse.json(
        { error: 'That email address is not valid. Please try a different one.' },
        { status: 400 },
      )
    }

    // Generic Clerk error — log it server-side but return a safe message
    console.error('[/api/claim] Clerk invitation error:', err)
    return NextResponse.json(
      { error: `We couldn't send the invitation right now. Please try again or contact ${BRAND_EMAIL}.` },
      { status: 422 },
    )
  }
}
