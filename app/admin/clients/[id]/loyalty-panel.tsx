'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Star, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'

interface LoyaltyStatus {
  currentPoints: number
  lifetimePoints: number
  dollarValue: number
  tier: LoyaltyTier
}

interface AuditEvent {
  id: string
  action: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

const tierBadgeStyles: Record<LoyaltyTier, string> = {
  Bronze: 'bg-amber-100 text-amber-800 border-amber-300',
  Silver: 'bg-gray-100 text-gray-700 border-gray-300',
  Gold: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  Platinum: 'bg-purple-100 text-purple-800 border-purple-300',
}

function formatAction(action: string): string {
  switch (action) {
    case 'loyalty_points_earned': return 'Points earned'
    case 'loyalty_points_redeemed': return 'Points redeemed'
    case 'loyalty_points_adjusted': return 'Manual adjustment'
    default: return action
  }
}

function formatMetadata(action: string, meta: Record<string, unknown> | null): string {
  if (!meta) return ''
  if (action === 'loyalty_points_earned') {
    return `+${meta.points} pts from order $${Number(meta.orderTotal).toFixed(2)}`
  }
  if (action === 'loyalty_points_redeemed') {
    return `-${meta.points} pts ($${Number(meta.dollarDiscount).toFixed(2)} discount)`
  }
  if (action === 'loyalty_points_adjusted') {
    const adj = Number(meta.adjustment)
    return `${adj >= 0 ? '+' : ''}${adj} pts — ${meta.note}`
  }
  return ''
}

export function LoyaltyPanel({ organizationId }: { organizationId: string }) {
  const [status, setStatus] = useState<LoyaltyStatus | null>(null)
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [adjustmentValue, setAdjustmentValue] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState<'add' | 'deduct'>('add')

  async function loadData() {
    try {
      const res = await fetch(`/api/admin/clients/${organizationId}/loyalty`)
      if (res.ok) {
        const data = await res.json()
        setStatus({
          currentPoints: data.currentPoints,
          lifetimePoints: data.lifetimePoints,
          dollarValue: data.dollarValue,
          tier: data.tier,
        })
        setEvents(data.events || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId])

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault()
    const pts = parseInt(adjustmentValue, 10)
    if (isNaN(pts) || pts <= 0) {
      toast.error('Enter a valid point amount')
      return
    }
    if (!note.trim()) {
      toast.error('Please enter a note explaining the adjustment')
      return
    }

    setSaving(true)
    try {
      const adjustment = mode === 'add' ? pts : -pts
      const res = await fetch(`/api/admin/clients/${organizationId}/loyalty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustment, note: note.trim() }),
      })
      if (res.ok) {
        toast.success(`${mode === 'add' ? 'Added' : 'Deducted'} ${pts} points`)
        setAdjustmentValue('')
        setNote('')
        await loadData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to adjust points')
      }
    } catch {
      toast.error('Failed to adjust points')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Star className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-lg">Loyalty Points</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading loyalty data...
          </div>
        ) : status ? (
          <>
            {/* Points Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
                <p className="text-2xl font-bold">{status.currentPoints.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">${status.dollarValue.toFixed(2)} value</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Lifetime Earned</p>
                <p className="text-2xl font-bold">{status.lifetimePoints.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tier</p>
                <Badge
                  variant="outline"
                  className={`text-sm px-3 py-1 border ${tierBadgeStyles[status.tier]}`}
                >
                  {status.tier}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {status.tier === 'Bronze' && 'Next: Silver at 500 pts'}
                  {status.tier === 'Silver' && 'Next: Gold at 2,000 pts'}
                  {status.tier === 'Gold' && 'Next: Platinum at 10,000 pts'}
                  {status.tier === 'Platinum' && 'Top tier'}
                </p>
              </div>
            </div>

            {/* Manual Adjustment Form */}
            <div>
              <p className="text-sm font-medium mb-3">Manual Adjustment</p>
              <form onSubmit={handleAdjust} className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={mode === 'add' ? 'default' : 'outline'}
                    onClick={() => setMode('add')}
                    className="flex-1 gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={mode === 'deduct' ? 'default' : 'outline'}
                    onClick={() => setMode('deduct')}
                    className="flex-1 gap-1"
                  >
                    <Minus className="h-3 w-3" />
                    Deduct
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="adj-points" className="text-xs text-muted-foreground uppercase tracking-wider">
                    Points
                  </Label>
                  <Input
                    id="adj-points"
                    type="number"
                    min={1}
                    value={adjustmentValue}
                    onChange={(e) => setAdjustmentValue(e.target.value)}
                    placeholder="e.g. 100"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="adj-note" className="text-xs text-muted-foreground uppercase tracking-wider">
                    Note (required)
                  </Label>
                  <Input
                    id="adj-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Goodwill credit for delayed shipment"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="w-full"
                >
                  {saving && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                  {mode === 'add' ? 'Add' : 'Deduct'} Points
                </Button>
              </form>
            </div>

            {/* Audit Log */}
            {events.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Recent Activity</p>
                <div className="space-y-2">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-start justify-between text-sm py-1.5 border-b last:border-0">
                      <div>
                        <p className="font-medium">{formatAction(event.action)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatMetadata(event.action, event.metadata as Record<string, unknown> | null)}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {format(new Date(event.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Could not load loyalty data.</p>
        )}
      </CardContent>
    </Card>
  )
}
