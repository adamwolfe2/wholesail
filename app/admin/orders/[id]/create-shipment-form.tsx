'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Truck, MapPin, Clock, User, Package } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Shipment {
  id: string
  trackingNumber: string | null
  carrier: string | null
  status: string
  driverName: string | null
  driverPhone: string | null
  driverNotes: string | null
  currentLat: number | null
  currentLng: number | null
  estimatedEta: string | null
  etaWindowEnd: string | null
  deliveryPhotoUrl: string | null
  deliverySignature: string | null
  createdAt: string
}

interface CreateShipmentFormProps {
  orderId: string
  orderStatus: string
  existingShipment: Shipment | null
}

const CARRIERS = ['TBGC Fleet', 'FedEx', 'UPS', 'DoorDash', 'Other'] as const

const shipmentStatusLabels: Record<string, string> = {
  PREPARING: 'Preparing',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  EXCEPTION: 'Exception',
}

export function CreateShipmentForm({
  orderId,
  orderStatus,
  existingShipment,
}: CreateShipmentFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [carrier, setCarrier] = useState('TBGC Fleet')
  const [driverName, setDriverName] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const [driverNotes, setDriverNotes] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [etaStart, setEtaStart] = useState('')
  const [etaEnd, setEtaEnd] = useState('')

  // Show existing shipment details (any status)
  if (existingShipment) {
    const etaFormatted = existingShipment.estimatedEta
      ? format(new Date(existingShipment.estimatedEta), "MMM d, h:mm a")
      : null
    const etaEndFormatted = existingShipment.etaWindowEnd
      ? format(new Date(existingShipment.etaWindowEnd), "h:mm a")
      : null

    return (
      <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-lg text-[#0A0A0A] flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#C8C0B4]" />
            Shipment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status + carrier row */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-[#0A0A0A]/50">Status: </span>
              <span className="font-medium">
                {shipmentStatusLabels[existingShipment.status] ?? existingShipment.status}
              </span>
            </div>
            {existingShipment.carrier && (
              <div>
                <span className="text-[#0A0A0A]/50">Carrier: </span>
                <span className="font-medium">{existingShipment.carrier}</span>
              </div>
            )}
            {existingShipment.trackingNumber && (
              <div>
                <span className="text-[#0A0A0A]/50">Tracking #: </span>
                <span className="font-mono font-medium">{existingShipment.trackingNumber}</span>
              </div>
            )}
          </div>

          {/* Driver row */}
          {(existingShipment.driverName || existingShipment.driverPhone) && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm border-t border-[#E5E1DB] pt-3">
              {existingShipment.driverName && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[#C8C0B4]" />
                  <span className="font-medium text-[#0A0A0A]">{existingShipment.driverName}</span>
                </div>
              )}
              {existingShipment.driverPhone && (
                <div>
                  <span className="text-[#0A0A0A]/50">Phone: </span>
                  <span className="font-medium">{existingShipment.driverPhone}</span>
                </div>
              )}
            </div>
          )}

          {/* ETA row */}
          {etaFormatted && (
            <div className="flex items-center gap-2 text-sm border-t border-[#E5E1DB] pt-3">
              <Clock className="h-3.5 w-3.5 text-[#C8C0B4]" />
              <span className="text-[#0A0A0A]/50">ETA: </span>
              <span className="font-medium text-[#0A0A0A]">
                {etaFormatted}
                {etaEndFormatted && ` – ${etaEndFormatted}`}
              </span>
            </div>
          )}

          {/* Driver notes */}
          {existingShipment.driverNotes && (
            <div className="text-sm border-t border-[#E5E1DB] pt-3">
              <span className="text-[#0A0A0A]/50">Driver Notes: </span>
              <span className="whitespace-pre-line text-[#0A0A0A]/80">{existingShipment.driverNotes}</span>
            </div>
          )}

          {/* GPS */}
          {existingShipment.currentLat !== null && existingShipment.currentLng !== null && (
            <div className="flex items-center gap-2 text-sm border-t border-[#E5E1DB] pt-3">
              <MapPin className="h-3.5 w-3.5 text-[#C8C0B4]" />
              <span className="text-[#0A0A0A]/50">Location: </span>
              <span className="font-mono text-xs text-[#0A0A0A]">
                {existingShipment.currentLat.toFixed(5)}, {existingShipment.currentLng.toFixed(5)}
              </span>
            </div>
          )}

          {/* Delivery proof */}
          {(existingShipment.deliveryPhotoUrl || existingShipment.deliverySignature) && (
            <div className="border-t border-[#E5E1DB] pt-3 space-y-2">
              <p className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                Delivery Proof
              </p>
              {existingShipment.deliverySignature && (
                <div className="text-sm">
                  <span className="text-[#0A0A0A]/50">Signed by: </span>
                  <span className="font-medium">{existingShipment.deliverySignature}</span>
                </div>
              )}
              {existingShipment.deliveryPhotoUrl && (
                <div className="text-sm">
                  <a
                    href={existingShipment.deliveryPhotoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0A0A0A] underline hover:no-underline"
                  >
                    View delivery photo
                  </a>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Only show create form when PACKED
  if (orderStatus !== 'PACKED') {
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
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
        toast.success('Shipment created successfully')
        setShowForm(false)
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create shipment')
      }
    } catch {
      toast.error('Failed to create shipment')
    } finally {
      setSubmitting(false)
    }
  }

  if (!showForm) {
    return (
      <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-lg text-[#0A0A0A] flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#C8C0B4]" />
            Shipment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#0A0A0A]/50 mb-3">
            This order is packed and ready to ship. Create a shipment record to start tracking.
          </p>
          <Button
            className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80"
            onClick={() => setShowForm(true)}
          >
            <Truck className="h-4 w-4 mr-2" />
            Create Shipment
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg text-[#0A0A0A] flex items-center gap-2">
          <Truck className="h-5 w-5 text-[#C8C0B4]" />
          Create Shipment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Carrier */}
          <div className="space-y-1.5">
            <Label htmlFor="carrier" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
              Carrier
            </Label>
            <select
              id="carrier"
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="driverName" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
                Driver Name
              </Label>
              <Input
                id="driverName"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="e.g. John Doe"
                className="border-[#E5E1DB] bg-[#F9F7F4] focus:ring-[#0A0A0A]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="driverPhone" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
                Driver Phone
              </Label>
              <Input
                id="driverPhone"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="(555) 000-0000"
                type="tel"
                className="border-[#E5E1DB] bg-[#F9F7F4] focus:ring-[#0A0A0A]"
              />
            </div>
          </div>

          {/* ETA Window */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="etaStart" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
                ETA From
              </Label>
              <Input
                id="etaStart"
                value={etaStart}
                onChange={(e) => setEtaStart(e.target.value)}
                type="datetime-local"
                className="border-[#E5E1DB] bg-[#F9F7F4] focus:ring-[#0A0A0A] text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="etaEnd" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
                ETA Until <span className="normal-case text-[#0A0A0A]/40">(opt)</span>
              </Label>
              <Input
                id="etaEnd"
                value={etaEnd}
                onChange={(e) => setEtaEnd(e.target.value)}
                type="datetime-local"
                className="border-[#E5E1DB] bg-[#F9F7F4] focus:ring-[#0A0A0A] text-sm"
              />
            </div>
          </div>

          {/* Tracking Number */}
          <div className="space-y-1.5">
            <Label htmlFor="trackingNumber" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
              Tracking Number <span className="normal-case text-[#0A0A0A]/40">(optional — not required for TBGC Fleet)</span>
            </Label>
            <Input
              id="trackingNumber"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. 1Z999AA..."
              className="border-[#E5E1DB] bg-[#F9F7F4] font-mono focus:ring-[#0A0A0A]"
            />
          </div>

          {/* Driver Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="driverNotes" className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
              Driver Notes <span className="normal-case text-[#0A0A0A]/40">(internal — not shown to client)</span>
            </Label>
            <textarea
              id="driverNotes"
              value={driverNotes}
              onChange={(e) => setDriverNotes(e.target.value)}
              placeholder="e.g. Call client on arrival. Use loading dock entrance."
              rows={2}
              className="w-full border border-[#E5E1DB] bg-[#F9F7F4] text-[#0A0A0A] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Shipment
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => setShowForm(false)}
              className="border-[#E5E1DB] text-[#0A0A0A] hover:bg-[#E5E1DB]/50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
