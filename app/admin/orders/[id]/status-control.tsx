'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowRight, X, MessageSquare, Check } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

const STATUS_FLOW: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200',
  CONFIRMED: 'bg-neutral-200 text-neutral-700 border-neutral-300 hover:bg-neutral-300',
  PACKED: 'bg-neutral-300 text-neutral-800 border-neutral-400 hover:bg-neutral-400',
  SHIPPED: 'bg-neutral-700 text-neutral-100 border-neutral-600 hover:bg-neutral-600',
  DELIVERED: 'bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800',
  CANCELLED: 'bg-neutral-50 text-neutral-400 border-neutral-200 hover:bg-neutral-100',
}

const PIPELINE = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED']

const STATUS_TO_NOTIFY_TYPE: Record<string, string> = {
  CONFIRMED: 'order_confirmation',
  SHIPPED: 'order_shipped',
  DELIVERED: 'order_delivered',
}

export function OrderStatusControl({
  orderId,
  organizationId,
  currentStatus,
}: {
  orderId: string
  organizationId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)
  const [notifying, setNotifying] = useState(false)
  const [notified, setNotified] = useState(false)

  const nextStatuses = STATUS_FLOW[currentStatus] || []
  const notifyType = STATUS_TO_NOTIFY_TYPE[currentStatus]

  async function handleNotify() {
    if (!notifyType) return
    setNotifying(true)
    try {
      const res = await fetch('/api/admin/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: notifyType,
          organizationId,
          orderId,
        }),
      })
      if (res.ok) {
        setNotified(true)
        setTimeout(() => setNotified(false), 3000)
      }
    } catch {
      toast.error('Failed to send notification')
    } finally {
      setNotifying(false)
    }
  }

  async function handleStatusChange(newStatus: string) {
    setUpdating(newStatus)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        toast.success(`Order status updated to ${statusLabels[newStatus]}`)
        router.refresh()
      } else {
        toast.error('Failed to update order status')
      }
    } catch {
      toast.error('Failed to update order status')
    } finally {
      setUpdating(null)
    }
  }

  const currentIdx = PIPELINE.indexOf(currentStatus)
  const isCancelled = currentStatus === 'CANCELLED'

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Order Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status pipeline visualization */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {PIPELINE.map((status, idx) => {
            const isActive = status === currentStatus
            const isPast = !isCancelled && idx < currentIdx
            const isFuture = !isCancelled && idx > currentIdx

            return (
              <div key={status} className="flex items-center gap-1">
                {idx > 0 && (
                  <ArrowRight
                    className={`h-3 w-3 shrink-0 ${
                      isPast ? 'text-neutral-900' : 'text-muted-foreground/30'
                    }`}
                  />
                )}
                <Badge
                  variant="outline"
                  className={`shrink-0 text-xs ${
                    isActive
                      ? statusColors[status]
                      : isPast
                        ? 'bg-neutral-200 text-neutral-700 border-neutral-300'
                        : isFuture
                          ? 'bg-muted text-muted-foreground border-muted'
                          : ''
                  }`}
                >
                  {statusLabels[status]}
                </Badge>
              </div>
            )
          })}
          {isCancelled && (
            <div className="flex items-center gap-1 ml-2">
              <X className="h-3 w-3 text-neutral-500" />
              <Badge variant="outline" className={statusColors['CANCELLED']}>
                Cancelled
              </Badge>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {nextStatuses.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {nextStatuses.map((status) =>
              status === 'CANCELLED' ? (
                <AlertDialog key={status}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={updating !== null}
                    >
                      Cancel Order
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will mark the order as cancelled. The client will need
                        to place a new order if they want to proceed. This action
                        cannot be easily undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Order</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-white hover:bg-destructive/90"
                        onClick={() => handleStatusChange('CANCELLED')}
                      >
                        {updating === 'CANCELLED' ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : null}
                        Yes, Cancel Order
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  key={status}
                  variant="default"
                  size="sm"
                  disabled={updating !== null}
                  onClick={() => handleStatusChange(status)}
                >
                  {updating === status ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : null}
                  Mark as {statusLabels[status]}
                </Button>
              )
            )}
          </div>
        )}

        {/* Notify client button */}
        {notifyType && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={notifying || notified}
              onClick={handleNotify}
            >
              {notifying ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : notified ? (
                <Check className="h-4 w-4 mr-1" />
              ) : (
                <MessageSquare className="h-4 w-4 mr-1" />
              )}
              {notified ? 'Notification Sent' : 'Notify Client via iMessage/SMS'}
            </Button>
          </div>
        )}

        {nextStatuses.length === 0 && (
          <p className="text-sm text-muted-foreground">
            This order is {currentStatus.toLowerCase()} — no further status changes available.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
