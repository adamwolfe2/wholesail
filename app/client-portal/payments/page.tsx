'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { PortalLayout } from '@/components/portal-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { DollarSign, CreditCard, CheckCircle2, Clock, Building2, Loader2, ExternalLink, FileText } from 'lucide-react'
import Link from 'next/link'

interface OutstandingInvoice {
  id: string
  invoiceNumber: string
  total: string
  dueDate: string
  status: string
}

interface DbPayment {
  id: string
  amount: string
  method: string
  status: string
  reference: string | null
  createdAt: string
  order: {
    orderNumber: string
    invoice: { invoiceNumber: string } | null
  }
}

function getPaymentStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return 'bg-[#0A0A0A] text-[#F9F7F4] border-[#0A0A0A]'
    case 'PENDING':
      return 'bg-transparent text-[#0A0A0A] border-[#0A0A0A]'
    case 'FAILED':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'REFUNDED':
      return 'bg-transparent text-[#0A0A0A]/40 border-[#C8C0B4]'
    default:
      return 'bg-transparent text-[#0A0A0A]/60 border-[#C8C0B4]'
  }
}

function getMethodIcon(method: string) {
  switch (method.toLowerCase()) {
    case 'wire':
    case 'ach':
      return <Building2 className="h-4 w-4" />
    case 'card':
      return <CreditCard className="h-4 w-4" />
    default:
      return <DollarSign className="h-4 w-4" />
  }
}

export default function PaymentsPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [dbPayments, setDbPayments] = useState<DbPayment[]>([])
  const [outstandingInvoices, setOutstandingInvoices] = useState<OutstandingInvoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      setLoading(false)
      return
    }

    async function fetchData() {
      try {
        const [paymentsRes, invoicesRes] = await Promise.all([
          fetch('/api/client/payments'),
          fetch('/api/client/invoices?status=outstanding'),
        ])
        if (paymentsRes.ok) {
          const data = await paymentsRes.json()
          setDbPayments(data.payments || [])
        }
        if (invoicesRes.ok) {
          const data = await invoicesRes.json()
          setOutstandingInvoices(data.invoices || [])
        }
      } catch {
        // silently fail — empty state shows
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isLoaded, isSignedIn])

  if (!isLoaded) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#C8C0B4]" />
        </div>
      </PortalLayout>
    )
  }

  const completedTotal = dbPayments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + Number(p.amount), 0)
  const pendingTotal = dbPayments.filter(p => p.status === 'PENDING').reduce((s, p) => s + Number(p.amount), 0)
  const completedCount = dbPayments.filter(p => p.status === 'COMPLETED').length
  const pendingCount = dbPayments.filter(p => p.status === 'PENDING').length

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Payments</h1>
          <p className="text-sm text-[#0A0A0A]/50 mt-1">Manage your payments and billing</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">Total Paid (YTD)</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-[#C8C0B4]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0A0A0A]">${completedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-[#0A0A0A]/40 mt-1">{completedCount} completed payments</p>
            </CardContent>
          </Card>

          <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">Pending</CardTitle>
              <Clock className="h-4 w-4 text-[#C8C0B4]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0A0A0A]">${pendingTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-[#0A0A0A]/40 mt-1">{pendingCount} pending payments</p>
            </CardContent>
          </Card>

          <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">Outstanding Invoices</CardTitle>
              <CreditCard className="h-4 w-4 text-[#C8C0B4]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0A0A0A]">
                {outstandingInvoices.length > 0
                  ? `$${outstandingInvoices.reduce((s, i) => s + Number(i.total), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : '$0.00'}
              </div>
              <p className="text-xs text-[#0A0A0A]/40 mt-1">{outstandingInvoices.length} awaiting payment</p>
            </CardContent>
          </Card>
        </div>

        {/* Outstanding Invoices */}
        {outstandingInvoices.length > 0 && (
          <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
            <CardHeader className="border-b border-[#C8C0B4]/50">
              <CardTitle className="font-serif text-lg text-[#0A0A0A]">Outstanding Invoices</CardTitle>
              <CardDescription className="text-[#0A0A0A]/50">Invoices awaiting payment</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {outstandingInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between border border-[#C8C0B4]/50 p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#C8C0B4]" />
                    <div>
                      <p className="font-mono text-sm font-semibold text-[#0A0A0A]">{inv.invoiceNumber}</p>
                      <p className="text-xs text-[#0A0A0A]/50">
                        Due {new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#0A0A0A]">
                      ${Number(inv.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <Button size="sm" className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none" asChild>
                      <Link href={`/client-portal/invoices/${inv.id}`}>
                        Pay Now
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
          <CardHeader className="border-b border-[#C8C0B4]/50">
            <CardTitle className="font-serif text-lg text-[#0A0A0A]">Payment History</CardTitle>
            <CardDescription className="text-[#0A0A0A]/50">All payments made against your account</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#C8C0B4]" />
              </div>
            ) : dbPayments.length > 0 ? (
              <>
                <div className="overflow-x-auto hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#C8C0B4]/50">
                        <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Payment</TableHead>
                        <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Date</TableHead>
                        <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs hidden md:table-cell">Order</TableHead>
                        <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs hidden md:table-cell">Method</TableHead>
                        <TableHead className="text-right text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Amount</TableHead>
                        <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dbPayments.map((payment) => (
                        <TableRow key={payment.id} className="border-[#C8C0B4]/30">
                          <TableCell>
                            <p className="font-medium text-sm font-mono text-[#0A0A0A]">{payment.id.slice(0, 12)}...</p>
                          </TableCell>
                          <TableCell className="text-[#0A0A0A]/60">
                            {new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm font-mono text-[#0A0A0A]/70">{payment.order.orderNumber}</span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2 text-[#0A0A0A]/60">
                              {getMethodIcon(payment.method)}
                              <span className="text-sm capitalize">{payment.method.toLowerCase()}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-[#0A0A0A]">
                            ${Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getPaymentStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Mobile card list */}
                <div className="sm:hidden space-y-3">
                  {dbPayments.map((payment) => (
                    <div key={payment.id} className="border border-[#C8C0B4]/50 p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-mono text-sm font-semibold text-[#0A0A0A]">{payment.id.slice(0, 12)}...</p>
                          <p className="text-xs text-[#0A0A0A]/50 mt-0.5">
                            {new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-[#0A0A0A] shrink-0">
                          ${Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#0A0A0A]/50">
                          {getMethodIcon(payment.method)}
                          <span className="text-xs capitalize">{payment.method.toLowerCase()}</span>
                        </div>
                        <Badge variant="outline" className={getPaymentStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-[#C8C0B4] mx-auto mb-4" />
                <h3 className="font-serif text-lg font-medium mb-2 text-[#0A0A0A]">No payments yet</h3>
                <p className="text-[#0A0A0A]/50 text-sm">
                  Payments will appear here after completing transactions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
