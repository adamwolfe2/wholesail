import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Snowflake, BarChart2, CreditCard, Package } from 'lucide-react'
import Script from 'next/script'
import { MarketingHeader } from '@/components/marketing-header'
import { prisma } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'

import { Instagram } from 'lucide-react'
import { getCategoryBySlug, catalogCategories } from '@/lib/catalog-categories'
import { provenanceEntries } from '@/lib/provenance'
import { ProductDetailActions } from '@/components/product-detail-actions'
import { auth } from '@clerk/nextjs/server'
import type { Product } from '@/lib/products'

export const dynamic = 'force-dynamic'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

type Props = { params: Promise<{ slug: string }> }

async function getProduct(slug: string) {
  try {
    return await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        price: true,
        unit: true,
        category: true,
        minimumOrder: true,
        packaging: true,
        available: true,
        coldChainRequired: true,
        marketRate: true,
        prepayRequired: true,
        image: true,
      },
    })
  } catch {
    return null
  }
}

async function getRelatedProducts(category: string, excludeId: string): Promise<Product[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { category, available: true, id: { not: excludeId } },
      orderBy: { sortOrder: 'asc' },
      take: 3,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        price: true,
        unit: true,
        category: true,
        minimumOrder: true,
        packaging: true,
        available: true,
        coldChainRequired: true,
        marketRate: true,
        prepayRequired: true,
        image: true,
      },
    })
    return rows.map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description || '',
      price: Number(p.price),
      unit: p.unit,
      category: p.category,
      minimumOrder: p.minimumOrder || undefined,
      packaging: p.packaging || undefined,
      available: p.available,
      coldChainRequired: p.coldChainRequired,
      marketRate: p.marketRate,
      prepayRequired: p.prepayRequired,
      image: p.image || null,
    }))
  } catch {
    return []
  }
}

