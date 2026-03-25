'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

export interface OrderChecklistData {
  orderId: string
  adminConfirmedAt: string | null
  distributorConfirmedAt: string | null
  clientConfirmedAt: string | null
}

type ViewerRole = 'admin' | 'distributor' | 'client'

interface Props {
  data: OrderChecklistData
  viewerRole: ViewerRole
}

function fmt(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface StepProps {
  label: string
  sublabel: string
  confirmedAt: string | null
  interactive: boolean
  actionLabel: string
  onConfirm: () => void
  loading: boolean
  // Whether the PREVIOUS step is done (gate)
  gated: boolean
}

function ChecklistStep({ label, sublabel, confirmedAt, interactive, actionLabel, onConfirm, loading, gated }: StepProps) {
  const done = confirmedAt !== null
  const canAct = interactive && !done && !gated

  return (
    <div className={`flex items-start gap-3 py-3 ${done ? '' : 'opacity-80'}`}>
      <div className="mt-0.5 shrink-0">
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        ) : (
          <Circle className={`h-5 w-5 ${gated ? 'text-muted-foreground/30' : 'text-muted-foreground'}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${done ? 'text-foreground' : gated ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {done ? fmt(confirmedAt) : sublabel}
        </p>
        {canAct && (
          <Button
            size="sm"
            className="mt-2 h-8 text-xs bg-ink text-cream hover:bg-ink/80 rounded-none"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : null}
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

export function OrderDeliveryChecklist({ data, viewerRole }: Props) {
  const [state, setState] = useState<OrderChecklistData>(data)
  const [loading, setLoading] = useState<'admin' | 'distributor' | 'client' | null>(null)

  async function confirm(step: 'admin' | 'distributor' | 'client') {
    setLoading(step)
    try {
      let url = ''
      const method = 'PATCH'

      if (step === 'admin') {
        url = `/api/admin/orders/${state.orderId}/admin-confirm`
      } else if (step === 'distributor') {
        url = `/api/distributor/orders/${state.orderId}/confirm`
      } else {
        url = `/api/client/orders/${state.orderId}/confirm-delivery`
      }

      const res = await fetch(url, { method })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error ?? 'Something went wrong.')
        return
      }
      const json = await res.json()
      setState(prev => ({ ...prev, ...json.updates }))
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const steps = [
    {
      key: 'admin' as const,
      label: 'Admin Acknowledged',
      sublabel: 'Waiting for admin to confirm receipt.',
      confirmedAt: state.adminConfirmedAt,
      interactive: viewerRole === 'admin',
      actionLabel: 'Confirm Order',
      gated: false,
    },
    {
      key: 'distributor' as const,
      label: 'Distributor Accepted',
      sublabel: 'Waiting for distributor to queue for fulfillment.',
      confirmedAt: state.distributorConfirmedAt,
      interactive: viewerRole === 'distributor',
      actionLabel: 'Confirm & Queue for Fulfillment',
      gated: state.adminConfirmedAt === null,
    },
    {
      key: 'client' as const,
      label: 'Delivered & Received',
      sublabel: 'Waiting for client to confirm delivery.',
      confirmedAt: state.clientConfirmedAt,
      interactive: viewerRole === 'client',
      actionLabel: 'Confirm Delivery',
      gated: state.distributorConfirmedAt === null,
    },
  ]

  // For distributor view, only show steps 1+2
  // For client view, show all 3
  // For admin view, show all 3
  const visibleSteps = viewerRole === 'distributor' ? steps.slice(0, 2) : steps

  return (
    <div className="divide-y divide-border">
      {visibleSteps.map((step, i) => (
        <ChecklistStep
          key={step.key}
          label={step.label}
          sublabel={step.sublabel}
          confirmedAt={step.confirmedAt}
          interactive={step.interactive}
          actionLabel={step.actionLabel}
          onConfirm={() => confirm(step.key)}
          loading={loading === step.key}
          gated={step.gated}
        />
      ))}
    </div>
  )
}
