'use client'

import { useEffect } from 'react'

export default function StatusError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.error('[status]', error.digest ?? error.message)
    }
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center bg-cream text-ink px-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-sand mb-4">
        Something went wrong
      </p>
      <h2 className="font-serif text-2xl mb-3">
        Could not load the status page.
      </h2>
      <p className="font-mono text-sm text-ink/60 mb-8 max-w-sm leading-relaxed">
        Try refreshing the page or come back shortly.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="font-mono text-sm border border-shell px-5 py-2.5 bg-cream text-ink hover:border-ink transition-colors"
        >
          Try again
        </button>
        <a
          href="/"
          className="font-mono text-sm border border-ink bg-ink text-cream px-5 py-2.5 hover:bg-ink/80 transition-colors"
        >
          Back to home
        </a>
      </div>
      {error.digest && (
        <p className="mt-8 text-[10px] text-sand font-mono">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  )
}
