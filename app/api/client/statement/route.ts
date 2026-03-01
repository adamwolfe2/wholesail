import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

// GET /api/client/statement?from=YYYY-MM-DD&to=YYYY-MM-DD
// Returns a printable HTML account statement with @media print CSS
// Defaults to current calendar year if no params supplied
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Resolve the client's org
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    })
    if (!user?.organizationId) {
      return new NextResponse('No organization found', { status: 404 })
    }

    // Parse date range — default to current calendar year
    const now = new Date()
    const url = new URL(req.url)
    const fromParam = url.searchParams.get('from')
    const toParam = url.searchParams.get('to')

    const from = fromParam
      ? new Date(fromParam + 'T00:00:00.000Z')
      : new Date(now.getFullYear(), 0, 1)
    const to = toParam
      ? new Date(toParam + 'T23:59:59.999Z')
      : new Date(now.getFullYear(), 11, 31, 23, 59, 59)

    const orgId = user.organizationId

    // Fetch org details
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        name: true,
        email: true,
        phone: true,
        contactPerson: true,
        paymentTerms: true,
      },
    })

    // Fetch all non-cancelled orders within range
    const orders = await prisma.order.findMany({
      where: {
        organizationId: orgId,
        status: { not: 'CANCELLED' },
        createdAt: { gte: from, lte: to },
      },
      include: {
        invoice: {
          select: {
            invoiceNumber: true,
            status: true,
            dueDate: true,
            paidAt: true,
          },
        },
        payments: {
          select: {
            amount: true,
            status: true,
            createdAt: true,
            method: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Build transaction rows
    // We interleave order charges and payments chronologically
    type TxRow = {
      date: Date
      type: 'Order' | 'Payment'
      reference: string
      amount: number // positive = charge, negative = payment
      balance: number
    }

    const txRows: TxRow[] = []
    let runningBalance = 0

    // Collect all events (orders + payments) sorted by date
    type RawEvent = {
      date: Date
      type: 'Order' | 'Payment'
      reference: string
      amount: number
    }
    const rawEvents: RawEvent[] = []

    for (const order of orders) {
      rawEvents.push({
        date: order.createdAt,
        type: 'Order',
        reference: order.invoice?.invoiceNumber ?? order.orderNumber,
        amount: Number(order.total),
      })
      for (const payment of order.payments) {
        if (payment.status === 'COMPLETED') {
          rawEvents.push({
            date: payment.createdAt,
            type: 'Payment',
            reference: order.orderNumber,
            amount: -Number(payment.amount), // negative = reduces balance
          })
        }
      }
    }

    rawEvents.sort((a, b) => a.date.getTime() - b.date.getTime())

    for (const event of rawEvents) {
      runningBalance += event.amount
      txRows.push({
        ...event,
        balance: runningBalance,
      })
    }

    // Summary figures
    const totalOrders = orders.reduce((sum, o) => sum + Number(o.total), 0)
    const totalPayments = rawEvents
      .filter((e) => e.type === 'Payment')
      .reduce((sum, e) => sum + Math.abs(e.amount), 0)
    const closingBalance = runningBalance

    // Helper formatters
    function fmtDate(d: Date): string {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
    function fmtCurrency(n: number): string {
      const abs = Math.abs(n)
      const formatted = abs.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      return n < 0 ? `(${formatted})` : formatted
    }

    // Build transaction table rows HTML
    const txRowsHtml = txRows.length > 0
      ? txRows
          .map(
            (row, i) =>
              `<tr style="background:${i % 2 === 0 ? '#FFFFFF' : '#F9F7F4'}">
                <td style="padding:9px 12px;border-bottom:1px solid #E5E1DB;font-size:13px;color:#5c5249;white-space:nowrap">${fmtDate(row.date)}</td>
                <td style="padding:9px 12px;border-bottom:1px solid #E5E1DB;font-size:13px;">
                  <span style="display:inline-block;padding:2px 8px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;font-weight:600;border:1px solid ${row.type === 'Order' ? '#0A0A0A' : '#C8C0B4'};color:${row.type === 'Order' ? '#0A0A0A' : '#888077'}">${row.type}</span>
                </td>
                <td style="padding:9px 12px;border-bottom:1px solid #E5E1DB;font-size:13px;color:#0A0A0A;font-family:monospace">${row.reference}</td>
                <td style="padding:9px 12px;border-bottom:1px solid #E5E1DB;font-size:13px;text-align:right;color:${row.amount < 0 ? '#16a34a' : '#0A0A0A'};font-variant-numeric:tabular-nums">${row.type === 'Payment' ? `<span style="color:#16a34a">(${fmtCurrency(Math.abs(row.amount))})</span>` : `$${fmtCurrency(row.amount)}`}</td>
                <td style="padding:9px 12px;border-bottom:1px solid #E5E1DB;font-size:13px;text-align:right;font-weight:${row.balance > 0 ? '600' : '400'};color:${row.balance > 0 ? '#0A0A0A' : '#16a34a'};font-variant-numeric:tabular-nums">$${fmtCurrency(row.balance)}</td>
              </tr>`
          )
          .join('')
      : `<tr><td colspan="5" style="padding:24px 12px;text-align:center;color:#C8C0B4;font-size:14px">No transactions in this period</td></tr>`

    const periodLabel = `${fmtDate(from)} – ${fmtDate(to)}`

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Account Statement — ${org?.name ?? 'Wholesail'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #F9F7F4;
      color: #0A0A0A;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    table { border-collapse: collapse; width: 100%; }
    .no-print { /* shown in browser, hidden when printing */ }

    @media print {
      body { background: #fff; padding: 0; max-width: none; }
      .no-print { display: none !important; }
      @page { margin: 20mm; }
    }
  </style>
</head>
<body>

  <!-- Print button — hidden when actually printing -->
  <div class="no-print" style="margin-bottom:24px;display:flex;gap:12px;align-items:center;">
    <button
      onclick="window.print()"
      style="background:#0A0A0A;color:#fff;border:none;padding:10px 20px;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;">
      Print / Save PDF
    </button>
    <span style="font-size:12px;color:#888077">Or use Ctrl+P / Cmd+P to print</span>
  </div>

  <!-- Statement Header -->
  <div style="border-bottom:2px solid #0A0A0A;padding-bottom:24px;margin-bottom:32px;display:flex;justify-content:space-between;align-items:flex-start;gap:24px;">
    <div>
      <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#C8C0B4;margin-bottom:6px">Wholesail</p>
      <h1 style="font-size:30px;font-family:Georgia,serif;font-weight:400;color:#0A0A0A;line-height:1.1">Account Statement</h1>
      <p style="font-size:13px;color:#888077;margin-top:6px">${periodLabel}</p>
    </div>
    <div style="text-align:right;">
      <p style="font-size:16px;font-weight:700;color:#0A0A0A">${org?.name ?? ''}</p>
      ${org?.contactPerson ? `<p style="font-size:13px;color:#5c5249;margin-top:2px">${org.contactPerson}</p>` : ''}
      <p style="font-size:13px;color:#5c5249;margin-top:2px">${org?.email ?? ''}</p>
      ${org?.phone ? `<p style="font-size:13px;color:#5c5249;margin-top:2px">${org.phone}</p>` : ''}
      ${org?.paymentTerms ? `<p style="font-size:11px;color:#C8C0B4;margin-top:4px;text-transform:uppercase;letter-spacing:0.08em">Terms: ${org.paymentTerms}</p>` : ''}
    </div>
  </div>

  <!-- Summary Box -->
  <div style="background:#FFFFFF;border:1px solid #E5E1DB;padding:20px 24px;margin-bottom:32px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
    <div>
      <p style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;margin-bottom:4px">Total Orders</p>
      <p style="font-size:22px;font-family:Georgia,serif;font-weight:400;color:#0A0A0A">$${totalOrders.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </div>
    <div>
      <p style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;margin-bottom:4px">Payments Received</p>
      <p style="font-size:22px;font-family:Georgia,serif;font-weight:400;color:#16a34a">($${totalPayments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</p>
    </div>
    <div>
      <p style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;margin-bottom:4px">Current Balance</p>
      <p style="font-size:22px;font-family:Georgia,serif;font-weight:700;color:${closingBalance > 0 ? '#0A0A0A' : '#16a34a'}">$${closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </div>
  </div>

  <!-- Transaction Table -->
  <h2 style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#C8C0B4;margin-bottom:12px;">Transactions</h2>
  <table style="border:1px solid #E5E1DB;background:#FFFFFF;">
    <thead>
      <tr style="background:#0A0A0A;color:#F9F7F4;">
        <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:500;letter-spacing:0.07em;text-transform:uppercase;">Date</th>
        <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:500;letter-spacing:0.07em;text-transform:uppercase;">Type</th>
        <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:500;letter-spacing:0.07em;text-transform:uppercase;">Reference</th>
        <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:500;letter-spacing:0.07em;text-transform:uppercase;">Amount</th>
        <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:500;letter-spacing:0.07em;text-transform:uppercase;">Balance</th>
      </tr>
    </thead>
    <tbody>
      ${txRowsHtml}
    </tbody>
    <!-- Closing balance row -->
    <tfoot>
      <tr style="background:#0A0A0A;">
        <td colspan="3" style="padding:10px 12px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#F9F7F4;">Closing Balance</td>
        <td></td>
        <td style="padding:10px 12px;text-align:right;font-size:14px;font-weight:700;color:${closingBalance > 0 ? '#F9F7F4' : '#86efac'}">$${closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    </tfoot>
  </table>

  <!-- Footer -->
  <div style="border-top:1px solid #E5E1DB;margin-top:40px;padding-top:16px;display:flex;justify-content:space-between;align-items:flex-end;gap:16px;">
    <p style="font-size:12px;color:#888077;line-height:1.7;">
      Wholesail &nbsp;&middot;&nbsp; orders@wholesailhub.com<br />
      This statement is for informational purposes only.
    </p>
    <p style="font-size:12px;color:#C8C0B4;text-align:right;white-space:nowrap;">
      Statement generated on<br />${fmtDate(now)}
    </p>
  </div>

</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Statement error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
