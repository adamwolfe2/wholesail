import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "Ordering Portal for Chemical & Industrial Chemical Distributors | Wholesail",
  description: "Wholesail builds custom B2B ordering portals for industrial chemical distributors and specialty chemical suppliers. Manufacturers order approved chemicals with SDS documentation and compliance tracking built in. Live in under 2 weeks.",
  openGraph: {
    title: "Ordering Portal for Chemical & Industrial Chemical Distributors | Wholesail",
    description: "Wholesail builds custom B2B ordering portals for industrial chemical distributors and specialty chemical suppliers. Manufacturers order approved chemicals with SDS documentation and compliance tracking built in. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/chemical-supply" },
};

const config: IndustryConfig = {
  slug: "chemical-supply",
  eyebrow: "For Chemical Supply Distributors",
  h1Line1: "Your industrial accounts need chemicals with proper documentation.",
  h1Line2: "That's not something you can manage over the phone.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for industrial chemical distributors, specialty chemical suppliers, and chemical packaging companies. Manufacturers and facilities order approved chemicals with SDS documentation and compliance tracking built in. Per-account approved product lists and purchase authorization workflows included. Live in under 2 weeks.",
  heroStat:
    "Chemical purchasing requires compliance. Your ordering process should enforce it automatically, not hope someone remembers.",
  painPoints: [
    {
      before: "Every order requires an SDS document, but your team manually attaches them to order confirmations — which means they're often missing or delayed.",
      after: "SDS documents attach automatically to every order confirmation and invoice. Compliance documentation is never missing, never late.",
    },
    {
      before: "Each industrial account is approved for a specific list of chemicals, but off-list orders still come in and have to be manually rejected and re-entered.",
      after: "Each account's portal displays only their approved product list. Off-list ordering is impossible — compliance is enforced by the system, not by a rep.",
    },
    {
      before: "Large chemical purchases require authorization from a plant manager, but your reps are chasing approvals by phone and email before they can process the order.",
      after: "Purchase authorization workflows are built into the portal. Orders above a threshold automatically route to the designated approver before processing.",
    },
    {
      before: "Regulatory record-keeping is a spreadsheet nightmare — orders, SDS documents, account approvals, and shipment records stored in five different places.",
      after: "Every order, document, and approval is logged in one place. Regulatory audits become a report download instead of a week of digging.",
    },
  ],
  features: [
    "SDS document delivery attached to every order confirmation and invoice",
    "Per-account approved product lists with off-list blocking",
    "Purchase authorization workflows for orders above configurable thresholds",
    "Compliance record keeping with full order and document audit trail",
    "Hazmat shipping documentation generated per applicable order",
    "Per-account pricing and payment terms configuration",
    "Bulk order entry for large industrial purchase quantities",
    "Regulatory reporting by account, product, and date range",
    "Admin order dashboard with compliance status tracking per order",
  ],
  testimonial: {
    quote:
      "We were manually attaching SDS sheets to every order confirmation and it was taking one of my team members two hours a day. Now the portal does it automatically. Compliance is just handled. We haven't had a documentation dispute in months.",
    name: "Frank D.",
    company: "Allied Chemical Supply",
    industry: "Chemical Supply Distribution",
  },
  sectionTitle: "What changes for chemical supply distributors.",
  featuresTitle: "Everything a chemical supply distributor needs.",
  stats: [
    {
      stat: "81%",
      label: "of chemical distributors cite compliance documentation as their top order processing bottleneck",
      source: "CDA Distribution Survey 2024",
    },
    {
      stat: "6.5 hrs",
      label: "per week spent by chemical supply reps manually attaching SDS documents to orders",
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
