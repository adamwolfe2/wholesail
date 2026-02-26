import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'
import { sendInvoiceEmail } from '@/lib/email'
import {
  isConfigured,
  invoiceReminderMessage,
  sendMessage,
  toE164,
} from '@/lib/integrations/blooio'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        organization: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === 'PAID' || invoice.status === 'DRAFT') {
      return NextResponse.json(
        { error: `Cannot send reminder for a ${invoice.status} invoice` },
        { status: 400 }
      )
    }

    const org = invoice.organization
    const now = new Date()
    const dueDateStr = invoice.dueDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    const totalStr = Number(invoice.total).toFixed(2)

    let emailOk = false
    let smsOk = false
    const channelErrors: string[] = []

    // Send reminder email
    const emailResult = await sendInvoiceEmail({
      invoiceNumber: invoice.invoiceNumber,
      customerName: org.name,
      customerEmail: org.email,
      total: Number(invoice.total),
      dueDate: dueDateStr,
    })
    emailOk = emailResult.success
    if (!emailResult.success) {
      channelErrors.push(`Email: ${emailResult.error}`)
    }

    // Send SMS if org has a phone and blooio is configured
    if (org.phone && isConfigured()) {
      const e164 = toE164(org.phone)
      if (e164) {
        const smsResult = await sendMessage({
          to: e164,
          message: invoiceReminderMessage(invoice.invoiceNumber, totalStr, dueDateStr),
        })
        smsOk = smsResult.success
        if (!smsResult.success) {
          channelErrors.push(`SMS: ${smsResult.error}`)
        }
      }
    }

    if (!emailOk && !smsOk) {
      return NextResponse.json(
        { error: 'All reminder channels failed', details: channelErrors },
        { status: 502 }
      )
    }

    // Update reminderSentAt
    const updated = await prisma.invoice.update({
      where: { id },
      data: { reminderSentAt: now },
    })

    // Audit trail
    await prisma.auditEvent.create({
      data: {
        entityType: 'Invoice',
        entityId: id,
        action: 'reminder_sent',
        userId,
        metadata: {
          invoiceNumber: invoice.invoiceNumber,
          emailOk,
          smsOk,
          channelErrors: channelErrors.length > 0 ? channelErrors : undefined,
        },
      },
    })

    return NextResponse.json({
      success: true,
      reminderSentAt: updated.reminderSentAt,
      emailOk,
      smsOk,
      warnings: channelErrors.length > 0 ? channelErrors : undefined,
    })
  } catch (err) {
    console.error('Error sending invoice reminder:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
