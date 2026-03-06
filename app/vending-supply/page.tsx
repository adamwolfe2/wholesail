import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Vending Supply Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for vending supply distributors. Operators order snacks, beverages, and supplies online — standing orders, route-based delivery, and Net terms built in. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Vending Supply Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for vending supply distributors. Route-based ordering, standing replenishment, and operator-specific pricing in one portal. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/vending-supply" },
};

const config: IndustryConfig = {
  slug: "vending-supply",
  eyebrow: "For Vending Supply Distributors",
  h1Line1: "Vending operators order the same products",
  h1Line2: "every week. They shouldn't have to call you to do it.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for vending supply distributors. Operators order snacks, beverages, machine supplies, and service parts online — with standing order automation, route-based delivery, and per-account pricing. Live in under 2 weeks.",
  heroStat:
    "The average vending operator places the same order 85% of the time. Standing order automation eliminates 4+ hours of weekly manual order processing per distributor.",
  painPoints: [
    {
      before: "Vending operators call in the same weekly order every Monday morning. Your team manually enters it every single time.",
      after: "Standing orders auto-generate on the operator's schedule. They get a reminder, confirm in 30 seconds, and your warehouse picks it automatically. No one has to call.",
    },
    {
      before: "You have 300 SKUs split between snack, beverage, healthy options, and machine parts — and each operator has a completely different mix.",
      after: "Every operator's catalog is filtered to their approved product set and pricing. They order what they actually buy, not what's on your full catalog.",
    },
    {
      before: "Tracking which operator is on Net-30 versus prepay across a 90-account base requires a spreadsheet no one fully trusts.",
      after: "Payment terms are configured once per account. Invoices generate automatically. The system tracks who's overdue so you don't have to.",
    },
    {
      before: "When an operator needs a rush delivery for a machine restock, they're calling your driver directly — bypassing dispatch entirely.",
      after: "Operators submit urgent orders through the portal with a rush flag. Dispatch sees it on the fulfillment board and routes it appropriately. No back-channel calls.",
    },
  ],
  features: [
    "Standing order automation with operator-controlled weekly replenishment schedules",
    "Per-operator product catalog filtered to their approved SKU list",
    "Per-account pricing locked to each operator's negotiated rates",
    "Rush order flagging with direct fulfillment board visibility",
    "Route-based delivery grouping and driver assignment",
    "Net-30/60/90 and prepay term management with automated AR tracking",
    "Branded wholesale account portal with your logo and domain",
    "Machine parts and service supply ordering alongside product replenishment",
    "PDF delivery confirmation and invoice generation per route stop",
    "Order history and one-click reorder for returning operators",
  ],
  testimonial: {
    quote:
      "We had 70 operators all calling in the same orders every week. We were entering orders for 40% of our week. Standing orders through Wholesail dropped that to almost nothing. Now we spend that time actually growing the route instead of just servicing it.",
    name: "Tom W.",
    company: "Metro Vending Supply",
    industry: "Vending Supply Distribution",
  },
  sectionTitle: "What changes for vending supply distributors.",
  featuresTitle: "Everything a vending supply distributor needs.",
  stats: [
    {
      stat: "85%",
      label: "of vending operator orders contain the same SKUs as the previous week",
      source: "NAMA Operator Survey 2024",
    },
    {
      stat: "4+ hrs",
      label: "per week in manual order entry eliminated with standing order automation",
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
