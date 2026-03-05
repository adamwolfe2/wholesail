import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "Ordering Portal for Janitorial & Sanitation Supply Distributors | Wholesail",
  description: "Wholesail builds custom B2B ordering portals for jan-san distributors and facilities supply companies. Facility managers order online — contract pricing, PO capture, and approved product lists built in. Live in under 2 weeks.",
  openGraph: {
    title: "Ordering Portal for Janitorial & Sanitation Supply Distributors | Wholesail",
    description: "Wholesail builds custom B2B ordering portals for jan-san distributors and facilities supply companies. Facility managers order online — contract pricing, PO capture, and approved product lists built in. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/jan-san" },
};

const config: IndustryConfig = {
  slug: "jan-san",
  eyebrow: "For Janitorial & Sanitation Distributors",
  h1Line1: "Your facility managers are emailing orders to five reps at once.",
  h1Line2: "A self-service portal ends the chaos.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for jan-san distributors and facilities supply companies. Facility managers and property management companies order online — approved products, contract pricing, and PO number capture built in. No more email chains. Live in under 2 weeks.",
  heroStat:
    "Facility managers juggle dozens of vendors. Make ordering from you frictionless and you become the default.",
  painPoints: [
    {
      before: "Every account has different contract pricing, but your reps are manually checking spreadsheets and correcting invoices after the fact.",
      after: "Contract pricing is enforced per account at checkout. Facility managers always see their correct price — no corrections, no disputes.",
    },
    {
      before: "Accounts place orders without PO numbers and your accounting team spends hours chasing them down before invoicing.",
      after: "PO number is required at order placement. Every order arrives with the PO attached — invoicing runs clean.",
    },
    {
      before: "Facility managers order off-contract products and your reps spend time reversing orders and re-educating accounts.",
      after: "Each facility account only sees their approved product list. Off-contract ordering is impossible by design.",
    },
    {
      before: "Net-30 account invoicing is slow because orders have to move through a manual reconciliation step before billing can happen.",
      after: "Invoices generate automatically on confirmed orders. Net-30 accounts get a clean PDF invoice the same day they order.",
    },
  ],
  features: [
    "Contract pricing per account enforced at checkout",
    "PO number capture and tracking required at order placement",
    "Approved SKU lists configured per facility account",
    "Bulk ordering tools for high-volume facility managers",
    "Compliance and safety data sheet documentation delivery",
    "Usage reporting by account and product category",
    "Net-30 and net-60 invoicing with PDF generation",
    "Automated payment reminders for outstanding invoices",
    "Admin dashboard with order management and fulfillment tracking",
  ],
  testimonial: {
    quote:
      "Our facility managers used to email three different reps and hope someone caught the order. Now they log into the portal, see their contract pricing, put in the PO, and they're done in two minutes. The email chain is gone.",
    name: "Robert H.",
    company: "CleanPath Supply Co.",
    industry: "Janitorial & Sanitation Distribution",
  },
  sectionTitle: "What changes for janitorial and sanitation distributors.",
  featuresTitle: "Everything a jan-san distributor needs.",
  stats: [
    {
      stat: "64%",
      label: "of janitorial supply distributors process the majority of orders via email or phone",
      source: "ISSA Distribution Report 2024",
    },
    {
      stat: "3.8 hrs",
      label: "per day spent by jan-san reps on order entry, PO matching, and invoice reconciliation",
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
