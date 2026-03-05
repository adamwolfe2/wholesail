import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "Ordering Portal for Restaurant Equipment Distributors | Wholesail",
  description: "Wholesail builds custom B2B ordering portals for restaurant equipment distributors and commercial kitchen suppliers. Restaurant owners order replacement parts and equipment online — per-account pricing and service documentation included. Live in under 2 weeks.",
  openGraph: {
    title: "Ordering Portal for Restaurant Equipment Distributors | Wholesail",
    description: "Wholesail builds custom B2B ordering portals for restaurant equipment distributors and commercial kitchen suppliers. Restaurant owners order replacement parts and equipment online — per-account pricing and service documentation included. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/restaurant-equipment" },
};

const config: IndustryConfig = {
  slug: "restaurant-equipment",
  eyebrow: "For Restaurant Equipment Distributors",
  h1Line1: "Your restaurant clients are calling when a piece of equipment breaks down.",
  h1Line2: "The urgency is real. The phone call shouldn't be necessary.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for restaurant equipment distributors, commercial kitchen suppliers, and foodservice equipment wholesalers. Restaurant owners and kitchen managers order replacement parts, smallwares, and new equipment online — per-account pricing, financing options, and service documentation included. Live in under 2 weeks.",
  heroStat:
    "A broken piece of kitchen equipment costs a restaurant $500–$2,000 per day. Speed of ordering is everything.",
  painPoints: [
    {
      before: "When equipment breaks down, restaurant managers call your emergency line — but your office is closed and the order waits until morning.",
      after: "Replacement part orders can be placed 24/7 through the portal. Emergency orders placed after hours are queued for first-thing-morning fulfillment automatically.",
    },
    {
      before: "Commercial kitchen equipment catalogs are massive and complex, and navigating them over the phone leads to wrong parts ordered and returns that cost everyone time.",
      after: "Equipment and parts are searchable by unit model, part number, and category. Compatibility is visible before the order is placed — wrong parts don't get ordered.",
    },
    {
      before: "Multi-unit restaurant groups have different pricing for each location, and your reps manage pricing manually across dozens of accounts.",
      after: "Per-account pricing for chains and multi-unit operators is configured in the portal. Every location sees their correct pricing at checkout.",
    },
    {
      before: "Service manuals, warranty documents, and installation guides have to be emailed separately with every equipment purchase — and they get lost in inboxes.",
      after: "Service documentation attaches automatically to the order and the account record. Operators can find their manuals anytime in their portal account.",
    },
  ],
  features: [
    "Equipment catalog with parts lookup by model and part number",
    "Emergency order prioritization with after-hours order queuing",
    "Per-account pricing configuration for chains and multi-unit operators",
    "Service documentation stored and accessible per equipment unit",
    "Financing options display for large equipment purchases",
    "Installation scheduling integrated with order placement",
    "Parts compatibility search to prevent wrong-part orders",
    "Order history by location for multi-unit restaurant groups",
    "Admin fulfillment dashboard with order prioritization and staging",
  ],
  testimonial: {
    quote:
      "Our fryer went down at 10pm on a Friday. I found the replacement part on the portal in two minutes, placed the order, and it was there Saturday morning. Before this portal existed, I would have been on the phone with an emergency line and crossing my fingers. This paid for itself the first week.",
    name: "Carlos R.",
    company: "Keystone Foodservice Equipment",
    industry: "Restaurant Equipment Distribution",
  },
  sectionTitle: "What changes for restaurant equipment distributors.",
  featuresTitle: "Everything a restaurant equipment distributor needs.",
  stats: [
    {
      stat: "68%",
      label: "of restaurant equipment failures occur outside of normal business hours",
      source: "NAFEM Service Report 2024",
    },
    {
      stat: "$1,200",
      label: "average daily revenue loss for a restaurant when critical equipment is down",
      source: "NRA Operations Survey 2024",
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
