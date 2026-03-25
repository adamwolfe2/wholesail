import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[10px] tracking-[0.3em] uppercase text-sand mb-6">
        404 · Page Not Found
      </p>
      <h1 className="font-serif text-5xl sm:text-7xl font-bold text-ink mb-4 leading-none">
        Page not found.
      </h1>
      <p className="text-ink/50 text-sm sm:text-base max-w-sm leading-relaxed mb-10">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-ink text-ink px-7 py-3.5 text-sm font-medium hover:bg-ink hover:text-cream transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <Link
          href="#"
          className="inline-flex items-center gap-2 border border-shell text-ink/60 px-7 py-3.5 text-sm font-medium hover:border-ink hover:text-ink transition-colors"
        >
          View Platform
        </Link>
      </div>
    </div>
  )
}
