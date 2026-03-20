'use client'

import type { Product } from '@/lib/products'
import { formatCurrency } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { SignInButton } from '@clerk/nextjs'
import { ShoppingCart, Check, Snowflake, TrendingUp, CreditCard, Heart } from 'lucide-react'
import { memo, useState } from 'react'

interface ProductCardProps {
  product: Product
  isSignedIn?: boolean
  featured?: boolean
  quantityOnHand?: number | null  // from InventoryLevel — show badge if low
  isFavorited?: boolean
  onToggleFavorite?: (productId: string) => void
}

export const ProductCard = memo(function ProductCard({ product, isSignedIn = false, featured = false, quantityOnHand, isFavorited, onToggleFavorite }: ProductCardProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    if (!isSignedIn) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      category: product.category,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const isAvailable = product.available !== false

  return (
    <article
      className={`flex flex-col h-full group transition-colors duration-200 hover:bg-muted/40 ${
        featured ? 'min-h-[260px]' : ''
      }`}
    >
      {/* Body */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Category + Favorite */}
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[9px] tracking-[0.18em] uppercase text-[#C8C0B4]">
            {product.category}
          </p>
          {isSignedIn && onToggleFavorite !== undefined && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleFavorite(product.id) }}
              className="h-9 w-9 sm:h-10 sm:w-10 -mr-1 flex items-center justify-center text-[#C8C0B4] hover:text-[#0A0A0A] transition-colors"
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`h-3.5 w-3.5 ${isFavorited ? 'fill-[#0A0A0A] text-[#0A0A0A]' : ''}`} />
            </button>
          )}
        </div>

        {/* Name */}
        <h3
          className={`font-serif font-bold leading-tight text-balance mb-2 ${
            featured ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
          }`}
        >
          {product.name}
        </h3>

        {/* Price / Market Rate */}
        <div className="mb-3 flex items-center">
          {product.marketRate ? (
            <span className="inline-flex items-center gap-1 text-[9px] tracking-[0.15em] uppercase border border-[#C8C0B4] text-[#C8C0B4] px-2 py-0.5">
              <TrendingUp className="h-2.5 w-2.5" />
              Market Rate
            </span>
          ) : (
            <p className="text-base sm:text-lg font-bold leading-none">
              {formatCurrency(product.price)}{' '}
              <span className="text-xs font-normal text-muted-foreground">{product.unit}</span>
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-auto">
          {product.description}
        </p>

        {/* Flag tags */}
        {(product.coldChainRequired || product.prepayRequired || !isAvailable || (quantityOnHand != null && quantityOnHand <= 5 && quantityOnHand > 0)) && (
          <div className="flex flex-wrap gap-1 mt-3">
            {!isAvailable && (
              <span className="text-[9px] tracking-wide uppercase border border-border px-1.5 py-0.5 text-muted-foreground">
                Out of Stock
              </span>
            )}
            {product.coldChainRequired && (
              <span className="text-[9px] tracking-wide uppercase border border-border px-1.5 py-0.5 text-muted-foreground inline-flex items-center gap-0.5">
                <Snowflake className="h-2 w-2" />
                Cold Chain
              </span>
            )}
            {product.prepayRequired && (
              <span className="text-[9px] tracking-wide uppercase border border-border px-1.5 py-0.5 text-muted-foreground inline-flex items-center gap-0.5">
                <CreditCard className="h-2 w-2" />
                Prepay
              </span>
            )}
            {quantityOnHand != null && quantityOnHand > 0 && quantityOnHand <= 5 && isAvailable && (
              <span className="text-[9px] tracking-wide uppercase border border-amber-300 bg-amber-50 text-amber-700 px-1.5 py-0.5 inline-flex items-center gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
                Only {quantityOnHand} left
              </span>
            )}
          </div>
        )}

        {/* Minimum order */}
        {product.minimumOrder && (
          <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border">
            {product.minimumOrder}
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 mt-auto">
        {isSignedIn ? (
          <button
            onClick={handleAdd}
            disabled={!isAvailable || added}
            className={`w-full h-9 text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 ${
              added
                ? 'bg-foreground text-background'
                : isAvailable
                  ? 'border border-foreground text-foreground hover:bg-foreground hover:text-background'
                  : 'border border-border text-muted-foreground cursor-not-allowed opacity-50'
            }`}
          >
            {added ? (
              <>
                <Check className="h-3 w-3" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="h-3 w-3" />
                {isAvailable ? 'Add to Order' : 'Out of Stock'}
              </>
            )}
          </button>
        ) : (
          <SignInButton mode="modal">
            <button
              className="w-full h-9 text-xs font-medium border border-border text-muted-foreground hover:border-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-all duration-200"
              title="Sign in to your wholesale account to order"
            >
              <ShoppingCart className="h-3 w-3" />
              Sign In to Order
            </button>
          </SignInButton>
        )}
      </div>
    </article>
  )
})
