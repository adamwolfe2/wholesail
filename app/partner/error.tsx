'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function PartnerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.error('[partner]', error.digest ?? error.message)
    }
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertTriangle className="h-10 w-10 text-muted-foreground mb-4" />
      <h2 className="font-serif text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        An unexpected error occurred. Please try again — if the issue persists, contact support.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          Back to home
        </Button>
      </div>
      {error.digest && (
        <p className="mt-6 text-[10px] text-muted-foreground/50 font-mono">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  )
}
