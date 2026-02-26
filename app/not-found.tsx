import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[10px] tracking-[0.3em] uppercase text-[#C8C0B4] mb-6">
        404 · Page Not Found
      </p>
      <h1 className="font-serif text-5xl sm:text-7xl font-bold text-[#0A0A0A] mb-4 leading-none">
        Lost in the truffle forest.
      </h1>
      <p className="text-[#0A0A0A]/50 text-sm sm:text-base max-w-sm leading-relaxed mb-10">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-[#0A0A0A] text-[#0A0A0A] px-7 py-3.5 text-sm font-medium hover:bg-[#0A0A0A] hover:text-[#F9F7F4] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 border border-[#E5E1DB] text-[#0A0A0A]/60 px-7 py-3.5 text-sm font-medium hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors"
        >
          Browse Catalog
        </Link>
      </div>
    </div>
  )
}
