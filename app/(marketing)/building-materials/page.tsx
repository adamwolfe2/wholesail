import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "Ordering Portal for Building Materials Distributors | Wholesail",
  description: "Wholesail builds custom B2B ordering portals for building materials distributors and lumber yards. Contractors check live inventory and place orders from their phone — job site delivery and per-contractor pricing included. Live in under 2 weeks.",
  openGraph: {
    title: "Ordering Portal for Building Materials Distributors | Wholesail",
    description: "Wholesail builds custom B2B ordering portals for building materials distributors and lumber yards. Contractors check live inventory and place orders from their phone — job site delivery and per-contractor pricing included. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/building-materials" },
};

const config: IndustryConfig = {
  slug: "building-materials",
  eyebrow: "For Building Materials Distributors",
  h1Line1: "Your contractors are calling at 6am to check what's in your yard.",
  h1Line2: "A live inventory portal ends the morning rush.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for building materials distributors and lumber yards. Contractors check live inventory and place orders from their phone — job site address capture, per-contractor pricing, and delivery scheduling included. Live in under 2 weeks.",
  heroStat:
    "Contractors are early risers. Most purchasing decisions are made before your office opens.",
  painPoints: [
    {
      before: "Contractors call at 6am to ask what's in the yard, and your staff isn't in yet — so they call a competitor who has an online system.",
      after: "Live yard inventory is visible in your portal 24/7. Contractors check availability at 6am and place the order before your office opens.",
    },
    {
      before: "You have 50 contractor accounts, each with different negotiated pricing, and your reps are manually quoting on every call.",
      after: "Per-contractor pricing is built into each account. Every contractor sees their correct rate the moment they log in — no quoting, no callbacks.",
    },
    {
      before: "Delivery scheduling is handled by phone call, and job site addresses have to be re-collected every order because nothing is saved.",
      after: "Contractors maintain a job site address book in their portal. Delivery scheduling happens at checkout — no extra calls needed.",
    },
    {
      before: "Large material orders — multiple products, varying quantities, multiple delivery drops — take 20 minutes to capture over the phone.",
      after: "Contractors build large orders in the portal with quantity tools designed for bulk entry. Complex orders take two minutes, not twenty.",
    },
  ],
  features: [
    "Live yard inventory visible by product and quantity",
    "Job site address book saved per contractor account",
    "Per-contractor pricing configured per account",
    "Large order quantity entry tools for bulk material orders",
    "Delivery scheduling with date and job site selection",
    "Material certifications and spec sheet delivery per product",
    "Project-based ordering with order history by job",
    "Quote-to-order workflow for large or custom material jobs",
    "Admin fulfillment board with order staging and delivery tracking",
  ],
  testimonial: {
    quote:
      "My foremen used to call the yard at 6am and half the time nobody answered. Now they check inventory on their phone before they leave the house, place the order, and it's ready when the crew gets there. I don't get calls about missing materials anymore.",
    name: "Dave M.",
    company: "Summit Building Supply",
    industry: "Building Materials Distribution",
  },
  sectionTitle: "What changes for building materials distributors.",
  featuresTitle: "Everything a building materials distributor needs.",
  stats: [
    {
      stat: "72%",
      label: "of specialty contractors report placing material orders before 7am on build days",
      source: "AGC Contractor Survey 2024",
    },
    {
      stat: "6.2 hrs",
      label: "per week spent by building supply reps handling inbound inventory and order calls",
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
