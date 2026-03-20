'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useCart } from '@/lib/cart-context'
import { formatCurrency } from '@/lib/utils'
import { PortalLayout } from '@/components/portal-nav'
import { CartDrawer } from './cart-drawer'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, ShoppingCart, Check, TrendingUp, Snowflake, CreditCard, Package } from 'lucide-react'

interface CatalogProduct {
  id: string
  name: string
  slug: string | null
  price: string
  unit: string
  description: string | null
  category: string
  available: boolean
  marketRate: boolean
  coldChainRequired: boolean
  prepayRequired: boolean
  minimumOrder: string | null
  packaging: string | null
  image: string | null
}

export default function CatalogPage() {
  const { isSignedIn } = useUser()
  const { addItem } = useCart()

  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products?limit=100')
        if (res.ok) {
          const data = await res.json()
          setProducts(data.products || [])
          setCategories(data.categories || [])
        }
      } catch {
        setFetchError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    let result = products
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      )
    }
    return result
  }, [products, search, selectedCategory])

  const handleAddToCart = useCallback(
    (product: CatalogProduct) => {
      addItem({
        id: product.slug || product.id,
        name: product.name,
        price: Number(product.price),
        unit: product.unit,
        category: product.category,
      })
      setAddedIds((prev) => {
        const next = new Set(prev)
        next.add(product.id)
        return next
      })
      setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev)
          next.delete(product.id)
          return next
        })
      }, 2000)
    },
    [addItem]
  )

  return (
    <PortalLayout>
      <div className="space-y-6">
        {fetchError && (
          <div className="mb-4 rounded-none border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Unable to load data. Please refresh the page or try again later.
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
              Catalog
            </h1>
            <p className="text-sm text-[#0A0A0A]/50 mt-1">
              Browse products and add items to your order
            </p>
          </div>
          <CartDrawer />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C8C0B4]" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-[#C8C0B4] bg-[#F9F7F4] focus-visible:ring-[#0A0A0A] rounded-none"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[220px] border-[#C8C0B4] bg-[#F9F7F4] rounded-none">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-[#C8C0B4]">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Product count */}
        {!loading && (
          <p className="text-xs tracking-widest uppercase text-[#C8C0B4]">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            {selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}
          </p>
        )}

        {/* Product Grid */}
        {loading ? (
          <CatalogSkeleton />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-12 w-12 text-[#C8C0B4] mx-auto mb-4" />
            <h3 className="font-serif text-lg font-medium mb-2 text-[#0A0A0A]">
              No products found
            </h3>
            <p className="text-sm text-[#0A0A0A]/50">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[#C8C0B4]/30">
            {filteredProducts.map((product) => {
              const isAdded = addedIds.has(product.id)
              const isAvailable = product.available !== false
              return (
                <article
                  key={product.id}
                  className="flex flex-col bg-[#F9F7F4] group transition-colors duration-200 hover:bg-[#C8C0B4]/10"
                >
                  <div className="flex flex-col flex-1 p-4 sm:p-5">
                    {/* Category */}
                    <p className="text-[9px] tracking-[0.18em] uppercase text-[#C8C0B4] mb-1.5">
                      {product.category}
                    </p>

                    {/* Name */}
                    <h3 className="font-serif font-bold text-sm sm:text-base leading-tight text-balance mb-2 text-[#0A0A0A]">
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className="mb-3 flex items-center">
                      {product.marketRate ? (
                        <span className="inline-flex items-center gap-1 text-[9px] tracking-[0.15em] uppercase border border-[#C8C0B4] text-[#C8C0B4] px-2 py-0.5">
                          <TrendingUp className="h-2.5 w-2.5" />
                          Market Rate
                        </span>
                      ) : (
                        <p className="text-base sm:text-lg font-bold leading-none text-[#0A0A0A]">
                          {formatCurrency(product.price)}{' '}
                          <span className="text-xs font-normal text-[#0A0A0A]/50">
                            {product.unit}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    {product.description && (
                      <p className="text-xs text-[#0A0A0A]/50 leading-relaxed line-clamp-2 mb-auto">
                        {product.description}
                      </p>
                    )}

                    {/* Flags */}
                    {(!isAvailable || product.coldChainRequired || product.prepayRequired) && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {!isAvailable && (
                          <span className="text-[9px] tracking-wide uppercase border border-[#C8C0B4] px-1.5 py-0.5 text-[#C8C0B4]">
                            Out of Stock
                          </span>
                        )}
                        {product.coldChainRequired && (
                          <span className="text-[9px] tracking-wide uppercase border border-[#C8C0B4] px-1.5 py-0.5 text-[#C8C0B4] inline-flex items-center gap-0.5">
                            <Snowflake className="h-2 w-2" />
                            Cold Chain
                          </span>
                        )}
                        {product.prepayRequired && (
                          <span className="text-[9px] tracking-wide uppercase border border-[#C8C0B4] px-1.5 py-0.5 text-[#C8C0B4] inline-flex items-center gap-0.5">
                            <CreditCard className="h-2 w-2" />
                            Prepay
                          </span>
                        )}
                      </div>
                    )}

                    {/* Minimum order */}
                    {product.minimumOrder && (
                      <p className="text-[10px] text-[#0A0A0A]/40 mt-2 pt-2 border-t border-[#C8C0B4]/30">
                        {product.minimumOrder}
                      </p>
                    )}
                  </div>

                  {/* Add to Cart */}
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 mt-auto">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!isAvailable || isAdded || !isSignedIn}
                      className={`w-full h-9 text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 ${
                        isAdded
                          ? 'bg-[#0A0A0A] text-[#F9F7F4]'
                          : isAvailable && isSignedIn
                            ? 'border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#F9F7F4]'
                            : 'border border-[#C8C0B4] text-[#C8C0B4] cursor-not-allowed opacity-50'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-3 w-3" />
                          Added
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-3 w-3" />
                          {!isSignedIn
                            ? 'Sign In to Order'
                            : isAvailable
                              ? 'Add to Order'
                              : 'Out of Stock'}
                        </>
                      )}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  )
}

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[#C8C0B4]/30">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-[#F9F7F4] p-4 sm:p-5 space-y-3">
          <Skeleton className="h-3 w-20 bg-[#C8C0B4]/20" />
          <Skeleton className="h-5 w-3/4 bg-[#C8C0B4]/20" />
          <Skeleton className="h-6 w-16 bg-[#C8C0B4]/20" />
          <Skeleton className="h-4 w-full bg-[#C8C0B4]/20" />
          <Skeleton className="h-4 w-2/3 bg-[#C8C0B4]/20" />
          <Skeleton className="h-9 w-full bg-[#C8C0B4]/20 mt-4" />
        </div>
      ))}
    </div>
  )
}
