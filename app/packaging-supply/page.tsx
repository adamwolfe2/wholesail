import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "Ordering Portal for Packaging Supply Distributors | Wholesail",
  description: "Wholesail builds custom B2B ordering portals for packaging distributors, corrugated box suppliers, and industrial packaging wholesalers. Manufacturers order by the case, skid, or truckload — per-account pricing and custom spec management included. Live in under 2 weeks.",
  openGraph: {
    title: "Ordering Portal for Packaging Supply Distributors | Wholesail",
    description: "Wholesail builds custom B2B ordering portals for packaging distributors, corrugated box suppliers, and industrial packaging wholesalers. Manufacturers order by the case, skid, or truckload — per-account pricing and custom spec management included. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/packaging-supply" },
};

const config: IndustryConfig = {
  slug: "packaging-supply",
  eyebrow: "For Packaging Supply Distributors",
  h1Line1: "Your manufacturer and e-commerce accounts order packaging by the pallet.",
  h1Line2: "A phone order process for pallet quantities is a bottleneck.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for packaging distributors, corrugated box suppliers, and industrial packaging wholesalers. Manufacturers, e-commerce businesses, and fulfillment centers order by the case, skid, or truckload — per-account pricing, custom spec management, and automated invoicing included. Live in under 2 weeks.",
  heroStat:
    "Packaging is a recurring purchase. Make reordering effortless and you become an account that never churns.",
  painPoints: [
    {
      before: "Large volume orders — hundreds of cases, multiple skids, custom quantities — take 30 minutes to capture by phone and routinely come in with spec errors.",
      after: "Accounts enter pallet and skid quantities directly in the portal with bulk entry tools. Large orders submit in minutes with zero spec errors.",
    },
    {
      before: "Custom spec orders — non-standard dimensions, branded printing, specific material grades — require back-and-forth by email before production can start.",
      after: "Custom spec requests submit through a structured form in the portal. All required spec information is captured upfront, and production starts without a back-and-forth.",
    },
    {
      before: "Each manufacturer and fulfillment center has contract pricing, but your team adjusts invoices manually after large orders come in by phone.",
      after: "Contract pricing is configured per account in the portal. Large order invoices generate automatically with the correct price — no manual intervention.",
    },
    {
      before: "Lead times and inventory levels for packaging aren't visible to accounts, so they over-order, under-order, or call to check before every purchase.",
      after: "Lead times and inventory thresholds are displayed on every product listing. Accounts order with full visibility into what to expect and when.",
    },
  ],
  features: [
    "Bulk and pallet order entry with case, skid, and truckload quantities",
    "Custom spec request workflow capturing dimensions, print, and material grade",
    "Per-account contract pricing enforced at checkout",
    "Lead time display per product for accurate delivery expectations",
    "Reorder reminders based on order frequency and account history",
    "Inventory alert thresholds with low-stock visibility per product",
    "Sample order management for new spec evaluation",
    "Net-30 and net-60 invoicing with automated PDF generation",
    "Admin fulfillment and production board with custom spec order tracking",
  ],
  testimonial: {
    quote:
      "We were placing our monthly packaging order over the phone and it was taking an hour — reading box dimensions, confirming quantities, verifying the print spec. Now I go into the portal, enter the quantities, submit the custom spec form, and it's done in ten minutes. And we haven't had a spec error since.",
    name: "Lisa H.",
    company: "PackRight Supply",
    industry: "Packaging Supply Distribution",
  },
  sectionTitle: "What changes for packaging supply distributors.",
  featuresTitle: "Everything a packaging supply distributor needs.",
  stats: [
    {
      stat: "70%",
      label: "of packaging distributors process large volume orders via phone or email, leading to spec errors",
      source: "TAPPI Distribution Survey 2024",
    },
    {
      stat: "14%",
      label: "of packaging shipments include a fulfillment error traceable to manual order entry",
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
