import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "Ordering Portal for Tobacco & Vape Distributors | Wholesail",
  description: "Wholesail builds custom B2B ordering portals for tobacco distributors, vape product wholesalers, and convenience store suppliers. C-stores order from a regulated product catalog — compliance enforcement and automated invoicing included. Live in under 2 weeks.",
  openGraph: {
    title: "Ordering Portal for Tobacco & Vape Distributors | Wholesail",
    description: "Wholesail builds custom B2B ordering portals for tobacco distributors, vape product wholesalers, and convenience store suppliers. C-stores order from a regulated product catalog — compliance enforcement and automated invoicing included. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/tobacco-vape" },
};

const config: IndustryConfig = {
  slug: "tobacco-vape",
  eyebrow: "For Tobacco & Vape Distributors",
  h1Line1: "Your convenience store accounts order by text and forget half the SKUs.",
  h1Line2: "A branded portal fixes that — and enforces compliance automatically.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for tobacco distributors, vape product wholesalers, and convenience store suppliers. C-stores and smoke shops order from a regulated product catalog — per-account approved product lists, age-verified account management, and automated invoicing included. Live in under 2 weeks.",
  heroStat:
    "C-store tobacco buyers reorder weekly. Every friction point in your ordering process is a competitor's opportunity.",
  painPoints: [
    {
      before: "C-store managers text orders to a rep number every week, and reps spend mornings decoding messages and entering orders manually — with errors on both sides.",
      after: "Store managers place weekly reorders directly in the portal. Orders are complete, accurate, and entered with zero rep involvement.",
    },
    {
      before: "Compliance and age-verification requirements vary by account type, and your team is manually tracking which accounts are cleared for which products.",
      after: "Compliance status and age-verification are enforced per account in the portal. Accounts can only see and order products they are approved to purchase.",
    },
    {
      before: "Promotional pricing for specific stores changes weekly and keeping reps updated leads to pricing errors and margin leakage on every promo cycle.",
      after: "Promotional pricing is managed in the portal admin and publishes automatically. Each account sees their current promo price without any rep involvement.",
    },
    {
      before: "Regulatory documentation — product compliance records, age-restriction acknowledgments — is tracked in spreadsheets and hard to audit.",
      after: "All regulatory documents are stored per account in the portal. Compliance records are always current and audit-ready.",
    },
  ],
  features: [
    "Per-account approved product catalog with restricted SKU blocking",
    "Compliance and age-verification enforcement per account",
    "Weekly reorder tools with one-click repeat of previous orders",
    "Promotional pricing management with automatic account-level application",
    "Regulatory document delivery and storage per account",
    "Per-store pricing tiers for volume and key accounts",
    "Branded wholesale account portal for each store",
    "Net terms invoicing with automated PDF and payment tracking",
    "Admin fulfillment dashboard with compliance status per order",
  ],
  testimonial: {
    quote:
      "My reps were fielding texts at 7am from c-store managers placing their weekly tobacco order. Half the SKUs were wrong and we were fixing orders all morning. Now the stores log into the portal, see their approved products, and place the order themselves. It's been a completely different operation.",
    name: "Marcus B.",
    company: "Mid-State Tobacco & Vape",
    industry: "Tobacco & Vape Distribution",
  },
  sectionTitle: "What changes for tobacco and vape distributors.",
  featuresTitle: "Everything a tobacco and vape distributor needs.",
  stats: [
    {
      stat: "77%",
      label: "of tobacco and vape distributors report order processing via phone and text as their primary method",
      source: "CSNEWS Distribution Survey 2024",
    },
    {
      stat: "Weekly",
      label: "reorder cycle for most convenience store tobacco and vape accounts — consistency requires automation",
      source: "Wholesail customer data",
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
