import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Produce & Dairy Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for produce and dairy distributors. Grocery stores and restaurants order from your daily catalog — automated cutoff times, delivery routing, and invoice generation. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Produce & Dairy Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for produce and dairy distributors. Grocery stores and restaurants order from your daily catalog — automated cutoff times, delivery routing, and invoice generation. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/produce-dairy" },
};

const config: IndustryConfig = {
  slug: "produce-dairy",
  eyebrow: "For Produce & Dairy Distributors",
  h1Line1: "Your grocery and restaurant clients need fresh inventory daily.",
  h1Line2: "Phone ordering for perishables is a liability, not a system.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for produce and dairy distributors. Grocery stores, restaurants, and institutions order directly from your catalog — updated daily with what's in stock. Automated cutoff times, delivery routing, and invoice generation. Live in under 2 weeks.",
  heroStat:
    "Produce and dairy buyers make purchasing decisions early — most before 8am. Are you reachable then?",
  painPoints: [
    {
      before: "Your team manually updates availability every morning and then starts calling accounts — by the time you reach them, half have already bought elsewhere.",
      after: "Daily inventory updates publish to your portal before your accounts start their day. They order directly — no call required.",
    },
    {
      before: "Early morning orders come in through text, phone, and email — and someone has to consolidate all of it before the trucks roll.",
      after: "All orders land in one portal, organized by delivery route and cutoff time. Your dispatch is clean every morning.",
    },
    {
      before: "Short shelf lives mean every miscommunication is a loss — wrong quantities ordered, wrong items shipped.",
      after: "Written, confirmed orders with timestamped PDFs eliminate verbal order errors. Disputes disappear.",
    },
    {
      before: "Pricing changes daily based on market conditions, and communicating that to 50 accounts is a nightmare.",
      after: "Update pricing in your portal and every account sees the current rate at checkout — automatically.",
    },
  ],
  features: [
    "Daily inventory board updated each morning with in-stock items and quantities",
    "Early morning order windows with automated cutoff enforcement",
    "Delivery route grouping for efficient daily distribution planning",
    "Variable daily pricing updated in real time across all accounts",
    "Per-account pricing tiers locked to each buyer's profile",
    "Branded wholesale portal with your logo and domain",
    "Automated PDF invoice generation on every confirmed order",
    "Short-shelf-life indicators and handling notes per product",
    "Order history and one-click reorder for returning accounts",
  ],
  testimonial: {
    quote:
      "We had drivers calling accounts at 5am trying to collect orders before leaving the warehouse. Now accounts place orders the night before in the portal, and our drivers have a printed route sheet waiting for them when they arrive.",
    name: "Miguel A.",
    company: "Valley Fresh Distributing",
    industry: "Produce & Dairy Distribution",
  },
  sectionTitle: "What changes for produce and dairy distributors.",
  featuresTitle: "Everything a produce and dairy distributor needs.",
  stats: [
    {
      stat: "74%",
      label: "of produce buyers at restaurants and grocery stores place orders before 9am",
      source: "FMI Purchasing Survey 2024",
    },
    {
      stat: "22%",
      label: "of produce is wasted due to miscommunication and manual order entry errors",
      source: "USDA Food Loss 2024",
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
