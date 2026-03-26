import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Apply for Wholesale Access | Wholesail",
  description:
    "Apply for a wholesale partnership with Wholesail. Get access to premium pricing, custom ordering portal, and dedicated account management.",
  openGraph: {
    title: "Apply for Wholesale Access | Wholesail",
    description:
      "Apply for a wholesale partnership. Get access to premium pricing and a custom ordering portal.",
  },
  alternates: { canonical: "https://wholesailhub.com/apply" },
}

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
