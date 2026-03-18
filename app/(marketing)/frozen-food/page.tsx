import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Frozen Food Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for frozen food distributors. Restaurants and retailers order online — no calls, no faxes required. Manage cold-chain SKUs, standing orders, and Net-30 billing. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Frozen Food Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for frozen food distributors. Restaurants and retailers order online — no calls, no faxes required. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/frozen-food" },
};

const config: IndustryConfig = {
  slug: "frozen-food",
  eyebrow: "For Frozen Food Distributors",
  h1Line1: "Your accounts are calling to place frozen orders",
  h1Line2: "before your cold chain team is even in the warehouse.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for frozen food distributors — IQF proteins, frozen appetizers, ice cream, and ready-to-heat meals. Restaurants and retailers order online with cold-chain cutoffs enforced automatically. Standing orders auto-replenish. Live in under 2 weeks.",
  heroStat:
    "The average frozen food distributor loses 3–5 hours per week to phone orders that miss cold-chain cutoffs. That ends when you launch.",
  painPoints: [
    {
      before: "Accounts call in orders after your refrigerated truck has already left — then blame you for the short ship.",
      after: "Order cutoff times are enforced automatically in the portal. No order placed after 2pm ships same day. No exceptions, no arguments.",
    },
    {
      before: "Managing weekly standing orders for frozen proteins across 60 accounts takes your reps half the morning.",
      after: "Frozen standing orders replenish on your schedule. Accounts confirm or adjust in 30 seconds. Your reps spend time on new business, not repeat admin.",
    },
    {
      before: "Your catalog has 400 SKUs split between fresh, ambient, and frozen — and accounts order from all three in one call.",
      after: "Catalog categories group by temperature zone. Accounts browse and order across all categories in one clean session. One order, one invoice.",
    },
    {
      before: "Net-30 billing on frozen products means you're funding your clients' inventory while managing cold storage costs.",
      after: "Per-account payment terms are configured once and automated forever. Overdue alerts go out before you have to make an awkward call.",
    },
  ],
  features: [
    "Temperature-zoned catalog with clear frozen / refrigerated / ambient categories",
    "Automated order cutoff enforcement — no orders past your cold chain deadline",
    "Standing order automation with weekly replenishment and account-controlled adjustments",
    "Per-account wholesale pricing locked to each buyer's profile",
    "Net-30/60/90 billing automation with overdue alerts and credit limits",
    "Route-based fulfillment board for cold chain delivery coordination",
    "Branded wholesale account portal with your logo and domain",
    "PDF invoice generation with temperature zone and handling notes",
    "Seasonal featured product spotlights — holiday frozen meals, summer frozen desserts",
    "Order history and one-click reorder for repeat wholesale buyers",
  ],
  testimonial: {
    quote:
      "We had accounts calling at 11pm to place frozen orders for next-day delivery. The portal stopped that overnight. Cutoffs are enforced, standing orders run themselves, and I stopped getting calls on nights and weekends.",
    name: "Marcus T.",
    company: "Summit Frozen Foods",
    industry: "Frozen Food Distribution",
  },
  sectionTitle: "What changes for frozen food distributors.",
  featuresTitle: "Everything a frozen food distributor needs.",
  stats: [
    {
      stat: "68%",
      label: "of frozen food distributors still process orders manually by phone or fax",
      source: "AFFI Distributor Operations Survey 2024",
    },
    {
      stat: "4.2 hrs",
      label: "per week the average frozen food rep spends on manual order entry",
      source: "Conexiom 2024",
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
