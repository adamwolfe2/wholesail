'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
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
import { Loader2, Edit2, Plus, Package, ClipboardList, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'

interface InventoryItem {
  productId: string
  productName: string
  category: string
  quantityOnHand: number
  quantityReserved: number
  lowStockThreshold: number
  available: boolean
  daysUntilStockout: number | null
}

function getStockStatus(onHand: number, threshold: number) {
  if (onHand === 0) return 'OUT'
  if (onHand <= threshold) return 'LOW'
  return 'IN_STOCK'
}

const stockStatusStyles = {
  OUT: 'bg-neutral-900 text-white border-neutral-800',
  LOW: 'bg-neutral-300 text-neutral-800 border-neutral-400',
  IN_STOCK: 'bg-neutral-100 text-neutral-700 border-neutral-200',
}

const stockStatusLabels = {
  OUT: 'OUT OF STOCK',
  LOW: 'LOW',
  IN_STOCK: 'IN STOCK',
}

const ADJUST_REASONS = [
  { value: 'Physical Count', label: 'Physical Count' },
  { value: 'Received Stock', label: 'Received Stock' },
  { value: 'Damaged', label: 'Damaged' },
  { value: 'Manual Correction', label: 'Manual Correction' },
]

interface AdjustDrawer {
  productId: string
  productName: string
  currentQty: number
}

interface RestockModalState {
  open: boolean
  productId: string
  productName: string
}

export function InventoryTable({ items }: { items: InventoryItem[] }) {
  const router = useRouter()

  // Quick adjust drawer
  const [adjustDrawer, setAdjustDrawer] = useState<AdjustDrawer | null>(null)
  const [adjustDelta, setAdjustDelta] = useState('')
  const [adjustReason, setAdjustReason] = useState('Physical Count')
  const [savingAdjust, setSavingAdjust] = useState(false)

  // Stock count mode
  const [stockCountMode, setStockCountMode] = useState(false)
  const [stockCounts, setStockCounts] = useState<Record<string, string>>({})
  const [savingBulk, setSavingBulk] = useState(false)

  // Availability toggle
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Restock modal
  const [restockModal, setRestockModal] = useState<RestockModalState | null>(null)
  const [restockQty, setRestockQty] = useState('')
  const [restockDate, setRestockDate] = useState('')
  const [restockNotes, setRestockNotes] = useState('')
  const [creatingRestock, setCreatingRestock] = useState(false)

  function openAdjustDrawer(item: InventoryItem) {
    setAdjustDrawer({ productId: item.productId, productName: item.productName, currentQty: item.quantityOnHand })
    setAdjustDelta('')
    setAdjustReason('Physical Count')
  }

  async function handleQuickAdjust(e: React.FormEvent) {
    e.preventDefault()
    if (!adjustDrawer) return
    const delta = parseInt(adjustDelta, 10)
    if (isNaN(delta)) {
      toast.error('Enter a valid adjustment (e.g. +5, -2, or 10)')
      return
    }
    const newQty = Math.max(0, adjustDrawer.currentQty + delta)
    setSavingAdjust(true)
    try {
      const res = await fetch(`/api/admin/inventory/${adjustDrawer.productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantityOnHand: newQty }),
      })
      if (res.ok) {
        toast.success(`${adjustDrawer.productName}: qty updated to ${newQty} (${adjustReason})`)
        setAdjustDrawer(null)
        router.refresh()
      } else {
        toast.error('Failed to update inventory')
      }
    } catch {
      toast.error('Failed to update inventory')
    } finally {
      setSavingAdjust(false)
    }
  }

  async function handleSaveAllCounts() {
    const updates = Object.entries(stockCounts)
      .map(([productId, val]) => ({ productId, qty: parseInt(val, 10) }))
      .filter((u) => !isNaN(u.qty) && u.qty >= 0)

    if (updates.length === 0) {
      toast.error('No valid counts entered')
      return
    }

    setSavingBulk(true)
    let successCount = 0
    let errorCount = 0

    await Promise.all(
      updates.map(async ({ productId, qty }) => {
        try {
          const res = await fetch(`/api/admin/inventory/${productId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantityOnHand: qty }),
          })
          if (res.ok) successCount++
          else errorCount++
        } catch {
          errorCount++
        }
      })
    )

    setSavingBulk(false)

    if (successCount > 0) {
      toast.success(`Updated ${successCount} item${successCount > 1 ? 's' : ''}`)
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} update${errorCount > 1 ? 's' : ''} failed`)
    }

    setStockCounts({})
    setStockCountMode(false)
    router.refresh()
  }

  async function handleToggleAvailable(productId: string, currentAvailable: boolean) {
    setTogglingId(productId)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !currentAvailable }),
      })
      if (res.ok) {
        toast.success(!currentAvailable ? 'Product enabled' : 'Product hidden from catalog')
        router.refresh()
      } else {
        toast.error('Failed to update product availability')
      }
    } catch {
      toast.error('Failed to update product availability')
    } finally {
      setTogglingId(null)
    }
  }

  async function handleCreateRestock(e: React.FormEvent) {
    e.preventDefault()
    if (!restockModal) return
    const qty = parseInt(restockQty, 10)
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }
    if (!restockDate) {
      toast.error('Please enter an expected date')
      return
    }
    setCreatingRestock(true)
    try {
      const res = await fetch(`/api/admin/inventory/${restockModal.productId}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: qty,
          expectedDate: restockDate,
          notes: restockNotes || undefined,
        }),
      })
      if (res.ok) {
        toast.success('Restock order created')
        setRestockModal(null)
        setRestockQty('')
        setRestockDate('')
        setRestockNotes('')
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create restock')
      }
    } catch {
      toast.error('Failed to create restock')
    } finally {
      setCreatingRestock(false)
    }
  }

  if (items.length === 0) {
    return (
      <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardHeader className="border-b border-[#E5E1DB] pb-3">
          <CardTitle className="font-serif text-lg text-[#0A0A0A] flex items-center gap-2">
            <Package className="h-5 w-5 text-[#C8C0B4]" />
            Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-[#0A0A0A]/40 py-4 text-center">
            No inventory levels set up yet. Add tracking below.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardHeader className="border-b border-[#E5E1DB] pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="font-serif text-lg text-[#0A0A0A] flex items-center gap-2">
              <Package className="h-5 w-5 text-[#C8C0B4]" />
              Inventory Levels
            </CardTitle>
            <div className="flex items-center gap-2">
              {stockCountMode && (
                <Button
                  size="sm"
                  disabled={savingBulk}
                  onClick={handleSaveAllCounts}
                  className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 h-8 text-xs gap-1"
                >
                  {savingBulk ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckSquare className="h-3 w-3" />
                  )}
                  Save All Counts
                </Button>
              )}
              <Button
                size="sm"
                variant={stockCountMode ? 'default' : 'outline'}
                onClick={() => {
                  setStockCountMode((v) => !v)
                  setStockCounts({})
                }}
                className={`h-8 text-xs gap-1 ${
                  stockCountMode
                    ? 'bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80'
                    : 'border-[#E5E1DB] text-[#0A0A0A] hover:bg-[#E5E1DB]/50'
                }`}
              >
                <ClipboardList className="h-3 w-3" />
                {stockCountMode ? 'Exit Stock Count' : 'Stock Count'}
              </Button>
            </div>
          </div>
          {stockCountMode && (
            <p className="text-xs text-[#0A0A0A]/50 mt-2">
              Enter actual on-hand counts for each product, then click &quot;Save All Counts&quot;.
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E1DB]">
                  <th className="text-left pb-2 pr-4 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Product</th>
                  <th className="text-left pb-2 pr-4 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-right pb-2 pr-4 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">On Hand</th>
                  <th className="text-right pb-2 pr-4 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider hidden sm:table-cell">Reserved</th>
                  <th className="text-right pb-2 pr-4 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider hidden sm:table-cell">Available</th>
                  <th className="text-right pb-2 pr-4 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider hidden lg:table-cell">Threshold</th>
                  <th className="text-left pb-2 pr-4 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Status</th>
                  <th className="text-right pb-2 pr-4 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider hidden xl:table-cell">Days Left</th>
                  <th className="text-center pb-2 pr-4 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider hidden sm:table-cell">In Catalog</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const status = getStockStatus(item.quantityOnHand, item.lowStockThreshold)
                  const available = item.quantityOnHand - item.quantityReserved

                  return (
                    <tr key={item.productId} className="border-b border-[#E5E1DB] last:border-0">
                      <td className="py-3 pr-4 font-medium text-[#0A0A0A]">
                        {item.productName}
                      </td>
                      <td className="py-3 pr-4 hidden md:table-cell">
                        <Badge variant="outline" className="text-xs border-[#E5E1DB] text-[#0A0A0A]/60">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        {stockCountMode ? (
                          <Input
                            type="number"
                            value={stockCounts[item.productId] ?? ''}
                            onChange={(e) =>
                              setStockCounts((prev) => ({
                                ...prev,
                                [item.productId]: e.target.value,
                              }))
                            }
                            placeholder={String(item.quantityOnHand)}
                            className="w-20 text-right border-[#E5E1DB] bg-[#F9F7F4] h-7 text-sm ml-auto"
                            min={0}
                          />
                        ) : (
                          <span className={`font-bold ${
                            status === 'OUT' ? 'text-[#0A0A0A]' :
                            status === 'LOW' ? 'text-[#0A0A0A]/70' :
                            'text-[#0A0A0A]'
                          }`}>
                            {item.quantityOnHand}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-right text-[#0A0A0A]/50 hidden sm:table-cell">
                        {item.quantityReserved}
                      </td>
                      <td className="py-3 pr-4 text-right hidden sm:table-cell">
                        <span className={available < 0 ? 'text-[#0A0A0A]/40' : 'text-[#0A0A0A]/70'}>
                          {Math.max(0, available)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right text-[#0A0A0A]/50 hidden lg:table-cell">
                        {item.lowStockThreshold}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant="outline"
                          className={`text-xs ${stockStatusStyles[status]}`}
                        >
                          {stockStatusLabels[status]}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-right hidden xl:table-cell">
                        {item.daysUntilStockout === null ? (
                          <span className="text-xs text-[#0A0A0A]/30">—</span>
                        ) : item.daysUntilStockout <= 0 ? (
                          <span className="text-xs font-semibold text-[#0A0A0A]">0d</span>
                        ) : (
                          <span className={`text-xs font-medium ${
                            item.daysUntilStockout <= 7 ? 'text-red-600' :
                            item.daysUntilStockout <= 21 ? 'text-amber-600' :
                            'text-[#0A0A0A]/60'
                          }`}>
                            {item.daysUntilStockout}d
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-center hidden sm:table-cell">
                        <Switch
                          checked={item.available}
                          disabled={togglingId === item.productId}
                          onCheckedChange={() => handleToggleAvailable(item.productId, item.available)}
                          className="data-[state=checked]:bg-[#0A0A0A] data-[state=unchecked]:bg-[#E5E1DB]"
                          aria-label={item.available ? 'Hide from catalog' : 'Show in catalog'}
                        />
                      </td>
                      <td className="py-3">
                        {!stockCountMode && (
                          <div className="flex items-center gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 px-2 text-xs text-[#0A0A0A]/60 hover:text-[#0A0A0A] border border-[#E5E1DB] hover:bg-[#E5E1DB]/50"
                              title="Quick adjust"
                              onClick={() => openAdjustDrawer(item)}
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              Adjust
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-[#0A0A0A]/40 hover:text-[#0A0A0A]"
                              title="Add restock order"
                              onClick={() =>
                                setRestockModal({
                                  open: true,
                                  productId: item.productId,
                                  productName: item.productName,
                                })
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Adjust Dialog */}
      <Dialog
        open={!!adjustDrawer}
        onOpenChange={(open) => {
          if (!open) setAdjustDrawer(null)
        }}
      >
        <DialogContent className="bg-[#F9F7F4] border-[#E5E1DB] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-[#0A0A0A]">
              Adjust Inventory — {adjustDrawer?.productName}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleQuickAdjust} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="adj-delta" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
                Change Amount
              </Label>
              <Input
                id="adj-delta"
                type="number"
                value={adjustDelta}
                onChange={(e) => setAdjustDelta(e.target.value)}
                placeholder="e.g. +5, -3, or 10"
                required
                autoFocus
                className="border-[#E5E1DB] bg-[#F9F7F4]"
              />
              {adjustDrawer && adjustDelta !== '' && !isNaN(parseInt(adjustDelta, 10)) && (
                <p className="text-xs text-[#0A0A0A]/50">
                  {adjustDrawer.currentQty} → {Math.max(0, adjustDrawer.currentQty + parseInt(adjustDelta, 10))}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adj-reason" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
                Reason
              </Label>
              <Select value={adjustReason} onValueChange={setAdjustReason}>
                <SelectTrigger id="adj-reason" className="border-[#E5E1DB] bg-[#F9F7F4]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADJUST_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                disabled={savingAdjust}
                className="flex-1 bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80"
              >
                {savingAdjust && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Adjustment
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdjustDrawer(null)}
                className="border-[#E5E1DB] text-[#0A0A0A] hover:bg-[#E5E1DB]/50"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Restock Modal */}
      <Dialog
        open={!!restockModal?.open}
        onOpenChange={(open) => {
          if (!open) setRestockModal(null)
        }}
      >
        <DialogContent className="bg-[#F9F7F4] border-[#E5E1DB] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-[#0A0A0A]">
              Add Restock — {restockModal?.productName}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRestock} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="restock-qty" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
                Quantity
              </Label>
              <Input
                id="restock-qty"
                type="number"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                placeholder="e.g. 100"
                min={1}
                required
                className="border-[#E5E1DB] bg-[#F9F7F4]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="restock-date" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
                Expected Arrival Date
              </Label>
              <Input
                id="restock-date"
                type="date"
                value={restockDate}
                onChange={(e) => setRestockDate(e.target.value)}
                required
                className="border-[#E5E1DB] bg-[#F9F7F4]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="restock-notes" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
                Notes <span className="normal-case text-[#0A0A0A]/40">(optional)</span>
              </Label>
              <Input
                id="restock-notes"
                value={restockNotes}
                onChange={(e) => setRestockNotes(e.target.value)}
                placeholder="e.g. From supplier XYZ"
                className="border-[#E5E1DB] bg-[#F9F7F4]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={creatingRestock}
                className="flex-1 bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80"
              >
                {creatingRestock && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Add Restock
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRestockModal(null)}
                className="border-[#E5E1DB] text-[#0A0A0A] hover:bg-[#E5E1DB]/50"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
