import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Beauty & Cosmetics Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for beauty product distributors, cosmetics wholesalers, and professional salon supply companies. Per-account pricing, minimums, and brand restrictions enforced automatically. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Beauty & Cosmetics Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for beauty product distributors, cosmetics wholesalers, and professional salon supply companies. Per-account pricing, minimums, and brand restrictions enforced automatically. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/beauty-cosmetics" },
};

const config: IndustryConfig = {
  slug: "beauty-cosmetics",
  eyebrow: "For Beauty & Cosmetics Distributors",
  h1Line1: "Your salon and boutique accounts are reordering by text.",
  h1Line2: "That's not a process. That's a liability waiting to happen.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for beauty product distributors, cosmetics wholesalers, and professional salon supply companies. Salons and boutiques order from their branded portal — per-account pricing, minimums, and brand restrictions enforced automatically. Live in under 2 weeks.",
  heroStat:
    "Most beauty distributors manage reorders over text and email. One wrong SKU ships and the account churns.",
  painPoints: [
    {
      before: "Salons text orders with product names, not SKUs — and your team has to guess which shade or size they mean.",
      after: "Every order placed in your portal includes the exact SKU, shade, and size. No interpretation required.",
    },
    {
      before: "Certain brands can only be sold to licensed professionals, but you're enforcing that manually on every order.",
      after: "Brand and SKU restrictions are locked per account. Unlicensed buyers simply don't see restricted items.",
    },
    {
      before: "Seasonal collections launch and your reps are individually notifying each account — an inefficient, inconsistent process.",
      after: "New collections publish to your portal on launch day. Every eligible account sees them simultaneously.",
    },
    {
      before: "Per-account minimums and promotional pricing are tracked in spreadsheets your reps may or may not check.",
      after: "Minimums and promo pricing are set in your portal and enforced automatically at checkout every time.",
    },
  ],
  features: [
    "Brand and SKU restrictions enforced per account based on license or tier",
    "Per-account minimums with promotional pricing windows",
    "Shade, finish, and variant catalog with product imagery",
    "New collection and seasonal launch announcements pushed to eligible accounts",
    "Licensed professional verification gating for restricted product lines",
    "Branded wholesale portal with your logo and domain",
    "PDF invoice generation on every confirmed order",
    "Reorder alerts for best-selling products when inventory is replenished",
    "Order history and one-click reorder for returning salon and boutique accounts",
  ],
  testimonial: {
    quote:
      "We were shipping wrong shades constantly because salons were texting 'the red one' or 'that new foundation.' Since launching our Wholesail portal, we've had exactly zero SKU errors. Salons pick from photos with the exact variant listed — it's foolproof.",
    name: "Danielle W.",
    company: "Pro Beauty Supply Co.",
    industry: "Beauty & Cosmetics Distribution",
  },
  sectionTitle: "What changes for beauty and cosmetics distributors.",
  featuresTitle: "Everything a beauty and cosmetics distributor needs.",
  stats: [
    {
      stat: "58%",
      label: "of beauty distributors report order entry errors as their top operational challenge",
      source: "Professional Beauty Association 2024",
    },
    {
      stat: "$1,200",
      label: "average annual revenue lost per account from misrouted or misread beauty orders",
      source: "Wholesail estimate",
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
