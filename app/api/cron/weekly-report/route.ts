import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Resend } from 'resend'

function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

// Vercel cron — runs every Monday at 7am UTC (before client digest at 8am)
// Schedule: 0 7 * * 1
export async function GET(req: NextRequest) {
  // Fail-secure CRON_SECRET auth (same pattern as billing-reminders)
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('CRON_SECRET env var is not set — aborting cron to prevent open access')
    return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
  }
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const r = getResend()
  if (!r) {
    return NextResponse.json({ error: 'Email not configured' }, { status: 503 })
  }

  const FROM_EMAIL =
    process.env.RESEND_FROM_EMAIL || 'orders@wholesailhub.com'
  const OPS_EMAIL =
    process.env.OPS_NOTIFICATION_EMAIL || FROM_EMAIL

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const fortyfiveDaysAgo = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)
  const startOfThisWeek = sevenDaysAgo
  const startOfLastWeek = fourteenDaysAgo

  try {
    // --- Revenue this week vs last week ---
    const thisWeekOrders = await prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' },
        createdAt: { gte: startOfThisWeek },
      },
      select: { total: true, createdAt: true, organizationId: true },
    })

    const lastWeekOrders = await prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' },
        createdAt: { gte: startOfLastWeek, lt: startOfThisWeek },
      },
      select: { total: true },
    })

    const revenueThisWeek = thisWeekOrders.reduce(
      (sum, o) => sum + Number(o.total),
      0
    )
    const revenueLastWeek = lastWeekOrders.reduce(
      (sum, o) => sum + Number(o.total),
      0
    )
    const revenueChangePct =
      revenueLastWeek > 0
        ? ((revenueThisWeek - revenueLastWeek) / revenueLastWeek) * 100
        : null
    const ordersThisWeek = thisWeekOrders.length

    // --- New clients this week ---
    const newClientsCount = await prisma.organization.count({
      where: {
        isWholesaler: true,
        createdAt: { gte: startOfThisWeek },
      },
    })

    // --- Overdue invoices + total AR ---
    const overdueInvoices = await prisma.invoice.findMany({
      where: { status: 'OVERDUE' },
      select: { total: true, invoiceNumber: true },
    })
    const overdueCount = overdueInvoices.length
    const totalAR = overdueInvoices.reduce(
      (sum, i) => sum + Number(i.total),
      0
    )

    // --- Top 3 products by revenue this week ---
    const thisWeekItems = await prisma.orderItem.findMany({
      where: {
        order: {
          status: { not: 'CANCELLED' },
          createdAt: { gte: startOfThisWeek },
        },
      },
      select: { name: true, total: true },
    })

    const productRevenueMap = new Map<string, number>()
    for (const item of thisWeekItems) {
      productRevenueMap.set(
        item.name,
        (productRevenueMap.get(item.name) || 0) + Number(item.total)
      )
    }
    const topProducts = Array.from(productRevenueMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, revenue]) => ({ name, revenue }))

    // --- At-risk clients (no order in 45+ days) ---
    const allWholesalers = await prisma.organization.findMany({
      where: { isWholesaler: true },
      select: { id: true, name: true, email: true },
    })

    const atRiskOrgs: { name: string; email: string; daysSince: number }[] = []
    for (const org of allWholesalers) {
      const lastOrder = await prisma.order.findFirst({
        where: {
          organizationId: org.id,
          status: { not: 'CANCELLED' },
        },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      })
      if (!lastOrder) continue
      const daysSince = Math.floor(
        (now.getTime() - lastOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSince >= 45) {
        atRiskOrgs.push({ name: org.name, email: org.email, daysSince })
      }
    }
    atRiskOrgs.sort((a, b) => b.daysSince - a.daysSince)

    // --- Build the HTML report ---
    const revenueArrow = revenueChangePct === null
      ? ''
      : revenueChangePct >= 0
      ? `<span style="color:#16a34a">&#9650; ${revenueChangePct.toFixed(1)}%</span>`
      : `<span style="color:#dc2626">&#9660; ${Math.abs(revenueChangePct).toFixed(1)}%</span>`

    const topProductRows = topProducts.length > 0
      ? topProducts
          .map(
            (p, i) =>
              `<tr style="${i % 2 === 0 ? 'background:#F9F7F4' : ''}">
                <td style="padding:9px 12px;border-bottom:1px solid #E5E1DB;color:#0A0A0A">${p.name}</td>
                <td style="padding:9px 12px;border-bottom:1px solid #E5E1DB;color:#0A0A0A;text-align:right;font-weight:600">$${p.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>`
          )
          .join('')
      : '<tr><td colspan="2" style="padding:10px 12px;color:#C8C0B4;font-size:13px">No orders this week</td></tr>'

    const atRiskRows = atRiskOrgs.slice(0, 10).length > 0
      ? atRiskOrgs
          .slice(0, 10)
          .map(
            (o, i) =>
              `<tr style="${i % 2 === 0 ? 'background:#F9F7F4' : ''}">
                <td style="padding:9px 12px;border-bottom:1px solid #E5E1DB;color:#0A0A0A">${o.name}</td>
                <td style="padding:9px 12px;border-bottom:1px solid #E5E1DB;color:#0A0A0A">${o.email}</td>
                <td style="padding:9px 12px;border-bottom:1px solid #E5E1DB;color:#dc2626;font-weight:600;text-align:right">${o.daysSince}d</td>
              </tr>`
          )
          .join('')
      : '<tr><td colspan="3" style="padding:10px 12px;color:#C8C0B4;font-size:13px">No at-risk clients</td></tr>'

    const weekLabel = `${startOfThisWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wholesail Weekly Business Report</title>
</head>
<body style="margin:0;padding:0;background-color:#F9F7F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F7F4;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background-color:#FFFFFF;border:1px solid #E5E0D8;border-radius:4px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0A0A0A;padding:24px 36px;">
              <p style="margin:0 0 4px;color:#C8C0B4;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;">Wholesail — Internal</p>
              <h1 style="margin:0;color:#FFFFFF;font-size:20px;font-weight:600;font-family:Georgia,serif;">Weekly Business Report</h1>
              <p style="margin:6px 0 0;color:#C8C0B4;font-size:13px;">${weekLabel}</p>
            </td>
          </tr>

          <!-- KPI Summary -->
          <tr>
            <td style="padding:28px 36px 20px;">
              <h2 style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;">Week at a Glance</h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:14px 16px;background:#F9F7F4;border:1px solid #E5E1DB;width:25%;vertical-align:top">
                    <p style="margin:0;font-size:10px;color:#C8C0B4;letter-spacing:0.1em;text-transform:uppercase;">Revenue</p>
                    <p style="margin:4px 0 0;font-size:24px;font-family:Georgia,serif;font-weight:400;color:#0A0A0A;">$${(revenueThisWeek / 1000).toFixed(1)}k</p>
                    <p style="margin:4px 0 0;font-size:12px;">${revenueArrow}</p>
                  </td>
                  <td style="padding:14px 16px;background:#F9F7F4;border:1px solid #E5E1DB;border-left:none;width:25%;vertical-align:top">
                    <p style="margin:0;font-size:10px;color:#C8C0B4;letter-spacing:0.1em;text-transform:uppercase;">Orders</p>
                    <p style="margin:4px 0 0;font-size:24px;font-family:Georgia,serif;font-weight:400;color:#0A0A0A;">${ordersThisWeek}</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#C8C0B4;">this week</p>
                  </td>
                  <td style="padding:14px 16px;background:#F9F7F4;border:1px solid #E5E1DB;border-left:none;width:25%;vertical-align:top">
                    <p style="margin:0;font-size:10px;color:#C8C0B4;letter-spacing:0.1em;text-transform:uppercase;">New Clients</p>
                    <p style="margin:4px 0 0;font-size:24px;font-family:Georgia,serif;font-weight:400;color:#0A0A0A;">${newClientsCount}</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#C8C0B4;">this week</p>
                  </td>
                  <td style="padding:14px 16px;background:#F9F7F4;border:1px solid #E5E1DB;border-left:none;width:25%;vertical-align:top">
                    <p style="margin:0;font-size:10px;color:#C8C0B4;letter-spacing:0.1em;text-transform:uppercase;">Overdue AR</p>
                    <p style="margin:4px 0 0;font-size:24px;font-family:Georgia,serif;font-weight:400;color:${overdueCount > 0 ? '#dc2626' : '#0A0A0A'};">$${(totalAR / 1000).toFixed(1)}k</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#C8C0B4;">${overdueCount} invoice${overdueCount !== 1 ? 's' : ''}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Top Products -->
          <tr><td style="padding:0 36px;"><div style="height:1px;background-color:#E5E0D8;"></div></td></tr>
          <tr>
            <td style="padding:24px 36px 20px;">
              <h2 style="margin:0 0 14px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;">Top 3 Products by Revenue (This Week)</h2>
              <table style="width:100%;border-collapse:collapse;border:1px solid #E5E1DB;">
                <thead>
                  <tr style="background:#0A0A0A;">
                    <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:500;color:#FFFFFF;letter-spacing:0.06em;">Product</th>
                    <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:500;color:#FFFFFF;letter-spacing:0.06em;">Revenue</th>
                  </tr>
                </thead>
                <tbody>${topProductRows}</tbody>
              </table>
            </td>
          </tr>

          <!-- At-Risk Clients -->
          <tr><td style="padding:0 36px;"><div style="height:1px;background-color:#E5E0D8;"></div></td></tr>
          <tr>
            <td style="padding:24px 36px 28px;">
              <h2 style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;">At-Risk Clients <span style="color:#dc2626">(45+ days no order)</span></h2>
              <p style="margin:0 0 14px;font-size:13px;color:#5c5249;">${atRiskOrgs.length} client${atRiskOrgs.length !== 1 ? 's' : ''} haven't ordered in 45+ days.</p>
              <table style="width:100%;border-collapse:collapse;border:1px solid #E5E1DB;">
                <thead>
                  <tr style="background:#0A0A0A;">
                    <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:500;color:#FFFFFF;letter-spacing:0.06em;">Company</th>
                    <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:500;color:#FFFFFF;letter-spacing:0.06em;">Email</th>
                    <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:500;color:#FFFFFF;letter-spacing:0.06em;">Days Since</th>
                  </tr>
                </thead>
                <tbody>${atRiskRows}</tbody>
              </table>
              ${atRiskOrgs.length > 10 ? `<p style="margin:8px 0 0;font-size:12px;color:#C8C0B4;">...and ${atRiskOrgs.length - 10} more. Review in admin panel.</p>` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F9F7F4;padding:16px 36px;border-top:1px solid #E5E0D8;">
              <p style="margin:0;color:#888077;font-size:12px;line-height:1.6;">
                Wholesail Internal Report &nbsp;&middot;&nbsp; Generated ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br/>
                Do not forward — for internal ops use only.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    const text = `Wholesail Weekly Business Report — ${weekLabel}

WEEK AT A GLANCE
Revenue: $${revenueThisWeek.toFixed(2)}${revenueChangePct !== null ? ` (${revenueChangePct >= 0 ? '+' : ''}${revenueChangePct.toFixed(1)}% vs last week)` : ''}
Orders: ${ordersThisWeek}
New clients: ${newClientsCount}
Overdue AR: $${totalAR.toFixed(2)} (${overdueCount} invoice${overdueCount !== 1 ? 's' : ''})

TOP 3 PRODUCTS
${topProducts.map((p) => `• ${p.name}: $${p.revenue.toFixed(2)}`).join('\n') || 'No orders this week'}

AT-RISK CLIENTS (45+ days no order)
${atRiskOrgs.slice(0, 10).map((o) => `• ${o.name} <${o.email}> — ${o.daysSince} days`).join('\n') || 'None'}

Generated: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Wholesail Internal Ops`

    await r.emails.send({
      from: FROM_EMAIL,
      to: OPS_EMAIL,
      subject: `Wholesail Weekly Report — ${weekLabel}`,
      html,
      text,
    })

    console.info(`Weekly report cron: sent to ${OPS_EMAIL}`)

    return NextResponse.json({
      ok: true,
      sentTo: OPS_EMAIL,
      stats: {
        revenueThisWeek,
        revenueLastWeek,
        revenueChangePct,
        ordersThisWeek,
        newClientsCount,
        overdueCount,
        totalAR,
        topProducts,
        atRiskCount: atRiskOrgs.length,
      },
    })
  } catch (err) {
    console.error('Weekly report cron error:', err)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
