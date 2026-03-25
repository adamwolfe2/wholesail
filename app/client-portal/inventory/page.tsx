'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, Save, CheckCircle2, Package, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PortalLayout } from '@/components/portal-nav'

interface ProductReport {
  productId: string
  name: string
  category: string
  unit: string
  report: {
    id: string
    quantityOnHand: number
    quantityBackstock: number
    notes: string | null
    updatedAt: string
  } | null
}

interface DraftRow {
  quantityOnHand: string
  quantityBackstock: string
  notes: string
  dirty: boolean
}

export default function DistributorInventoryPage() {
  const [products, setProducts] = useState<ProductReport[]>([])
  const [drafts, setDrafts] = useState<Record<string, DraftRow>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/distributor/inventory')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products)
        // Seed drafts from existing reports
        const initial: Record<string, DraftRow> = {}
        for (const p of data.products as ProductReport[]) {
          initial[p.productId] = {
            quantityOnHand: String(p.report?.quantityOnHand ?? 0),
            quantityBackstock: String(p.report?.quantityBackstock ?? 0),
            notes: p.report?.notes ?? '',
            dirty: false,
          }
        }
        setDrafts(initial)
      }
    } catch {
      setError('Failed to load products.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  function update(productId: string, field: keyof DraftRow, value: string) {
    setDrafts(prev => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value, dirty: true },
    }))
    setSaved(false)
  }

  async function saveAll() {
    const dirtyIds = Object.entries(drafts)
      .filter(([, d]) => d.dirty)
      .map(([id]) => id)

    if (dirtyIds.length === 0) return

    setSaving(true)
    setError(null)

    const updates = dirtyIds.map(productId => ({
      productId,
      quantityOnHand: Math.max(0, parseInt(drafts[productId].quantityOnHand, 10) || 0),
      quantityBackstock: Math.max(0, parseInt(drafts[productId].quantityBackstock, 10) || 0),
      notes: drafts[productId].notes.trim() || undefined,
    }))

    try {
      const res = await fetch('/api/distributor/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })

      if (res.ok) {
        setSaved(true)
        // Mark all rows clean
        setDrafts(prev => {
          const next = { ...prev }
          for (const id of dirtyIds) {
            next[id] = { ...next[id], dirty: false }
          }
          return next
        })
        // Refresh to get new updatedAt timestamps
        await fetchProducts()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Failed to save. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const dirtyCount = Object.values(drafts).filter(d => d.dirty).length

  const grouped = products.reduce<Record<string, ProductReport[]>>((acc, p) => {
    const cat = p.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-ink/40" />
        </div>
      </PortalLayout>
    )
  }

  if (products.length === 0) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-ink">My Inventory</h2>
            <p className="text-sm text-ink/50 mt-1">Report your current stock levels</p>
          </div>
          <div className="border border-shell bg-white py-16 text-center">
            <Package className="h-8 w-8 text-ink/20 mx-auto mb-3" />
            <p className="text-sm text-ink/50">No products assigned to your account yet.</p>
            <p className="text-xs text-ink/30 mt-1">Contact your admin to get your products configured.</p>
          </div>
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-ink">My Inventory</h2>
          <p className="text-sm text-ink/50 mt-1">
            Report your current stock so the admin can plan orders accurately.
          </p>
        </div>
        <Button
          onClick={saveAll}
          disabled={saving || dirtyCount === 0}
          className="shrink-0 bg-ink text-cream hover:bg-ink/80 rounded-none gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved && dirtyCount === 0 ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Saving…' : saved && dirtyCount === 0 ? 'Saved' : dirtyCount > 0 ? `Save ${dirtyCount} update${dirtyCount !== 1 ? 's' : ''}` : 'Save'}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Product groups */}
      {Object.entries(grouped).map(([category, catProducts]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/40">
            {category} ({catProducts.length})
          </h3>

          <div className="border border-shell bg-white divide-y divide-shell">
            {/* Column headers */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_120px_120px_1fr] gap-4 px-5 py-2.5 bg-cream">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/35">Product</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/35">On Hand</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/35">Back Stock</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/35">Notes</span>
            </div>

            {catProducts.map(product => {
              const draft = drafts[product.productId]
              if (!draft) return null
              const lastUpdated = product.report?.updatedAt

              return (
                <div
                  key={product.productId}
                  className={`px-5 py-4 transition-colors ${draft.dirty ? 'bg-amber-50/50' : ''}`}
                >
                  {/* Mobile: stacked layout */}
                  <div className="sm:hidden space-y-3">
                    <div>
                      <p className="font-medium text-sm text-ink">{product.name}</p>
                      {product.unit && <p className="text-xs text-ink/40 mt-0.5">Unit: {product.unit}</p>}
                      {lastUpdated && (
                        <p className="text-[10px] text-ink/30 mt-0.5">
                          Last reported {new Date(lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-ink/40 block mb-1">On Hand</label>
                        <input
                          type="number"
                          min="0"
                          value={draft.quantityOnHand}
                          onChange={e => update(product.productId, 'quantityOnHand', e.target.value)}
                          className="w-full border border-shell px-3 py-2 text-sm focus:outline-none focus:border-ink text-ink"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-ink/40 block mb-1">Back Stock</label>
                        <input
                          type="number"
                          min="0"
                          value={draft.quantityBackstock}
                          onChange={e => update(product.productId, 'quantityBackstock', e.target.value)}
                          className="w-full border border-shell px-3 py-2 text-sm focus:outline-none focus:border-ink text-ink"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-ink/40 block mb-1">Notes</label>
                      <input
                        type="text"
                        value={draft.notes}
                        onChange={e => update(product.productId, 'notes', e.target.value)}
                        placeholder="e.g. seasonal gap, new batch arriving Tuesday…"
                        className="w-full border border-shell px-3 py-2 text-sm focus:outline-none focus:border-ink text-ink placeholder:text-ink/25"
                      />
                    </div>
                  </div>

                  {/* Desktop: grid layout */}
                  <div className="hidden sm:grid sm:grid-cols-[1fr_120px_120px_1fr] gap-4 items-center">
                    <div>
                      <p className="font-medium text-sm text-ink">{product.name}</p>
                      {product.unit && <p className="text-xs text-ink/40 mt-0.5">{product.unit}</p>}
                      {lastUpdated && (
                        <p className="text-[10px] text-ink/30 mt-0.5">
                          Updated {new Date(lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={draft.quantityOnHand}
                      onChange={e => update(product.productId, 'quantityOnHand', e.target.value)}
                      className="border border-shell px-3 py-2 text-sm focus:outline-none focus:border-ink text-ink w-full"
                      aria-label={`${product.name} on hand quantity`}
                    />
                    <input
                      type="number"
                      min="0"
                      value={draft.quantityBackstock}
                      onChange={e => update(product.productId, 'quantityBackstock', e.target.value)}
                      className="border border-shell px-3 py-2 text-sm focus:outline-none focus:border-ink text-ink w-full"
                      aria-label={`${product.name} back stock quantity`}
                    />
                    <input
                      type="text"
                      value={draft.notes}
                      onChange={e => update(product.productId, 'notes', e.target.value)}
                      placeholder="Any notes…"
                      className="border border-shell px-3 py-2 text-sm focus:outline-none focus:border-ink text-ink placeholder:text-ink/25 w-full"
                      aria-label={`${product.name} notes`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Save footer */}
      {dirtyCount > 0 && (
        <div className="sticky bottom-4 flex justify-end">
          <Button
            onClick={saveAll}
            disabled={saving}
            className="bg-ink text-cream hover:bg-ink/80 rounded-none gap-2 shadow-lg"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving…' : `Save ${dirtyCount} update${dirtyCount !== 1 ? 's' : ''}`}
          </Button>
        </div>
      )}
    </div>
    </PortalLayout>
  )
}
