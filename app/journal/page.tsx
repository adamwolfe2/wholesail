import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Instagram } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing-header'
import { articles } from '@/lib/journal/articles'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'The Journal',
  description:
    'Behind the scenes from Wholesail — truffle season guides, caviar sourcing stories, and insights from the world of luxury specialty foods.',
  openGraph: {
    title: 'The Journal | Wholesail',
    description:
      'Behind the scenes from Wholesail — truffle season guides, caviar sourcing stories, and insights from the world of luxury specialty foods.',
    type: 'website',
    url: 'https://wholesailhub.com/journal',
    images: [{ url: '/Public Social Image.png', width: 1731, height: 966, alt: 'Wholesail — Luxury Wholesale Specialty Foods' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/Public Social Image.png'],
  },
  alternates: {
    canonical: 'https://wholesailhub.com/journal',
  },
}

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      <MarketingHeader />

      {/* HERO */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-20 border-b border-[#E5E1DB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-6">
            Wholesail Journal
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-[#0A0A0A] mb-7 max-w-3xl">
            Behind the Ingredients.
          </h1>
          <p className="text-[#0A0A0A]/55 text-base sm:text-lg leading-relaxed max-w-xl">
            Truffle season guides, caviar sourcing stories, and insights from the world of luxury
            specialty foods. Written by the team who sources them.
          </p>
        </div>
      </section>

      {/* ARTICLES GRID */}
      <section className="py-16 sm:py-20 border-b border-[#E5E1DB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E5E1DB]">
            {articles.map(article => (
              <Link
                key={article.slug}
                href={`/journal/${article.slug}`}
                className="bg-[#F9F7F4] p-8 sm:p-10 flex flex-col justify-between min-h-[300px] group hover:bg-white transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#C8C0B4]">
                      {article.category}
                    </p>
                    <p className="text-[10px] text-[#C8C0B4]">{article.readTime}</p>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0A0A0A] leading-tight mb-4">
                    {article.title}
                  </h2>
                  <p className="text-sm text-[#0A0A0A]/55 leading-relaxed">
                    {article.description}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#E5E1DB] flex items-center justify-between">
                  <p className="text-xs text-[#C8C0B4]">
                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </p>
                  <p className="text-[10px] tracking-wider uppercase text-[#C8C0B4] group-hover:text-[#0A0A0A] flex items-center gap-1 transition-colors">
                    Read More <ArrowUpRight className="h-3 w-3" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM CTA */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-4">
                Daily Updates
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-5">
                Follow the Feed.
              </h2>
              <p className="text-[#0A0A0A]/55 text-sm leading-relaxed mb-8 max-w-md">
                Weekly arrivals, seasonal drops, and kitchen moments from our partner network.
                All the news that doesn&apos;t fit in an article — live on Instagram.
              </p>
              <a
                href="https://www.instagram.com/wholesailhub/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 border border-[#0A0A0A] text-[#0A0A0A] px-7 py-3.5 text-sm font-medium hover:bg-[#0A0A0A] hover:text-[#F9F7F4] transition-colors"
              >
                <Instagram className="h-4 w-4" />
                @wholesailhub
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="border border-[#E5E1DB] bg-white p-10 sm:p-14 text-center">
              <p className="font-serif text-6xl font-bold text-[#0A0A0A]/10 mb-4 italic">46K</p>
              <p className="text-sm text-[#0A0A0A]/50 leading-relaxed">
                Followers on Instagram — join the community to stay ahead of seasonal arrivals
                and weekly giveaways.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E5E1DB] bg-[#1A1614] text-[#F9F7F4] py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl font-bold">Wholesail</Link>
          <div className="flex items-center gap-6 text-sm text-[#F9F7F4]/40">
            <Link href="/" className="hover:text-[#F9F7F4] transition-colors">Home</Link>
            <Link href="/catalog" className="hover:text-[#F9F7F4] transition-colors">Catalog</Link>
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
