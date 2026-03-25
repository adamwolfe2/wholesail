'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { SignInButton } from '@clerk/nextjs'
import { ShoppingCart, Check, Minus, Plus, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product-card'
import { BRAND_EMAIL } from '@/lib/brand'
import type { Product } from '@/lib/products'

interface ProductDetailActionsProps {
  product: {
    id: string
    name: string
    price: number
    unit: string
    category: string
    available: boolean
    marketRate: boolean
    slug: string
  }
  isSignedIn: boolean
  relatedProducts: Product[]
}

const RECENTLY_VIEWED_KEY = 'portal-recently-viewed'
const MAX_RECENTLY_VIEWED = 5

interface RecentlyViewedItem {
  id: string
  slug: string
  name: string
  category: string
}

export function ProductDetailActions({ product, isSignedIn, relatedProducts }: ProductDetailActionsProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([])

  // Track recently viewed in localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY)
      const existing: RecentlyViewedItem[] = stored ? JSON.parse(stored) : []

      // Remove current product if already in list, then prepend
      const filtered = existing.filter(p => p.id !== product.id)
      const updated = [
        { id: product.id, slug: product.slug, name: product.name, category: product.category },
        ...filtered,
      ].slice(0, MAX_RECENTLY_VIEWED)

      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated))

      // Set recently viewed = all except the current product (for display)
      setRecentlyViewed(filtered.slice(0, MAX_RECENTLY_VIEWED - 1))
    } catch {
      // localStorage not available
    }
  }, [product.id, product.slug, product.name, product.category])

  function handleAdd() {
    if (!isSignedIn || !product.available) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      category: product.category,
      quantity,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  const canAdd = isSignedIn && product.available && !product.marketRate

  return (
    <>
      {/* Add to Order section */}
      <div className="border-t border-shell pt-6">
        {!isSignedIn ? (
          <div className="space-y-3">
            <p className="text-sm text-ink/50">
              Sign in to your wholesale account to see pricing and place orders.
            </p>
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="w-full h-12 bg-ink text-cream hover:bg-ink-dark text-sm font-medium"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In to Order
              </Button>
            </SignInButton>
          </div>
        ) : product.marketRate ? (
          <div className="bg-white border border-shell p-4">
            <p className="text-sm text-ink/60 leading-relaxed">
              This product is priced at market rate. Contact us for today&apos;s pricing and availability.
            </p>
            <a
              href={`mailto:${BRAND_EMAIL}`}
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-ink underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              Contact for pricing
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quantity selector */}
            <div className="flex items-center gap-4">
              <p className="text-[10px] tracking-[0.2em] uppercase text-sand">Quantity</p>
              <div className="flex items-center border border-shell">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-ink hover:bg-cream-hover transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-12 text-center text-sm font-medium tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-ink hover:bg-cream-hover transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Add to Order button */}
            <button
              onClick={handleAdd}
              disabled={!canAdd || added}
              className={`w-full h-12 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                added
                  ? 'bg-foreground text-background'
                  : product.available
                    ? 'bg-ink text-cream hover:bg-ink-dark'
                    : 'border border-shell text-sand cursor-not-allowed'
              }`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" />
                  {quantity} {quantity === 1 ? 'item' : 'items'} added
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  {product.available
                    ? `Add ${quantity} to Order`
                    : 'Out of Stock'}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-shell">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-3">
              From the same category
            </p>
            <h2 className="font-serif text-2xl font-bold text-ink mb-8">
              You may also need
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-shell">
              {relatedProducts.map(p => (
                <div key={p.id} className="bg-cream">
                  <ProductCard product={p} isSignedIn={isSignedIn} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently viewed */}
      {recentlyViewed.length > 0 && (
        <section className="mt-12 pt-10 border-t border-shell">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-3">
              Your history
            </p>
            <h2 className="font-serif text-xl font-bold text-ink mb-6">
              You also viewed
            </h2>
            <div className="flex flex-wrap gap-3">
              {recentlyViewed.map(item => (
                <a
                  key={item.id}
                  href={`/catalog/${item.slug}`}
                  className="inline-flex items-center gap-2 border border-shell px-4 py-2.5 text-sm text-ink hover:border-ink transition-colors"
                >
                  <span className="text-[10px] tracking-wide uppercase text-sand">{item.category}</span>
                  <span className="text-sand">/</span>
                  <span className="font-medium">{item.name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
