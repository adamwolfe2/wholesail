import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Organic & Natural Food Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for organic and natural food distributors. Natural grocers, co-ops, and health food stores order online — certification data, standing orders, and Net terms built in. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Organic & Natural Food Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for organic and natural food distributors. Certifications, traceability, and buyer-specific pricing in one portal. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/organic-natural" },
};

const config: IndustryConfig = {
  slug: "organic-natural",
  eyebrow: "For Organic & Natural Food Distributors",
  h1Line1: "Your buyers want USDA Organic cert sheets",
  h1Line2: "and they want them before they order. Every time.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for organic and natural food distributors. Natural grocers, food co-ops, and health food retailers order online — with certifications attached at the product level, per-account pricing, and standing order automation. Live in under 2 weeks.",
  heroStat:
    "Natural food buyers request certification documentation 3× more often than conventional food buyers. Distributors who surface cert data at the product level see 28% fewer pre-order inquiries.",
  painPoints: [
    {
      before: "Buyers email before every order asking for the USDA Organic cert, the Non-GMO verification, or the Fair Trade documentation for specific SKUs.",
      after: "Certifications are attached at the product level in your portal. Buyers see them before they order. No request, no email, no delay.",
    },
    {
      before: "Your 600-SKU natural catalog turns over constantly — seasonal items, limited availability, certified products that sell out before restocking.",
      after: "Catalog availability updates in real time. Out-of-stock items show notify-me options. Seasonal windows are visible to buyers before they place. No surprises at fulfillment.",
    },
    {
      before: "Co-ops and buying clubs need member-allocated quantities and split invoices — and every one of them has a different setup.",
      after: "Per-account purchase limits and custom invoicing configurations are set once per account. The portal enforces them automatically on every order.",
    },
    {
      before: "Your natural food buyers expect to know the farm, the region, and the story behind every SKU. That's four calls a week you didn't budget for.",
      after: "Origin, farm partnership, and sourcing story are part of each product listing. Buyers read before they order. Your reps spend time on relationships, not product lookups.",
    },
  ],
  features: [
    "Certification display at product level — USDA Organic, Non-GMO, Fair Trade, Kosher",
    "Per-account pricing tiers for co-ops, independent retailers, and buying clubs",
    "Seasonal and limited-availability SKU management with notify-me waitlists",
    "Standing order automation for weekly natural grocery replenishment",
    "Origin and sourcing story fields on every product listing",
    "Purchase limit enforcement by account and by SKU",
    "Net-30/60/90 billing automation with overdue alerts and credit limits",
    "Branded wholesale account portal with your logo and domain",
    "PDF invoice generation with certification references included",
    "Order history and one-click reorder for returning natural food buyers",
  ],
  testimonial: {
    quote:
      "We were emailing cert docs constantly. It felt like a full-time job. Now everything is in the portal at the product level — buyers check before they order, and we've cut cert-related emails by 80%. That alone was worth it.",
    name: "Rachel M.",
    company: "Appalachian Natural Foods",
    industry: "Organic & Natural Food Distribution",
  },
  sectionTitle: "What changes for organic and natural food distributors.",
  featuresTitle: "Everything an organic and natural food distributor needs.",
  stats: [
    {
      stat: "3×",
      label: "more certification documentation requests from natural food buyers vs. conventional",
      source: "UNFI Buyer Insights Report 2024",
    },
    {
      stat: "28%",
      label: "fewer pre-order inquiries when certifications are surfaced at the product listing level",
      source: "Wholesail client data",
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
