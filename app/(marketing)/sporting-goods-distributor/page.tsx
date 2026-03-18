import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Sporting Goods Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for sporting goods distributors. Schools, fitness studios, and outdoor retailers order online — seasonal pre-orders, equipment package pricing, and Net-30 billing. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Sporting Goods Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for sporting goods distributors. Seasonal pre-orders and institutional account billing handled automatically. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/sporting-goods-distributor" },
};

const config: IndustryConfig = {
  slug: "sporting-goods-distributor",
  eyebrow: "For Sporting Goods Distributors",
  h1Line1: "Spring season opens in 6 weeks and your school and gym accounts",
  h1Line2: "are still placing pre-season orders by email.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for sporting goods distributors. Schools, fitness studios, and outdoor retailers order online — seasonal pre-orders, equipment package pricing, and Net-30 billing for institutional accounts. Live in under 2 weeks.",
  heroStat:
    "Sporting goods distributors lose an average of 15-20% of pre-season committed volume to competitors due to slow confirmation on phone/email pre-orders.",
  painPoints: [
    {
      before: "Your school district accounts send pre-season equipment lists by email — you receive them at different times, in different formats, and spend a week manually entering orders before the season window closes.",
      after: "School and institutional accounts place pre-season orders directly in the portal. Orders arrive in your system in real time, in a consistent format, and volume is confirmed the moment they submit.",
    },
    {
      before: "Team equipment packages include multiple SKUs across uniforms, gear, and accessories — and coaches always call back to change one item after submitting, forcing you to edit orders across several line items.",
      after: "Equipment package bundles are configured once in the portal with editable line-item flexibility before the order ships. Coaches make changes themselves — with your approval window enforced automatically.",
    },
    {
      before: "Independent sporting goods retailers place reorders throughout the season but never know your current inventory — and you lose sales when they assume you're out of stock and go to a competitor.",
      after: "Real-time available inventory is visible to accounts at checkout. Low-stock alerts prompt reorders before you run out. Retailers who can see stock levels reorder faster and more often.",
    },
    {
      before: "Institutional accounts like schools and recreation departments require a PO number on every invoice — your team manually matches PO numbers to invoices and the accounting department still disputes half of them.",
      after: "Purchase order number capture is required at checkout for institutional accounts. PO numbers print on every invoice automatically. Accounting matches invoices to POs without calling your office.",
    },
  ],
  features: [
    "Seasonal pre-order windows with open/close date enforcement per product line",
    "Equipment package and team bundle builder with flexible line-item editing",
    "Institutional PO number capture required at checkout for school and government accounts",
    "Per-account pricing for school districts, fitness studios, and independent retailers",
    "Available inventory visibility at checkout to eliminate stock assumption drop-off",
    "Net-30/60/90 billing with credit limits and overdue alerts for institutional accounts",
    "Branded wholesale account portal with your logo and domain",
    "Size run ordering for apparel and footwear with minimum quantity by size",
    "PDF invoice and packing slip generation with PO number and account details",
    "Order history and one-click reorder for in-season replenishment",
  ],
  testimonial: {
    quote:
      "Pre-season used to mean two weeks of phone calls and spreadsheets. We'd still be missing orders from half our school accounts when the window closed. Now pre-season is a portal link we send to every account — orders come in on their own and we see our committed volume in real time. We confirmed 22% more pre-season volume last spring than the year before.",
    name: "Jason T.",
    company: "Midland Athletic Supply",
    industry: "Sporting Goods Distribution",
  },
  sectionTitle: "What changes for sporting goods distributors.",
  featuresTitle: "Everything a sporting goods distributor needs.",
  stats: [
    {
      stat: "15-20%",
      label: "of pre-season committed volume lost to competitors when phone and email pre-orders aren't confirmed quickly enough",
      source: "NSGA Distributor Benchmarking Study 2024",
    },
    {
      stat: "22%",
      label: "more pre-season orders confirmed by Wholesail clients after launching an online pre-order portal for institutional accounts",
      source: "Wholesail client data",
    },
    {
      stat: "< 2 wks",
      label: "from your first call to a fully deployed, branded portal live for your school, gym, and retail accounts",
      source: "Wholesail build average",
    },
  ],
};

export default function Page() {
  return <IndustryPage config={config} />;
}
