import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { AlertTriangle, Clock, DollarSign } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { SendReminderButton } from './send-reminder-button'

export const dynamic = 'force-dynamic'

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

interface InvoiceRow {
  id: string
  invoiceNumber: string
  total: number
  dueDate: Date
  status: string
  reminderSentAt: Date | null
  daysOverdue: number
  organization: { name: string }
}

type AgingBucket = {
  label: string
  min: number   // days overdue (inclusive)
  max: number   // days overdue (inclusive), -1 = no upper bound
  rows: InvoiceRow[]
  total: number
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

function fmt(amount: number) {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// -----------------------------------------------------------------------
// Page (Server Component)
// -----------------------------------------------------------------------

export default async function ARAgingPage() {
  // Admin guard
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  }).catch(() => null)

  if (!dbUser || !['ADMIN', 'OPS', 'SALES_REP'].includes(dbUser.role)) {
    redirect('/')
  }

  // Fetch all unpaid invoices
  const rawInvoices = await prisma.invoice.findMany({
    where: { status: { in: ['PENDING', 'OVERDUE'] } },
    include: {
      organization: { select: { name: true } },
    },
    orderBy: { dueDate: 'asc' },
  })

  const now = new Date()

  const invoices: InvoiceRow[] = rawInvoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    total: Number(inv.total),
    dueDate: inv.dueDate,
    status: inv.status,
    reminderSentAt: inv.reminderSentAt,
    daysOverdue: Math.max(0, daysBetween(inv.dueDate, now)),
    organization: { name: inv.organization.name },
  }))

  // Build aging buckets
  const buckets: AgingBucket[] = [
    { label: 'Current', min: -Infinity, max: 0, rows: [], total: 0 },
    { label: '1–30 Days', min: 1, max: 30, rows: [], total: 0 },
    { label: '31–60 Days', min: 31, max: 60, rows: [], total: 0 },
    { label: '61–90 Days', min: 61, max: 90, rows: [], total: 0 },
    { label: '90+ Days', min: 91, max: Infinity, rows: [], total: 0 },
  ]

  for (const inv of invoices) {
    const isPastDue = inv.dueDate < now
    if (!isPastDue) {
      // Current bucket
      buckets[0].rows.push(inv)
      buckets[0].total += inv.total
    } else {
      const days = inv.daysOverdue
      const bucket = buckets.find((b) => b.min <= days && days <= b.max)
      if (bucket) {
        bucket.rows.push(inv)
        bucket.total += inv.total
      }
    }
  }

  // Summary numbers
  const totalAR = invoices.reduce((s, i) => s + i.total, 0)
  const overdueInvoices = invoices.filter((i) => i.dueDate < now)
  const overdueTotal = overdueInvoices.reduce((s, i) => s + i.total, 0)
  const overdueCount = overdueInvoices.length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#0A0A0A]">AR Aging</h1>
        <p className="text-sm text-[#0A0A0A]/50 mt-0.5">
          Outstanding accounts receivable — as of {fmtDate(now)}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#F9F7F4] border border-[#E5E1DB] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wide text-[#0A0A0A]/50">
              Total AR
            </span>
            <DollarSign className="h-4 w-4 text-[#C8C0B4]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#0A0A0A]">{fmt(totalAR)}</p>
          <p className="text-xs text-[#0A0A0A]/40 mt-1">
            {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'} open
          </p>
        </div>

        <div className="bg-[#F9F7F4] border border-[#E5E1DB] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wide text-[#0A0A0A]/50">
              Overdue Total
            </span>
            <AlertTriangle className="h-4 w-4 text-[#C8C0B4]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#0A0A0A]">{fmt(overdueTotal)}</p>
          <p className="text-xs text-[#0A0A0A]/40 mt-1">
            {overdueCount} {overdueCount === 1 ? 'invoice' : 'invoices'} past due
          </p>
        </div>

        <div className="bg-[#F9F7F4] border border-[#E5E1DB] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wide text-[#0A0A0A]/50">
              Overdue Count
            </span>
            <Clock className="h-4 w-4 text-[#C8C0B4]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#0A0A0A]">{overdueCount}</p>
          <p className="text-xs text-[#0A0A0A]/40 mt-1">
            {invoices.length > 0
              ? `${Math.round((overdueCount / invoices.length) * 100)}% of open invoices`
              : 'No open invoices'}
          </p>
        </div>
      </div>

      {/* Aging buckets */}
      {invoices.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No Outstanding Invoices"
          description="All invoices are paid or in draft status. Nothing to collect."
          action={{ label: 'View All Invoices', href: '/admin/invoices' }}
        />
      ) : (
        <div className="space-y-6">
          {buckets.map((bucket) => {
            if (bucket.rows.length === 0) return null
            const isOverdueBucket = bucket.min >= 1
            return (
              <div key={bucket.label} className="bg-[#F9F7F4] border border-[#E5E1DB]">
                {/* Bucket header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E1DB]">
                  <div className="flex items-center gap-2">
                    {isOverdueBucket && (
                      <span className="inline-block w-2 h-2 bg-[#0A0A0A] rounded-full" />
                    )}
                    <span className="text-sm font-semibold text-[#0A0A0A]">{bucket.label}</span>
                    <span className="text-xs text-[#0A0A0A]/40">
                      ({bucket.rows.length})
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-[#0A0A0A]">
                    {fmt(bucket.total)}
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E1DB]">
                        <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-[#0A0A0A]/50">
                          Client
                        </th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-[#0A0A0A]/50">
                          Invoice #
                        </th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-[#0A0A0A]/50">
                          Amount
                        </th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-[#0A0A0A]/50 hidden sm:table-cell">
                          Due Date
                        </th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-[#0A0A0A]/50 hidden md:table-cell">
                          Days Overdue
                        </th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-[#0A0A0A]/50 hidden lg:table-cell">
                          Last Reminder
                        </th>
                        <th className="px-4 py-2.5" />
                      </tr>
                    </thead>
                    <tbody>
                      {bucket.rows.map((inv, idx) => (
                        <tr
                          key={inv.id}
                          className={
                            idx < bucket.rows.length - 1
                              ? 'border-b border-[#E5E1DB]/60'
                              : ''
                          }
                        >
                          <td className="px-4 py-3 font-medium text-[#0A0A0A]">
                            {inv.organization.name}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#0A0A0A]/60">
                            {inv.invoiceNumber}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-[#0A0A0A]">
                            {fmt(inv.total)}
                          </td>
                          <td className="px-4 py-3 text-[#0A0A0A]/60 hidden sm:table-cell">
                            {fmtDate(inv.dueDate)}
                          </td>
                          <td className="px-4 py-3 text-right hidden md:table-cell">
                            {inv.daysOverdue > 0 ? (
                              <span
                                className={
                                  inv.daysOverdue > 60
                                    ? 'font-semibold text-[#0A0A0A]'
                                    : 'text-[#0A0A0A]/60'
                                }
                              >
                                {inv.daysOverdue}d
                              </span>
                            ) : (
                              <span className="text-[#0A0A0A]/40">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-[#0A0A0A]/40 text-xs hidden lg:table-cell">
                            {inv.reminderSentAt ? fmtDate(inv.reminderSentAt) : 'Never'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <SendReminderButton
                              invoiceId={inv.id}
                              invoiceNumber={inv.invoiceNumber}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* Bucket total row */}
                    <tfoot>
                      <tr className="border-t border-[#E5E1DB] bg-[#F9F7F4]">
                        <td
                          colSpan={2}
                          className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-[#0A0A0A]/50"
                        >
                          Subtotal — {bucket.label}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-[#0A0A0A]">
                          {fmt(bucket.total)}
                        </td>
                        <td colSpan={4} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
