import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Live Demo | Wholesail",
  description:
    "Try the Wholesail ordering portal live. Browse products, add to cart, and see how your wholesale clients will experience your custom portal.",
  openGraph: {
    title: "Live Demo | Wholesail",
    description:
      "Try the Wholesail ordering portal live. See how your wholesale clients will experience your custom portal.",
  },
  alternates: { canonical: "https://wholesailhub.com/demo" },
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
