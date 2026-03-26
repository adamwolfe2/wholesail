import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'
import { sendDropBlastEmail, shouldSendEmail } from '@/lib/email'
import { sendMessage, toE164 } from '@/lib/integrations/blooio'
import { notifyLimiter, checkRateLimit } from '@/lib/rate-limit'
import { getSiteUrl } from '@/lib/brand'

/**
 * POST /api/admin/drops/[id]/blast
 *
 * Sends a drop announcement to all approved wholesale organizations:
 * - Email via Resend to the org's contact email
 * - SMS via Bloo.io if the org has a phone number
 *
 * Also marks `notifiedAt` on the drop so admins can see when the blast went out.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdmin()
  if (error) return error

  const { allowed } = await checkRateLimit(notifyLimiter, userId)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { id } = await params

  const drop = await prisma.productDrop.findUnique({ where: { id } })
  if (!drop) {
    return NextResponse.json({ error: 'Drop not found' }, { status: 404 })
  }

  // Fetch all approved wholesale organizations
  const orgs = await prisma.organization.findMany({
    where: { isWholesaler: true },
    select: { id: true, name: true, email: true, phone: true, notificationPrefs: true },
  })

  if (orgs.length === 0) {
    return NextResponse.json({
      ok: true,
      emailsSent: 0,
      smsSent: 0,
      total: 0,
      message: 'No wholesale organizations to notify',
    })
  }

  const appUrl = getSiteUrl()
  const smsBody = `New Wholesail Drop: ${drop.title}${drop.priceNote ? `. ${drop.priceNote}` : ''}. First-come, first-served. Order now: ${appUrl}/drops`

  let emailsSent = 0
  let smsSent = 0
  let optedOut = 0
  const emailErrors: string[] = []
  const smsErrors: string[] = []

  // Send email + SMS concurrently across all orgs (batched at 20 parallel to avoid rate limits)
  const BATCH_SIZE = 20
  for (let i = 0; i < orgs.length; i += BATCH_SIZE) {
    const batch = orgs.slice(i, i + BATCH_SIZE)
    await Promise.allSettled(
      batch.map(async (org) => {
        // Check notification preferences — skip if opted out of drop alerts
        const prefs = org.notificationPrefs as
          | { emailDropAlerts?: boolean; emailOrderUpdates?: boolean; emailWeeklyDigest?: boolean }
          | null
        if (!shouldSendEmail(prefs, 'drops')) {
          optedOut++
          return
        }

        // Email
        const emailResult = await sendDropBlastEmail({
          email: org.email,
          dropTitle: drop.title,
          dropDate: drop.dropDate.toISOString(),
          description: drop.description,
          category: drop.category,
          priceNote: drop.priceNote,
        })
        if (emailResult.success) {
          emailsSent++
        } else {
          emailErrors.push(org.email)
        }

        // SMS (optional — only if org has a phone)
        if (org.phone) {
          const e164 = toE164(org.phone)
          if (e164) {
            const smsResult = await sendMessage({ to: e164, message: smsBody })
            if (smsResult.success) {
              smsSent++
            } else {
              smsErrors.push(org.phone)
            }
          }
        }
      })
    )
  }

  // Mark notifiedAt on the drop
  await prisma.productDrop.update({
    where: { id },
    data: { notifiedAt: new Date() },
  })

  await prisma.auditEvent.create({
    data: {
      entityType: 'ProductDrop',
      entityId: id,
      action: 'blast_sent',
      userId,
      metadata: {
        total: orgs.length,
        emailsSent,
        smsSent,
        optedOut,
        emailErrors,
        smsErrors,
        dropTitle: drop.title,
      },
    },
  })

  return NextResponse.json({
    ok: true,
    total: orgs.length,
    emailsSent,
    smsSent,
    optedOut,
    emailErrors,
    smsErrors,
  })
}
