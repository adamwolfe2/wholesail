import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { ensureReferralCode } from '@/lib/referrals'
import { Resend } from 'resend'
import { getSiteUrl } from '@/lib/get-site-url'
import { BRAND_EMAIL, BRAND_NAME, BRAND_TEAM } from '@/lib/brand'
import { checkRateLimit, clientWriteLimiter } from '@/lib/rate-limit'

function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM_EMAIL = BRAND_EMAIL
const APP_URL = getSiteUrl()

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

// GET /api/client/referrals
// Returns referral code, referral list, and credit balance for the authenticated org
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true, organization: { select: { name: true } } },
  })

  if (!user?.organizationId) {
    return NextResponse.json({ error: 'No organization found' }, { status: 404 })
  }

  const orgId = user.organizationId

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      referralCode: true,
      referralCredits: true,
      referralsGiven: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          refereeEmail: true,
          refereeName: true,
          status: true,
          creditAmount: true,
          creditedAt: true,
          createdAt: true,
        },
      },
    },
  })

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  const pendingReferrals = org.referralsGiven.filter((r) => r.status === 'PENDING').length

  return NextResponse.json({
    code: org.referralCode,
    referrals: org.referralsGiven.map((r) => ({
      ...r,
      creditAmount: Number(r.creditAmount),
    })),
    totalCredits: Number(org.referralCredits),
    pendingReferrals,
  })
}

// POST /api/client/referrals
// Creates a referral record and optionally sends an email invite
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      organizationId: true,
      organization: { select: { name: true, referralCode: true } },
    },
  })

  if (!user?.organizationId) {
    return NextResponse.json({ error: 'No organization found' }, { status: 404 })
  }

  // Rate limit: 10 referral invites per user per hour
  const rl = await checkRateLimit(clientWriteLimiter, userId)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429 }
    )
  }

  const body = await req.json()
  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { email, name } = parsed.data
  const normalizedEmail = email.toLowerCase()

  // Self-referral prevention: check if the referee is the current user or a member of the same org
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })
  if (currentUser?.email?.toLowerCase() === normalizedEmail) {
    return NextResponse.json(
      { error: 'Cannot refer members of your own organization' },
      { status: 400 }
    )
  }
  const orgMember = await prisma.user.findFirst({
    where: {
      organizationId: user.organizationId,
      email: { equals: normalizedEmail, mode: 'insensitive' },
    },
    select: { id: true },
  })
  if (orgMember) {
    return NextResponse.json(
      { error: 'Cannot refer members of your own organization' },
      { status: 400 }
    )
  }

  // Check for existing referral
  const existing = await prisma.referral.findFirst({
    where: { referrerId: user.organizationId, refereeEmail: normalizedEmail },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'You have already referred this email address.' },
      { status: 409 }
    )
  }

  // Ensure referral code exists
  const code = await ensureReferralCode(
    user.organizationId,
    user.organization!.name
  )

  // Create referral record
  const referral = await prisma.referral.create({
    data: {
      referrerId: user.organizationId,
      refereeEmail: normalizedEmail,
      refereeName: name || null,
      status: 'PENDING',
    },
  })

  // Send invite email (fire-and-forget)
  const resend = getResend()
  if (resend) {
    const orgName = user.organization!.name
    const referLink = `${APP_URL}/refer/${code}`
    resend.emails
      .send({
        from: FROM_EMAIL,
        to: normalizedEmail,
        subject: `${orgName} invited you to ${BRAND_NAME}`,
        text: `${name ? `Hi ${name},\n\n` : ''}${orgName} has invited you to apply for a wholesale account with ${BRAND_NAME}.

Apply here: ${referLink}

Applications are reviewed within 24 hours. Once approved, you'll get access to 122+ SKUs at true wholesale pricing with same-day LA delivery.

— The ${BRAND_TEAM}`,
      })
      .catch((err: unknown) => console.error('Referral invite email failed:', err))
  }

  return NextResponse.json({ success: true, referralId: referral.id })
}
