import type { Metadata } from 'next'
import Link from 'next/link'
import { Instagram } from 'lucide-react'
import { format } from 'date-fns'
import { MarketingHeader } from '@/components/marketing-header'
import { prisma } from '@/lib/db'
import { DropsAlertForm } from './drops-alert-form'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Product Drops | Wholesail',
  description:
    'First-come, first-served. We release limited quantities of rare seasonal items when they land — white truffles, beluga caviar, A5 wagyu, and more.',
  openGraph: {
    title: 'Product Drops | Wholesail',
    description: 'First-come, first-served limited drops of rare seasonal items — white truffles, beluga caviar, A5 wagyu, and more.',
    type: 'website',
    url: 'https://wholesailhub.com/drops',
    images: [{ url: '/Public Social Image.png', width: 1731, height: 966, alt: 'Wholesail Product Drops' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/Public Social Image.png'],
  },
  alternates: {
    canonical: 'https://wholesailhub.com/drops',
  },
}

type Drop = {
  id: string
  title: string
  category: string | null
  dropDate: Date
  description: string | null
  priceNote: string | null
  quantityTotal: number | null
  quantitySold: number
  featured: boolean
  product: { slug: string; name: string } | null
}

async function getDrops(): Promise<Drop[]> {
  try {
    const now = new Date()
    return await prisma.productDrop.findMany({
      where: {
        isPublic: true,
        OR: [{ activeUntil: null }, { activeUntil: { gt: now } }],
      },
      orderBy: { dropDate: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        dropDate: true,
        description: true,
        priceNote: true,
        quantityTotal: true,
        quantitySold: true,
        featured: true,
        product: {
          select: { slug: true, name: true },
        },
      },
    })
  } catch {
    return []
  }
}

function QuantityBar({ total, sold }: { total: number; sold: number }) {
  const pct = Math.min(100, Math.round((sold / total) * 100))
  const remaining = Math.max(0, total - sold)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-[#0A0A0A]/60">
        <span>{remaining} remaining</span>
        <span>{pct}% claimed</span>
      </div>
      <div className="h-1 w-full bg-[#E5E1DB] overflow-hidden">
        <div
          className="h-full bg-[#0A0A0A] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function DropCard({ drop }: { drop: Drop }) {
  const now = new Date()
  const isAvailable = new Date(drop.dropDate) <= now
  const catalogSearch = drop.product?.slug || encodeURIComponent(drop.title)

  return (
    <div className="bg-[#F9F7F4] p-6 sm:p-8 flex flex-col gap-4 min-h-[260px]">
      {/* Category + Featured */}
      <div className="flex items-center justify-between gap-2">
        {drop.category && (
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C8C0B4]">
            {drop.category}
          </p>
        )}
        {drop.featured && (
          <span className="text-[10px] tracking-[0.15em] uppercase bg-[#0A0A0A] text-[#F9F7F4] px-2 py-0.5">
            Featured
          </span>
        )}
      </div>

      {/* Title + Description */}
      <div className="flex-1">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0A0A0A] mb-2 leading-tight">
          {drop.title}
        </h3>
        {drop.description && (
          <p className="text-sm text-[#0A0A0A]/55 leading-relaxed">
            {drop.description}
          </p>
        )}
      </div>

      {/* Price note */}
      {drop.priceNote && (
        <p className="text-sm font-medium text-[#0A0A0A]/70 italic">
          {drop.priceNote}
        </p>
      )}

      {/* Quantity bar */}
      {drop.quantityTotal !== null && (
        <QuantityBar total={drop.quantityTotal} sold={drop.quantitySold} />
      )}

      {/* Date + CTA */}
      <div className="pt-3 border-t border-[#E5E1DB] space-y-3">
        <p className="text-sm text-[#0A0A0A]/60">
          {isAvailable
            ? `Dropped ${format(new Date(drop.dropDate), 'MMMM d, yyyy')}`
            : `Available ${format(new Date(drop.dropDate), 'MMMM d, yyyy')}`}
        </p>

        {isAvailable ? (
          <Link
            href={`/catalog?search=${catalogSearch}`}
            className="inline-flex items-center gap-2 border border-[#0A0A0A] text-[#0A0A0A] px-5 py-2.5 text-sm font-medium hover:bg-[#0A0A0A] hover:text-[#F9F7F4] transition-colors"
          >
            Add to Cart
          </Link>
        ) : (
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-wider text-[#C8C0B4] font-medium">
              Get Notified When It Drops
            </p>
            <DropsAlertForm dropId={drop.id} compact />
          </div>
        )}
      </div>
    </div>
  )
}

export default async function DropsPage() {
  const drops = await getDrops()
  const now = new Date()

  const available = drops.filter((d) => new Date(d.dropDate) <= now)
  const coming = drops.filter((d) => new Date(d.dropDate) > now)

  return (
    <div className="min-h-screen bg-[#F9F7F4]">

      {/* NAV */}
      <MarketingHeader />

      {/* HERO */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-20 border-b border-[#E5E1DB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-6">
            LIMITED RELEASE
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-[#0A0A0A] mb-7 max-w-3xl">
            Drops
          </h1>
          <p className="text-[#0A0A0A]/55 text-base sm:text-lg leading-relaxed max-w-xl">
            First-come, first-served. We release limited quantities of rare seasonal items when they land.
          </p>
        </div>
      </section>

      {/* AVAILABLE NOW */}
      {(available.length > 0 || drops.length === 0) && (
        <section className="py-16 sm:py-20 border-b border-[#E5E1DB]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-3">
                IN STOCK NOW
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
                Available Now
              </h2>
            </div>

            {available.length === 0 ? (
              <div className="border border-[#E5E1DB] bg-white p-12 text-center">
                <p className="text-[#0A0A0A]/40 text-sm">
                  No drops available right now. Check Coming Soon below, or join the list for early access.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E5E1DB]">
                {available.map((drop) => (
                  <DropCard key={drop.id} drop={drop} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* COMING SOON */}
      {coming.length > 0 && (
        <section className="py-16 sm:py-20 border-b border-[#E5E1DB]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-3">
                UPCOMING ARRIVALS
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
                Coming Soon
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E5E1DB]">
              {coming.map((drop) => (
                <DropCard key={drop.id} drop={drop} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ALERT SIGNUP — general list */}
      <section id="early-access" className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-5">
              EARLY ACCESS
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#0A0A0A] mb-5 leading-tight">
              Get Notified First.
            </h2>
            <p className="text-[#0A0A0A]/55 text-base leading-relaxed mb-8">
              Join our drops list. {"We'll"} alert you 48 hours before availability opens —
              so your team can plan and secure allocation before it sells out.
            </p>
            <DropsAlertForm />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E5E1DB] bg-[#1A1614] text-[#F9F7F4] py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl font-bold">Wholesail</Link>
          <div className="flex items-center gap-6 text-sm text-[#F9F7F4]/40">
            <Link href="/" className="hover:text-[#F9F7F4] transition-colors">Home</Link>
            <Link href="/catalog" className="hover:text-[#F9F7F4] transition-colors">Products</Link>
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
