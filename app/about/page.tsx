import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Instagram } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing-header'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Truffle Boys & Girls Club is a Los Angeles–based luxury food distributor. Direct-sourced truffles, caviar, wagyu, and artisan specialty foods for the finest restaurants, hotels, and private chefs in the US.',
  openGraph: {
    title: 'About TBGC — The Story Behind the Club',
    description:
      'Built on direct relationships with truffle hunters in Abruzzo, caviar producers on the Caspian coast, and wagyu farms across Japan. We move luxury ingredients fast, fresh, and overnight.',
    images: [{ url: '/Public Social Image.png', width: 1731, height: 966, alt: 'Truffle Boys & Girls Club — Luxury Wholesale Specialty Foods' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/Public Social Image.png'],
  },
  alternates: {
    canonical: 'https://truffleboys.com/about',
  },
}

const MILESTONES = [
  {
    year: 'Founded',
    title: 'Los Angeles, CA',
    body: "TBGC was born in LA with a simple belief: the city's best kitchens deserved a supplier who matched their obsession with quality.",
  },
  {
    year: '342+',
    title: 'Active Partners',
    body: 'From Michelin-starred dining rooms to elite private chef services, over 342 restaurants, hotels, and culinary professionals trust TBGC weekly.',
  },
  {
    year: 'Weekly',
    title: 'Direct Sourcing',
    body: 'We source directly from truffle hunters in Italy\'s Abruzzo region, caviar producers on the Caspian coast, and wagyu farms across Japan\'s finest prefectures.',
  },
  {
    year: '24–48hr',
    title: 'Nationwide Cold Chain',
    body: 'Same-day delivery across Southern California. Nationwide 24–48 hour cold chain guaranteed. No frozen product — ever.',
  },
]

const VALUES = [
  {
    title: 'We Don\'t Warehouse Luxury',
    body: 'Where traditional distributors stockpile and sit on inventory, we source on-demand and move fast. Every truffle, every tin of caviar arrives at its peak — because we timed it that way.',
  },
  {
    title: 'Direct Relationships Only',
    body: 'We built personal relationships with every producer we represent. That means better provenance traceability, better pricing, and access to allocations that never reach the open market.',
  },
  {
    title: 'Quality Over Margin',
    body: 'We have never compromised on product quality to protect a margin. Our reputation is built on the confidence our partners feel putting our ingredients on their menus — that\'s the only currency we care about.',
  },
  {
    title: 'The Cold Chain Is Sacred',
    body: 'Temperature integrity from source to kitchen is non-negotiable. Every product in our network is cold-chain certified, tracked, and delivered in conditions that preserve peak quality.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      <MarketingHeader />

      {/* HERO */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-20 border-b border-[#E5E1DB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-6">
            Our Story
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-[#0A0A0A] mb-7 max-w-3xl">
            We Don&apos;t Warehouse Luxury.<br />
            We Move It.
          </h1>
          <p className="text-[#0A0A0A]/55 text-base sm:text-lg leading-relaxed max-w-2xl">
            Truffle Boys & Girls Club started with a deceptively simple premise: the best restaurants
            in the world deserve a supplier who takes quality as seriously as they do.
          </p>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="py-16 sm:py-24 border-b border-[#E5E1DB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Pull quote */}
            <div className="border border-[#E5E1DB] bg-white p-10 sm:p-14">
              <p className="font-serif text-6xl text-[#E5E1DB] leading-none mb-6 select-none">
                &ldquo;
              </p>
              <blockquote className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A] leading-snug italic mb-8">
                Every product that leaves our cold chain has been touched by fewer hands and moved
                faster than any distributor in the market.
              </blockquote>
              <cite className="text-sm text-[#C8C0B4] not-italic tracking-wide">
                — TBGC Team
              </cite>
            </div>

            {/* Narrative */}
            <div className="space-y-5 text-[15px] text-[#0A0A0A]/65 leading-relaxed">
              <p>
                We built direct relationships — with truffle hunters in Abruzzo&apos;s oak forests,
                caviar producers on the Caspian coast, and wagyu farms in Japan&apos;s finest
                prefectures — so our clients never have to compromise.
              </p>
              <p>
                Every product that moves through our cold chain has been touched by fewer hands and
                moved faster than any distributor in the market. Where others warehouse and wait, we
                source on-demand. Where others average, we curate.
              </p>
              <p>
                Our obsession with provenance means our partners can put anything we supply on their
                menu with complete confidence. That trust took years to earn. We protect it on every
                single order.
              </p>
              <p>
                From Michelin-starred dining rooms to some of LA&apos;s most celebrated private chef
                experiences, 342+ partners trust TBGC because we&apos;ve never once compromised on
                quality to make a margin. That reputation is the only one we care about building.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BY THE NUMBERS */}
      <section className="py-16 sm:py-20 border-b border-[#E5E1DB] bg-[#0A0A0A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-10">
            By the Numbers
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#1A1614]">
            {MILESTONES.map((m) => (
              <div key={m.title} className="bg-[#0A0A0A] p-8 sm:p-10">
                <p className="font-serif text-3xl sm:text-4xl font-bold text-[#F9F7F4] mb-2">
                  {m.year}
                </p>
                <p className="text-[11px] tracking-[0.15em] uppercase text-[#C8C0B4] mb-4">
                  {m.title}
                </p>
                <p className="text-sm text-[#F9F7F4]/45 leading-relaxed hidden sm:block">
                  {m.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-16 sm:py-24 border-b border-[#E5E1DB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-3">
            How We Operate
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-12">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#E5E1DB]">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-[#F9F7F4] p-8 sm:p-10">
                <h3 className="font-serif text-xl font-bold text-[#0A0A0A] mb-4">{v.title}</h3>
                <p className="text-sm text-[#0A0A0A]/60 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOURCING */}
      <section className="py-16 sm:py-20 border-b border-[#E5E1DB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-3">
                Where We Source
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-6 leading-tight">
                Direct from the Source.<br />Weekly.
              </h2>
              <div className="space-y-5 text-sm text-[#0A0A0A]/65 leading-relaxed">
                <p>
                  <strong className="text-[#0A0A0A] font-medium">Italy — Abruzzo & Périgord.</strong>{' '}
                  Black truffles (Tuber Melanosporum), summer truffles, and white truffles (Tuber
                  Magnatum) sourced directly from trusted hunters with generational expertise.
                </p>
                <p>
                  <strong className="text-[#0A0A0A] font-medium">Caspian Region.</strong>{' '}
                  Beluga, Ossetra, and Kaluga caviar from certified aquaculture partners with full
                  CITES traceability. Every tin is dated and quality-checked before it ships.
                </p>
                <p>
                  <strong className="text-[#0A0A0A] font-medium">Japan — Kagoshima & Miyazaki.</strong>{' '}
                  A5 Wagyu from Japan&apos;s finest prefectures, sourced by BMS score and cut.
                  We work with farms directly — not through aggregator middlemen.
                </p>
                <p>
                  <strong className="text-[#0A0A0A] font-medium">France & Spain.</strong>{' '}
                  Grade-A foie gras, artisan charcuterie, and specialty salumi from Gascony and
                  Iberian producers whose craft speaks for itself on the plate.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#E5E1DB]">
              {['Italy', 'Caspian', 'Japan', 'France'].map((region) => (
                <div key={region} className="bg-[#F9F7F4] p-8 sm:p-10 flex items-center justify-center min-h-[140px]">
                  <p className="font-serif text-2xl font-bold text-[#0A0A0A]/25 italic">{region}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-5">
              Ready to Partner?
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#0A0A0A] mb-6 leading-tight">
              Join 342+ kitchens who trust TBGC.
            </h2>
            <p className="text-[#0A0A0A]/55 text-base leading-relaxed mb-8 max-w-lg">
              Applications take under 2 minutes. Our team reviews and activates accounts within 24 hours.
              No gatekeeping, no minimums to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-sm font-medium bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#1A1614]"
              >
                <Link href="/partner">
                  Apply for Wholesale <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-8 text-sm font-medium border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#F9F7F4]"
              >
                <Link href="/catalog">Browse the Catalog</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E5E1DB] bg-[#1A1614] text-[#F9F7F4] py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl font-bold">TBGC</Link>
          <div className="flex items-center gap-6 text-sm text-[#F9F7F4]/40">
            <Link href="/" className="hover:text-[#F9F7F4] transition-colors">Home</Link>
            <Link href="/catalog" className="hover:text-[#F9F7F4] transition-colors">Catalog</Link>
            <Link href="/partner" className="hover:text-[#F9F7F4] transition-colors">Wholesale</Link>
            <a
              href="https://www.instagram.com/tbgc_inc/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#F9F7F4] transition-colors flex items-center gap-1.5"
            >
              <Instagram className="h-3.5 w-3.5" />
              @tbgc_inc
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
