import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'

interface ReferPageProps {
  params: Promise<{ code: string }>
}

async function getOrgByReferralCode(code: string) {
  try {
    return await prisma.organization.findUnique({
      where: { referralCode: code.toUpperCase() },
      select: { id: true, name: true, referralCode: true },
    })
  } catch {
    return null
  }
}

export default async function ReferralLandingPage({ params }: ReferPageProps) {
  const { code } = await params
  const org = await getOrgByReferralCode(code)

  if (!org) {
    return (
      <div className="min-h-screen bg-[#F9F7F4] flex flex-col">
        <header className="border-b border-[#E5E1DB] bg-[#F9F7F4]">
          <div className="container mx-auto flex h-16 items-center px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/wholesail-logo.svg"
                alt="Wholesail"
                width={36}
                height={36}
                className="h-9 w-auto"
              />
              <span className="font-serif font-bold text-xl text-[#0A0A0A]">Wholesail</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <p className="text-xs tracking-widest uppercase text-[#C8C0B4] mb-4">Invalid Link</p>
            <h1 className="font-serif text-4xl text-[#0A0A0A] mb-4 leading-tight">
              This referral link is no longer valid.
            </h1>
            <p className="text-[#0A0A0A]/60 mb-8 leading-relaxed">
              The link you followed may have expired or been entered incorrectly.
              You can still apply for wholesale access directly.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#1A1614] rounded-none h-12 px-8 font-medium tracking-wide"
            >
              <Link href="/partner">Apply for Wholesale Access</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#E5E1DB] bg-[#F9F7F4]">
        <div className="container mx-auto flex h-16 items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/wholesail-logo.svg"
              alt="Wholesail"
              width={36}
              height={36}
              className="h-9 w-auto"
            />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg text-[#0A0A0A] leading-tight">Wholesail</span>
              <span className="font-serif italic text-xs text-[#C8C0B4] leading-tight">Wholesale Portal</span>
            </div>
          </Link>
          <nav className="hidden sm:flex items-center gap-6">
            <Link
              href="/catalog"
              className="text-sm text-[#0A0A0A]/60 hover:text-[#0A0A0A] transition-colors"
            >
              Catalog
            </Link>
            <Button asChild variant="outline" size="sm" className="rounded-none border-[#0A0A0A]">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <div className="container mx-auto px-6 lg:px-8 py-16 sm:py-24 max-w-4xl">
          {/* Eyebrow */}
          <p className="text-xs tracking-widest uppercase text-[#C8C0B4] mb-6">
            You have been invited
          </p>

          {/* Main headline */}
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-[#0A0A0A] leading-[1.05] mb-6 max-w-2xl">
            {org.name} thinks you belong here.
          </h1>

          <p className="text-lg sm:text-xl text-[#0A0A0A]/70 leading-relaxed mb-10 max-w-2xl">
            {org.name} thinks you&apos;d love access to Wholesail's wholesale catalog —
            premium products sourced directly for food service and hospitality operators.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button
              asChild
              size="lg"
              className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#1A1614] rounded-none h-14 px-10 text-base font-medium tracking-wide"
            >
              <Link href={`/partner?ref=${org.referralCode}`}>
                Apply for Wholesale Access &rarr;
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-none border-[#0A0A0A]/30 h-14 px-8 text-base text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.05]"
            >
              <Link href="/catalog">Browse the Catalog</Link>
            </Button>
          </div>

          {/* Social proof stats */}
          <div className="grid gap-px sm:grid-cols-3 border border-[#E5E1DB] bg-[#E5E1DB] mb-16">
            <div className="bg-[#F9F7F4] px-6 py-5">
              <p className="font-serif text-3xl text-[#0A0A0A] mb-1">342+</p>
              <p className="text-xs tracking-widest uppercase text-[#C8C0B4]">Wholesale Clients</p>
            </div>
            <div className="bg-[#F9F7F4] px-6 py-5">
              <p className="font-serif text-3xl text-[#0A0A0A] mb-1">Same-Day</p>
              <p className="text-xs tracking-widest uppercase text-[#C8C0B4]">LA Delivery</p>
            </div>
            <div className="bg-[#F9F7F4] px-6 py-5">
              <p className="font-serif text-3xl text-[#0A0A0A] mb-1">122+</p>
              <p className="text-xs tracking-widest uppercase text-[#C8C0B4]">SKUs Available</p>
            </div>
          </div>

          {/* What you get */}
          <div className="border-t border-[#E5E1DB] pt-12">
            <p className="text-xs tracking-widest uppercase text-[#C8C0B4] mb-8">
              What You Get
            </p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="font-serif text-lg text-[#0A0A0A] mb-2">True Wholesale Pricing</p>
                <p className="text-sm text-[#0A0A0A]/60 leading-relaxed">
                  Direct-source rates across your full catalog. No middleman markup — just clean wholesale pricing.
                </p>
              </div>
              <div>
                <p className="font-serif text-lg text-[#0A0A0A] mb-2">Cold Chain Delivery</p>
                <p className="text-sm text-[#0A0A0A]/60 leading-relaxed">
                  SoCal same-day if ordered before 11am. Nationwide 24&ndash;48hr insulated delivery.
                </p>
              </div>
              <div>
                <p className="font-serif text-lg text-[#0A0A0A] mb-2">Dedicated Account Rep</p>
                <p className="text-sm text-[#0A0A0A]/60 leading-relaxed">
                  A real person, not a ticket queue. Same contact every order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E1DB] py-8">
        <div className="container mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#C8C0B4]">
            &copy; {new Date().getFullYear()} Wholesail. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-[#C8C0B4]">
            <Link href="/catalog" className="hover:text-[#0A0A0A] transition-colors">Catalog</Link>
            <Link href="/partner" className="hover:text-[#0A0A0A] transition-colors">Apply</Link>
            <Link href="/sign-in" className="hover:text-[#0A0A0A] transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
