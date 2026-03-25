'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { PortalLayout } from '@/components/portal-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DollarSign, Clock, AlertTriangle, Download, Eye, Loader2, FileText, CheckCircle, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

interface DbInvoice {
  id: string
  invoiceNumber: string
  dueDate: string
  status: string
  subtotal: string
  tax: string
  total: string
  paidAt: string | null
  createdAt: string
  order: {
    items: {
      id: string
      name: string
      quantity: number
      unitPrice: string
      total: string
    }[]
  }
}

function getInvoiceStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case 'PAID':
      return 'bg-ink text-cream border-ink'
    case 'PENDING':
      return 'bg-transparent text-ink border-ink'
    case 'OVERDUE':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'DRAFT':
      return 'bg-transparent text-ink/40 border-sand'
    default:
      return 'bg-transparent text-ink/60 border-sand'
  }
}

function InvoiceDetailModal({ invoice }: { invoice: DbInvoice }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-ink/60 hover:text-ink min-h-[44px]">
          <Eye className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">View</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-cream border-sand">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg sm:text-xl text-ink">Invoice {invoice.invoiceNumber}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-ink/50">
            Issued: {new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm">
            <div className="border border-sand p-2 sm:p-3">
              <p className="text-[10px] text-ink/50 uppercase tracking-wider mb-1">Due Date</p>
              <p className="font-semibold text-ink">{new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div className="border border-sand p-2 sm:p-3">
              <p className="text-[10px] text-ink/50 uppercase tracking-wider mb-1">Status</p>
              <Badge variant="outline" className={getInvoiceStatusColor(invoice.status)}>
                {invoice.status}
              </Badge>
            </div>
            <div className="border border-sand p-2 sm:p-3">
              <p className="text-[10px] text-ink/50 uppercase tracking-wider mb-1">Total</p>
              <p className="font-semibold text-ink">${Number(invoice.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <Separator className="bg-sand/50" />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-sand/50">
                  <TableHead className="text-ink/50 uppercase tracking-wider text-xs">Item</TableHead>
                  <TableHead className="text-right text-ink/50 uppercase tracking-wider text-xs">Qty</TableHead>
                  <TableHead className="text-right text-ink/50 uppercase tracking-wider text-xs hidden sm:table-cell">Price</TableHead>
                  <TableHead className="text-right text-ink/50 uppercase tracking-wider text-xs">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.order?.items?.map((item) => (
                  <TableRow key={item.id} className="border-sand/30">
                    <TableCell className="font-medium text-ink">{item.name}</TableCell>
                    <TableCell className="text-right text-ink/60">{item.quantity}</TableCell>
                    <TableCell className="text-right text-ink/60 hidden sm:table-cell">${Number(item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right font-semibold text-ink">${Number(item.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator className="bg-sand/50" />

          <div className="flex flex-col items-end gap-2 text-sm">
            <div className="flex justify-between w-full max-w-[200px]">
              <span className="text-ink/50">Subtotal</span>
              <span className="font-medium text-ink">${Number(invoice.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between w-full max-w-[200px]">
              <span className="text-ink/50">Tax</span>
              <span className="font-medium text-ink">${Number(invoice.tax).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <Separator className="w-full max-w-[200px] bg-sand/50" />
            <div className="flex justify-between w-full max-w-[200px] text-base">
              <span className="font-bold text-ink">Total</span>
              <span className="font-bold text-ink">${Number(invoice.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-ink text-cream px-4 py-2.5 text-sm font-medium hover:bg-ink/80 transition-colors min-h-[44px]"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function InvoicesPage() {
  const { isLoaded, isSignedIn } = useUser()
  const searchParams = useSearchParams()
  const paidInvoiceNumber = searchParams.get('paid')
  const [dbInvoices, setDbInvoices] = useState<DbInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      setLoading(false)
      return
    }

    async function fetchInvoices() {
      try {
        const res = await fetch('/api/client/invoices')
        if (res.ok) {
          const data = await res.json()
          setDbInvoices(data.invoices || [])
        }
      } catch {
        setFetchError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [isLoaded, isSignedIn])

  async function handlePayNow(invoiceId: string) {
    setPayingId(invoiceId)
    try {
      const res = await fetch(`/api/client/invoices/${invoiceId}/pay`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        toast.error(data.error || 'Failed to start payment. Please try again.')
        setPayingId(null)
      }
    } catch {
      toast.error('Network error. Please try again.')
      setPayingId(null)
    }
  }

  if (!isLoaded) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-sand" />
        </div>
      </PortalLayout>
    )
  }

  const paidTotal = dbInvoices.filter(i => i.status === 'PAID').reduce((s, i) => s + Number(i.total), 0)
  const pendingTotal = dbInvoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + Number(i.total), 0)
  const overdueTotal = dbInvoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + Number(i.total), 0)
  const paidCount = dbInvoices.filter(i => i.status === 'PAID').length
  const pendingCount = dbInvoices.filter(i => i.status === 'PENDING').length
  const overdueCount = dbInvoices.filter(i => i.status === 'OVERDUE').length

  return (
    <PortalLayout>
      <div className="space-y-6">
        {fetchError && (
          <div className="mb-4 rounded-none border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Unable to load data. Please refresh the page or try again later.
          </div>
        )}
        {paidInvoiceNumber && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
            <span>Invoice <span className="font-mono font-semibold">{paidInvoiceNumber}</span> has been paid successfully.</span>
          </div>
        )}

        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">Invoices</h1>
          <p className="text-sm text-ink/50 mt-1">View and manage your invoices</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card className="border-sand bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-ink/60 uppercase tracking-wider">Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-sand" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-ink">${paidTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-ink/40 mt-1">{paidCount} invoices</p>
            </CardContent>
          </Card>

          <Card className="border-sand bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-ink/60 uppercase tracking-wider">Pending</CardTitle>
              <Clock className="h-4 w-4 text-sand" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-ink">${pendingTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-ink/40 mt-1">{pendingCount} invoices</p>
            </CardContent>
          </Card>

          <Card className="border-sand bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-ink/60 uppercase tracking-wider">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${overdueTotal > 0 ? 'text-red-600' : 'text-ink'}`}>
                ${overdueTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-ink/40 mt-1">{overdueCount} invoices</p>
            </CardContent>
          </Card>
        </div>

        {/* All Invoices */}
        <Card className="border-sand bg-cream">
          <CardHeader className="border-b border-sand/50">
            <CardTitle className="font-serif text-lg text-ink">All Invoices</CardTitle>
            <CardDescription className="text-ink/50">Complete invoice history for your account</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-sand" />
              </div>
            ) : dbInvoices.length > 0 ? (
              <>
                {/* Desktop table */}
                <div className="overflow-x-auto hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-sand/50">
                        <TableHead className="text-ink/50 uppercase tracking-wider text-xs">Invoice</TableHead>
                        <TableHead className="text-ink/50 uppercase tracking-wider text-xs">Date</TableHead>
                        <TableHead className="text-ink/50 uppercase tracking-wider text-xs hidden md:table-cell">Due Date</TableHead>
                        <TableHead className="text-right text-ink/50 uppercase tracking-wider text-xs">Total</TableHead>
                        <TableHead className="text-ink/50 uppercase tracking-wider text-xs">Status</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dbInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="border-sand/30">
                          <TableCell>
                            <p className="font-medium font-mono text-ink">{invoice.invoiceNumber}</p>
                          </TableCell>
                          <TableCell className="text-ink/60">
                            {new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="text-ink/60 hidden md:table-cell">
                            {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-ink">
                            ${Number(invoice.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getInvoiceStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {(invoice.status === 'PENDING' || invoice.status === 'OVERDUE') && (
                                <Button
                                  size="sm"
                                  onClick={() => handlePayNow(invoice.id)}
                                  disabled={payingId === invoice.id}
                                  className="bg-ink text-cream hover:bg-ink/80 min-h-[44px] text-xs"
                                >
                                  {payingId === invoice.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <><CreditCard className="h-3.5 w-3.5 mr-1" />Pay</>
                                  )}
                                </Button>
                              )}
                              <a
                                href={`/api/invoices/${invoice.id}/pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 min-h-[44px]"
                              >
                                <Download className="h-4 w-4" />
                                <span className="hidden lg:inline">PDF</span>
                              </a>
                              <InvoiceDetailModal invoice={invoice} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Mobile card list */}
                <div className="sm:hidden space-y-3">
                  {dbInvoices.map((invoice) => (
                    <div key={invoice.id} className="border border-sand/50 p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-mono text-sm font-semibold text-ink">{invoice.invoiceNumber}</p>
                          <p className="text-xs text-ink/50 mt-0.5">
                            {new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            &nbsp;&middot;&nbsp;Due {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-ink shrink-0">
                          ${Number(invoice.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className={getInvoiceStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {(invoice.status === 'PENDING' || invoice.status === 'OVERDUE') && (
                            <Button
                              size="sm"
                              onClick={() => handlePayNow(invoice.id)}
                              disabled={payingId === invoice.id}
                              className="bg-ink text-cream hover:bg-ink/80 min-h-[44px] text-xs"
                            >
                              {payingId === invoice.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <><CreditCard className="h-3.5 w-3.5 mr-1" />Pay</>
                              )}
                            </Button>
                          )}
                          <a
                            href={`/api/invoices/${invoice.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 min-h-[44px]"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          <InvoiceDetailModal invoice={invoice} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-sand mx-auto mb-4" />
                <h3 className="font-serif text-lg font-medium mb-2 text-ink">No invoices yet</h3>
                <p className="text-ink/50 text-sm">
                  Invoices will appear here after your orders are processed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
