'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <Button
      onClick={() => window.print()}
      className="bg-ink text-cream hover:bg-ink/80"
      size="sm"
    >
      <Printer className="h-4 w-4 mr-2" />
      Print
    </Button>
  )
}
