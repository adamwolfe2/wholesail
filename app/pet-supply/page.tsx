import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Pet Supply Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for pet supply distributors, specialty pet food wholesalers, and grooming supply companies. Per-account pricing, volume discounts, and automated invoicing included. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Pet Supply Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for pet supply distributors, specialty pet food wholesalers, and grooming supply companies. Per-account pricing, volume discounts, and automated invoicing included. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/pet-supply" },
};

const config: IndustryConfig = {
  slug: "pet-supply",
  eyebrow: "For Pet Supply Distributors",
  h1Line1: "Your pet store and groomer accounts are ordering by phone and spreadsheet.",
  h1Line2: "They'd switch online tomorrow if you gave them the option.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for pet supply distributors, specialty pet food wholesalers, and grooming supply companies. Pet stores and groomers place orders from your branded catalog — per-account pricing, volume discounts, and automated invoicing included. Live in under 2 weeks.",
  heroStat:
    "Pet store buyers are digital-first. They're waiting for their distributor to catch up.",
  painPoints: [
    {
      before: "Pet store owners call during business hours when your reps are already stretched — hold times lead to lost orders.",
      after: "Accounts order from your portal any time, day or night. No wait, no hold, no missed sales.",
    },
    {
      before: "Your product catalog spans food, health, accessories, and grooming — too complex to quote over the phone without errors.",
      after: "Your full catalog is searchable by category, brand, and species. Buyers find and order the right product every time.",
    },
    {
      before: "Volume discounts are tracked in a spreadsheet and applied manually — inconsistently — by your reps.",
      after: "Volume pricing tiers are locked to each account. The correct discount applies automatically at checkout.",
    },
    {
      before: "Invoicing happens days after delivery — a slow process that delays your cash flow and frustrates accounts.",
      after: "PDF invoices generate automatically on every confirmed order. Accounts have their invoice before delivery day.",
    },
  ],
  features: [
    "Full product catalog organized by category: food, health, accessories, and grooming",
    "Per-account wholesale pricing with volume discount tiers",
    "Breed and species filtering to help buyers find relevant products faster",
    "Promotional pricing windows with automatic expiration",
    "Branded wholesale portal with your logo and domain",
    "Automated PDF invoice generation on every confirmed order",
    "Order cutoff management for next-day or scheduled delivery accounts",
    "Reorder alerts for fast-moving SKUs and seasonal items",
    "Order history and one-click reorder for returning pet store and groomer accounts",
  ],
  testimonial: {
    quote:
      "I own two pet stores and used to call our distributor every week during opening rush. Half the time I'd get voicemail and have to try again later. Now I order from their portal at 10pm after we close. It takes five minutes and I don't have to talk to anyone.",
    name: "Karen B.",
    company: "Midwest Pet Wholesale",
    industry: "Pet Supply Distribution",
  },
  sectionTitle: "What changes for pet supply distributors.",
  featuresTitle: "Everything a pet supply distributor needs.",
  stats: [
    {
      stat: "67%",
      label: "of independent pet retailers still place wholesale orders by phone, fax, or email",
      source: "APPA Distribution Report 2024",
    },
    {
      stat: "4.1 hrs",
      label: "per week the average pet supply rep spends on inbound order calls and entry",
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
