import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { publicSignupLimiter, checkRateLimit, getIp } from '@/lib/rate-limit'
import { sendGiveawayConfirmationEmail } from '@/lib/email'

const signupSchema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  const { allowed } = await checkRateLimit(publicSignupLimiter, getIp(req))
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = signupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim()

  try {
    // Duplicate check within last 7 days
    const recent = await prisma.auditEvent.findFirst({
      where: {
        entityType: 'GiveawayEntry',
        entityId: normalizedEmail,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    })

    if (recent) {
      // Already entered — still return success so UX flows through to Instagram step
      return NextResponse.json({ success: true, alreadyEntered: true })
    }

    // Create audit event for giveaway tracking
    await prisma.auditEvent.create({
      data: {
        entityType: 'GiveawayEntry',
        entityId: normalizedEmail,
        action: 'giveaway_signup',
        metadata: { email: normalizedEmail, timestamp: new Date().toISOString() },
      },
    })

    // Create a Lead record in the CRM pipeline (upsert to avoid duplicates)
    const existingLead = await prisma.lead.findFirst({
      where: { email: normalizedEmail },
    })

    if (!existingLead) {
      await prisma.lead.create({
        data: {
          name: normalizedEmail.split('@')[0], // use email username as display name
          email: normalizedEmail,
          source: 'giveaway',
          status: 'NEW',
        },
      })
    }

    // Confirmation email (fire-and-forget — non-critical)
    sendGiveawayConfirmationEmail(normalizedEmail).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Giveaway signup error:', error)
    // Don't fail the user — let them proceed to Instagram step
    return NextResponse.json({ success: true })
  }
}
