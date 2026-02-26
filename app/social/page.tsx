import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Instagram } from 'lucide-react'
import { InstagramFeed } from '@/components/instagram-feed'
import { MarketingHeader } from '@/components/marketing-header'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Wanna Bump? — TBGC',
  description: 'Follow @tbgc_inc on Instagram. 46K followers, weekly caviar giveaway, partner creations, and behind-the-scenes from the world\'s finest food distributor.',
  openGraph: {
    title: 'Wanna Bump? — TBGC',
    description: 'Follow @tbgc_inc on Instagram. Weekly caviar giveaway, partner creations, and behind-the-scenes from the world\'s finest food distributor.',
    type: 'website',
    url: 'https://truffleboys.com/social',
    images: [{ url: '/wanna-bump-circle.jpg', width: 800, height: 800, alt: 'Wanna Bump? — TBGC' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/wanna-bump-circle.jpg'],
  },
  alternates: {
    canonical: 'https://truffleboys.com/social',
  },
}

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-[#F9F7F4]">

      {/* ── NAV ─────────────────────────────────────── */}
      <MarketingHeader />

      {/* ── HERO ────────────────────────────────────── */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-20 border-b border-[#E5E1DB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-6">
                Community · @tbgc_inc
              </p>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-[#0A0A0A] mb-7">
                Follow the Feed.
              </h1>
              <p className="text-[#0A0A0A]/55 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
                Weekly caviar giveaways, partner creations, and behind-the-scenes
                from the world&apos;s finest food distributor. Join the club.
              </p>
              <a
                href="https://www.instagram.com/tbgc_inc/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 border border-[#0A0A0A] text-[#0A0A0A] px-7 py-3.5 text-sm font-medium hover:bg-[#0A0A0A] hover:text-[#F9F7F4] transition-colors"
              >
                <Instagram className="h-4 w-4" />
                Follow @tbgc_inc
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-px bg-[#E5E1DB]">
              {[
                { num: '46K', label: 'Followers' },
                { num: '220', label: 'Posts' },
                { num: '342+', label: 'Partners' },
              ].map(stat => (
                <div key={stat.label} className="bg-[#F9F7F4] p-6 sm:p-8 text-center">
                  <p className="font-serif text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-1">{stat.num}</p>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#C8C0B4]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM LIVE FEED ──────────────────────── */}
      <section className="border-b border-[#E5E1DB] bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-2">
                Live from Instagram
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
                @tbgc_inc
              </h2>
            </div>
            <a
              href="https://www.instagram.com/tbgc_inc/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#0A0A0A]/60 hover:text-[#0A0A0A] transition-colors"
            >
              <Instagram className="h-4 w-4" />
              Open Instagram
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <InstagramFeed />
        </div>
      </section>

      {/* ── WANNA BUMP — main feature ────────────────── */}
      <section className="py-20 sm:py-28 border-b border-[#E5E1DB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Text */}
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-6">
                Weekly Giveaway · Newsletter
              </p>
              <h2 className="font-serif text-5xl sm:text-6xl font-bold italic leading-none text-[#0A0A0A] mb-7">
                Wanna Bump?
              </h2>
              <p className="text-[#0A0A0A]/55 text-base leading-relaxed mb-4 max-w-sm">
                Every Friday we give away a complimentary caviar bump.
                One winner, picked live. No catch.
              </p>
              <p className="text-[#0A0A0A]/40 text-sm mb-8">
                Follow us on Instagram and drop your name in the latest post comments to enter.
                Plus join the Wanna Bump newsletter for weekly drops and new arrivals.
              </p>
              <a
                href="https://www.instagram.com/tbgc_inc/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 border border-[#0A0A0A] text-[#0A0A0A] px-7 py-3.5 text-sm font-medium hover:bg-[#0A0A0A] hover:text-[#F9F7F4] transition-colors"
              >
                <Instagram className="h-4 w-4" />
                Enter on Instagram
              </a>
              <p className="mt-4 text-[#C8C0B4] text-xs tracking-wide">No spam. Just caviar.</p>
            </div>

            {/* Wanna Bump circle image */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-xs sm:max-w-sm">
                <Image
                  src="/wanna-bump-circle.jpg"
                  alt="Wanna Bump? — TBGC weekly caviar giveaway"
                  width={480}
                  height={480}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAVIAR CIRCLE — brand moment ─────────────── */}
      <section className="py-20 sm:py-28 border-b border-[#E5E1DB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-48 h-48 sm:w-64 sm:h-64 mb-12 sm:mb-16">
              <Image
                src="/caviar-circle.jpg"
                alt="Caviar — TBGC"
                width={256}
                height={256}
                className="w-full h-auto"
              />
            </div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-4">
              Est. Los Angeles
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A0A0A] mb-5 max-w-lg">
              The world&apos;s finest,<br />in your kitchen.
            </h2>
            <p className="text-[#0A0A0A]/50 text-sm sm:text-base max-w-sm leading-relaxed mb-10">
              Beluga, Ossetra, Kaluga, Paddlefish — sourced directly,
              delivered fresh, every week.
            </p>
            <Link
              href="/partner"
              className="inline-flex items-center gap-2 text-sm font-medium border border-[#0A0A0A] text-[#0A0A0A] px-7 py-3.5 hover:bg-[#0A0A0A] hover:text-[#F9F7F4] transition-colors"
            >
              Apply for Wholesale
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── INFO STRIP ──────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#E5E1DB]">
            {[
              {
                tag: 'Every Friday',
                line: 'Caviar giveaway on Instagram. Drop your name to enter.',
              },
              {
                tag: 'Partner Kitchens',
                line: '342+ restaurants creating with TBGC every week.',
              },
              {
                tag: 'New Arrivals',
                line: 'White truffle season. Beluga drops. Real-time updates.',
              },
            ].map((item) => (
              <a
                key={item.tag}
                href="https://www.instagram.com/tbgc_inc/"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#F9F7F4] hover:bg-[#1A1614] transition-colors duration-300 p-10 sm:p-12 flex flex-col justify-between min-h-[180px]"
              >
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#C8C0B4] group-hover:text-[#C8C0B4]/60 transition-colors">
                  {item.tag}
                </p>
                <div>
                  <p className="text-sm text-[#0A0A0A]/60 group-hover:text-[#F9F7F4]/70 leading-relaxed mb-4 transition-colors">
                    {item.line}
                  </p>
                  <p className="text-xs text-[#0A0A0A] group-hover:text-[#F9F7F4] flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    @tbgc_inc <ArrowUpRight className="h-3 w-3" />
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer className="border-t border-[#E5E1DB] bg-[#1A1614] text-[#F9F7F4] py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl font-bold">TBGC</Link>
          <div className="flex items-center gap-6 text-sm text-[#F9F7F4]/40">
            <Link href="/" className="hover:text-[#F9F7F4] transition-colors">Home</Link>
            <Link href="/catalog" className="hover:text-[#F9F7F4] transition-colors">Products</Link>
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
