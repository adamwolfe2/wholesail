import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "Ordering Portal for Apparel & Fashion Wholesale Distributors | Wholesail",
  description: "Wholesail builds custom B2B ordering portals for apparel distributors, fashion wholesalers, and clothing importers. Boutiques order from your lookbook-style catalog with size/color matrix ordering and seasonal collection management. Live in under 2 weeks.",
  openGraph: {
    title: "Ordering Portal for Apparel & Fashion Wholesale Distributors | Wholesail",
    description: "Wholesail builds custom B2B ordering portals for apparel distributors, fashion wholesalers, and clothing importers. Boutiques order from your lookbook-style catalog with size/color matrix ordering and seasonal collection management. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/apparel-fashion" },
};

const config: IndustryConfig = {
  slug: "apparel-fashion",
  eyebrow: "For Apparel & Fashion Distributors",
  h1Line1: "Your boutique buyers are ordering by email lookbook and reply.",
  h1Line2: "That's not a wholesale channel. That's a guessing game.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for apparel distributors, fashion wholesalers, and clothing importers. Boutiques and retailers browse your lookbook-style catalog and place orders directly — size/color matrix ordering, per-account minimums, and seasonal collection management built in. Live in under 2 weeks.",
  heroStat:
    "Boutique buyers make seasonal buying decisions fast. If your ordering process is slow, they buy elsewhere.",
  painPoints: [
    {
      before: "Buyers reply to lookbook emails with handwritten size breakdowns and you spend hours interpreting what they meant and entering it manually.",
      after: "Buyers select sizes and colors in a clean matrix interface and submit the order directly. What they ordered is exactly what arrives.",
    },
    {
      before: "Every boutique has different minimum order requirements and terms, and your reps are enforcing them manually — or letting them slide.",
      after: "Per-account minimums and payment terms are enforced at checkout. Buyers see their minimums clearly and can't place an order below them.",
    },
    {
      before: "Seasonal collection launches mean sending a new lookbook PDF to every account and following up to see if they saw it.",
      after: "New seasonal collections publish to every active account's portal instantly. Buyers get notified and can order the same day.",
    },
    {
      before: "Backorders and allocation changes happen mid-season and you're calling accounts to update orders that have already been entered.",
      after: "Backorder status and available inventory update in real time. Accounts see current availability when they order and can choose alternatives.",
    },
  ],
  features: [
    "Lookbook-style catalog with full product imagery",
    "Size and color matrix ordering for apparel SKUs",
    "Per-account minimums and payment terms enforced at checkout",
    "Seasonal collection management with launch and close windows",
    "Pre-order windows for upcoming collections before inventory lands",
    "Reorder tracking with order history by season and style",
    "Per-account price tiers for volume buyers and key accounts",
    "Backorder management with real-time inventory status",
    "Wholesale account portal branded to your company",
  ],
  testimonial: {
    quote:
      "I used to get 40 emails after every lookbook drop — buyers replying with notes like 'medium in the blue, two of the tan.' Now they go into the portal, click their sizes, and submit. My order entry time is basically zero.",
    name: "Nina T.",
    company: "Metropolitan Apparel Group",
    industry: "Apparel & Fashion Distribution",
  },
  sectionTitle: "What changes for apparel and fashion distributors.",
  featuresTitle: "Everything an apparel distributor needs.",
  stats: [
    {
      stat: "55%",
      label: "of boutique buyers report that complex size/color ordering is the top friction point with wholesale vendors",
      source: "NRF Wholesale Survey 2024",
    },
    {
      stat: "2.5 hrs",
      label: "per order the average apparel rep spends reconciling email lookbook orders into a system",
      source: "Wholesail customer survey",
    },
    {
      stat: "< 2 wks",
      label: "from your first call to a fully deployed, branded portal live for your clients",
      source: "Wholesail build average",
    },
  ],
};

export default function Page() {
  return <IndustryPage config={config} />;
}
