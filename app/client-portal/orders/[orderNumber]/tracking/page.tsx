'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { PortalLayout } from '@/components/portal-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Loader2,
  Package,
  Truck,
  MapPin,
  Clock,
  User,
  CheckCircle,
  Circle,
  MessageCircle,
} from 'lucide-react'

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
  currentLat: number | null
  currentLng: number | null
  estimatedEta: string | null
  etaWindowEnd: string | null
  deliveredAt: string | null
  deliveryPhotoUrl: string | null
  deliverySignature: string | null
  events: ShipmentEvent[]
}

interface OrderSummary {
  id: string
  orderNumber: string
  status: string
  shipment: ShipmentData | null
}

// Stepper steps aligned with ShipmentStatus
const TRACKING_STEPS = [
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PACKED', label: 'Packed' },
  { key: 'PREPARING', label: 'Dispatched' },
  { key: 'IN_TRANSIT', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
] as const

type TrackingStepKey = typeof TRACKING_STEPS[number]['key']

// Map order status to stepper position for pre-shipment states
function getStepIndex(orderStatus: string, shipmentStatus?: string): number {
  if (shipmentStatus === 'DELIVERED') return 4
  if (shipmentStatus === 'OUT_FOR_DELIVERY') return 3
  if (shipmentStatus === 'IN_TRANSIT' || shipmentStatus === 'PICKED_UP') return 3
  if (shipmentStatus === 'PREPARING') return 2
  if (orderStatus === 'PACKED') return 1
  if (orderStatus === 'CONFIRMED') return 0
  if (orderStatus === 'SHIPPED') return 3
  if (orderStatus === 'DELIVERED') return 4
  return 0
}

const shipmentStatusColors: Record<string, string> = {
  PREPARING: 'bg-[#C8C0B4]/30 text-[#0A0A0A] border-[#C8C0B4]',
  PICKED_UP: 'bg-[#0A0A0A]/20 text-[#0A0A0A] border-[#C8C0B4]',
  IN_TRANSIT: 'bg-[#0A0A0A]/60 text-[#F9F7F4] border-[#0A0A0A]/50',
  OUT_FOR_DELIVERY: 'bg-[#0A0A0A]/80 text-[#F9F7F4] border-[#0A0A0A]/70',
  DELIVERED: 'bg-[#0A0A0A] text-[#F9F7F4] border-[#0A0A0A]',
  EXCEPTION: 'bg-transparent text-[#0A0A0A]/60 border-[#C8C0B4]',
}

function getEventIcon(status: string) {
  switch (status) {
    case 'DELIVERED':
      return <CheckCircle className="h-4 w-4 text-[#0A0A0A]" />
    case 'OUT_FOR_DELIVERY':
    case 'IN_TRANSIT':
    case 'PICKED_UP':
      return <Truck className="h-4 w-4 text-[#C8C0B4]" />
    case 'PREPARING':
      return <Package className="h-4 w-4 text-[#C8C0B4]" />
    default:
      return <Circle className="h-4 w-4 text-[#C8C0B4]" />
  }
}

export default function TrackingPage() {
  const params = useParams()
  const { isLoaded, isSignedIn } = useUser()
  const [order, setOrder] = useState<OrderSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const orderNumber = params.orderNumber as string

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/client/orders/${orderNumber}`)
        if (res.ok) {
          const data = await res.json()
          setOrder(data.order)
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
          <p className="text-[#0A0A0A]/50 mb-6">We couldn&apos;t find order {orderNumber}.</p>
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

  const shipment = order.shipment
  const activeStep = getStepIndex(order.status, shipment?.status)

  return (
    <PortalLayout>
      <div className="max-w-2xl space-y-6">
        {/* Back nav */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#0A0A0A]/60 hover:text-[#0A0A0A]"
            asChild
          >
            <Link href={`/client-portal/orders/${orderNumber}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Order
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#0A0A0A]">
            Track Your Order
          </h1>
          <p className="text-sm text-[#0A0A0A]/50 mt-1 font-mono">{order.orderNumber}</p>
        </div>

        {/* No shipment yet */}
        {!shipment && (
          <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
            <CardContent className="pt-6 pb-6 text-center">
              <Package className="h-10 w-10 text-[#C8C0B4] mx-auto mb-3" />
              <p className="font-serif text-base font-semibold text-[#0A0A0A] mb-1">
                Your order is being prepared for dispatch.
              </p>
              <p className="text-sm text-[#0A0A0A]/50">
                You&apos;ll receive a text message when it ships.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Status Stepper */}
        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="border-b border-[#E5E1DB] pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-lg text-[#0A0A0A]">Delivery Status</CardTitle>
              {shipment && (
                <Badge
                  variant="outline"
                  className={`text-xs px-3 py-1 ${shipmentStatusColors[shipment.status] ?? 'border-[#C8C0B4] text-[#0A0A0A]/60'}`}
                >
                  {shipment.status.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              {TRACKING_STEPS.map((step, index) => {
                const isComplete = index < activeStep
                const isCurrent = index === activeStep
                return (
                  <div key={step.key} className="flex items-center flex-1 last:flex-initial">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 flex items-center justify-center border-2 transition-colors ${
                          isComplete
                            ? 'bg-[#0A0A0A] text-[#F9F7F4] border-[#0A0A0A]'
                            : isCurrent
                              ? 'bg-[#F9F7F4] text-[#0A0A0A] border-[#0A0A0A] ring-4 ring-[#0A0A0A]/10'
                              : 'bg-[#F9F7F4] text-[#0A0A0A]/20 border-[#C8C0B4]'
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : isCurrent ? (
                          <div className="w-2.5 h-2.5 bg-[#0A0A0A] rounded-full" />
                        ) : (
                          <span className="text-[10px] font-bold">{index + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] mt-1.5 font-medium uppercase tracking-wider text-center max-w-[52px] leading-tight ${
                          isComplete || isCurrent ? 'text-[#0A0A0A]' : 'text-[#0A0A0A]/30'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < TRACKING_STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-1 sm:mx-2 ${
                          index < activeStep ? 'bg-[#0A0A0A]' : 'bg-[#C8C0B4]'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Shipment Details */}
        {shipment && (
          <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
            <CardHeader className="border-b border-[#E5E1DB] pb-3">
              <CardTitle className="font-serif text-lg text-[#0A0A0A] flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#C8C0B4]" />
                Shipment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Driver + carrier */}
              <div className="flex flex-wrap gap-4 text-sm">
                {shipment.driverName && (
                  <div className="flex items-center gap-2 text-[#0A0A0A]/70">
                    <User className="h-4 w-4 text-[#C8C0B4]" />
                    <span>Driver: </span>
                    <span className="font-medium text-[#0A0A0A]">{shipment.driverName}</span>
                  </div>
                )}
                {shipment.carrier && (
                  <div className="text-[#0A0A0A]/60">
                    Carrier: <span className="font-medium text-[#0A0A0A]">{shipment.carrier}</span>
                  </div>
                )}
                {shipment.trackingNumber && (
                  <div className="text-[#0A0A0A]/60">
                    Tracking #:{' '}
                    <span className="font-mono font-medium text-[#0A0A0A]">{shipment.trackingNumber}</span>
                  </div>
                )}
              </div>

              {/* ETA — prominent */}
              {shipment.estimatedEta && (
                <div className="border border-[#E5E1DB] bg-white px-4 py-3 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[#C8C0B4] shrink-0" />
                  <div>
                    <p className="text-xs text-[#0A0A0A]/50 uppercase tracking-wider">Estimated Delivery</p>
                    <p className="font-semibold text-[#0A0A0A] mt-0.5">
                      {new Date(shipment.estimatedEta).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {shipment.etaWindowEnd && (
                        <span className="text-[#0A0A0A]/50">
                          {' '}–{' '}
                          {new Date(shipment.etaWindowEnd).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* GPS / location placeholder */}
              {shipment.currentLat !== null && shipment.currentLng !== null && (
                <div className="border border-[#E5E1DB] bg-white p-4 flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#C8C0B4] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#0A0A0A]">Driver Location</p>
                    <p className="text-xs text-[#0A0A0A]/50 mt-0.5">
                      Our driver is near coordinates{' '}
                      <span className="font-mono">
                        {shipment.currentLat.toFixed(4)}, {shipment.currentLng.toFixed(4)}
                      </span>
                    </p>
                    <p className="text-xs text-[#C8C0B4] mt-1">Location updates every 30 seconds</p>
                  </div>
                </div>
              )}

              {/* Delivery confirmation */}
              {(shipment.deliverySignature || shipment.deliveryPhotoUrl) && (
                <div className="border border-[#E5E1DB] bg-white p-4 space-y-2">
                  <p className="text-xs font-semibold text-[#0A0A0A] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Delivery Confirmed
                  </p>
                  {shipment.deliverySignature && (
                    <p className="text-sm text-[#0A0A0A]/70">{shipment.deliverySignature}</p>
                  )}
                  {shipment.deliveryPhotoUrl && (
                    <a
                      href={shipment.deliveryPhotoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#0A0A0A] underline"
                    >
                      View delivery photo
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Shipment Event Timeline */}
        {shipment && shipment.events.length > 0 && (
          <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
            <CardHeader className="border-b border-[#E5E1DB] pb-3">
              <CardTitle className="font-serif text-lg text-[#0A0A0A]">Shipment History</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-0 border-l-2 border-[#E5E1DB] ml-3">
                {shipment.events.map((event, i) => (
                  <div
                    key={event.id}
                    className={`relative pl-5 ${i < shipment.events.length - 1 ? 'pb-5' : 'pb-0'}`}
                  >
                    {/* Timeline dot with icon */}
                    <div className="absolute -left-[13px] top-0 w-6 h-6 bg-[#F9F7F4] border border-[#E5E1DB] flex items-center justify-center">
                      {getEventIcon(event.status)}
                    </div>

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
                      <p className="text-xs text-[#0A0A0A]/40 shrink-0 sm:ml-4">
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
            </CardContent>
          </Card>
        )}

        {/* Support link */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#0A0A0A]">Have a question about your delivery?</p>
            <p className="text-xs text-[#0A0A0A]/50 mt-0.5">Our team is here to help.</p>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#F9F7F4] transition-colors shrink-0"
          >
            <Link href="/client-portal/messages">
              <MessageCircle className="h-4 w-4 mr-2" />
              Message Us
            </Link>
          </Button>
        </div>
      </div>
    </PortalLayout>
  )
}
