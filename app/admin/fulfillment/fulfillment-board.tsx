'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Loader2,
  ClipboardList,
  Truck,
  Package,
  CheckCircle,
  ArrowRight,
  Zap,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'

interface OrderItem {
  id: string
  name: string
  quantity: number
  product: { category: string; unit: string } | null
}

interface PendingOrder {
  id: string
  orderNumber: string
  organizationName: string
  itemCount: number
  total: number
  createdAt: string
  isSmsOrder: boolean
  hasMarketRate: boolean
  items: OrderItem[]
}

interface ConfirmedOrder {
  id: string
  orderNumber: string
  organizationName: string
  itemCount: number
  total: number
  createdAt: string
  isSmsOrder: boolean
  hasMarketRate: boolean
  items: OrderItem[]
}

interface PackedOrder {
  id: string
  orderNumber: string
  organizationName: string
  itemCount: number
  total: number
  packedAt: string | null
  hasShipment: boolean
  isSmsOrder: boolean
  hasMarketRate: boolean
  items: OrderItem[]
}

interface ShippedOrder {
  id: string
  orderNumber: string
  organizationName: string
  itemCount: number
  shippedAt: string | null
  driverName: string | null
}

interface DeliveredOrder {
  id: string
  orderNumber: string
  organizationName: string
  itemCount: number
}

interface Props {
  pendingOrders: PendingOrder[]
  confirmedOrders: ConfirmedOrder[]
  packedOrders: PackedOrder[]
  shippedOrders: ShippedOrder[]
  deliveredOrders: DeliveredOrder[]
}

const CARRIERS = ['Wholesail Fleet', 'FedEx', 'UPS', 'DoorDash', 'Other'] as const

// ─── Individual order card ──────────────────────────────────────────────────

