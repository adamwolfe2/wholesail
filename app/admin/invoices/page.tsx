'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Loader2, FileText, AlertCircle, ChevronDown, DollarSign, Clock, AlertTriangle, Download, X, Search } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { toast } from 'sonner'

interface Invoice {
  id: string
  invoiceNumber: string
  dueDate: string
  status: string
  subtotal: string
  tax: string
  total: string
  createdAt: string
  paidAt: string | null
  order: {
    orderNumber: string
    items: { name: string; quantity: number; unitPrice: string; total: string }[]
  }
  organization: { name: string }
}

interface Order {
  id: string
  orderNumber: string
  total: string
  organization: { name: string }
  createdAt: string
}

import { invoiceStatusColors as statusColors } from '@/lib/status-colors'

const INVOICE_STATUSES = ['DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'] as const

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Filters
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDateRange, setFilterDateRange] = useState('all')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterMinAmount, setFilterMinAmount] = useState('')
  const [filterMaxAmount, setFilterMaxAmount] = useState('')
  const [filterClient, setFilterClient] = useState('')

  async function fetchInvoices() {
    try {
      const res = await fetch('/api/admin/invoices')
      if (res.ok) {
        const data = await res.json()
        setInvoices(data.invoices || [])
      }
    } catch {
      // DB not connected
    } finally {
      setLoading(false)
    }
  }

  async function fetchOrders() {
    try {
      const res = await fetch('/api/admin/orders/uninvoiced')
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch {
      // DB not connected
    }
  }

  useEffect(() => {
    fetchInvoices()
    fetchOrders()
  }, [])

  async function handleCreate() {
    if (!selectedOrderId || !dueDate) return
    setCreating(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrderId, dueDate }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create invoice')
        setCreating(false)
        return
      }

      toast.success('Invoice created')
      setDialogOpen(false)
      setSelectedOrderId('')
      setDueDate('')
      fetchInvoices()
      fetchOrders()
    } catch {
      toast.error('Network error')
      setError('Network error')
    } finally {
      setCreating(false)
    }
  }

  async function updateStatus(invoiceId: string, status: string) {
    setUpdatingId(invoiceId)
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success(`Invoice updated to ${status}`)
        fetchInvoices()
      } else {
        toast.error('Failed to update invoice')
      }
    } catch {
      toast.error('Failed to update invoice')
    } finally {
      setUpdatingId(null)
    }
  }

  // Default due date: 30 days from now
  const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const hasFilters =
    filterStatus !== 'all' ||
    filterDateRange !== 'all' ||
    filterDateFrom !== '' ||
    filterDateTo !== '' ||
    filterMinAmount !== '' ||
    filterMaxAmount !== '' ||
    filterClient !== ''

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Status
      if (filterStatus !== 'all' && inv.status !== filterStatus) return false

      // Client
      if (
        filterClient &&
        !inv.organization.name.toLowerCase().includes(filterClient.toLowerCase())
      ) return false

      // Amount range
      const total = Number(inv.total)
      if (filterMinAmount && total < Number(filterMinAmount)) return false
      if (filterMaxAmount && total > Number(filterMaxAmount)) return false

      // Date range
      const created = new Date(inv.createdAt)
      const now = new Date()

      if (filterDateRange === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        if (created < start) return false
      } else if (filterDateRange === 'week') {
        const start = new Date(now)
        start.setDate(now.getDate() - now.getDay())
        start.setHours(0, 0, 0, 0)
        if (created < start) return false
      } else if (filterDateRange === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
        if (created < start) return false
      } else if (filterDateRange === '30days') {
        const start = new Date(now)
        start.setDate(now.getDate() - 30)
        start.setHours(0, 0, 0, 0)
        if (created < start) return false
      } else if (filterDateRange === 'custom') {
        if (filterDateFrom && created < new Date(filterDateFrom)) return false
        if (filterDateTo) {
          const end = new Date(filterDateTo)
          end.setHours(23, 59, 59, 999)
          if (created > end) return false
        }
      }

      return true
    })
  }, [
    invoices,
    filterStatus,
    filterClient,
    filterMinAmount,
    filterMaxAmount,
    filterDateRange,
    filterDateFrom,
    filterDateTo,
  ])

  // KPI summaries
  const paidTotal = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + Number(i.total), 0)
  const pendingTotal = invoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + Number(i.total), 0)
  const overdueTotal = invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + Number(i.total), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-3xl font-normal">Invoices</h2>
        <div className="flex items-center gap-2">
          <a
            href="/api/admin/invoices/export"
            className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setDueDate(defaultDueDate); setError(null) }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100vw-2rem)] sm:w-full">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
              <DialogDescription>
                Generate an invoice from an existing order.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Order</Label>
                <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an order..." />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.length === 0 ? (
                      <SelectItem value="_none" disabled>
                        No uninvoiced orders
                      </SelectItem>
                    ) : (
                      orders.map(order => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.orderNumber} — {order.organization.name} ({formatCurrency(order.total)})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
              {error && (
                <div className="rounded-none border border-red-200 bg-red-50 p-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={creating || !selectedOrderId || !dueDate}
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Invoice
              </Button>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 stagger-children">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${paidTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {invoices.filter(i => i.status === 'PAID').length} invoices
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${pendingTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {invoices.filter(i => i.status === 'PENDING').length} invoices
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${overdueTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {invoices.filter(i => i.status === 'OVERDUE').length} invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Filters</p>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => {
                setFilterStatus('all')
                setFilterDateRange('all')
                setFilterDateFrom('')
                setFilterDateTo('')
                setFilterMinAmount('')
                setFilterMaxAmount('')
                setFilterClient('')
              }}
            >
              <X className="h-3 w-3" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {INVOICE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Date Range</Label>
            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Min Amount */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Min Amount</Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={filterMinAmount}
                onChange={(e) => setFilterMinAmount(e.target.value)}
                className="h-8 text-xs pl-5"
              />
            </div>
          </div>

          {/* Max Amount */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Max Amount</Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input
                type="number"
                min="0"
                placeholder="Any"
                value={filterMaxAmount}
                onChange={(e) => setFilterMaxAmount(e.target.value)}
                className="h-8 text-xs pl-5"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Client search */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Client Name</Label>
            <Input
              type="text"
              placeholder="Search by org name..."
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          {filterDateRange === 'custom' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">From Date</Label>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">To Date</Label>
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {hasFilters
              ? `${filteredInvoices.length} invoice${filteredInvoices.length !== 1 ? 's' : ''} matching filters`
              : 'All Invoices'}
          </CardTitle>
          <CardDescription>Manage and track invoices. Use the status dropdown to update.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : invoices.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Invoices Yet"
              description="Create invoices from confirmed orders using the button above."
            />
          ) : filteredInvoices.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No Matching Invoices"
              description="No invoices match the current filters. Try adjusting or clearing them."
            />
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead className="hidden sm:table-cell">Order</TableHead>
                  <TableHead className="hidden md:table-cell">Client</TableHead>
                  <TableHead className="hidden md:table-cell">Due Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono font-medium">
                      {invoice.invoiceNumber}
                      <div className="sm:hidden text-xs text-muted-foreground font-sans font-normal mt-0.5">
                        {invoice.order.orderNumber} &middot; {invoice.organization.name}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm hidden sm:table-cell">
                      {invoice.order.orderNumber}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{invoice.organization.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(invoice.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(invoice.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[invoice.status] || ''}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <a
                          href={`/api/invoices/${invoice.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                        >
                          <Download className="h-4 w-4" />
                          <span className="hidden md:inline text-xs">PDF</span>
                        </a>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={updatingId === invoice.id}
                            >
                              {updatingId === invoice.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {INVOICE_STATUSES.map((s) => (
                              <DropdownMenuItem
                                key={s}
                                disabled={s === invoice.status}
                                onClick={() => updateStatus(invoice.id, s)}
                              >
                                <Badge
                                  variant="outline"
                                  className={`mr-2 ${statusColors[s] || ''}`}
                                >
                                  {s}
                                </Badge>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
