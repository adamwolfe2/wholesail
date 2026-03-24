import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Standing Orders',
}

export default function StandingOrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
