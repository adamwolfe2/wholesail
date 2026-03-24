import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Saved Carts',
}

export default function SavedCartsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
