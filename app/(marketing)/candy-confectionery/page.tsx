import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Candy & Confectionery Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for candy and confectionery distributors. Retailers, gift shops, and food service accounts order online — no calls required. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Candy & Confectionery Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for candy and confectionery distributors. Seasonal ordering, account-specific pricing, and Net-30 automation built in. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/candy-confectionery" },
};

const config: IndustryConfig = {
  slug: "candy-confectionery",
  eyebrow: "For Candy & Confectionery Distributors",
  h1Line1: "Valentine's, Easter, Halloween — your peak weeks",
  h1Line2: "are chaos. They don't have to be.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for candy and confectionery distributors. Specialty retailers, gift shops, and food service accounts order online — seasonal pre-orders, standing replenishment, and per-account pricing all in one place. Live in under 2 weeks.",
  heroStat:
    "The average confectionery distributor sees 3–4 seasonal demand spikes per year. Distributors with a portal close 35% more pre-season orders than those still working the phone.",
  painPoints: [
    {
      before: "Every Halloween and Valentine's Day you're flooded with calls and can't tell who's confirmed versus still shopping around.",
      after: "Accounts pre-order seasonal lines through the portal. You see confirmed volume weeks out — not guesses, real orders with payment terms attached.",
    },
    {
      before: "You have 500+ SKUs across premium chocolate, seasonal candy, novelty, and bulk — and accounts expect you to know what they usually order.",
      after: "Every account's order history is one click away. Reorder from last Easter in 30 seconds. Your reps aren't running lookup for clients — the portal handles it.",
    },
    {
      before: "Gift shops and specialty retailers need case quantities, assortments, and custom minimums — and they all need something slightly different.",
      after: "Per-account MOQs and case configurations are locked to each buyer's profile. Every account sees their rules, not a generic catalog.",
    },
    {
      before: "Tracking who's on Net-30 vs. Net-60 across 80 accounts during peak season is a billing nightmare.",
      after: "Payment terms are configured once per account and automated. Invoices generate on shipment. Overdue alerts go out automatically so nothing slips.",
    },
  ],
  features: [
    "Seasonal pre-order system with campaign windows and deposit collection",
    "Per-account pricing tiers for premium, standard, and volume buyers",
    "Assortment and case-pack configurations locked to each account",
    "Standing order automation for year-round candy replenishment",
    "Category organization across premium chocolate, bulk, novelty, and seasonal",
    "Net-30/60/90 billing automation with credit limits and overdue alerts",
    "Branded wholesale account portal with your logo and domain",
    "Demand visibility dashboard — see confirmed pre-season orders in real time",
    "PDF invoicing with assortment line items and case count breakdown",
    "Order history and one-click seasonal reorder for returning accounts",
  ],
  testimonial: {
    quote:
      "We'd lose track of who actually confirmed their Halloween orders every year. With Wholesail, every order is confirmed in writing the moment it's placed. I can see exactly what's coming in for October in August. It changed how we plan production.",
    name: "Linda C.",
    company: "Great Lakes Confections",
    industry: "Candy & Confectionery Distribution",
  },
  sectionTitle: "What changes for candy and confectionery distributors.",
  featuresTitle: "Everything a candy and confectionery distributor needs.",
  stats: [
    {
      stat: "72%",
      label: "of confectionery distributors manage seasonal pre-orders manually",
      source: "NCA Distributor Survey 2024",
    },
    {
      stat: "35%",
      label: "more pre-season orders confirmed when accounts can self-serve pre-orders online",
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
