'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { PortalLayout } from '@/components/portal-nav'

export default function OrderDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.error('[client-portal/orders/[orderNumber]]', error.digest ?? error.message)
    }
  }, [error])

  return (
    <PortalLayout>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="h-10 w-10 text-muted-foreground mb-4" />
        <h2 className="font-serif text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          We hit an unexpected error loading this page. Your data is safe — try refreshing or come back shortly.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.href = '/client-portal/orders'}>
            Back to orders
          </Button>
        </div>
        {error.digest && (
          <p className="mt-6 text-[10px] text-muted-foreground/50 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </PortalLayout>
  )
}
