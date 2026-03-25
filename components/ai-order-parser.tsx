'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Wand2, Loader2, AlertCircle, Check, Minus, Plus, ShoppingCart } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useCart } from '@/lib/cart-context'

interface ParsedItem {
  product: {
    id: string
    name: string
    price: number
    unit: string
    category: string
    marketRate?: boolean
  }
  quantity: number
  originalText: string
}

interface ParseResult {
  items: ParsedItem[]
  unmatched: string[]
}

interface AIOrderParserProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AIOrderParser({ open, onOpenChange }: AIOrderParserProps) {
  const { addItem } = useCart()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')

  const handleParse = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setAdded(false)

    try {
      const res = await fetch('/api/parse-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to parse order')
        return
      }
      setResult(data)
      // Initialize quantities from parsed result
      const q: Record<string, number> = {}
      for (const item of data.items) {
        q[item.product.id] = item.quantity
      }
      setQuantities(q)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!result) return
    for (const item of result.items) {
      const qty = quantities[item.product.id] ?? item.quantity
      if (qty > 0) {
        addItem({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          unit: item.product.unit,
          category: item.product.category,
          quantity: qty,
        })
      }
    }
    setAdded(true)
    setTimeout(() => {
      onOpenChange(false)
      // Reset state for next use
      setTimeout(() => {
        setText('')
        setResult(null)
        setQuantities({})
        setAdded(false)
      }, 300)
    }, 800)
  }

  const adjustQty = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 1) + delta),
    }))
  }

  const totalItems = result?.items.reduce((sum, item) => sum + (quantities[item.product.id] ?? item.quantity), 0) ?? 0
  const totalPrice = result?.items.reduce((sum, item) => {
    const qty = quantities[item.product.id] ?? item.quantity
    return sum + (item.product.marketRate ? 0 : item.product.price * qty)
  }, 0) ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-xl max-h-[90svh] flex flex-col bg-cream border-shell rounded-none p-0 gap-0">

        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 pt-5 pb-4 border-b border-shell shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-ink flex items-center justify-center">
              <Wand2 className="h-4 w-4 text-cream" />
            </div>
            <div>
              <DialogTitle className="font-serif text-lg font-bold text-ink">
                AI Order Parser
              </DialogTitle>
              <DialogDescription className="text-xs text-sand mt-0.5">
                Paste any order text — we&apos;ll match it to your catalog.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

          {/* Input */}
          {!result && (
            <>
              <div>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder={'5 oz white truffle, 3 tins Beluga 1oz, 2 lbs A5 wagyu, 4 bottles black truffle oil...'}
                  className="w-full h-32 bg-white border border-shell text-sm text-ink placeholder:text-sand p-4 resize-none focus:outline-none focus:border-ink transition-colors font-mono"
                  autoFocus
                />
                <p className="text-[10px] text-sand mt-2 tracking-wide uppercase">
                  Tip — paste from email, SMS, or type naturally
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-ink/60 border border-shell p-3">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleParse}
                disabled={loading || !text.trim()}
                className="w-full h-11 bg-ink text-cream text-sm font-medium flex items-center justify-center gap-2 hover:bg-ink/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Parse Order
                  </>
                )}
              </button>
            </>
          )}

          {/* Results */}
          {result && (
            <>
              {result.items.length === 0 && result.unmatched.length === 0 && (
                <div className="text-center py-8 text-ink/40 text-sm">
                  No products found. Try being more specific.
                </div>
              )}

              {result.items.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-sand">
                    Matched — {result.items.length} item{result.items.length !== 1 ? 's' : ''}
                  </p>
                  <div className="divide-y divide-shell border border-shell">
                    {result.items.map(item => {
                      const qty = quantities[item.product.id] ?? item.quantity
                      return (
                        <div key={item.product.id} className="flex items-center gap-2 sm:gap-4 p-3 bg-white">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink truncate">
                              {item.product.name}
                            </p>
                            <p className="text-[11px] text-sand mt-0.5">
                              {item.product.marketRate
                                ? 'Market rate'
                                : `${formatCurrency(item.product.price)} ${item.product.unit}`}
                            </p>
                          </div>
                          {/* Quantity control */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => adjustQty(item.product.id, -1)}
                              className="w-6 h-6 border border-shell flex items-center justify-center hover:border-ink transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-ink">
                              {qty}
                            </span>
                            <button
                              onClick={() => adjustQty(item.product.id, 1)}
                              className="w-6 h-6 border border-shell flex items-center justify-center hover:border-ink transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          {/* Line total */}
                          <div className="w-16 text-right flex-shrink-0">
                            {item.product.marketRate ? (
                              <span className="text-[11px] text-sand">MR</span>
                            ) : (
                              <span className="text-sm font-medium text-ink">
                                {formatCurrency(item.product.price * qty)}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {result.unmatched.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-sand">
                    Not matched — {result.unmatched.length} item{result.unmatched.length !== 1 ? 's' : ''}
                  </p>
                  <div className="border border-shell divide-y divide-shell">
                    {result.unmatched.map((u, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-white">
                        <AlertCircle className="h-3.5 w-3.5 text-sand flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-ink/60">{u}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary + actions */}
              {result.items.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-shell">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {totalItems} item{totalItems !== 1 ? 's' : ''}
                      {totalPrice > 0 && ` · ${formatCurrency(totalPrice)}`}
                    </p>
                    <p className="text-[11px] text-sand">Market-rate items excluded from total</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => { setResult(null); setAdded(false) }}
                      className="flex-1 sm:flex-none h-10 px-4 text-sm border border-shell text-ink/60 hover:border-ink hover:text-ink transition-colors"
                    >
                      Re-parse
                    </button>
                    <button
                      onClick={handleAddToCart}
                      disabled={added || totalItems === 0}
                      className="flex-1 sm:flex-none h-10 px-5 text-sm font-medium bg-ink text-cream flex items-center justify-center gap-2 hover:bg-ink/80 transition-colors disabled:opacity-40"
                    >
                      {added ? (
                        <><Check className="h-3.5 w-3.5" /> Added!</>
                      ) : (
                        <><ShoppingCart className="h-3.5 w-3.5" /> Add to Cart</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {result.items.length === 0 && (
                <button
                  onClick={() => { setResult(null) }}
                  className="w-full h-10 border border-shell text-sm text-ink/60 hover:border-ink hover:text-ink transition-colors"
                >
                  Try again
                </button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
