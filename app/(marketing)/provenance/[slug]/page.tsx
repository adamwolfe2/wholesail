import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Instagram } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing-header'
import { provenanceEntries, getProvenanceBySlug } from '@/lib/provenance'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return provenanceEntries.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = getProvenanceBySlug(slug)
  if (!entry) return { title: 'Provenance Not Found' }

  const description = entry.story[0].split('.')[0] + '.'

  return {
    title: `${entry.name} — Provenance & Sourcing | Wholesail`,
    description,
    openGraph: {
      title: `${entry.name} — Provenance & Sourcing | Wholesail`,
      description,
      type: 'article',
      images: [{ url: '/Public Social Image.png', width: 1731, height: 966, alt: `${entry.name} — Wholesail` }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      images: ['/Public Social Image.png'],
    },
    alternates: {
      canonical: `https://wholesailhub.com/provenance/${entry.slug}`,
    },
  }
}

export default async function ProvenanceDetailPage({ params }: Props) {
  const { slug } = await params
  const entry = getProvenanceBySlug(slug)
  if (!entry) notFound()

  return (
    <div className="min-h-screen bg-cream">
      <MarketingHeader />

      {/* HERO */}
      <div className="bg-ink pt-24 pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/30 mb-10">
            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/catalog" className="hover:text-white/60 transition-colors">Catalog</Link>
            <span>/</span>
            <Link href="/provenance" className="hover:text-white/60 transition-colors">Provenance</Link>
            <span>/</span>
            <span className="text-white/60">{entry.name}</span>
          </nav>

          <p className="text-xs tracking-[0.25em] uppercase text-sand mb-4">
            Sourcing Story
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal text-white leading-tight mb-4">
            {entry.name}
          </h1>
          <p className="text-sand text-base tracking-wide mb-6">
            {entry.origin}
          </p>
          <p className="font-serif text-xl sm:text-2xl text-white/70 italic leading-relaxed max-w-2xl">
            {entry.heroTagline}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

          {/* Left column — editorial content */}
          <div className="lg:col-span-2 space-y-14">

            {/* The Story */}
            <section>
              <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-4">The Story</p>
              <div className="space-y-5">
                {entry.story.map((paragraph, i) => (
                  <p key={i} className="text-ink/75 text-base sm:text-lg leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            {/* How Chefs Use It */}
            <section>
              <div className="border-t border-shell pt-10">
                <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-4">How Chefs Use It</p>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-ink mb-6">
                  Kitchen Applications
                </h2>
                <ul className="space-y-3">
                  {entry.culinaryUses.map((use, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-ink/30 shrink-0" />
                      <span className="text-ink/70 text-base leading-relaxed">{use}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Pairing Notes */}
            <section>
              <div className="border-t border-shell pt-10">
                <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-4">Pairing Notes</p>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-ink mb-6">
                  Wine & Menu Pairings
                </h2>
                <p className="text-ink/70 text-base leading-relaxed">
                  {entry.pairingNotes}
                </p>
              </div>
            </section>

            {/* Grade Explainer (if present) */}
            {entry.gradeExplainer && (
              <section>
                <div className="border-t border-shell pt-10">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-4">Grade & Classification</p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-normal text-ink mb-6">
                    Understanding the Grades
                  </h2>
                  <p className="text-ink/70 text-base leading-relaxed">
                    {entry.gradeExplainer}
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Right column — sticky info cards */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">

              {/* What We Look For */}
              <div className="border border-shell bg-white p-6">
                <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-4">
                  What We Look For
                </p>
                <ul className="space-y-3">
                  {entry.qualityMarkers.map((marker, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <svg
                        className="w-4 h-4 text-ink shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-ink/70 leading-snug">{marker}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Season (if present) */}
              {entry.seasonNote && (
                <div className="border border-shell bg-white p-6">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-3">
                    Season
                  </p>
                  <p className="text-sm text-ink/70 leading-relaxed">
                    {entry.seasonNote}
                  </p>
                </div>
              )}

              {/* Storage */}
              <div className="border border-shell bg-white p-6">
                <p className="text-[10px] tracking-[0.25em] uppercase text-sand mb-3">
                  Storage
                </p>
                <p className="text-sm text-ink/70 leading-relaxed">
                  {entry.storageNote}
                </p>
              </div>

              {/* CTA */}
              <div className="bg-ink p-6">
                <p className="font-serif text-white text-lg mb-2">Ready to order?</p>
                <p className="text-white/50 text-sm mb-5 leading-relaxed">
                  Apply for wholesale access to source {entry.name.toLowerCase()} directly.
                </p>
                <Link
                  href="/partner"
                  className="block w-full text-center bg-white text-ink text-sm font-medium py-3 hover:bg-white/90 transition-colors"
                >
                  Apply for Wholesale Access
                </Link>
                <Link
                  href="/catalog"
                  className="block w-full text-center text-white/50 text-sm mt-3 hover:text-white transition-colors"
                >
                  Browse the Catalog
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM CTA BAR */}
      <div className="border-t border-shell bg-cream-hover py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-serif text-xl text-ink mb-1">
              Ready to source premium {entry.name.toLowerCase()}?
            </p>
            <p className="text-sm text-ink/50">
              Become a wholesale partner and get access to our full catalog.
            </p>
          </div>
          <Link
            href="/partner"
            className="shrink-0 inline-flex items-center gap-2 bg-ink text-cream px-6 py-3 text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            Become a Wholesale Partner
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-shell bg-ink-dark text-cream py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl font-bold">Wholesail</Link>
          <div className="flex items-center gap-6 text-sm text-cream/40">
            <Link href="/catalog" className="hover:text-cream transition-colors">Catalog</Link>
            <Link href="/provenance" className="hover:text-cream transition-colors">Provenance</Link>
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
    </div>
  )
}
