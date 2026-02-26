import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, ArrowUpRight, Calendar, Package } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing-header'
import { prisma } from '@/lib/db'
import { getSiteUrl } from '@/lib/get-site-url'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

async function getDrop(id: string) {
  try {
    return await prisma.productDrop.findUnique({
      where: { id, isPublic: true },
    })
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const drop = await getDrop(id)
  if (!drop) return { title: 'Drop Not Found — TBGC' }

  return {
    title: `${drop.title} — TBGC`,
    description:
      drop.description ||
      `Upcoming product drop: ${drop.title}. Available ${format(new Date(drop.dropDate), 'MMMM d, yyyy')}.`,
    openGraph: {
      title: `${drop.title} — TBGC`,
      description: drop.description || `Upcoming product drop from Truffle Boys & Girls Club.`,
      type: 'article',
      images: [{ url: '/Public Social Image.png', width: 1731, height: 966, alt: `${drop.title} — TBGC Drop` }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      images: ['/Public Social Image.png'],
    },
    alternates: {
      canonical: `${getSiteUrl()}/drops/${id}`,
    },
  }
}

export default async function DropPage({ params }: Props) {
  const { id } = await params
  const drop = await getDrop(id)

  if (!drop) notFound()

  const isPast = new Date(drop.dropDate) < new Date()

  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      <MarketingHeader />

      {/* BREADCRUMB */}
      <div className="border-b border-[#E5E1DB] bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 pt-20">
          <Link
            href="/drops"
            className="inline-flex items-center gap-2 text-sm text-[#0A0A0A]/50 hover:text-[#0A0A0A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Drops
          </Link>
        </div>
      </div>

      {/* HERO */}
      <section className="pt-12 pb-12 sm:pt-16 sm:pb-16 border-b border-[#E5E1DB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          {drop.category && (
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-6">
              {drop.category}
            </p>
          )}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] text-[#0A0A0A] mb-8">
            {drop.title}
          </h1>

          {/* Date + Status */}
          <div className="flex flex-wrap items-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-sm text-[#0A0A0A]/60">
              <Calendar className="h-4 w-4 text-[#C8C0B4]" />
              <span>{format(new Date(drop.dropDate), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-[#C8C0B4]" />
              <span className={isPast ? 'text-[#C8C0B4]' : 'text-[#0A0A0A] font-medium'}>
                {isPast ? 'Past Drop' : 'Upcoming'}
              </span>
            </div>
          </div>

          {drop.description && (
            <p className="text-[#0A0A0A]/70 text-base sm:text-lg leading-relaxed">
              {drop.description}
            </p>
          )}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#E5E1DB]">
            <div className="bg-[#F9F7F4] p-8 sm:p-10">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-4">
                Wholesale Access
              </p>
              <h2 className="font-serif text-2xl font-bold text-[#0A0A0A] mb-3">
                Partner with TBGC
              </h2>
              <p className="text-sm text-[#0A0A0A]/55 leading-relaxed mb-6">
                Get priority allocation on every drop. Apply for wholesale access and join 342+ partner kitchens.
              </p>
              <Link
                href="/partner"
                className="inline-flex items-center gap-2 border border-[#0A0A0A] text-[#0A0A0A] px-6 py-3 text-sm font-medium hover:bg-[#0A0A0A] hover:text-[#F9F7F4] transition-colors"
              >
                Apply for Wholesale
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="bg-[#F9F7F4] p-8 sm:p-10">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-4">
                Early Access
              </p>
              <h2 className="font-serif text-2xl font-bold text-[#0A0A0A] mb-3">
                Get Notified First
              </h2>
              <p className="text-sm text-[#0A0A0A]/55 leading-relaxed mb-6">
                We alert drop-list subscribers 48 hours before availability opens.
              </p>
              <Link
                href="/drops#early-access"
                className="inline-flex items-center gap-2 border border-[#0A0A0A] text-[#0A0A0A] px-6 py-3 text-sm font-medium hover:bg-[#0A0A0A] hover:text-[#F9F7F4] transition-colors"
              >
                Join the Drop List
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
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
            <Link href="/catalog" className="hover:text-[#F9F7F4] transition-colors">Products</Link>
            <Link href="/drops" className="hover:text-[#F9F7F4] transition-colors">Drops</Link>
            <Link href="/partner" className="hover:text-[#F9F7F4] transition-colors">Wholesale</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
