import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { PrintButton } from './print-button'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          items: true,
        },
      },
      organization: {
        include: {
          addresses: {
            where: { type: 'BILLING' },
            take: 1,
          },
        },
      },
    },
  })
}

export default async function PrintInvoicePage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  let invoice
  try {
    invoice = await getInvoice(id)
  } catch {
    notFound()
  }

  if (!invoice) notFound()

  // Check access: admin can view any invoice, clients can only view their org's invoices
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, organizationId: true },
  })

  if (!dbUser) redirect('/sign-in')

  const isAdmin = dbUser.role === 'ADMIN' || dbUser.role === 'SALES_REP'
  if (!isAdmin && dbUser.organizationId !== invoice.organizationId) {
    notFound()
  }

  const billingAddress = invoice.organization.addresses[0]
  const subtotal = Number(invoice.subtotal)
  const tax = Number(invoice.tax)
  const total = Number(invoice.total)

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const statusColors: Record<string, React.CSSProperties> = {
    PAID:    { color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0' },
    PENDING: { color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a' },
    OVERDUE: { color: '#991b1b', background: '#fef2f2', border: '1px solid #fecaca' },
    DRAFT:   { color: '#6b7280', background: '#f9fafb', border: '1px solid #e5e7eb' },
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Invoice {invoice.invoiceNumber} — Wholesail</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #fff;
            color: #0A0A0A;
            font-size: 14px;
            line-height: 1.5;
          }
          .page { max-width: 800px; margin: 0 auto; padding: 48px 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; }
          .logo { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
          .invoice-badge { text-align: right; }
          .invoice-badge h1 { font-size: 32px; font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; }
          .invoice-badge .num { font-size: 16px; font-weight: 600; color: #0A0A0A; margin-top: 4px; }
          .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; padding-bottom: 40px; border-bottom: 1px solid #e5e7eb; }
          .party-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #9ca3af; margin-bottom: 8px; }
          .party-name { font-weight: 600; font-size: 15px; margin-bottom: 4px; }
          .party-detail { color: #6b7280; font-size: 13px; line-height: 1.6; }
          .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #e5e7eb; margin-bottom: 40px; }
          .meta-cell { background: #fff; padding: 16px; }
          .meta-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #9ca3af; margin-bottom: 6px; }
          .meta-value { font-weight: 600; font-size: 14px; }
          .status-badge { display: inline-block; padding: 3px 10px; border-radius: 3px; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
          thead th { text-align: left; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #9ca3af; padding: 0 12px 12px; border-bottom: 2px solid #e5e7eb; }
          thead th:not(:first-child) { text-align: right; }
          tbody td { padding: 14px 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
          tbody td:not(:first-child) { text-align: right; }
          tbody td:first-child { font-weight: 500; }
          .totals { display: flex; justify-content: flex-end; }
          .totals-grid { width: 260px; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #6b7280; }
          .totals-divider { border: none; border-top: 1px solid #e5e7eb; margin: 4px 0; }
          .totals-total { display: flex; justify-content: space-between; padding: 12px 0 0; font-size: 16px; font-weight: 700; color: #0A0A0A; }
          .footer { margin-top: 64px; padding-top: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; color: #9ca3af; font-size: 12px; }
          .print-actions { display: flex; justify-content: flex-end; gap: 12px; margin-bottom: 32px; }
          @media print {
            .print-actions { display: none !important; }
            @page { margin: 0.75in; }
          }
        `}</style>
      </head>
      <body>
        <div className="page">
          {/* Actions bar */}
          <div className="print-actions">
            <PrintButton />
          </div>

          {/* Header */}
          <div className="header">
            <div className="logo">Wholesail</div>
            <div className="invoice-badge">
              <h1>Invoice</h1>
              <div className="num">{invoice.invoiceNumber}</div>
            </div>
          </div>

          {/* From / Bill To */}
          <div className="parties">
            <div>
              <div className="party-label">From</div>
              <div className="party-name">Wholesail</div>
              <div className="party-detail">
                Los Angeles, CA 90012<br />
                orders@wholesailhub.com
              </div>
            </div>
            <div>
              <div className="party-label">Bill To</div>
              <div className="party-name">{invoice.organization.name}</div>
              <div className="party-detail">
                {invoice.organization.contactPerson}<br />
                {billingAddress ? (
                  <>{billingAddress.street}<br />{billingAddress.city}, {billingAddress.state} {billingAddress.zip}</>
                ) : (
                  invoice.organization.email
                )}
              </div>
            </div>
          </div>

          {/* Meta grid */}
          <div className="meta">
            <div className="meta-cell">
              <div className="meta-label">Invoice #</div>
              <div className="meta-value" style={{ fontFamily: 'monospace', fontSize: '12px' }}>{invoice.invoiceNumber}</div>
            </div>
            <div className="meta-cell">
              <div className="meta-label">Issue Date</div>
              <div className="meta-value">
                {new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <div className="meta-cell">
              <div className="meta-label">Due Date</div>
              <div className="meta-value">
                {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <div className="meta-cell">
              <div className="meta-label">Status</div>
              <div className="meta-value">
                <span
                  className="status-badge"
                  style={statusColors[invoice.status] || statusColors.DRAFT}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Line items */}
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>${fmt(Number(item.unitPrice))}</td>
                  <td>${fmt(Number(item.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="totals">
            <div className="totals-grid">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>${fmt(subtotal)}</span>
              </div>
              <div className="totals-row">
                <span>Tax</span>
                <span>${fmt(tax)}</span>
              </div>
              <hr className="totals-divider" />
              <div className="totals-total">
                <span>Total</span>
                <span>${fmt(total)}</span>
              </div>
              {invoice.paidAt && (
                <div className="totals-row" style={{ color: '#166534', marginTop: '8px' }}>
                  <span>Paid</span>
                  <span>{new Date(invoice.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <span>Wholesail · Los Angeles, CA</span>
            <span>Thank you for your business.</span>
          </div>
        </div>
      </body>
    </html>
  )
}
