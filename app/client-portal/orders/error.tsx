'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function OrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.error('[client-portal/orders]', error.digest ?? error.message)
    }
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertTriangle className="h-10 w-10 text-sand mb-4" />
      <h2 className="font-serif text-2xl font-bold text-ink mb-2">Something went wrong</h2>
      <p className="text-sm text-ink/50 mb-6 max-w-sm">
        An unexpected error occurred. Try refreshing — if the issue persists, check the server logs.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/client-portal/dashboard">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
      {error.digest && (
        <p className="mt-6 text-[10px] text-ink/30 font-mono">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  )
}
