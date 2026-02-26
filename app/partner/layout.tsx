import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Apply for Wholesale Access | TBGC Partner Program",
  description:
    "Apply to become a TBGC wholesale partner. We supply Michelin-starred restaurants, hotels, and private chefs with premium truffles, caviar, wagyu, and 122+ specialty SKUs. Applications reviewed within 24 hours.",
  keywords: [
    "wholesale food application",
    "restaurant food supplier application",
    "wholesale truffle access",
    "specialty food wholesale partner",
    "B2B food distributor Los Angeles",
  ],
  openGraph: {
    title: "Apply for Wholesale Access | TBGC",
    description:
      "Join 300+ Michelin-starred restaurants and hotels. Apply for wholesale access to premium truffles, caviar, A5 wagyu, and more.",
    url: "https://truffleboys.com/partner",
    type: "website",
    images: [{ url: '/Public Social Image.png', width: 1731, height: 966, alt: 'TBGC Wholesale Partner Application' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/Public Social Image.png'],
  },
  alternates: {
    canonical: "https://truffleboys.com/partner",
  },
}

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
