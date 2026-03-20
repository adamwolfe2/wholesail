'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { PortalLayout } from '@/components/portal-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Loader2, Package, Check, Truck, MapPin, Clock, User } from 'lucide-react'
import { ReorderButton } from '@/components/reorder-button'
import { OrderDeliveryChecklist } from '@/components/order-delivery-checklist'

interface ShipmentEvent {
  id: string
  status: string
  description: string
  lat: number | null
  lng: number | null
  timestamp: string
}

interface ShipmentData {
  id: string
  trackingNumber: string | null
  carrier: string | null
  status: string
  driverName: string | null
  driverPhone: string | null
  currentLat: number | null
  currentLng: number | null
  estimatedEta: string | null
  deliveredAt: string | null
  events: ShipmentEvent[]
}

interface OrderDetail {
  id: string
  orderNumber: string
  status: string
  subtotal: string
  tax: string
  deliveryFee: string
  total: string
  notes: string | null
  createdAt: string
  paidAt: string | null
  adminConfirmedAt: string | null
  distributorConfirmedAt: string | null
  clientConfirmedAt: string | null
  organization: {
    name: string
    email: string
    phone: string
    contactPerson: string
  } | null
  items: {
    id: string
    name: string
    quantity: number
    unitPrice: string
    total: string
    product: { slug: string; unit: string; category: string; price: string } | null
  }[]
  payments: {
    id: string
    amount: string
    method: string
    status: string
    createdAt: string
  }[]
  shipment: ShipmentData | null
}

function getStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case 'DELIVERED':
    case 'PAID':
      return 'bg-[#0A0A0A] text-[#F9F7F4] border-[#0A0A0A]'
    case 'PENDING':
      return 'bg-transparent text-[#0A0A0A]/60 border-[#C8C0B4]'
    case 'CONFIRMED':
    case 'PROCESSING':
      return 'bg-[#C8C0B4]/30 text-[#0A0A0A] border-[#C8C0B4]'
    case 'SHIPPED':
    case 'PACKED':
      return 'bg-[#0A0A0A]/80 text-[#F9F7F4] border-[#0A0A0A]/70'
    case 'CANCELLED':
      return 'bg-transparent text-[#0A0A0A]/40 border-[#C8C0B4]/50'
    default:
      return 'bg-transparent text-[#0A0A0A]/60 border-[#C8C0B4]'
  }
}

const statusDescriptions: Record<string, string> = {
  PENDING: 'Your order has been received and is being reviewed.',
  CONFIRMED: 'Your order has been confirmed and is being prepared.',
  PACKED: 'Your order has been packed and is ready for shipping.',
  SHIPPED: 'Your order is on its way!',
  DELIVERED: 'Your order has been delivered.',
  CANCELLED: 'This order has been cancelled.',
}

const ORDER_STEPS = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'] as const

