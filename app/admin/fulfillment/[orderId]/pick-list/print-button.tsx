'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <Button
      onClick={() => window.print()}
      className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80"
      size="sm"
    >
      <Printer className="h-4 w-4 mr-2" />
      Print
    </Button>
  )
}
