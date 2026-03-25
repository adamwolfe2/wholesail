import { NextRequest, NextResponse } from 'next/server'
import { captureWithContext } from '@/lib/sentry'
import { prisma } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { sendInvoiceEmail } from '@/lib/email'
import {
  isConfigured,
  invoiceReminderMessage,
  sendMessage,
  toE164,
} from '@/lib/integrations/blooio'

// Vercel cron calls this as GET with Authorization header
// Recommended schedule: 0 9 * * * (9am UTC daily)
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
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

  let sent = 0
  let skipped = 0
  const errors: string[] = []

  try {
    // Step 1: Auto-promote PENDING invoices past their due date to OVERDUE
    const overduePromotion = await prisma.invoice.updateMany({
      where: {
        status: 'PENDING',
        dueDate: { lt: now },
      },
      data: { status: 'OVERDUE' },
    })

    if (overduePromotion.count > 0) {
      console.info(`Billing reminders cron: promoted ${overduePromotion.count} invoices to OVERDUE`)
    }

    // Step 2: Find all invoices that need a reminder
    // Conditions: OVERDUE, OR (PENDING with dueDate in the past after promotion)
    // AND (reminderSentAt is null OR reminderSentAt was more than 3 days ago)
    const invoices = await prisma.invoice.findMany({
      where: {
        status: { in: ['OVERDUE', 'PENDING'] },
        dueDate: { lt: now }, // only past-due invoices
        OR: [
          { reminderSentAt: null },
          { reminderSentAt: { lt: threeDaysAgo } },
        ],
      },
      include: {
        organization: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      take: 100, // safety cap per run
    })

    for (const invoice of invoices) {
      const org = invoice.organization
      const dueDateStr = invoice.dueDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      const totalStr = formatCurrency(invoice.total)

      let emailOk = false
      let smsOk = false
      let smsAttempted = false

      // Send reminder email
      try {
        const emailResult = await sendInvoiceEmail({
          invoiceNumber: invoice.invoiceNumber,
          customerName: org.name,
          customerEmail: org.email,
          total: Number(invoice.total),
          dueDate: dueDateStr,
        })
        emailOk = emailResult.success
        if (!emailResult.success) {
          errors.push(`Invoice ${invoice.invoiceNumber}: email failed — ${emailResult.error}`)
        }
      } catch (err) {
        errors.push(
          `Invoice ${invoice.invoiceNumber}: email threw — ${err instanceof Error ? err.message : 'unknown'}`
        )
      }

      // Send SMS if org has a phone and blooio is configured
      if (org.phone && isConfigured()) {
        const e164 = toE164(org.phone)
        if (e164) {
          smsAttempted = true
          try {
            const smsResult = await sendMessage({
              to: e164,
              message: invoiceReminderMessage(invoice.invoiceNumber, totalStr, dueDateStr),
            })
            smsOk = smsResult.success
            if (!smsResult.success) {
              errors.push(
                `Invoice ${invoice.invoiceNumber}: SMS failed — ${smsResult.error}`
              )
            }
          } catch (err) {
            errors.push(
              `Invoice ${invoice.invoiceNumber}: SMS threw — ${err instanceof Error ? err.message : 'unknown'}`
            )
          }
        }
      }

      // Update reminderSentAt only if all attempted channels succeeded
      const allAttemptedSucceeded = emailOk && (!smsAttempted || smsOk)
      if (allAttemptedSucceeded) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { reminderSentAt: now },
        })
        sent++
      } else {
        skipped++
      }
    }

    console.info(
      `Billing reminders cron: ${sent} sent, ${skipped} skipped, ${errors.length} errors` +
        (overduePromotion.count > 0 ? `, ${overduePromotion.count} promoted to OVERDUE` : '')
    )

    return NextResponse.json({
      processed: invoices.length,
      promoted: overduePromotion.count,
      sent,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    captureWithContext(err, { route: 'cron/billing-reminders' })
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
