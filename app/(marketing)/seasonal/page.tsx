import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { MarketingHeader } from '@/components/marketing-header'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Seasonal Availability Calendar — Wholesail',
  description:
    'When are white truffles in season? When does black winter truffle peak? Wholesail\'s seasonal availability calendar shows exactly when each luxury ingredient is at its finest.',
  openGraph: {
    title: 'Seasonal Availability Calendar — Wholesail',
    description: 'When are white truffles in season? Wholesail\'s monthly availability calendar for truffles, caviar, wagyu, and all specialty ingredients.',
    type: 'website',
    url: 'https://wholesailhub.com/seasonal',
    images: [{ url: '/Public Social Image.png', width: 1731, height: 966, alt: 'Wholesail Seasonal Availability Calendar' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/Public Social Image.png'],
  },
  alternates: {
    canonical: 'https://wholesailhub.com/seasonal',
  },
}

// ─── Seasonal Data ───────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

interface SeasonalProduct {
  name: string
  months: number[]
  peak: number[]
  origin: string
  description: string
  priceNote: string
  category: string
}

const seasonalData: SeasonalProduct[] = [
  {
    name: 'White Périgord Truffle',
    months: [11, 12, 1, 2],
    peak: [12, 1],
    origin: 'Périgord, France',
    description:
      'The diamond of the kitchen. Harvested only in the depths of French winter, with a haunting, garlicky perfume unlike anything else.',
    priceNote: 'Starting at $180/oz',
    category: 'Truffles',
  },
  {
    name: 'Black Winter Truffle',
    months: [12, 1, 2, 3],
    peak: [1, 2],
    origin: 'Périgord, France',
    description:
      'The culinary workhorse of the truffle world — intensely aromatic and versatile.',
    priceNote: 'Starting at $65/oz',
    category: 'Truffles',
  },
  {
    name: 'Black Summer Truffle',
    months: [5, 6, 7, 8],
    peak: [6, 7],
    origin: 'Umbria, Italy',
    description: 'Nutty, earthy, and deeply aromatic. Perfect for summer menus.',
    priceNote: 'Starting at $45/oz',
    category: 'Truffles',
  },
  {
    name: 'Osetra Caviar',
    months: MONTH_NUMS,
    peak: MONTH_NUMS,
    origin: 'Aquaculture, Multiple Origins',
    description:
      'Farmed osetra sturgeon — rich, nutty, and consistent year-round.',
    priceNote: 'Market rate',
    category: 'Caviar',
  },
  {
    name: 'Beluga Caviar',
    months: MONTH_NUMS,
    peak: [9, 10, 11, 12, 1, 2],
    origin: 'Caspian Hybrid, Aquaculture',
    description:
      'The rarest and most prized. Silky, large pearls with a clean, buttery finish.',
    priceNote: 'Market rate — inquire for pricing',
    category: 'Caviar',
  },
  {
    name: 'A5 Wagyu',
    months: MONTH_NUMS,
    peak: MONTH_NUMS,
    origin: 'Kagoshima & Miyazaki, Japan',
    description: 'The pinnacle of beef. BMS 10–12, direct import from Japan.',
    priceNote: 'Market rate',
    category: 'Wagyu & Protein',
  },
  {
    name: 'Hudson Valley Foie Gras',
    months: MONTH_NUMS,
    peak: [10, 11, 12, 1, 2],
    origin: 'Hudson Valley, New York',
    description:
      'The finest domestic foie gras. Silky, rich lobes — ideal for torchon or seared preparations.',
    priceNote: 'Starting at $85/lobe',
    category: 'Foie Gras & Duck',
  },
  {
    name: 'Morel Mushrooms',
    months: [3, 4, 5],
    peak: [4, 5],
    origin: 'Pacific Northwest, USA',
    description:
      'Wild-foraged morels at the peak of spring. A fleeting luxury — get them while they last.',
    priceNote: 'Market rate',
    category: 'Mushrooms & Botanicals',
  },
  {
    name: 'Ramps (Wild Leeks)',
    months: [3, 4, 5],
    peak: [4],
    origin: 'Appalachian Mountains',
    description:
      'One of spring\'s first treasures. Pungent, garlicky, and wildly versatile.',
    priceNote: 'Market rate',
    category: 'Mushrooms & Botanicals',
  },
  {
    name: 'Sea Urchin (Uni)',
    months: MONTH_NUMS,
    peak: [12, 1, 2, 3],
    origin: 'Santa Barbara, California',
    description:
      'Sweet, briny Santa Barbara uni — the gold standard of West Coast urchin.',
    priceNote: 'Starting at $28/tray',
    category: 'Seafood',
  },
]

// Group products by category, preserving display order
const CATEGORY_ORDER = [
  'Truffles',
  'Caviar',
  'Wagyu & Protein',
  'Foie Gras & Duck',
  'Mushrooms & Botanicals',
  'Seafood',
]

function groupByCategory(products: SeasonalProduct[]) {
  const groups: Record<string, SeasonalProduct[]> = {}
  for (const cat of CATEGORY_ORDER) groups[cat] = []
  for (const p of products) {
    if (!groups[p.category]) groups[p.category] = []
    groups[p.category].push(p)
  }
  return groups
}

// ─── Calendar Row ─────────────────────────────────────────────────────────────

function CalendarRow({ product }: { product: SeasonalProduct }) {
  return (
    <tr className="border-b border-shell last:border-0">
      <td className="py-3 pr-4 text-sm font-medium text-ink min-w-[160px] max-w-[220px]">
        {product.name}
        <div className="text-[10px] text-ink/40 mt-0.5 font-normal">{product.origin}</div>
      </td>
      {MONTH_NUMS.map((m) => {
        const active = product.months.includes(m)
        const peak = product.peak.includes(m)
        return (
          <td key={m} className="py-3 px-1 text-center">
            <div
              className={`mx-auto h-5 w-5 rounded-sm transition-colors ${
                peak
                  ? 'bg-ink'
                  : active
                  ? 'bg-ink/40'
                  : 'bg-shell'
              }`}
              title={
                peak ? 'Peak season' : active ? 'In season' : 'Off season'
              }
            />
          </td>
        )
      })}
    </tr>
  )
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: SeasonalProduct }) {
  // Pin to LA timezone — Wholesail is LA-based; server runs UTC which can drift a month boundary
  const currentMonth = parseInt(
    new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', month: 'numeric' }),
    10
  )
  const isInSeason = product.months.includes(currentMonth)
  const isPeak = product.peak.includes(currentMonth)

  const seasonMonthNames = product.months.map((m) => MONTHS[m - 1])
  const peakMonthNames = product.peak.length === 12
    ? ['Year-round']
    : product.peak.map((m) => MONTHS[m - 1])

  return (
    <div className="border border-shell bg-cream p-6 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-serif text-lg font-medium text-ink">{product.name}</h3>
          <p className="text-xs text-ink/50 mt-0.5">{product.origin}</p>
        </div>
        {isPeak ? (
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest bg-ink text-cream px-2 py-1">
            Peak Now
          </span>
        ) : isInSeason ? (
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest bg-ink/20 text-ink px-2 py-1">
            In Season
          </span>
        ) : (
          <span className="shrink-0 text-[10px] font-medium uppercase tracking-widest text-ink/30 border border-shell px-2 py-1">
            Off Season
          </span>
        )}
      </div>

      <p className="text-sm text-ink/70 leading-relaxed">{product.description}</p>

      <div className="flex flex-col gap-1 text-xs text-ink/50">
        <span>
          <strong className="text-ink/70">Season:</strong>{' '}
          {product.months.length === 12 ? 'Year-round' : seasonMonthNames.join(', ')}
        </span>
        <span>
          <strong className="text-ink/70">Peak:</strong>{' '}
          {peakMonthNames.join(', ')}
        </span>
        <span>
          <strong className="text-ink/70">Pricing:</strong> {product.priceNote}
        </span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SeasonalPage() {
  const { userId } = await auth()
  const grouped = groupByCategory(seasonalData)

  return (
    <>
      <MarketingHeader />

      <main className="min-h-screen bg-cream">
        {/* Hero */}
        <section className="border-b border-shell">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-5xl">
            <p className="text-xs tracking-[0.25em] uppercase text-sand mb-4">
              Ingredient Calendar
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-ink leading-tight mb-4">
              What&apos;s In Season
            </h1>
            <p className="text-lg text-ink/50 max-w-xl">
              Truffles, caviar, and luxury ingredients — timed to your menu.
            </p>
          </div>
        </section>

        {/* Calendar Grid */}
        <section className="border-b border-shell">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
            <h2 className="font-serif text-2xl text-ink mb-1">Availability at a Glance</h2>
            <p className="text-sm text-ink/50 mb-8">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm bg-ink" />
                Peak season
              </span>
              <span className="mx-3 text-shell">|</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm bg-ink/40" />
                In season
              </span>
              <span className="mx-3 text-shell">|</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm bg-shell" />
                Off season
              </span>
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-shell">
                    <th className="text-left pb-2 pr-4 text-xs font-medium text-ink/40 uppercase tracking-wider min-w-[160px]">
                      Product
                    </th>
                    {MONTHS.map((m) => (
                      <th
                        key={m}
                        className="pb-2 px-1 text-center text-xs font-medium text-ink/40 uppercase tracking-wider"
                      >
                        {m}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CATEGORY_ORDER.map((cat) => {
                    const products = grouped[cat]
                    if (!products || products.length === 0) return null
                    return (
                      <>
                        <tr key={`cat-${cat}`}>
                          <td
                            colSpan={13}
                            className="pt-6 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sand"
                          >
                            {cat}
                          </td>
                        </tr>
                        {products.map((product) => (
                          <CalendarRow key={product.name} product={product} />
                        ))}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Product Cards by Category */}
        <section>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl space-y-16">
            {CATEGORY_ORDER.map((cat) => {
              const products = grouped[cat]
              if (!products || products.length === 0) return null
              return (
                <div key={cat}>
                  <h2 className="font-serif text-2xl text-ink mb-1">{cat}</h2>
                  <div className="h-px bg-shell mb-6" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    {products.map((product) => (
                      <ProductCard key={product.name} product={product} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-shell bg-ink">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl text-center">
            <p className="text-xs tracking-[0.25em] uppercase text-sand mb-4">
              Ready to order?
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-cream mb-4">
              Source what&apos;s in season.
            </h2>
            <p className="text-cream/50 mb-8 max-w-lg mx-auto">
              Same-day delivery across Southern California. Nationwide 24–48hr for most items.
            </p>
            {userId ? (
              <Button
                asChild
                size="lg"
                className="bg-cream text-ink hover:bg-cream/90 font-medium px-8"
              >
                <Link href="/catalog">Order Now</Link>
              </Button>
            ) : (
              <Button
                asChild
                size="lg"
                className="bg-cream text-ink hover:bg-cream/90 font-medium px-8"
              >
                <Link href="/partner">Apply for Wholesale Access</Link>
              </Button>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
