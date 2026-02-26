'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 bg-[#0A0A0A] text-[#F9F7F4] px-6 py-3 text-sm font-medium hover:bg-[#0A0A0A]/80 transition-colors"
    >
      <Printer className="h-4 w-4" />
      Print / Save PDF
    </button>
  )
}
