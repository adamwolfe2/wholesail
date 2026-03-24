import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quote Details',
}

export default function QuoteDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
