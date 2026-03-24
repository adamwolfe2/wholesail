import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Build Cart',
}

export default function BuildCartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
