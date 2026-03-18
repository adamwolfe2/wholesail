import type { Metadata } from 'next'
import Link from 'next/link'
import { Instagram } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing-header'
import { provenanceEntries } from '@/lib/provenance'

export const revalidate = 86400 // ISR: rebuild at most once per day

export const metadata: Metadata = {
  title: 'Our Sourcing Standards — Ingredient Provenance | Wholesail',
  description:
    'Every ingredient we carry has a story. Learn where Wholesail sources its white truffles, caviar, A5 wagyu, and specialty foods — and what we look for before accepting a single lot.',
  openGraph: {
    title: 'Our Sourcing Standards — Ingredient Provenance | Wholesail',
    description:
      'Every ingredient we carry has a story. Learn where Wholesail sources its white truffles, caviar, A5 wagyu, and specialty foods — and what we look for before accepting a single lot.',
    type: 'website',
    images: [{ url: '/Public Social Image.png', width: 1731, height: 966, alt: 'Wholesail — Luxury Wholesale Specialty Foods' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/Public Social Image.png'],
  },
  alternates: {
    canonical: 'https://wholesailhub.com/provenance',
  },
}

export default function ProvenancePage() {
  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      <MarketingHeader />

      {/* HERO */}
      <div className="pt-24 pb-12 sm:pb-16 border-b border-[#E5E1DB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <p className="text-xs tracking-[0.25em] uppercase text-[#C8C0B4] mb-4">Wholesail</p>
          <h1 className="font-serif text-5xl sm:text-6xl font-normal text-[#0A0A0A] leading-tight mb-6">
            Our Sourcing Standards
          </h1>
          <p className="text-lg text-[#0A0A0A]/60 leading-relaxed max-w-2xl">
            Every ingredient we carry has a story. Here&apos;s why we chose it and how to use it.
          </p>
        </div>
      </div>

      {/* EDITORIAL GRID */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-14 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#E5E1DB]">
          {provenanceEntries.map((entry) => (
            <Link
              key={entry.slug}
              href={`/provenance/${entry.slug}`}
              className="group block bg-[#F9F7F4] hover:bg-[#F0EDE8] transition-colors p-8 sm:p-10"
            >
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#C8C0B4] mb-3">
                {entry.origin}
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#0A0A0A] leading-tight mb-4 group-hover:text-[#0A0A0A] transition-colors">
                {entry.name}
              </h2>
              <p className="text-sm text-[#0A0A0A]/55 leading-relaxed mb-6 italic">
                &ldquo;{entry.heroTagline}&rdquo;
              </p>
              <p className="text-sm text-[#0A0A0A]/50 leading-relaxed mb-8 line-clamp-3">
                {entry.story[0]}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase text-[#0A0A0A] font-medium group-hover:gap-2.5 transition-all">
                Read the Story
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        {/* Mission statement */}
        <div className="mt-16 border-t border-[#E5E1DB] pt-14 max-w-2xl">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-4">Our Standard</p>
          <p className="font-serif text-2xl sm:text-3xl font-normal text-[#0A0A0A] leading-relaxed mb-5">
            We reject more than we approve.
          </p>
          <p className="text-[#0A0A0A]/60 text-base leading-relaxed mb-8">
            Every lot that arrives at Wholesail is tasted, graded, and evaluated by our sourcing team before
            it enters the catalog. If it doesn&apos;t meet the standard we would hold for our own table,
            it doesn&apos;t make it to yours.
          </p>
          <Link
            href="/partner"
            className="inline-flex items-center gap-2 bg-[#0A0A0A] text-[#F9F7F4] px-6 py-3 text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            Apply for Wholesale Access
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-[#E5E1DB] bg-[#1A1614] text-[#F9F7F4] py-10 mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl font-bold">Wholesail</Link>
          <div className="flex items-center gap-6 text-sm text-[#F9F7F4]/40">
            <Link href="/catalog" className="hover:text-[#F9F7F4] transition-colors">Catalog</Link>
            <Link href="/provenance" className="hover:text-[#F9F7F4] transition-colors">Provenance</Link>
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
