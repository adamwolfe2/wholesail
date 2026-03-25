'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { PortalLayout } from '@/components/portal-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { RefreshCw, Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface StandingOrderItem {
  id: string
  productId: string
  quantity: number
  product: {
    name: string
    slug: string
    price: string | number
    unit: string
    marketRate: boolean
  }
}

interface StandingOrder {
  id: string
  name: string
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
  nextRunDate: string
  isActive: boolean
  items: StandingOrderItem[]
}

interface Product {
  id: string
  name: string
  slug: string
}

const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Bi-Weekly',
  MONTHLY: 'Monthly',
}

function getFrequencyBadge(freq: string) {
  return (
    <Badge
      variant="outline"
      className="border-sand text-ink/60 rounded-none text-xs uppercase tracking-wider"
    >
      {FREQUENCY_LABELS[freq] ?? freq}
    </Badge>
  )
}

function estimateTotal(items: StandingOrderItem[]): {
  total: number
  hasMarketRate: boolean
} {
  let total = 0
  let hasMarketRate = false
  for (const item of items) {
    if (item.product.marketRate) {
      hasMarketRate = true
    } else {
      total += Number(item.product.price) * item.quantity
    }
  }
  return { total, hasMarketRate }
}

export default function StandingOrdersPage() {
  const { isLoaded, isSignedIn } = useUser()

  const [orders, setOrders] = useState<StandingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<StandingOrder | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editOrder, setEditOrder] = useState<StandingOrder | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [fetchError, setFetchError] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formFrequency, setFormFrequency] = useState<'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'>('WEEKLY')
  const [formStartDate, setFormStartDate] = useState('')
  const [formItems, setFormItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: '', quantity: 1 },
  ])

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/client/standing-orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch {
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchOrders()
      fetch('/api/products')
        .then((r) => r.json())
        .then((d) => setProducts(d.products || []))
        .catch(() => {})
    } else if (isLoaded) {
      setLoading(false)
    }
  }, [isLoaded, isSignedIn, fetchOrders])

  async function handleToggle(id: string, current: boolean) {
    setTogglingId(id)
    try {
      const res = await fetch(`/api/client/standing-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      })
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, isActive: !current } : o))
        )
      }
    } catch {
      toast.error('Failed to update status. Please try again.')
    } finally {
      setTogglingId(null)
    }
  }

  function confirmDelete(order: StandingOrder) {
    setOrderToDelete(order)
    setDeleteDialogOpen(true)
  }

  async function handleDelete() {
    if (!orderToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/client/standing-orders/${orderToDelete.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id))
        setDeleteDialogOpen(false)
        setOrderToDelete(null)
      }
    } catch {
      toast.error('Failed to delete. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  async function handleCreate() {
    const validItems = formItems.filter((i) => i.productId && i.quantity > 0)
    if (!formName || !formStartDate || validItems.length === 0) return

    setCreating(true)
    try {
      const res = await fetch('/api/client/standing-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          frequency: formFrequency,
          nextRunDate: formStartDate,
          items: validItems,
        }),
      })
      if (res.ok) {
        setDialogOpen(false)
        resetForm()
        await fetchOrders()
      }
    } catch {
      toast.error('Failed to create order. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  async function handleUpdate() {
    if (!editOrder) return
    const validItems = formItems.filter((i) => i.productId && i.quantity > 0)
    if (!formName || !formStartDate || validItems.length === 0) return

    setUpdating(true)
    try {
      const res = await fetch(`/api/client/standing-orders/${editOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          frequency: formFrequency,
          nextRunDate: formStartDate,
          items: validItems,
        }),
      })
      if (res.ok) {
        setDialogOpen(false)
        resetForm()
        await fetchOrders()
      }
    } catch {
      toast.error('Failed to save changes. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  function resetForm() {
    setFormName('')
    setFormFrequency('WEEKLY')
    setFormStartDate('')
    setFormItems([{ productId: '', quantity: 1 }])
    setEditOrder(null)
  }

  function openNewDialog() {
    resetForm()
    setDialogOpen(true)
  }

  function openEditDialog(order: StandingOrder) {
    setEditOrder(order)
    setFormName(order.name)
    setFormFrequency(order.frequency)
    const d = new Date(order.nextRunDate)
    setFormStartDate(d.toISOString().split('T')[0])
    setFormItems(order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })))
    setDialogOpen(true)
  }

  function addFormItem() {
    setFormItems((prev) => [...prev, { productId: '', quantity: 1 }])
  }

  function updateFormItem(index: number, field: 'productId' | 'quantity', value: string | number) {
    setFormItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  function removeFormItem(index: number) {
    setFormItems((prev) => prev.filter((_, i) => i !== index))
  }

  const formBody = (
    <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
      <div className="space-y-1.5">
        <Label className="text-ink text-sm font-medium">Order Name *</Label>
        <Input
          placeholder="e.g. Weekly Standard Order"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          className="border-sand bg-cream focus-visible:ring-ink rounded-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-ink text-sm font-medium">Frequency *</Label>
          <Select
            value={formFrequency}
            onValueChange={(v) => setFormFrequency(v as 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY')}
          >
            <SelectTrigger className="border-sand bg-cream focus:ring-ink rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none border-sand">
              <SelectItem value="WEEKLY" className="rounded-none">Weekly</SelectItem>
              <SelectItem value="BIWEEKLY" className="rounded-none">Every 2 Weeks</SelectItem>
              <SelectItem value="MONTHLY" className="rounded-none">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-ink text-sm font-medium">
            {editOrder ? 'Next Run Date *' : 'Start Date *'}
          </Label>
          <Input
            type="date"
            value={formStartDate}
            onChange={(e) => setFormStartDate(e.target.value)}
            className="border-sand bg-cream focus-visible:ring-ink rounded-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-ink text-sm font-medium">Items *</Label>
        {formItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Select
              value={item.productId}
              onValueChange={(v) => updateFormItem(index, 'productId', v)}
            >
              <SelectTrigger className="flex-1 border-sand bg-cream focus:ring-ink rounded-none text-sm">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-sand">
                {products.length === 0 ? (
                  <SelectItem value="_none" disabled className="rounded-none">
                    No products
                  </SelectItem>
                ) : (
                  products.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="rounded-none text-sm">
                      {p.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateFormItem(index, 'quantity', parseInt(e.target.value) || 1)}
              className="w-20 border-sand bg-cream focus-visible:ring-ink rounded-none text-sm text-center"
            />
            {formItems.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFormItem(index)}
                className="px-2 text-ink/40 hover:text-ink rounded-none"
              >
                &times;
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addFormItem}
          className="border-sand text-ink/60 hover:text-ink hover:bg-sand/20 rounded-none"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Item
        </Button>
      </div>

      {editOrder && (
        <div className="space-y-1.5 pt-1">
          <Label className="text-ink text-sm font-medium">Status</Label>
          <div className="flex items-center gap-3">
            <Switch
              checked={editOrder.isActive}
              onCheckedChange={() => {
                handleToggle(editOrder.id, editOrder.isActive)
                setEditOrder({ ...editOrder, isActive: !editOrder.isActive })
              }}
              className="data-[state=checked]:bg-ink"
            />
            <span className="text-sm text-ink/60">
              {editOrder.isActive ? 'Active' : 'Paused'}
            </span>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <PortalLayout>
      <div className="space-y-6">
        {fetchError && (
          <div className="mb-4 rounded-none border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Unable to load data. Please refresh the page or try again later.
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest uppercase text-sand mb-1">Auto-Reorder</p>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              Standing Orders
            </h1>
            <p className="text-sm text-ink/50 mt-1">
              Set up recurring orders and we&apos;ll automatically place them on schedule.
            </p>
          </div>
          <Button
            onClick={openNewDialog}
            className="bg-ink text-cream hover:bg-ink/80 min-h-[44px] w-full sm:w-auto rounded-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Standing Order
          </Button>
        </div>

        <Card className="border-sand bg-cream rounded-none">
          <CardHeader className="border-b border-sand/50">
            <CardTitle className="font-serif text-lg text-ink">Your Standing Orders</CardTitle>
            <CardDescription className="text-ink/50">
              Manage and monitor your recurring orders
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-sand" />
              </div>
            ) : !isSignedIn ? (
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 text-sand mx-auto mb-4" />
                <p className="text-ink/50 text-sm">Sign in to view standing orders.</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 text-sand mx-auto mb-4" />
                <h3 className="font-serif text-lg font-medium mb-2 text-ink">
                  No standing orders yet
                </h3>
                <p className="text-ink/50 text-sm mb-6">
                  Set up auto-reorder for your staples and we&apos;ll handle the rest.
                </p>
                <Button
                  onClick={openNewDialog}
                  className="bg-ink text-cream hover:bg-ink/80 rounded-none min-h-[44px]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const { total, hasMarketRate } = estimateTotal(order.items)
                  return (
                    <div
                      key={order.id}
                      className="flex flex-col gap-3 p-4 border border-sand/50"
                    >
                      {/* Top row: name + badges + status + actions */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-medium text-ink">{order.name}</p>
                            {getFrequencyBadge(order.frequency)}
                            <Badge
                              variant="outline"
                              className={
                                order.isActive
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 rounded-none text-xs'
                                  : 'border-sand/50 text-ink/30 rounded-none text-xs'
                              }
                            >
                              {order.isActive ? 'Active' : 'Paused'}
                            </Badge>
                          </div>
                          <p className="text-xs text-ink/50">
                            Next run:{' '}
                            {new Date(order.nextRunDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-ink/50 hidden sm:inline">
                              {order.isActive ? 'Active' : 'Paused'}
                            </span>
                            <Switch
                              checked={order.isActive}
                              onCheckedChange={() => handleToggle(order.id, order.isActive)}
                              disabled={togglingId === order.id}
                              className="data-[state=checked]:bg-ink"
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-sand text-ink/60 hover:text-ink hover:bg-sand/20 rounded-none min-h-[36px] px-2"
                            onClick={() => openEditDialog(order)}
                          >
                            <Pencil className="h-3 w-3" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-sand text-red-400 hover:text-red-600 hover:bg-red-50 rounded-none min-h-[36px] px-2"
                            onClick={() => confirmDelete(order)}
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>

                      {/* Item list */}
                      <div className="space-y-0.5">
                        {order.items.map((item) => (
                          <p key={item.id} className="text-xs text-ink/50">
                            {item.product.name} &times; {item.quantity}
                            {item.product.marketRate && (
                              <span className="ml-1 text-sand">(market rate)</span>
                            )}
                          </p>
                        ))}
                      </div>

                      {/* Estimated total */}
                      <div className="flex items-center justify-between border-t border-sand/30 pt-2">
                        <p className="text-xs text-ink/40 uppercase tracking-wider">
                          Est. per order
                        </p>
                        <p className="text-sm font-semibold text-ink">
                          ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          {hasMarketRate && (
                            <span className="ml-1 text-xs font-normal text-ink/40">
                              + market-rate items
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="rounded-none border-sand bg-cream max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-ink">
              {editOrder ? 'Edit Standing Order' : 'New Standing Order'}
            </DialogTitle>
            <DialogDescription className="text-ink/50">
              {editOrder
                ? 'Update this recurring order.'
                : 'Set up a recurring order that runs automatically on your chosen schedule.'}
            </DialogDescription>
          </DialogHeader>

          {formBody}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false)
                resetForm()
              }}
              className="border-sand text-ink hover:bg-sand/20 rounded-none"
            >
              Cancel
            </Button>
            {!editOrder ? (
              <Button
                onClick={handleCreate}
                disabled={
                  creating ||
                  !formName ||
                  !formStartDate ||
                  formItems.every((i) => !i.productId)
                }
                className="bg-ink text-cream hover:bg-ink/80 rounded-none"
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Create Order
              </Button>
            ) : (
              <Button
                onClick={handleUpdate}
                disabled={
                  updating ||
                  !formName ||
                  !formStartDate ||
                  formItems.every((i) => !i.productId)
                }
                className="bg-ink text-cream hover:bg-ink/80 rounded-none"
              >
                {updating && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Save Changes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setOrderToDelete(null)
        }}
      >
        <DialogContent className="rounded-none border-sand bg-cream max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-ink">Delete Standing Order</DialogTitle>
            <DialogDescription className="text-ink/50">
              Are you sure you want to delete{' '}
              <span className="font-medium text-ink">
                &ldquo;{orderToDelete?.name}&rdquo;
              </span>
              ? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setOrderToDelete(null)
              }}
              className="border-sand text-ink hover:bg-sand/20 rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700 rounded-none"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  )
}
