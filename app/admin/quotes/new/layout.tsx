import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Quote',
}

export default function NewQuoteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
