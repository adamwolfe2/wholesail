import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Gift & Novelty Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for gift and novelty distributors. Boutiques, museum shops, and specialty retailers order online — seasonal pre-orders, assortment minimums, and Net-30 billing. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Gift & Novelty Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for gift and novelty distributors. Seasonal ordering, assortment configurations, and retail buyer pricing in one portal. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/gift-novelty" },
};

const config: IndustryConfig = {
  slug: "gift-novelty",
  eyebrow: "For Gift & Novelty Distributors",
  h1Line1: "Q4 is 40% of your revenue.",
  h1Line2: "You're still managing it through email and phone calls.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for gift and novelty distributors. Boutiques, museum shops, hotel gift shops, and specialty retailers order online — seasonal pre-orders, assortment minimums, and per-account pricing all in one place. Live in under 2 weeks.",
  heroStat:
    "Gift distributors who offer online ordering see 40% more pre-season confirmed orders than those managing Q4 by phone. That's committed revenue, not hope.",
  painPoints: [
    {
      before: "You're managing holiday pre-orders through email threads with 80 boutique buyers — trying to track who confirmed and who's still deciding.",
      after: "Seasonal campaigns run through the portal with defined windows. Buyers place and confirm pre-orders online. You see your committed Q4 volume in real time.",
    },
    {
      before: "Your minimum order quantities vary by account — a museum shop gets different assortment rules than a boutique hotel.",
      after: "Per-account MOQs and assortment requirements are configured once per buyer. The portal enforces them automatically. No manual checks, no exceptions that slip through.",
    },
    {
      before: "New arrivals land in your warehouse and you're sending group emails hoping buyers will respond before the good stuff sells out.",
      after: "New arrival notifications publish to the portal the day product arrives. Buyers see it on login. Featured drops build urgency and move inventory fast.",
    },
    {
      before: "Boutique and specialty retail buyers are all on different terms — some Net-30, some Net-60, some prepay — and your billing is a spreadsheet disaster.",
      after: "Payment terms are configured once per buyer account and automated. Invoices generate on shipment. Overdue alerts fire so your AR team isn't chasing manually.",
    },
  ],
  features: [
    "Seasonal pre-order campaigns with defined windows and deposit collection",
    "Per-account assortment minimums and case-pack configurations",
    "New arrival and featured drop notifications on portal login",
    "Per-account pricing for boutiques, chain retail, museum shops, and hotel gift shops",
    "Standing order automation for year-round replenishment SKUs",
    "Net-30/60/90 billing automation with credit limits and overdue alerts",
    "Branded wholesale account portal with your logo and domain",
    "Visual catalog with lifestyle imagery and detailed product descriptions",
    "PDF wholesale order confirmation and invoice generation",
    "Order history and one-click seasonal reorder for returning retail buyers",
  ],
  testimonial: {
    quote:
      "Christmas pre-orders used to be six weeks of inbox chaos. I never knew what was confirmed versus what was just 'interested.' Now everything is in the portal — orders are binding when they're placed, I can see our Q4 volume in October, and we actually had a plan this year instead of winging it.",
    name: "Jenna A.",
    company: "Coastal Gift Distributors",
    industry: "Gift & Novelty Distribution",
  },
  sectionTitle: "What changes for gift and novelty distributors.",
  featuresTitle: "Everything a gift and novelty distributor needs.",
  stats: [
    {
      stat: "40%",
      label: "more confirmed pre-season orders when buyers can commit through an online portal",
      source: "Wholesail client data",
    },
    {
      stat: "45%",
      label: "of gift distributor annual revenue is generated in Q4",
      source: "Gift & Home trade survey 2024",
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