function OrderCard({
  id,
  orderNumber,
  organizationName,
  itemCount,
  total,
  timeLabel,
  isSmsOrder,
  hasMarketRate,
  actionLabel,
  onAction,
  updating,
  secondaryAction,
}: {
  id: string
  orderNumber: string
  organizationName: string
  itemCount: number
  total?: number
  timeLabel: string
  isSmsOrder?: boolean
  hasMarketRate?: boolean
  actionLabel: string
  onAction: (id: string) => void
  updating: string | null
  secondaryAction?: React.ReactNode
}) {
  return (
    <div className="border border-[#E5E1DB] bg-white p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/admin/orders/${id}`}
            className="font-mono font-semibold text-sm text-[#0A0A0A] hover:underline"
          >
            {orderNumber}
          </Link>
          <p className="text-xs text-[#0A0A0A]/60 mt-0.5 truncate">{organizationName}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {isSmsOrder && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-[#0A0A0A] text-[#F9F7F4] px-1.5 py-0.5">
              <Zap className="h-2.5 w-2.5" />
              SMS Order
            </span>
          )}
          {hasMarketRate && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium border border-[#C8C0B4] text-[#0A0A0A]/70 px-1.5 py-0.5">
              <AlertTriangle className="h-2.5 w-2.5" />
              Market Rate
            </span>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-[#0A0A0A]/50">
        <span>{itemCount} item{itemCount !== 1 ? 's' : ''}{total !== undefined ? ` · $${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : ''}</span>
        <span>{timeLabel}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        {secondaryAction}
        <Button
          size="sm"
          disabled={updating === id}
          onClick={() => onAction(id)}
          className="flex-1 bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 text-xs h-9"
        >
          {updating === id ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : null}
          {actionLabel}
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  )
}

// ─── Column header ──────────────────────────────────────────────────────────

function ColumnHeader({
  icon: Icon,
  label,
  count,
  accent,
}: {
  icon: React.ElementType
  label: string
  count: number
  accent?: string
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 border-b border-[#E5E1DB] ${accent ?? 'bg-[#F9F7F4]'}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#C8C0B4]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#0A0A0A]">{label}</span>
      </div>
      <span className="text-xs font-bold bg-[#0A0A0A] text-[#F9F7F4] px-2 py-0.5 min-w-[22px] text-center">
        {count}
      </span>
    </div>
  )
}

// ─── Main board ─────────────────────────────────────────────────────────────

export function FulfillmentBoard({
  pendingOrders: initialPending,
  confirmedOrders: initialConfirmed,
  packedOrders: initialPacked,
  shippedOrders: initialShipped,
  deliveredOrders: initialDelivered,
}: Props) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)

  // Shipment modal state
  const [shipmentModal, setShipmentModal] = useState<{
    open: boolean
    orderId: string
    orderNumber: string
  } | null>(null)
  const [carrier, setCarrier] = useState('Wholesail Fleet')
  const [driverName, setDriverName] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const [driverNotes, setDriverNotes] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [etaStart, setEtaStart] = useState('')
  const [etaEnd, setEtaEnd] = useState('')
  const [creatingShipment, setCreatingShipment] = useState(false)

  async function handleStatusChange(orderId: string, status: string) {
    setUpdating(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success(`Order marked as ${status.toLowerCase()}`)
        router.refresh()
      } else {
        toast.error('Failed to update status')
      }
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  async function handleCreateShipment(e: React.FormEvent) {
    e.preventDefault()
    if (!shipmentModal) return
    setCreatingShipment(true)
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: shipmentModal.orderId,
          carrier,
          driverName: driverName || undefined,
          driverPhone: driverPhone || undefined,
          driverNotes: driverNotes || undefined,
          trackingNumber: trackingNumber || undefined,
          estimatedEta: etaStart || undefined,
          etaWindowEnd: etaEnd || undefined,
        }),
      })
      if (res.ok) {
        toast.success('Shipment created')
        setShipmentModal(null)
        resetShipmentForm()
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create shipment')
      }
    } catch {
      toast.error('Failed to create shipment')
    } finally {
      setCreatingShipment(false)
    }
  }

  function resetShipmentForm() {
    setCarrier('Wholesail Fleet')
    setDriverName('')
    setDriverPhone('')
    setDriverNotes('')
    setTrackingNumber('')
    setEtaStart('')
    setEtaEnd('')
  }

  function openShipmentModal(orderId: string, orderNumber: string) {
    resetShipmentForm()
    setShipmentModal({ open: true, orderId, orderNumber })
  }

  const totalActive =
    initialPending.length +
    initialConfirmed.length +
    initialPacked.length +
    initialShipped.length

  return (
    <div className="space-y-4">
      {totalActive === 0 && (
        <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-12 text-center">
          <CheckCircle className="h-10 w-10 text-[#C8C0B4] mx-auto mb-3" />
          <p className="font-serif text-lg font-semibold text-[#0A0A0A]">All caught up</p>
          <p className="text-sm text-[#0A0A0A]/40 mt-1">No active orders in the pipeline.</p>
        </div>
      )}

      {/* Kanban grid: 4 active stages side-by-side on large screens */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {/* ── Stage 1: PENDING ── */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4] flex flex-col">
          <ColumnHeader
            icon={AlertTriangle}
            label="Pending"
            count={initialPending.length}
            accent="bg-[#FFF8EC]"
          />
          <div className="flex-1 p-3 space-y-3">
            {initialPending.length === 0 ? (
              <p className="text-xs text-[#0A0A0A]/30 py-6 text-center">No pending orders</p>
            ) : (
              initialPending.map((order) => (
                <OrderCard
                  key={order.id}
                  id={order.id}
                  orderNumber={order.orderNumber}
                  organizationName={order.organizationName}
                  itemCount={order.itemCount}
                  total={order.total}
                  timeLabel={formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                  isSmsOrder={order.isSmsOrder}
                  hasMarketRate={order.hasMarketRate}
                  actionLabel="Confirm →"
                  onAction={(id) => handleStatusChange(id, 'CONFIRMED')}
                  updating={updating}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Stage 2: CONFIRMED ── */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4] flex flex-col">
          <ColumnHeader
            icon={ClipboardList}
            label="Confirmed"
            count={initialConfirmed.length}
          />
          <div className="flex-1 p-3 space-y-3">
            {initialConfirmed.length === 0 ? (
              <p className="text-xs text-[#0A0A0A]/30 py-6 text-center">No orders to pack</p>
            ) : (
              initialConfirmed.map((order) => (
                <OrderCard
                  key={order.id}
                  id={order.id}
                  orderNumber={order.orderNumber}
                  organizationName={order.organizationName}
                  itemCount={order.itemCount}
                  total={order.total}
                  timeLabel={formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                  isSmsOrder={order.isSmsOrder}
                  hasMarketRate={order.hasMarketRate}
                  actionLabel="Mark Packed"
                  onAction={(id) => handleStatusChange(id, 'PACKED')}
                  updating={updating}
                  secondaryAction={
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#E5E1DB] text-[#0A0A0A] hover:bg-[#E5E1DB]/50 text-xs h-9 px-2"
                      asChild
                    >
                      <Link href={`/admin/fulfillment/${order.id}/pick-list`}>
                        <ClipboardList className="h-3 w-3 mr-1" />
                        Pick List
                      </Link>
                    </Button>
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* ── Stage 3: PACKED ── */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4] flex flex-col">
          <ColumnHeader
            icon={Package}
            label="Packed"
            count={initialPacked.length}
          />
          <div className="flex-1 p-3 space-y-3">
            {initialPacked.length === 0 ? (
              <p className="text-xs text-[#0A0A0A]/30 py-6 text-center">No orders packed</p>
            ) : (
              initialPacked.map((order) => (
                <OrderCard
                  key={order.id}
                  id={order.id}
                  orderNumber={order.orderNumber}
                  organizationName={order.organizationName}
                  itemCount={order.itemCount}
                  total={order.total}
                  timeLabel={order.packedAt ? formatDistanceToNow(new Date(order.packedAt), { addSuffix: true }) : ''}
                  isSmsOrder={order.isSmsOrder}
                  hasMarketRate={order.hasMarketRate}
                  actionLabel="Mark Shipped"
                  onAction={(id) => handleStatusChange(id, 'SHIPPED')}
                  updating={updating}
                  secondaryAction={
                    !order.hasShipment ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openShipmentModal(order.id, order.orderNumber)}
                        className="border-[#E5E1DB] text-[#0A0A0A] hover:bg-[#E5E1DB]/50 text-xs h-9 px-2"
                      >
                        <Truck className="h-3 w-3 mr-1" />
                        Dispatch
                      </Button>
                    ) : (
                      <span className="text-[10px] text-[#0A0A0A]/40 border border-[#E5E1DB] px-2 py-1">
                        Shipment ready
                      </span>
                    )
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* ── Stage 4: SHIPPED ── */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4] flex flex-col">
          <ColumnHeader
            icon={Truck}
            label="In Transit"
            count={initialShipped.length}
          />
          <div className="flex-1 p-3 space-y-3">
            {initialShipped.length === 0 ? (
              <p className="text-xs text-[#0A0A0A]/30 py-6 text-center">No orders in transit</p>
            ) : (
              initialShipped.map((order) => (
                <div key={order.id} className="border border-[#E5E1DB] bg-white p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono font-semibold text-sm text-[#0A0A0A] hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="text-xs text-[#0A0A0A]/60 mt-0.5 truncate">{order.organizationName}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-[#E5E1DB] text-[#0A0A0A]/50 shrink-0">
                      {order.itemCount} items
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#0A0A0A]/50">
                    <span>Driver: {order.driverName ?? '—'}</span>
                    <span>{order.shippedAt ? format(new Date(order.shippedAt), 'h:mm a') : '—'}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      disabled={updating === order.id}
                      onClick={() => handleStatusChange(order.id, 'DELIVERED')}
                      className="flex-1 bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 text-xs h-9"
                    >
                      {updating === order.id ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      )}
                      Mark Delivered
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-[#0A0A0A]/40 hover:text-[#0A0A0A]"
                      asChild
                    >
                      <Link href={`/admin/orders/${order.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delivered today — compact row */}
      {initialDelivered.length > 0 && (
        <div className="border border-[#E5E1DB] bg-[#F9F7F4]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E1DB]">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#C8C0B4]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0A0A0A]">Delivered Today</span>
            </div>
            <span className="text-xs font-bold bg-[#0A0A0A] text-[#F9F7F4] px-2 py-0.5 min-w-[22px] text-center">
              {initialDelivered.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 p-4">
            {initialDelivered.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="inline-flex items-center gap-1.5 border border-[#E5E1DB] bg-white px-3 py-1.5 text-xs font-mono font-medium text-[#0A0A0A] hover:bg-[#E5E1DB]/30 transition-colors"
              >
                <CheckCircle className="h-3 w-3 text-[#C8C0B4]" />
                {order.orderNumber}
                <span className="text-[#0A0A0A]/40">· {order.organizationName}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Shipment Creation Modal */}
      <Dialog
        open={!!shipmentModal?.open}
        onOpenChange={(open) => {
          if (!open) setShipmentModal(null)
        }}
      >
        <DialogContent className="bg-[#F9F7F4] border-[#E5E1DB] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-[#0A0A0A]">
              Dispatch Order — {shipmentModal?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateShipment} className="space-y-4 mt-2">
            {/* Carrier */}
            <div className="space-y-1.5">
              <Label htmlFor="modal-carrier" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
                Carrier
              </Label>
              <select
                id="modal-carrier"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full border border-[#E5E1DB] bg-[#F9F7F4] text-[#0A0A0A] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
              >
                {CARRIERS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Driver Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="modal-driver" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
                  Driver Name
                </Label>
                <Input
                  id="modal-driver"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="border-[#E5E1DB] bg-[#F9F7F4]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modal-phone" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
                  Driver Phone
                </Label>
                <Input
                  id="modal-phone"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  type="tel"
                  className="border-[#E5E1DB] bg-[#F9F7F4]"
                />
              </div>
            </div>

            {/* ETA Window */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="modal-eta-start" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
                  ETA From
                </Label>
                <Input
                  id="modal-eta-start"
                  value={etaStart}
                  onChange={(e) => setEtaStart(e.target.value)}
                  type="datetime-local"
                  className="border-[#E5E1DB] bg-[#F9F7F4] text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modal-eta-end" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
                  ETA Until <span className="normal-case text-[#0A0A0A]/40">(opt)</span>
                </Label>
                <Input
                  id="modal-eta-end"
                  value={etaEnd}
                  onChange={(e) => setEtaEnd(e.target.value)}
                  type="datetime-local"
                  className="border-[#E5E1DB] bg-[#F9F7F4] text-sm"
                />
              </div>
            </div>

            {/* Tracking Number */}
            <div className="space-y-1.5">
              <Label htmlFor="modal-tracking" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
                Tracking # <span className="normal-case text-[#0A0A0A]/40">(optional — not required for Wholesail Fleet)</span>
              </Label>
              <Input
                id="modal-tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. 1Z999AA..."
                className="border-[#E5E1DB] bg-[#F9F7F4] font-mono"
              />
            </div>

            {/* Driver Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="modal-notes" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
                Driver Notes <span className="normal-case text-[#0A0A0A]/40">(internal)</span>
              </Label>
              <textarea
                id="modal-notes"
                value={driverNotes}
                onChange={(e) => setDriverNotes(e.target.value)}
                placeholder="e.g. Call client on arrival. Use loading dock entrance."
                rows={2}
                className="w-full border border-[#E5E1DB] bg-[#F9F7F4] text-[#0A0A0A] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={creatingShipment}
                className="flex-1 bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80"
              >
                {creatingShipment && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                <Truck className="h-4 w-4 mr-2" />
                Create &amp; Dispatch
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShipmentModal(null)}
                className="border-[#E5E1DB] text-[#0A0A0A] hover:bg-[#E5E1DB]/50"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
