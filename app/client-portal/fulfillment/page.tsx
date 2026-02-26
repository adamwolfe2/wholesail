'use client'

import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { CheckSquare, Square, Package, MapPin, Mail, Phone, Loader2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OrderInfo {
  id: string
  orderNumber: string
  status: string
  createdAt: string
  notes: string | null
  organization: { name: string; contactPerson: string; email: string; phone: string }
  shippingAddress: { street: string; city: string; state: string; zip: string } | null
}

interface FulfillmentItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  total: number
  distributorFulfilledAt: string | null
  order: OrderInfo
}

export default function DistributorFulfillmentPage() {
  const [items, setItems] = useState<FulfillmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [ccEmail, setCcEmail] = useState('')
  const [ccEmailInput, setCcEmailInput] = useState('')
  const [savingCc, setSavingCc] = useState(false)
  const [ccSaved, setCcSaved] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/distributor/items')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/distributor/settings')
      if (res.ok) {
        const data = await res.json()
        setCcEmail(data.distributorCcEmail ?? '')
        setCcEmailInput(data.distributorCcEmail ?? '')
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchItems()
    fetchSettings()
  }, [fetchItems, fetchSettings])

  async function toggleFulfilled(item: FulfillmentItem) {
    setToggling(item.id)
    const nowFulfilled = !item.distributorFulfilledAt
    try {
      const res = await fetch(`/api/distributor/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfilled: nowFulfilled }),
      })
      if (res.ok) {
        const data = await res.json()
        setItems(prev => prev.map(i =>
          i.id === item.id ? { ...i, distributorFulfilledAt: data.distributorFulfilledAt } : i
        ))
      }
    } catch { /* ignore */ } finally {
      setToggling(null)
    }
  }

  async function saveCcEmail() {
    setSavingCc(true)
    try {
      const res = await fetch('/api/distributor/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distributorCcEmail: ccEmailInput || null }),
      })
      if (res.ok) {
        setCcEmail(ccEmailInput)
        setCcSaved(true)
        setTimeout(() => setCcSaved(false), 3000)
      }
    } catch { /* ignore */ } finally {
      setSavingCc(false)
    }
  }

  const pending = items.filter(i => !i.distributorFulfilledAt)
  const done = items.filter(i => i.distributorFulfilledAt)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#0A0A0A]/40" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#0A0A0A]">Fulfillment Queue</h2>
          <p className="text-sm text-[#0A0A0A]/50 mt-1">
            {pending.length} item{pending.length !== 1 ? 's' : ''} pending · {done.length} fulfilled
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="text-[#0A0A0A]/50 hover:text-[#0A0A0A] gap-1.5"
        >
          <Settings className="h-4 w-4" />
          Notification settings
        </Button>
      </div>

      {/* CC Email Settings */}
      {showSettings && (
        <div className="border border-[#E5E1DB] bg-white p-5 space-y-3">
          <div>
            <p className="text-sm font-medium text-[#0A0A0A] mb-1">CC email for order notifications</p>
            <p className="text-xs text-[#0A0A0A]/50 mb-3">
              When your products are ordered, a notification goes to your account email.
              Add a second address to CC — e.g. your ops team or coordinator.
              {ccEmail && <span className="block mt-1 text-[#0A0A0A]/70">Currently CC&apos;ing: <strong>{ccEmail}</strong></span>}
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={ccEmailInput}
                onChange={(e) => setCcEmailInput(e.target.value)}
                placeholder="ops@yourcompany.com"
                className="flex-1 border border-[#E5E1DB] px-3 py-2 text-sm focus:outline-none focus:border-[#0A0A0A] text-[#0A0A0A] placeholder:text-[#0A0A0A]/30"
              />
              <Button
                onClick={saveCcEmail}
                disabled={savingCc || ccEmailInput === ccEmail}
                className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none"
              >
                {savingCc ? <Loader2 className="h-4 w-4 animate-spin" /> : ccSaved ? 'Saved ✓' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="border border-[#E5E1DB] bg-white py-16 text-center">
          <Package className="h-8 w-8 text-[#0A0A0A]/20 mx-auto mb-3" />
          <p className="text-sm text-[#0A0A0A]/50">No items to fulfill yet.</p>
          <p className="text-xs text-[#0A0A0A]/30 mt-1">Orders containing your products will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending items */}
          {pending.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0A0A0A]/50">
                Needs Fulfillment ({pending.length})
              </h3>
              <div className="space-y-2">
                {pending.map(item => (
                  <FulfillmentItemCard
                    key={item.id}
                    item={item}
                    onToggle={() => toggleFulfilled(item)}
                    isToggling={toggling === item.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Fulfilled items */}
          {done.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0A0A0A]/30">
                Fulfilled ({done.length})
              </h3>
              <div className="space-y-2 opacity-60">
                {done.map(item => (
                  <FulfillmentItemCard
                    key={item.id}
                    item={item}
                    onToggle={() => toggleFulfilled(item)}
                    isToggling={toggling === item.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FulfillmentItemCard({
  item,
  onToggle,
  isToggling,
}: {
  item: FulfillmentItem
  onToggle: () => void
  isToggling: boolean
}) {
  const fulfilled = !!item.distributorFulfilledAt
  const addr = item.order.shippingAddress

  return (
    <div className={`border bg-white transition-colors ${fulfilled ? 'border-[#E5E1DB]' : 'border-[#0A0A0A]/20'}`}>
      <div className="flex items-start gap-4 p-4">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          disabled={isToggling}
          className="mt-0.5 shrink-0 text-[#0A0A0A] hover:opacity-70 transition-opacity disabled:opacity-40"
          aria-label={fulfilled ? 'Mark as not fulfilled' : 'Mark as fulfilled'}
        >
          {isToggling ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : fulfilled ? (
            <CheckSquare className="h-5 w-5" />
          ) : (
            <Square className="h-5 w-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={`font-medium text-sm ${fulfilled ? 'line-through text-[#0A0A0A]/40' : 'text-[#0A0A0A]'}`}>
                {item.name}
              </p>
              <p className="text-xs text-[#0A0A0A]/50 mt-0.5">
                Qty: <strong>{item.quantity}</strong> · ${Number(item.total).toFixed(2)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-medium text-[#0A0A0A]">{item.order.orderNumber}</p>
              <p className="text-[10px] text-[#0A0A0A]/40 mt-0.5">
                {format(new Date(item.order.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          {/* Client + Delivery info */}
          <div className="mt-2 pt-2 border-t border-[#E5E1DB] grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#0A0A0A]/50">
            <div className="flex items-center gap-1.5">
              <Package className="h-3 w-3 shrink-0" />
              <span>{item.order.organization.name} — {item.order.organization.contactPerson}</span>
            </div>
            {item.order.organization.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 shrink-0" />
                <span>{item.order.organization.phone}</span>
              </div>
            )}
            {item.order.organization.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="h-3 w-3 shrink-0" />
                <span>{item.order.organization.email}</span>
              </div>
            )}
            {addr && (
              <div className="flex items-center gap-1.5 sm:col-span-2">
                <MapPin className="h-3 w-3 shrink-0" />
                <span>{addr.street}, {addr.city}, {addr.state} {addr.zip}</span>
              </div>
            )}
          </div>

          {fulfilled && (
            <p className="text-[10px] text-[#0A0A0A]/30 mt-1.5">
              Fulfilled {format(new Date(item.distributorFulfilledAt!), 'MMM d, yyyy h:mm a')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
