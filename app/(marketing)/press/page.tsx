import type { Metadata } from 'next'
import Link from 'next/link'
import { Instagram, Download, Mail, ArrowUpRight } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing-header'

export const revalidate = 86400 // ISR: rebuild at most once per day

export const metadata: Metadata = {
  title: 'Press & Media — Wholesail',
  description:
    'Wholesail press kit, brand assets, and media inquiries. The wholesale partner behind some of LA\'s most acclaimed restaurants, hotels, and private culinary experiences.',
  openGraph: {
    title: 'Press & Media — Wholesail',
    description: 'Wholesail press kit, brand assets, and media inquiries. The wholesale partner behind some of LA\'s most acclaimed restaurants and hotels.',
    type: 'website',
    url: 'https://wholesailhub.com/press',
    images: [{ url: '/Public Social Image.png', width: 1731, height: 966, alt: 'Wholesail — Press & Media' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/Public Social Image.png'],
  },
  alternates: {
    canonical: 'https://wholesailhub.com/press',
  },
}

const KEY_FACTS = [
  { stat: '342+', label: 'Restaurant & Hotel Partners' },
  { stat: '122+', label: 'Premium SKUs' },
  { stat: 'Same-Week', label: 'Delivery Guaranteed' },
  { stat: 'Est. LA', label: 'Los Angeles, CA' },
  { stat: 'Italy & Japan', label: 'Primary Sourcing Regions' },
  { stat: 'Michelin', label: "Starred Kitchens' Choice" },
]

export default function PressPage() {
  return (
    <div className="min-h-screen bg-cream">

      {/* NAV */}
      <MarketingHeader />

      {/* HERO */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-20 border-b border-shell">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-6">
            PRESS & MEDIA
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-ink mb-7 max-w-3xl">
            Built for the World&apos;s Best Kitchens.
          </h1>
          <p className="text-ink/55 text-base sm:text-lg leading-relaxed max-w-2xl">
            Wholesail is the wholesale partner behind some of {"LA's"} most acclaimed restaurants,
            hotels, and private culinary experiences.
          </p>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="py-16 sm:py-24 border-b border-shell">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left — pull quote */}
            <div className="border border-shell bg-cream p-10 sm:p-14">
              <p className="font-serif text-5xl text-shell leading-none mb-6 select-none">
                &ldquo;
              </p>
              <blockquote className="font-serif text-2xl sm:text-3xl font-bold text-ink leading-snug italic mb-8">
                We don&apos;t warehouse luxury. We move it.
              </blockquote>
              <cite className="text-sm text-sand not-italic tracking-wide">
                — Wholesail Founders
              </cite>
            </div>

            {/* Right — brand narrative */}
            <div className="space-y-5 text-[15px] text-ink/65 leading-relaxed">
              <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-6">
                Our Story
              </p>
              <p>
                Wholesail was founded on a deceptively simple premise: the best
                restaurants in the world deserve a supplier who takes quality as seriously as they
                do. We built direct relationships — with truffle hunters in {"Abruzzo's"} oak forests,
                caviar producers on the Caspian coast, and wagyu farms in Japan&apos;s finest
                prefectures — so our clients never have to compromise.
              </p>
              <p>
                Every product that moves through our cold chain has been touched by fewer hands and
                moved faster than any distributor in the market. Where others warehouse and wait, we
                source on-demand. Where others average, we curate. Our obsession with provenance
                means our partners can put anything we supply on their menu with complete
                confidence.
              </p>
              <p>
                From Michelin-starred dining rooms to some of {"LA's"} most celebrated private chef
                experiences, 342+ partners trust Wholesail because we have never once compromised on
                quality to protect a margin. That reputation is the only one we care about
                building.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED COVERAGE */}
      <section className="py-16 sm:py-24 border-b border-shell">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-3">
            FEATURED COVERAGE
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink mb-10">
            As Seen In
          </h2>

          {/* Videos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-shell mb-px">
            {[
              { id: 'Qv2tF8b9RM8', label: 'Feature' },
              { id: 'gIxKuoW_5-0', label: 'Feature' },
            ].map((video) => (
              <div key={video.id} className="bg-cream">
                <p className="text-[10px] tracking-[0.2em] uppercase text-sand px-6 pt-6 pb-3">
                  YOUTUBE · {video.label}
                </p>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title="Wholesail Feature"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 'none' }}
                  />
                </div>
                <div className="px-6 pb-6 pt-3">
                  <a
                    href={`https://youtu.be/${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-ink/50 hover:text-ink transition-colors"
                  >
                    Watch on YouTube <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Article */}
          <a
            href="https://la.eater.com/2025/4/15/24408691/best-food-coachella-2025-what-to-eat"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10 bg-cream border border-shell p-8 sm:p-10 hover:bg-ink transition-colors duration-300"
          >
            <div className="shrink-0">
              <p className="text-[10px] tracking-[0.2em] uppercase text-sand group-hover:text-sand/60 mb-1 transition-colors">
                PRESS · EATER LA
              </p>
              <p className="text-xs text-ink/40 group-hover:text-cream/40 transition-colors">
                April 15, 2025
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-xl sm:text-2xl font-bold text-ink group-hover:text-cream leading-snug transition-colors">
                Best Food at Coachella 2025: What to Eat
              </p>
              <p className="text-sm text-ink/50 group-hover:text-cream/50 mt-1 transition-colors">
                la.eater.com
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-sand group-hover:text-cream/60 shrink-0 transition-colors" />
          </a>
        </div>
      </section>

      {/* KEY FACTS */}
      <section className="py-16 sm:py-20 border-b border-shell">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-10">
            BY THE NUMBERS
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-shell">
            {KEY_FACTS.map((fact) => (
              <div
                key={fact.label}
                className="bg-cream p-8 sm:p-10"
              >
                <p className="font-serif text-3xl sm:text-4xl font-bold text-ink mb-2">
                  {fact.stat}
                </p>
                <p className="text-[11px] tracking-[0.15em] uppercase text-sand">
                  {fact.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRESS ASSETS */}
      <section className="py-16 sm:py-20 border-b border-shell">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-3">
            MEDIA ASSETS
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink mb-10">
            Press Assets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-shell">
            {/* SVG Logo */}
            <a
              href="/wholesail-logo.svg"
              download="wholesail-logo.svg"
              className="group bg-cream p-8 flex flex-col justify-between min-h-[160px] hover:bg-ink transition-colors duration-300"
            >
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-sand group-hover:text-sand/60 mb-3">
                  VECTOR
                </p>
                <p className="font-serif text-xl font-bold text-ink group-hover:text-cream transition-colors">
                  Brand Logo (SVG)
                </p>
                <p className="text-sm text-ink/50 group-hover:text-cream/50 mt-1 transition-colors">
                  Scalable vector — for print & digital
                </p>
              </div>
              <div className="flex items-center gap-2 text-ink/60 group-hover:text-cream/60 text-sm mt-6 transition-colors">
                <Download className="h-4 w-4" />
                Download SVG
              </div>
            </a>

            {/* PNG Logo */}
            <a
              href="/wholesail-logo.svg"
              download="wholesail-logo.png"
              className="group bg-cream p-8 flex flex-col justify-between min-h-[160px] hover:bg-ink transition-colors duration-300"
            >
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-sand group-hover:text-sand/60 mb-3">
                  RASTER
                </p>
                <p className="font-serif text-xl font-bold text-ink group-hover:text-cream transition-colors">
                  Brand Logo (PNG)
                </p>
                <p className="text-sm text-ink/50 group-hover:text-cream/50 mt-1 transition-colors">
                  High-resolution — for web & presentations
                </p>
              </div>
              <div className="flex items-center gap-2 text-ink/60 group-hover:text-cream/60 text-sm mt-6 transition-colors">
                <Download className="h-4 w-4" />
                Download PNG
              </div>
            </a>

            {/* Press Kit — request via email */}
            <a
              href="mailto:press@wholesailhub.com?subject=Press Kit Request"
              className="group bg-cream p-8 flex flex-col justify-between min-h-[160px] hover:bg-ink transition-colors duration-300"
            >
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-sand group-hover:text-sand/60 mb-3">
                  REQUEST
                </p>
                <p className="font-serif text-xl font-bold text-ink group-hover:text-cream transition-colors">
                  Full Press Kit
                </p>
                <p className="text-sm text-ink/50 group-hover:text-cream/50 mt-1 transition-colors">
                  Brand story, stats, and hi-res photos
                </p>
              </div>
              <div className="flex items-center gap-2 text-ink/60 group-hover:text-cream/60 text-sm mt-6 transition-colors">
                <Mail className="h-4 w-4" />
                Request via Email
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* NOTABLE CLIENTS */}
      <section className="py-16 sm:py-20 border-b border-shell">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-3">
            WHO WE SERVE
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink mb-10">
            Our Partners
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-shell">
            {[
              {
                tier: 'Fine Dining',
                desc: 'Michelin 1–3 Star Restaurants',
                detail:
                  'The most decorated dining rooms in Los Angeles and Southern California trust Wholesail for truffle season, caviar service, and premium protein sourcing.',
              },
              {
                tier: 'Hospitality',
                desc: 'Luxury Hotel Groups',
                detail:
                  "Five-star hotels rely on our cold chain for consistent, same-week delivery that meets their exacting standards and seasonal menu demands.",
              },
              {
                tier: 'Private',
                desc: 'Private Chef Services',
                detail:
                  "LA's elite private chef community uses Wholesail for direct access to allocations that aren't available through traditional distributors.",
              },
              {
                tier: 'Events',
                desc: 'Celebrity Events & Corporate',
                detail:
                  'From industry galas to corporate hospitality, we provide curated luxury ingredients for moments that demand nothing less than exceptional.',
              },
              {
                tier: 'Catering',
                desc: 'Corporate Catering',
                detail:
                  'Forward-thinking catering operations that want to differentiate with genuine luxury — not commodity products dressed up for the menu.',
              },
              {
                tier: 'Wholesale',
                desc: 'Specialty Retailers',
                detail:
                  'Select specialty food retailers partner with Wholesail for exclusive allocations that they can offer their most discerning clientele.',
              },
            ].map((item) => (
              <div key={item.tier} className="bg-cream p-8">
                <p className="text-[10px] tracking-[0.2em] uppercase text-sand mb-2">
                  {item.tier}
                </p>
                <p className="font-serif text-lg font-bold text-ink mb-3">
                  {item.desc}
                </p>
                <p className="text-sm text-ink/55 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEDIA CONTACT */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-3">
                CONTACT
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink mb-8">
                Press Inquiries
              </h2>
              <div className="border border-shell bg-cream p-8 space-y-6">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-sand mb-2">
                    Media Contact
                  </p>
                  <a
                    href="mailto:press@wholesailhub.com"
                    className="flex items-center gap-2.5 text-ink font-medium text-lg hover:text-ink/70 transition-colors group"
                  >
                    <Mail className="h-5 w-5 text-sand" />
                    press@wholesailhub.com
                    <ArrowUpRight className="h-4 w-4 text-sand group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                  <p className="text-sm text-ink/50 mt-2">
                    For press, editorial, and media partnership inquiries.
                  </p>
                </div>

                <div className="border-t border-shell pt-6 space-y-3">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-sand mb-2">
                      Partnership & Wholesale
                    </p>
                    <Link
                      href="/partner"
                      className="flex items-center gap-2 text-sm font-medium text-ink hover:text-ink/70 transition-colors"
                    >
                      Apply for a wholesale account
                      <ArrowUpRight className="h-3.5 w-3.5 text-sand" />
                    </Link>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-sand mb-2">
                      Event Sourcing
                    </p>
                    <Link
                      href="/partner"
                      className="flex items-center gap-2 text-sm font-medium text-ink hover:text-ink/70 transition-colors"
                    >
                      Inquire about event sourcing
                      <ArrowUpRight className="h-3.5 w-3.5 text-sand" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:pt-16">
              <div className="border border-shell bg-cream p-8">
                <p className="text-[10px] tracking-[0.2em] uppercase text-sand mb-6">
                  QUICK FACTS FOR MEDIA
                </p>
                <ul className="space-y-4">
                  {[
                    'Founded in Los Angeles, CA',
                    'Direct-source from Italy, Japan, and the Caspian region',
                    '342+ active wholesale partners',
                    'Same-week delivery across Southern California',
                    'Nationwide 24–48 hour cold chain delivery',
                    'Michelin-starred kitchen verified',
                    'No frozen product — ever',
                  ].map((fact) => (
                    <li key={fact} className="flex items-start gap-3 text-sm text-ink/70">
                      <span className="w-1 h-1 rounded-full bg-sand mt-2 shrink-0" />
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTAL CTA */}
      <section className="py-16 sm:py-20 border-t border-shell bg-ink">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-5">
              Built With Wholesail
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream mb-4 leading-tight">
              Want a portal like this built for your distribution business?
            </h2>
            <p className="text-cream/55 text-sm leading-relaxed mb-8 max-w-lg">
              Wholesail builds custom B2B wholesale ordering portals — fully branded, deployed
              in under 2 weeks. See the live platform demo or start your intake.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/#demo"
                className="inline-flex items-center justify-center h-12 px-8 text-sm font-medium bg-cream text-ink hover:bg-shell transition-colors"
              >
                See the Platform Demo
              </Link>
              <Link
                href="/#intake-form"
                className="inline-flex items-center justify-center h-12 px-8 text-sm font-medium border border-cream/30 text-cream hover:bg-cream/10 transition-colors"
              >
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-shell bg-ink-dark text-cream py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl font-bold">Wholesail</Link>
          <div className="flex items-center gap-6 text-sm text-cream/40">
            <Link href="/" className="hover:text-cream transition-colors">Home</Link>
            <Link href="/catalog" className="hover:text-cream transition-colors">Products</Link>
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
    </div>
  )
}
