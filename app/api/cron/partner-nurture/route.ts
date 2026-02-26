import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendPartnerDay3Email, sendPartnerDay7Email } from '@/lib/email'

// Vercel cron calls this as GET with Authorization header
// Schedule: 0 10 * * * (10am UTC daily)
export async function GET(req: NextRequest) {
  // Verify cron secret — fail secure if not configured
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('CRON_SECRET env var is not set — aborting cron to prevent open access')
    return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
  }
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Day-3 window: approved between 4 days ago and 3 days ago
  const day3Start = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
  const day3End = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

  // Day-7 window: approved between 8 days ago and 7 days ago
  const day7Start = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
  const day7End = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  let day3Sent = 0
  let day7Sent = 0
  let skipped = 0
  const errors: string[] = []

  try {
    // ── Day-3 emails ──────────────────────────────────────────────────────────
    const day3Candidates = await prisma.wholesaleApplication.findMany({
      where: {
        status: 'APPROVED',
        reviewedAt: { gte: day3Start, lt: day3End },
      },
      select: {
        id: true,
        contactName: true,
        email: true,
        businessName: true,
      },
    })

    for (const app of day3Candidates) {
      // Check if nurture_day3_sent audit event already exists
      const alreadySent = await prisma.auditEvent.findFirst({
        where: {
          entityType: 'WholesaleApplication',
          entityId: app.id,
          action: 'nurture_day3_sent',
        },
        select: { id: true },
      })

      if (alreadySent) {
        skipped++
        continue
      }

      try {
        const result = await sendPartnerDay3Email({
          name: app.contactName.split(' ')[0] || app.contactName,
          email: app.email,
          businessName: app.businessName,
        })

        if (result.success) {
          await prisma.auditEvent.create({
            data: {
              entityType: 'WholesaleApplication',
              entityId: app.id,
              action: 'nurture_day3_sent',
              metadata: { email: app.email, businessName: app.businessName },
            },
          })
          day3Sent++
        } else {
          errors.push(`Day-3 ${app.id}: email send failed`)
          skipped++
        }
      } catch (err) {
        errors.push(`Day-3 ${app.id}: ${err instanceof Error ? err.message : 'unknown error'}`)
        skipped++
      }
    }

    // ── Day-7 emails ──────────────────────────────────────────────────────────
    const day7Candidates = await prisma.wholesaleApplication.findMany({
      where: {
        status: 'APPROVED',
        reviewedAt: { gte: day7Start, lt: day7End },
      },
      select: {
        id: true,
        contactName: true,
        email: true,
        businessName: true,
      },
    })

    for (const app of day7Candidates) {
      // Check if nurture_day7_sent audit event already exists
      const alreadySent = await prisma.auditEvent.findFirst({
        where: {
          entityType: 'WholesaleApplication',
          entityId: app.id,
          action: 'nurture_day7_sent',
        },
        select: { id: true },
      })

      if (alreadySent) {
        skipped++
        continue
      }

      try {
        const result = await sendPartnerDay7Email({
          name: app.contactName.split(' ')[0] || app.contactName,
          email: app.email,
          businessName: app.businessName,
        })

        if (result.success) {
          await prisma.auditEvent.create({
            data: {
              entityType: 'WholesaleApplication',
              entityId: app.id,
              action: 'nurture_day7_sent',
              metadata: { email: app.email, businessName: app.businessName },
            },
          })
          day7Sent++
        } else {
          errors.push(`Day-7 ${app.id}: email send failed`)
          skipped++
        }
      } catch (err) {
        errors.push(`Day-7 ${app.id}: ${err instanceof Error ? err.message : 'unknown error'}`)
        skipped++
      }
    }

    console.info(
      `Partner nurture cron: day3=${day3Sent} sent, day7=${day7Sent} sent, ${skipped} skipped, ${errors.length} errors`
    )

    return NextResponse.json({
      day3Sent,
      day7Sent,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error('Partner nurture cron error:', err)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
