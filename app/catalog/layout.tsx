import type { Metadata } from "next"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Wholesale Product Catalog | Wholesail",
  description: "Browse Wholesail's full wholesale catalog — 122+ SKUs including black and white truffles, Kaluga and Osetra caviar, A5 wagyu, Grade A foie gras, Italian salumi, and specialty foods. Pricing available to approved partners.",
  keywords: ["wholesale truffle catalog", "wholesale caviar prices", "specialty food catalog", "restaurant ingredient supplier", "premium food wholesale"],
  openGraph: {
    title: "Wholesale Product Catalog | Wholesail",
    description: "122+ premium SKUs for Michelin kitchens — truffles, caviar, A5 wagyu, foie gras, and more. Approved partners only.",
    url: "https://wholesailhub.com/catalog",
    type: "website",
    images: [{ url: '/Public Social Image.png', width: 1731, height: 966, alt: 'Wholesail Catalog — Luxury Specialty Foods' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/Public Social Image.png'],
  },
  alternates: {
    canonical: "https://wholesailhub.com/catalog",
  },
}

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