function OrderProgressTracker({ currentStatus }: { currentStatus: string }) {
  const currentIndex = ORDER_STEPS.indexOf(currentStatus as typeof ORDER_STEPS[number])

  return (
    <div className="flex items-center justify-between">
      {ORDER_STEPS.map((step, index) => {
        const isComplete = index < currentIndex
        const isCurrent = index === currentIndex
        return (
          <div key={step} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  isComplete
                    ? 'bg-[#0A0A0A] text-[#F9F7F4] border-[#0A0A0A]'
                    : isCurrent
                      ? 'bg-[#F9F7F4] text-[#0A0A0A] border-[#0A0A0A]'
                      : 'bg-[#C8C0B4]/10 text-[#0A0A0A]/30 border-[#C8C0B4]'
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span className={`text-[9px] sm:text-[10px] mt-1.5 font-medium uppercase tracking-wider ${
                isComplete || isCurrent ? 'text-[#0A0A0A]' : 'text-[#0A0A0A]/30'
              }`}>
                {step}
              </span>
            </div>
            {index < ORDER_STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 sm:mx-2 ${
                  index < currentIndex ? 'bg-[#0A0A0A]' : 'bg-[#C8C0B4]'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

const shipmentStatusColors: Record<string, string> = {
  PREPARING: 'bg-[#C8C0B4]/30 text-[#0A0A0A] border-[#C8C0B4]',
  PICKED_UP: 'bg-[#0A0A0A]/20 text-[#0A0A0A] border-[#C8C0B4]',
  IN_TRANSIT: 'bg-[#0A0A0A]/60 text-[#F9F7F4] border-[#0A0A0A]/50',
  OUT_FOR_DELIVERY: 'bg-[#0A0A0A]/80 text-[#F9F7F4] border-[#0A0A0A]/70',
  DELIVERED: 'bg-[#0A0A0A] text-[#F9F7F4] border-[#0A0A0A]',
  EXCEPTION: 'bg-transparent text-[#0A0A0A]/60 border-[#C8C0B4]',
}

export default function ClientOrderDetailPage() {
  const params = useParams()
  const { isLoaded, isSignedIn } = useUser()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [shipment, setShipment] = useState<ShipmentData | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const orderNumber = params.orderNumber as string

  async function fetchShipment(shipmentId: string) {
    try {
      const res = await fetch(`/api/shipments/${shipmentId}`)
      if (res.ok) {
        const data = await res.json()
        setShipment(data.shipment)
      }
    } catch {
      // Silently fail polling
    }
  }

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/client/orders/${orderNumber}`)
        if (res.ok) {
          const data = await res.json()
          setOrder(data.order)
          if (data.order?.shipment) {
            setShipment(data.order.shipment)
          }
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [isLoaded, isSignedIn, orderNumber])

  // Poll shipment every 30 seconds when active
  useEffect(() => {
    if (!shipment || shipment.status === 'DELIVERED') return

    pollingRef.current = setInterval(() => {
      fetchShipment(shipment.id)
    }, 30000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [shipment?.id, shipment?.status])

  if (!isLoaded || loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#C8C0B4]" />
        </div>
      </PortalLayout>
    )
  }

  if (error || !order) {
    return (
      <PortalLayout>
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-[#C8C0B4] mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold mb-2 text-[#0A0A0A]">Order not found</h2>
          <p className="text-[#0A0A0A]/50 mb-6">
            We couldn&apos;t find order {orderNumber}.
          </p>
          <Button
            asChild
            className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 min-h-[44px]"
          >
            <Link href="/client-portal/orders">Back to Orders</Link>
          </Button>
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout>
      <div className="max-w-3xl space-y-6">
        {/* Back + Header */}
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#0A0A0A]/60 hover:text-[#0A0A0A] shrink-0 mt-1"
            asChild
          >
            <Link href="/client-portal/orders">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#0A0A0A] font-mono">{order.orderNumber}</h1>
            <p className="text-sm text-[#0A0A0A]/50 mt-0.5">
              Placed {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <ReorderButton orderNumber={order.orderNumber} items={order.items} />
        </div>

        {/* Status Progress */}
        <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
          <CardHeader className="pb-3 border-b border-[#C8C0B4]/50">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="font-serif text-lg text-[#0A0A0A]">Order Status</CardTitle>
              <Badge
                variant="outline"
                className={`text-xs px-3 py-1 shrink-0 ${getStatusColor(order.status)}`}
              >
                {order.status}
              </Badge>
            </div>
            <p className="text-sm text-[#0A0A0A]/50">
              {statusDescriptions[order.status] || ''}
            </p>
          </CardHeader>
          <CardContent className="pt-5">
            {order.status === 'CANCELLED' ? (
              <p className="text-sm text-[#0A0A0A]/50 font-medium">This order has been cancelled.</p>
            ) : (
              <OrderProgressTracker currentStatus={order.status} />
            )}
          </CardContent>
        </Card>

        {/* Delivery Confirmation Checklist */}
        {(order.adminConfirmedAt || order.distributorConfirmedAt || order.clientConfirmedAt || order.status !== 'CANCELLED') && (
          <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
            <CardHeader className="pb-3 border-b border-[#C8C0B4]/50">
              <CardTitle className="font-serif text-lg text-[#0A0A0A]">Delivery Confirmation</CardTitle>
              <p className="text-sm text-[#0A0A0A]/50">
                Track your order through our 3-step fulfillment process.
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <OrderDeliveryChecklist
                data={{
                  // The client confirm route uses orderNumber as the param
                  orderId: order.orderNumber,
                  adminConfirmedAt: order.adminConfirmedAt,
                  distributorConfirmedAt: order.distributorConfirmedAt,
                  clientConfirmedAt: order.clientConfirmedAt,
                }}
                viewerRole="client"
              />
            </CardContent>
          </Card>
        )}

        {/* Track Shipment */}
        {shipment && (
          <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
            <CardHeader className="border-b border-[#E5E1DB]">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="font-serif text-lg text-[#0A0A0A] flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[#C8C0B4]" />
                  Track Shipment
                </CardTitle>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-xs px-3 py-1 ${shipmentStatusColors[shipment.status] ?? ''}`}
                  >
                    {shipment.status.replace(/_/g, ' ')}
                  </Badge>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#F9F7F4] text-xs h-8"
                  >
                    <Link href={`/client-portal/orders/${order.orderNumber}/tracking`}>
                      Track →
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Driver + ETA row */}
              <div className="flex flex-wrap gap-4 text-sm">
                {shipment.driverName && (
                  <div className="flex items-center gap-2 text-[#0A0A0A]/70">
                    <User className="h-4 w-4 text-[#C8C0B4]" />
                    <span className="font-medium text-[#0A0A0A]">{shipment.driverName}</span>
                  </div>
                )}
                {shipment.estimatedEta && (
                  <div className="flex items-center gap-2 text-[#0A0A0A]/70">
                    <Clock className="h-4 w-4 text-[#C8C0B4]" />
                    <span>
                      ETA:{' '}
                      <span className="font-medium text-[#0A0A0A]">
                        {new Date(shipment.estimatedEta).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </span>
                  </div>
                )}
                {shipment.carrier && (
                  <div className="text-[#0A0A0A]/60">
                    Carrier: <span className="font-medium text-[#0A0A0A]">{shipment.carrier}</span>
                  </div>
                )}
                {shipment.trackingNumber && (
                  <div className="text-[#0A0A0A]/60">
                    Tracking #: <span className="font-mono font-medium text-[#0A0A0A]">{shipment.trackingNumber}</span>
                  </div>
                )}
              </div>

              {/* Live GPS card */}
              {(shipment.currentLat !== null && shipment.currentLng !== null) && (
                <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[#C8C0B4] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#0A0A0A]">Live GPS Tracking</p>
                      <p className="text-xs text-[#0A0A0A]/50 mt-0.5">
                        Lat: {shipment.currentLat.toFixed(6)}, Lng: {shipment.currentLng.toFixed(6)}
                      </p>
                      <p className="text-xs text-[#C8C0B4] mt-1">
                        Live location updating every 30 seconds
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Event timeline */}
              {shipment.events.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider mb-3">Shipment History</p>
                  <div className="space-y-0 border-l-2 border-[#E5E1DB] ml-2">
                    {shipment.events.map((event) => (
                      <div key={event.id} className="relative pl-4 pb-4 last:pb-0">
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-[#C8C0B4] border border-[#F9F7F4]" />
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                          <div>
                            <p className="text-sm font-medium text-[#0A0A0A]">{event.description}</p>
                            <Badge
                              variant="outline"
                              className={`text-[10px] mt-1 ${shipmentStatusColors[event.status] ?? 'border-[#C8C0B4] text-[#0A0A0A]/60'}`}
                            >
                              {event.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-[#0A0A0A]/40 shrink-0">
                            {new Date(event.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Items */}
        <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
          <CardHeader className="border-b border-[#C8C0B4]/50">
            <CardTitle className="font-serif text-lg text-[#0A0A0A]">Order Items</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#C8C0B4]/50">
                    <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Product</TableHead>
                    <TableHead className="text-right text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Qty</TableHead>
                    <TableHead className="text-right text-[#0A0A0A]/50 uppercase tracking-wider text-xs hidden sm:table-cell">Price</TableHead>
                    <TableHead className="text-right text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id} className="border-[#C8C0B4]/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-[#0A0A0A]">{item.name}</p>
                          {item.product?.unit && (
                            <p className="text-xs text-[#0A0A0A]/40">{item.product.unit}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-[#0A0A0A]/60">{item.quantity}</TableCell>
                      <TableCell className="text-right text-[#0A0A0A]/60 hidden sm:table-cell">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-[#0A0A0A]">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator className="my-4 bg-[#C8C0B4]/50" />

            <div className="flex flex-col items-end gap-2 text-sm">
              <div className="flex justify-between w-full max-w-[200px]">
                <span className="text-[#0A0A0A]/50">Subtotal</span>
                <span className="text-[#0A0A0A]">{formatCurrency(order.subtotal)}</span>
              </div>
              {Number(order.tax) > 0 && (
                <div className="flex justify-between w-full max-w-[200px]">
                  <span className="text-[#0A0A0A]/50">Tax</span>
                  <span className="text-[#0A0A0A]">{formatCurrency(order.tax)}</span>
                </div>
              )}
              {Number(order.deliveryFee) > 0 && (
                <div className="flex justify-between w-full max-w-[200px]">
                  <span className="text-[#0A0A0A]/50">Delivery</span>
                  <span className="text-[#0A0A0A]">{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}
              <Separator className="w-full max-w-[200px] bg-[#C8C0B4]/50" />
              <div className="flex justify-between w-full max-w-[200px] text-base font-bold text-[#0A0A0A]">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {order.notes != null && order.notes !== '' && (
          <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
            <CardHeader className="border-b border-[#C8C0B4]/50">
              <CardTitle className="font-serif text-lg text-[#0A0A0A]">Order Notes</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm whitespace-pre-line text-[#0A0A0A]/70">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Payments */}
        {order.payments && order.payments.length > 0 && (
          <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
            <CardHeader className="border-b border-[#C8C0B4]/50">
              <CardTitle className="font-serif text-lg text-[#0A0A0A]">Payments</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#C8C0B4]/50">
                      <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Date</TableHead>
                      <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs hidden sm:table-cell">Method</TableHead>
                      <TableHead className="text-right text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Amount</TableHead>
                      <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.payments.map((payment) => (
                      <TableRow key={payment.id} className="border-[#C8C0B4]/30">
                        <TableCell className="text-[#0A0A0A]/70">
                          {new Date(payment.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="capitalize text-[#0A0A0A]/70 hidden sm:table-cell">
                          {payment.method.toLowerCase()}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-[#0A0A0A]">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="capitalize text-xs border-[#C8C0B4] text-[#0A0A0A]/60"
                          >
                            {payment.status.toLowerCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  )
}
