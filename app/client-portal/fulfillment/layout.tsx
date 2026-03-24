import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fulfillment',
}

export default function FulfillmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
