'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { SignInButton, useUser } from '@clerk/nextjs'
import { MarketingHeader } from '@/components/marketing-header'
import { ProductCard } from '@/components/product-card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CartSidebar } from '@/components/cart-sidebar'
import { Search, Instagram, X } from 'lucide-react'
import { AIOrderParser } from '@/components/ai-order-parser'
import { Wand2 } from 'lucide-react'
import type { Product } from '@/lib/products'
import { motion, AnimatePresence } from 'framer-motion'

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'name_asc'

interface CatalogClientProps {
  initialProducts: Product[]
  initialCategories: string[]
  initialLowStock: Record<string, number>
}

export function CatalogClient({
  initialProducts,
  initialCategories,
  initialLowStock,
}: CatalogClientProps) {
  const { isSignedIn } = useUser()
  const [products] = useState<Product[]>(initialProducts)
  const [categories] = useState<string[]>(initialCategories)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [aiParserOpen, setAiParserOpen] = useState(false)
  const [lowStock] = useState<Record<string, number>>(initialLowStock)

  // Favorites are auth-dependent — cannot be prefetched server-side
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isSignedIn) return
    const controller = new AbortController()
    fetch('/api/favorites', { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.favorites) setFavorites(new Set(data.favorites))
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return
      })
    return () => controller.abort()
  }, [isSignedIn])

  async function handleToggleFavorite(productId: string) {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
    } catch {
      // revert on error
      setFavorites(prev => {
        const next = new Set(prev)
        if (next.has(productId)) next.delete(productId)
        else next.add(productId)
        return next
      })
    }
  }

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase()
    let result = products.filter(p =>
      (p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)) &&
      (selectedCategory === 'all' || p.category === selectedCategory)
    )
    switch (sortBy) {
      case 'price_asc':
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        result = [...result].sort((a, b) => b.price - a.price)
        break
      case 'name_asc':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name))
        break
      // 'featured' uses default server sortOrder — no change needed
    }
    return result
  }, [products, searchQuery, selectedCategory, sortBy])

  function clearFilters() {
    setSearchQuery('')
    setSelectedCategory('all')
    setSortBy('featured')
  }

  return (
    <div className="min-h-screen bg-cream">
      <MarketingHeader />

      {/* HERO */}
      <section className="pt-24 pb-14 sm:pt-32 sm:pb-16 border-b border-shell">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-4">
                Wholesale Catalog
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.05] text-ink">
                The Full Catalog.
              </h1>
              {!isSignedIn && (
                <p className="mt-4 text-sm text-ink/55">
                  <SignInButton mode="modal">
                    <button className="underline underline-offset-2 hover:opacity-70 transition-opacity">
                      Sign in
                    </button>
                  </SignInButton>
                  {' '}to place orders, or{' '}
                  <Link href="/partner" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
                    apply for wholesale access
                  </Link>
                  .
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand" />
                <Input
                  type="search"
                  placeholder="Search products…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label="Search products"
                  className="pl-9 rounded-none border-shell bg-white focus-visible:ring-0 focus-visible:border-ink transition-colors"
                  suppressHydrationWarning
                />
              </div>
              {isSignedIn && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAiParserOpen(true)}
                    className="flex-1 sm:flex-none h-10 px-4 flex items-center justify-center gap-2 border border-ink text-ink text-sm font-medium hover:bg-ink hover:text-cream transition-colors whitespace-nowrap"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    AI Parse Order
                  </button>
                  <CartSidebar />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section className="py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="mb-6 flex flex-nowrap overflow-x-auto h-auto gap-1.5 bg-transparent p-0 pb-2 scrollbar-none">
              {['all', ...categories].map(cat => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="relative text-xs sm:text-[11px] tracking-wide rounded-none border border-shell px-3 py-1.5 sm:px-4 sm:py-2 data-[state=active]:bg-ink data-[state=active]:text-cream data-[state=active]:border-ink transition-all whitespace-nowrap shrink-0"
                >
                  {selectedCategory === cat && (
                    <motion.span
                      layoutId="catalog-tab-indicator"
                      className="absolute inset-0 bg-ink"
                      style={{ zIndex: -1 }}
                      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    />
                  )}
                  {cat === 'all' ? 'All' : cat}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Sort + count bar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <p className="text-xs text-ink/40 shrink-0">
                Showing <span className="font-medium text-ink/70">{filteredProducts.length}</span> of{' '}
                <span className="font-medium text-ink/70">{products.length}</span> products
              </p>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="text-xs border border-shell bg-white text-ink px-3 py-1.5 focus:outline-none focus:border-ink transition-colors cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price_asc">Sort: Price Low to High</option>
                <option value="price_desc">Sort: Price High to Low</option>
                <option value="name_asc">Sort: Name A–Z</option>
              </select>
            </div>

            <TabsContent value={selectedCategory} className="mt-0">
              <AnimatePresence mode="wait">
                {filteredProducts.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-center py-20 border border-shell"
                  >
                    <p className="text-ink/40 text-sm mb-4">No products found.</p>
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1.5 text-xs border border-ink px-4 py-2 text-ink hover:bg-ink hover:text-cream transition-colors"
                    >
                      <X className="h-3 w-3" />
                      Clear filters
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`${selectedCategory}-${searchQuery}-${filteredProducts.length}`}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-shell"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredProducts.map(product => (
                      <motion.div key={product.id} className="bg-cream" variants={fadeUp}>
                        <ProductCard
                          product={product}
                          isSignedIn={!!isSignedIn}
                          quantityOnHand={lowStock[product.id] ?? null}
                          isFavorited={favorites.has(product.id)}
                          onToggleFavorite={isSignedIn ? handleToggleFavorite : undefined}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* BOTTOM CTA */}
      {!isSignedIn && (
        <section className="py-16 sm:py-20 border-t border-shell bg-ink">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-4">
              Wholesale Access
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream mb-5">
              Ready to Order?
            </h2>
            <p className="text-cream/50 text-sm leading-relaxed mb-8 max-w-md mx-auto">
              Apply for a wholesale account in under 2 minutes. Our team reviews and activates your
              account within 24 hours.
            </p>
            <Link
              href="/partner"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 border border-cream/30 text-cream px-7 py-3.5 text-sm font-medium hover:bg-cream hover:text-ink transition-colors"
            >
              Apply for Wholesale
            </Link>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-shell bg-ink-dark text-cream py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl font-bold">Wholesail</Link>
          <div className="flex items-center gap-6 text-sm text-cream/40">
            <Link href="/" className="hover:text-cream transition-colors">Home</Link>
            <Link href="/about" className="hover:text-cream transition-colors">About</Link>
            <Link href="/partner" className="hover:text-cream transition-colors">Wholesale</Link>
            <a
              href="https://www.instagram.com/wholesailhub/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cream transition-colors flex items-center gap-1.5"
            >
              <Instagram className="h-3.5 w-3.5" />
              @wholesailhub
            </a>
          </div>
        </div>
      </footer>

      <AIOrderParser open={aiParserOpen} onOpenChange={setAiParserOpen} />
    </div>
  )
}