export async function generateStaticParams() {
  // Product slugs
  let productSlugs: { slug: string }[] = []
  try {
    const products = await prisma.product.findMany({
      where: { available: true },
      select: { slug: true },
    })
    productSlugs = products.map(p => ({ slug: p.slug }))
  } catch { }

  // Category slugs
  const categorySlugs = catalogCategories.map(c => ({ slug: c.slug }))

  return [...productSlugs, ...categorySlugs]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  // Check if it's a category page
  const category = getCategoryBySlug(slug)
  if (category) {
    return {
      title: category.title,
      description: category.description,
      keywords: category.keywords,
      openGraph: {
        title: category.title,
        description: category.description,
        url: `https://wholesailhub.com/catalog/${category.slug}`,
        type: 'website',
        images: [{ url: '/Public Social Image.png', width: 1731, height: 966, alt: `${category.title} — Wholesail` }],
      },
      twitter: {
        card: 'summary_large_image' as const,
        images: ['/Public Social Image.png'],
      },
      alternates: { canonical: `https://wholesailhub.com/catalog/${category.slug}` },
    }
  }

  const product = await getProduct(slug)
  if (!product) return { title: 'Product Not Found' }

  const priceStr = product.marketRate
    ? 'Market Rate — contact for pricing'
    : `${formatCurrency(product.price)} / ${product.unit}`

  return {
    title: product.name,
    description: `${product.name} — ${product.description || product.category} wholesale. ${priceStr}. Wholesale pricing for qualified restaurants, hotels, and private chefs.`,
    openGraph: {
      title: `${product.name} | Wholesail Wholesale`,
      description: product.description || `${product.name} from Wholesail — luxury wholesale specialty foods.`,
      images: [{ url: '/Public Social Image.png', width: 1731, height: 966, alt: `${product.name} — Wholesail` }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      images: ['/Public Social Image.png'],
    },
    alternates: { canonical: `https://wholesailhub.com/catalog/${product.slug}` },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const { userId } = await auth()
  const isSignedIn = !!userId

  // Check if it's a category page
  const category = getCategoryBySlug(slug)
  if (category) {
    // Fetch products for this category
    type CategoryProduct = Awaited<ReturnType<typeof prisma.product.findMany>>[number]
    let products: CategoryProduct[] = []
    try {
      products = await prisma.product.findMany({
        where: { category: category.dbCategory, available: true },
        orderBy: { sortOrder: 'asc' },
      })
    } catch { }

    // Build schema.org ItemList
    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: category.headline,
      description: category.description,
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: p.name,
          url: `https://wholesailhub.com/catalog/${p.slug}`,
        },
      })),
    }

    return (
      <div className="min-h-screen bg-[#F9F7F4]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />

        <MarketingHeader />

        <div className="mx-auto max-w-6xl px-6 py-16 pt-28 sm:pt-32">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#C8C0B4] mb-12">
            <Link href="/" className="hover:text-[#0A0A0A] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/catalog" className="hover:text-[#0A0A0A] transition-colors">Catalog</Link>
            <span>/</span>
            <span className="text-[#0A0A0A]">{category.name}</span>
          </nav>

          {/* Header */}
          <div className="mb-12 max-w-2xl">
            <p className="text-xs tracking-widest uppercase text-[#C8C0B4] mb-4">Wholesale</p>
            <h1 className="font-serif text-5xl font-normal text-[#0A0A0A] mb-6">{category.headline}</h1>
            <p className="text-lg text-[#0A0A0A]/60 leading-relaxed">{category.body}</p>
          </div>

          <div className="border-t border-[#E5E1DB] mb-12" />

          {/* Product grid */}
          {products.length === 0 ? (
            <p className="text-[#0A0A0A]/50">No products currently available in this category. Check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[#E5E1DB]">
              {products.map(p => (
                <div key={p.id} className="bg-[#F9F7F4]">
                  <Link href={`/catalog/${p.slug}`} className="block h-full hover:bg-[#F0EDE8] transition-colors p-6">
                    <p className="text-[10px] tracking-[0.18em] uppercase text-[#C8C0B4] mb-2">{category.name}</p>
                    <h3 className="font-serif text-lg font-bold leading-tight mb-3">{p.name}</h3>
                    <div className="h-10 flex items-center mb-4">
                      {p.marketRate ? (
                        <span className="text-[10px] tracking-[0.15em] uppercase border border-[#C8C0B4] text-[#C8C0B4] px-2.5 py-1">Market Rate</span>
                      ) : (
                        <p className="text-xl font-bold">{formatCurrency(p.price)} <span className="text-sm font-normal text-[#0A0A0A]/50">{p.unit}</span></p>
                      )}
                    </div>
                    <p className="text-sm text-[#0A0A0A]/55 line-clamp-2">{p.description}</p>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 border-t border-[#E5E1DB] pt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-[#0A0A0A]/50 text-sm">Don&apos;t see what you need? We source on request.</p>
            <Link
              href="/partner"
              className="inline-flex items-center gap-2 bg-[#0A0A0A] text-[#F9F7F4] px-6 py-3 text-sm tracking-wide hover:opacity-90 transition-opacity"
            >
              Apply for Wholesale Access
            </Link>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="border-t border-[#E5E1DB] bg-[#1A1614] text-[#F9F7F4] py-10 mt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link href="/" className="font-serif text-xl font-bold">Wholesail</Link>
            <div className="flex items-center gap-6 text-sm text-[#F9F7F4]/40">
              <Link href="/catalog" className="hover:text-[#F9F7F4] transition-colors">Catalog</Link>
              <Link href="/about" className="hover:text-[#F9F7F4] transition-colors">About</Link>
              <Link href="/partner" className="hover:text-[#F9F7F4] transition-colors">Wholesale</Link>
              <a
                href="https://www.instagram.com/wholesailhub/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#F9F7F4] transition-colors flex items-center gap-1.5"
              >
                <Instagram className="h-3.5 w-3.5" />
                @wholesailhub
              </a>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  // --- Product detail page ---
  const product = await getProduct(slug)
  if (!product) notFound()

  const relatedProducts = await getRelatedProducts(product.category, product.id)

  // Match product to a provenance entry by name keywords and category
  const nameLower = product.name.toLowerCase()
  let matchedProvenanceSlug: string | undefined

  if (nameLower.includes('white truffle') || nameLower.includes('white périgord') || nameLower.includes('white perigord')) {
    matchedProvenanceSlug = 'white-truffle'
  } else if (
    nameLower.includes('black truffle') ||
    nameLower.includes('périgord') ||
    nameLower.includes('perigord') ||
    nameLower.includes('melanosporum') ||
    (product.category === 'Truffles' && !nameLower.includes('white'))
  ) {
    matchedProvenanceSlug = 'black-truffle'
  } else if (product.category === 'Caviar') {
    matchedProvenanceSlug = 'caviar'
  } else if (nameLower.includes('wagyu') || nameLower.includes('a5') || product.category === 'Wagyu & Protein') {
    matchedProvenanceSlug = 'wagyu'
  }

  // Validate the slug actually exists in our entries
  if (matchedProvenanceSlug && !provenanceEntries.find(p => p.slug === matchedProvenanceSlug)) {
    matchedProvenanceSlug = undefined
  }

  const priceDisplay = product.marketRate
    ? 'Market Rate'
    : `${formatCurrency(product.price)} / ${product.unit}`

  // JSON-LD Product structured data
  const productJson = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name,
    category: product.category,
    url: `${SITE_URL}/catalog/${product.slug}`,
    brand: {
      '@type': 'Brand',
      name: 'Wholesail',
    },
    offers: product.marketRate
      ? undefined
      : {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: Number(product.price).toFixed(2),
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: Number(product.price).toFixed(2),
            priceCurrency: 'USD',
            unitText: product.unit,
          },
          availability: product.available
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'Wholesail',
            url: SITE_URL,
          },
        },
  }

  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      <Script
        id={`product-schema-${product.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJson) }}
      />

      <MarketingHeader />

      {/* BREADCRUMB */}
      <div className="pt-20 sm:pt-24 border-b border-[#E5E1DB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-xs text-[#C8C0B4]">
            <Link href="/" className="hover:text-[#0A0A0A] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/catalog" className="hover:text-[#0A0A0A] transition-colors">Catalog</Link>
            <span>/</span>
            <span className="text-[#0A0A0A]">{product.name}</span>
          </div>
        </div>
      </div>

      {/* PRODUCT DETAIL */}
      <section className="py-12 sm:py-16 border-b border-[#E5E1DB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

            {/* Left — product image or placeholder */}
            <div className="relative aspect-square overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
              ) : (
                <div className="w-full h-full bg-[#0A0A0A] flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-serif text-6xl sm:text-8xl font-bold text-white/10 select-none mb-4">
                      {product.category?.slice(0, 2).toUpperCase() || 'TB'}
                    </p>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-white/20">
                      {product.category}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right — product info */}
            <div className="flex flex-col justify-center">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-4">
                {product.category}
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#0A0A0A] leading-tight mb-5">
                {product.name}
              </h1>

              {product.description && (
                <p className="text-[#0A0A0A]/60 text-base leading-relaxed mb-8">
                  {product.description}
                </p>
              )}

              {/* Price */}
              <div className="border-t border-[#E5E1DB] pt-6 mb-6">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#C8C0B4] mb-2">
                  Wholesale Price
                </p>
                <p className="font-serif text-3xl font-bold text-[#0A0A0A]">
                  {priceDisplay}
                </p>
                {product.marketRate && (
                  <p className="text-xs text-[#0A0A0A]/40 mt-1">
                    Fluctuates with commodity market — contact us for today&apos;s rate.
                  </p>
                )}
              </div>

              {/* Attributes */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {product.coldChainRequired && (
                  <div className="flex items-start gap-2.5 bg-white border border-[#E5E1DB] p-3">
                    <Snowflake className="h-4 w-4 text-[#C8C0B4] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] tracking-wider uppercase text-[#C8C0B4]">Storage</p>
                      <p className="text-xs font-medium text-[#0A0A0A] mt-0.5">Cold Chain Required</p>
                    </div>
                  </div>
                )}
                {product.minimumOrder && (
                  <div className="flex items-start gap-2.5 bg-white border border-[#E5E1DB] p-3">
                    <Package className="h-4 w-4 text-[#C8C0B4] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] tracking-wider uppercase text-[#C8C0B4]">Minimum</p>
                      <p className="text-xs font-medium text-[#0A0A0A] mt-0.5">{product.minimumOrder}</p>
                    </div>
                  </div>
                )}
                {product.packaging && (
                  <div className="flex items-start gap-2.5 bg-white border border-[#E5E1DB] p-3">
                    <Package className="h-4 w-4 text-[#C8C0B4] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] tracking-wider uppercase text-[#C8C0B4]">Packaging</p>
                      <p className="text-xs font-medium text-[#0A0A0A] mt-0.5">{product.packaging}</p>
                    </div>
                  </div>
                )}
                {product.prepayRequired && (
                  <div className="flex items-start gap-2.5 bg-white border border-[#E5E1DB] p-3">
                    <CreditCard className="h-4 w-4 text-[#C8C0B4] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] tracking-wider uppercase text-[#C8C0B4]">Payment</p>
                      <p className="text-xs font-medium text-[#0A0A0A] mt-0.5">Prepay Required</p>
                    </div>
                  </div>
                )}
                {product.marketRate && (
                  <div className="flex items-start gap-2.5 bg-white border border-[#E5E1DB] p-3">
                    <BarChart2 className="h-4 w-4 text-[#C8C0B4] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] tracking-wider uppercase text-[#C8C0B4]">Pricing</p>
                      <p className="text-xs font-medium text-[#0A0A0A] mt-0.5">Market Rate</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className={`inline-flex items-center gap-2 text-xs mb-8 ${product.available ? 'text-[#0A0A0A]/60' : 'text-[#C8C0B4]'}`}>
                <span className={`w-2 h-2 rounded-full ${product.available ? 'bg-green-600' : 'bg-[#C8C0B4]'}`} />
                {product.available ? 'In Stock — Available to Order' : 'Currently Unavailable'}
              </div>

              {/* Back to catalog */}
              <div className="mb-4">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-1.5 text-xs text-[#C8C0B4] hover:text-[#0A0A0A] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Catalog
                </Link>
              </div>

              {/* Add to Order / Sign In — client component */}
              <ProductDetailActions
                product={{
                  id: product.id,
                  name: product.name,
                  price: Number(product.price),
                  unit: product.unit,
                  category: product.category,
                  available: product.available,
                  marketRate: product.marketRate,
                  slug: product.slug,
                }}
                isSignedIn={isSignedIn}
                relatedProducts={relatedProducts}
              />
            </div>
          </div>
        </div>
      </section>

      {/* PROVENANCE LINK */}
      {matchedProvenanceSlug && (
        <section className="py-8 border-b border-[#E5E1DB]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4 px-5 border border-[#E5E1DB] bg-white max-w-xl">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#C8C0B4] mb-0.5">Sourcing</p>
                <p className="text-sm text-[#0A0A0A] font-medium">Where does this come from?</p>
              </div>
              <Link
                href={`/provenance/${matchedProvenanceSlug}`}
                className="text-xs text-[#0A0A0A]/60 hover:text-[#0A0A0A] transition-colors underline underline-offset-2 shrink-0 ml-4"
              >
                Learn about our sourcing
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* WHY WHOLESAIL */}
      <section className="py-14 sm:py-20 border-b border-[#E5E1DB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-3">
            Why Wholesail
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-10">
            The Wholesail Difference
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#E5E1DB]">
            {[
              {
                title: 'Direct-Sourced',
                body: 'Every product comes directly from our vetted producers — fewer hands, better provenance, lower price for the quality.',
              },
              {
                title: 'Cold Chain Certified',
                body: 'Temperature-controlled from origin to your kitchen. We don\'t break the chain — ever. No exceptions.',
              },
              {
                title: 'Same-Week Delivery',
                body: 'SoCal next-day. Nationwide 24–48 hours. Fresh ingredients arrive when you need them, not when it\'s convenient for us.',
              },
            ].map(item => (
              <div key={item.title} className="bg-[#F9F7F4] p-8 sm:p-10">
                <h3 className="font-serif text-xl font-bold text-[#0A0A0A] mb-3">{item.title}</h3>
                <p className="text-sm text-[#0A0A0A]/55 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E5E1DB] bg-[#1A1614] text-[#F9F7F4] py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl font-bold">Wholesail</Link>
          <div className="flex items-center gap-6 text-sm text-[#F9F7F4]/40">
            <Link href="/catalog" className="hover:text-[#F9F7F4] transition-colors">Catalog</Link>
            <Link href="/about" className="hover:text-[#F9F7F4] transition-colors">About</Link>
            <Link href="/partner" className="hover:text-[#F9F7F4] transition-colors">Wholesale</Link>
            <a
              href="https://www.instagram.com/wholesailhub/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#F9F7F4] transition-colors flex items-center gap-1.5"
            >
              <Instagram className="h-3.5 w-3.5" />
              @wholesailhub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
