import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "Ordering Portal for Office & Breakroom Supply Distributors | Wholesail",
  description: "Wholesail builds custom B2B ordering portals for office supply distributors and breakroom supply companies. Office managers set up recurring orders for coffee, paper, and cleaning supplies — orders generate automatically every week or month. Live in under 2 weeks.",
  openGraph: {
    title: "Ordering Portal for Office & Breakroom Supply Distributors | Wholesail",
    description: "Wholesail builds custom B2B ordering portals for office supply distributors and breakroom supply companies. Office managers set up recurring orders for coffee, paper, and cleaning supplies — orders generate automatically every week or month. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/office-breakroom" },
};

const config: IndustryConfig = {
  slug: "office-breakroom",
  eyebrow: "For Office & Breakroom Supply Distributors",
  h1Line1: "Your office manager accounts are placing standing orders by spreadsheet and email.",
  h1Line2: "Automate recurring orders and they never leave you.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for office supply distributors, breakroom supply companies, and facilities consumables distributors. Office managers set up recurring orders for coffee, paper, cleaning supplies, and kitchen staples — orders generate automatically every week or month. Per-account pricing and net-30 invoicing included. Live in under 2 weeks.",
  heroStat:
    "Office and breakroom supplies are predictable recurring purchases. Automate them and you remove the only reason an account switches.",
  painPoints: [
    {
      before: "Office managers email the same order every month with minor variations, and your team re-enters it manually each time — wasting time on both sides.",
      after: "Office managers configure a recurring order schedule once in the portal. Orders generate automatically on their selected frequency without anyone touching them.",
    },
    {
      before: "Multi-location offices have different approved product lists for each location, and managing these per-location catalogs is a manual spreadsheet nightmare.",
      after: "Each office location has its own approved product list configured in the portal. Location managers only see and order from their approved catalog.",
    },
    {
      before: "Companies with multiple delivery locations require a separate order or phone call for each site, and your team routes deliveries manually.",
      after: "A single order can include multiple delivery destinations. Accounts manage their location list in the portal and assign products to each site at checkout.",
    },
    {
      before: "Net-30 invoicing is delayed because orders have to be manually reconciled before billing runs — which means cash flow is always lagging.",
      after: "Invoices generate automatically when orders are confirmed. Net-30 accounts receive a PDF invoice the same day the order is placed.",
    },
  ],
  features: [
    "Recurring order scheduling by week, month, or custom interval",
    "Per-office approved product lists with location-specific catalogs",
    "Multi-location delivery management from a single order",
    "Per-account pricing tiers for volume and key accounts",
    "Breakroom catalog organized by category — coffee, paper, cleaning, kitchen",
    "Net-30 and net-60 invoicing with automated PDF generation",
    "Automated payment reminders for outstanding invoices",
    "Usage tracking by office location and product category",
    "Admin fulfillment dashboard with recurring order management",
  ],
  testimonial: {
    quote:
      "I used to spend two hours every month putting together the same order in a spreadsheet and emailing it in. Now I have it set up as a recurring order and I haven't thought about it in four months. It just shows up. That's exactly what I needed.",
    name: "Jessica M.",
    company: "Cornerstone Office Supply",
    industry: "Office & Breakroom Distribution",
  },
  sectionTitle: "What changes for office and breakroom supply distributors.",
  featuresTitle: "Everything an office and breakroom supply distributor needs.",
  stats: [
    {
      stat: "82%",
      label: "of office supply reorders are for the same products and quantities ordered the previous period",
      source: "BSDA Supply Report 2024",
    },
    {
      stat: "2.8 hrs",
      label: "per week office managers spend manually reordering supplies when self-service is not available",
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
