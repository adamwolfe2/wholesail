import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Hardware & Tool Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for hardware and tool distributors. Contractors, hardware stores, and trade accounts order online — part numbers, quantity breaks, and Net-30 billing. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Hardware & Tool Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for hardware and tool distributors. Trade accounts order online with part-number search, volume pricing, and Net terms. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/hardware-tools" },
};

const config: IndustryConfig = {
  slug: "hardware-tools",
  eyebrow: "For Hardware & Tool Distributors",
  h1Line1: "Contractors are ordering at 5am from a jobsite.",
  h1Line2: "Your phone doesn't ring — they find another supplier.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for hardware and tool distributors. Contractors, hardware stores, and trade accounts order online around the clock — part-number search, quantity-break pricing, and Net-30 terms built in. Live in under 2 weeks.",
  heroStat:
    "60% of contractor orders happen outside normal business hours. Distributors with an online ordering portal capture that volume. Those without it lose it to the nearest competitor with a website.",
  painPoints: [
    {
      before: "Contractors call in orders with part numbers you have to look up, verify, and manually enter — three times a day.",
      after: "Accounts search by part number or product name directly in the portal. They add to cart themselves. You confirm and ship. No lookup, no transcription.",
    },
    {
      before: "Your volume pricing is different for every account — hardware stores get one price, large contractors get another, and one-off buyers get list price.",
      after: "Per-account pricing tiers are locked to each buyer's login. The right price shows up automatically. No reps needed to quote what's already configured.",
    },
    {
      before: "A big GC is running 12 jobs and needs standing orders for consumables delivered to three different job sites.",
      after: "Multi-location account management lets one GC company order for multiple job addresses from a single login. Standing orders replenish on their schedule.",
    },
    {
      before: "You're extending Net-30 to 80 trade accounts and tracking payment manually in a spreadsheet that's always six days behind.",
      after: "Payment terms are configured once per account and automated. Invoices generate on shipment. Overdue alerts fire automatically so nothing slips off your radar.",
    },
  ],
  features: [
    "Part-number and keyword search across 2,000+ SKU catalogs",
    "Quantity-break pricing with automatic tier application at checkout",
    "Per-account pricing locked to each trade account's login",
    "Multi-location support for GCs and contractors ordering to multiple job sites",
    "Standing order automation for consumables and recurring supply replenishment",
    "Net-30/60/90 billing automation with credit limits and overdue alerts",
    "Branded wholesale account portal with your logo and domain",
    "After-hours ordering — accounts order 24/7 against confirmed inventory",
    "PDF invoice and packing list generation for every fulfilled order",
    "Order history and one-click reorder for repeat trade account buyers",
  ],
  testimonial: {
    quote:
      "Our biggest contractor accounts were calling us before 6am and leaving voicemails with their orders. We were losing jobs to suppliers with websites. After launching with Wholesail, our top 10 accounts now order online — and our average order value went up because they're not rushing through a phone call.",
    name: "Dave P.",
    company: "Tri-State Supply Co.",
    industry: "Hardware & Tool Distribution",
  },
  sectionTitle: "What changes for hardware and tool distributors.",
  featuresTitle: "Everything a hardware and tool distributor needs.",
  stats: [
    {
      stat: "60%",
      label: "of contractor orders happen outside normal 9-to-5 business hours",
      source: "NAHB Contractor Procurement Study 2024",
    },
    {
      stat: "22%",
      label: "average increase in order value when trade accounts order online vs. phone",
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
