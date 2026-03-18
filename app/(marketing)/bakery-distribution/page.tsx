import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Bakery & Specialty Food Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for artisan bakeries, specialty food producers, and baked goods distributors. Restaurants order next-day online — no calls, no missed cutoffs. Automated cutoff enforcement. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Bakery & Specialty Food Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for artisan bakeries, specialty food producers, and baked goods distributors. Restaurants order next-day online — no calls, no missed cutoffs. Automated cutoff enforcement. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/bakery-distribution" },
};

const config: IndustryConfig = {
  slug: "bakery-distribution",
  eyebrow: "For Bakery & Specialty Food Distributors",
  h1Line1: "Your bakery clients call in orders the night before delivery.",
  h1Line2: "The deadline chaos ends when they have a portal.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for artisan bakeries, specialty food producers, and baked goods distributors. Restaurants and retailers place next-day orders online — no calls, no voicemails, no missed cutoffs. Automated order cutoffs enforce your production schedule. Live in under 2 weeks.",
  heroStat:
    "Missing a next-day order cutoff costs you one full production run. That adds up fast across 40+ accounts.",
  painPoints: [
    {
      before: "Accounts call and leave voicemails after hours — and you're manually entering their orders the next morning.",
      after: "Orders are placed directly in your portal before cutoff. Your morning starts with a clean production sheet.",
    },
    {
      before: "Your cutoff time is 9pm, but accounts call at 11pm anyway and you feel obligated to accommodate them.",
      after: "Order windows close automatically at your cutoff time. No exceptions, no awkward conversations.",
    },
    {
      before: "Planning production quantities requires guessing based on last week's patterns and spotty notes.",
      after: "Your portal generates a production-ready order summary by SKU — bake exactly what's been ordered.",
    },
    {
      before: "Updating seasonal menus means re-sending a PDF to every account and hoping they read it.",
      after: "Seasonal items publish to your portal instantly. Accounts see what's available the moment they log in.",
    },
  ],
  features: [
    "Automated order cutoff enforcement with configurable close times per day",
    "Production-friendly order summaries grouped by SKU and delivery date",
    "Day-of delivery scheduling with route-based order grouping",
    "Per-account minimums and delivery frequency settings",
    "Seasonal and limited menu items with availability windows",
    "Branded wholesale portal with your logo and domain",
    "PDF invoice generation on every confirmed order",
    "New item announcements pushed to all active accounts",
    "Order history and one-click reorder for returning restaurant accounts",
  ],
  testimonial: {
    quote:
      "Before Wholesail, I was fielding calls until midnight and waking up to voicemails I had to decode into a production list. Now my cutoff enforces itself and I have a clean order sheet by 6am. I sleep again.",
    name: "Elena M.",
    company: "Harvest Hearth Bakers",
    industry: "Bakery Distribution",
  },
  sectionTitle: "What changes for bakery and specialty food distributors.",
  featuresTitle: "Everything a bakery distributor needs.",
  stats: [
    {
      stat: "89%",
      label: "of bakery distributors report that missed order cutoffs are their top operational pain point",
      source: "AIB International 2024",
    },
    {
      stat: "2.4 hrs",
      label: "average time spent calling accounts each night to collect next-day orders",
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
