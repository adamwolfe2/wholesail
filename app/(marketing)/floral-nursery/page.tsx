import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Floral & Nursery Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for wholesale floral distributors, nursery suppliers, and plant distributors. Florists and garden centers order any time — you wake up to a clean order board. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Floral & Nursery Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for wholesale floral distributors, nursery suppliers, and plant distributors. Florists and garden centers order any time — you wake up to a clean order board. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/floral-nursery" },
};

const config: IndustryConfig = {
  slug: "floral-nursery",
  eyebrow: "For Floral & Nursery Distributors",
  h1Line1: "Your florists are placing orders on Sunday night for Monday delivery.",
  h1Line2: "Without a portal, your weekend is their phone call.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for wholesale floral distributors, nursery suppliers, and plant distributors. Florists and garden centers order from their phone any time — you wake up to a clean order board, not a voicemail box. Seasonal availability updates automatically. Live in under 2 weeks.",
  heroStat:
    "Most wholesale florists place orders 1–3 days in advance. That window only works if ordering is frictionless.",
  painPoints: [
    {
      before: "Florists call and text Sunday evening to place Monday delivery orders — straight to your personal phone.",
      after: "Orders come in through your portal any time of day or night. Your phone stays quiet on weekends.",
    },
    {
      before: "Seasonal availability changes weekly — and notifying every account by text or email is a part-time job.",
      after: "Seasonal catalog updates publish to your portal in minutes. Accounts see what's in stock when they log in.",
    },
    {
      before: "Perishable orders placed too late lead to waste, substitutions, and unhappy accounts.",
      after: "Order windows close automatically before your cut time. No more last-minute scrambles on delivery morning.",
    },
    {
      before: "Different accounts have different minimums and you're enforcing them manually on every order.",
      after: "Per-account minimums are set in your portal and enforced at checkout — automatically, every time.",
    },
  ],
  features: [
    "Seasonal catalog management with availability windows per item",
    "Order window controls with configurable cutoff times by delivery day",
    "Perishable handling notes and care instructions on each product listing",
    "Per-account minimums enforced automatically at checkout",
    "Branded wholesale portal with your logo and domain",
    "PDF invoice generation on every confirmed order",
    "New arrival and in-season spotlights pushed to active accounts",
    "Delivery schedule and route management for weekly distribution",
    "Order history and one-click reorder for returning florist accounts",
  ],
  testimonial: {
    quote:
      "My florist clients were texting me at midnight on Sundays. I'd wake up Monday morning with 12 texts to sort through and delivery starting in two hours. With Wholesail, the orders are already there — clean, organized, ready to pull.",
    name: "James P.",
    company: "Bloom Wholesale Co.",
    industry: "Floral & Nursery Distribution",
  },
  sectionTitle: "What changes for floral and nursery distributors.",
  featuresTitle: "Everything a floral and nursery distributor needs.",
  stats: [
    {
      stat: "78%",
      label: "of wholesale florists place at least one order outside of business hours each week",
      source: "AIFD Florist Survey 2024",
    },
    {
      stat: "$340",
      label: "average order value lost per missed weekend order across a 30-account floral business",
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
