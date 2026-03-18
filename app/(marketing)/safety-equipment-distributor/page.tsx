import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Safety Equipment & PPE Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for safety equipment and PPE distributors. Construction companies, manufacturers, and facility managers order online — compliance documentation, standing replenishment, and Net-30 billing. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Safety Equipment & PPE Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for safety equipment distributors. Compliance documentation and standing replenishment handled automatically. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/safety-equipment-distributor" },
};

const config: IndustryConfig = {
  slug: "safety-equipment-distributor",
  eyebrow: "For Safety Equipment & PPE Distributors",
  h1Line1: "OSHA compliance deadlines don't wait for your team to return",
  h1Line2: "from lunch to process the purchase order.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for safety equipment and PPE distributors. Construction companies, manufacturers, and facility managers order online — compliance documentation attached at the product level, standing replenishment for consumables, and Net-30 billing for institutional accounts. Live in under 2 weeks.",
  heroStat:
    "Safety supply distributors spend an average of 6+ hours per week on PO processing and compliance document requests that could be handled automatically through a self-service portal.",
  painPoints: [
    {
      before: "Construction site managers need SDS sheets and ANSI/OSHA compliance certificates for every product they purchase — they call your office to request them after the order ships, and your team manually emails each document.",
      after: "SDS sheets, ANSI ratings, and OSHA compliance certificates are attached at the product level in the portal. Accounts download documentation themselves at order or any time afterward. Your team doesn't touch it.",
    },
    {
      before: "Consumable PPE — gloves, disposable respirators, safety glasses — runs out unpredictably on job sites and the site manager places an emergency order you can't always fulfill same-day.",
      after: "Standing replenishment orders auto-generate on account-defined intervals. Site managers set par levels and the portal places the order before they run out. Emergency orders drop by half.",
    },
    {
      before: "You serve accounts across construction, manufacturing, and warehousing — each with different PPE requirements, different ANSI standards, and different pricing agreements — and your reps struggle to keep it straight.",
      after: "Each account sees only the product catalog relevant to their industry segment and their negotiated pricing. A construction account never sees warehouse-specific products. Pricing is locked per account — no rep guesswork.",
    },
    {
      before: "Large facility accounts require PO approval workflows before an order can ship — your team receives the order, waits for the approval email, and sits on inventory while the account's procurement team moves slowly.",
      after: "Multi-level PO approval workflows are built into the portal. Orders route to the account's designated approver automatically. You see the order status in real time. Nothing ships until the workflow clears.",
    },
  ],
  features: [
    "SDS sheets, ANSI ratings, and OSHA compliance docs attached at the product level and downloadable by accounts",
    "Standing replenishment automation with par levels for consumable PPE and disposables",
    "Per-account catalog segmentation — construction, manufacturing, and warehouse accounts see relevant products only",
    "Multi-level PO approval workflow for large facility and institutional accounts",
    "Per-account pricing locked to negotiated rates with no rep override required",
    "Net-30/60/90 billing with credit limits and overdue alerts for institutional accounts",
    "Branded wholesale account portal with your logo and domain",
    "Compliance expiration tracking for dated certifications and product recalls",
    "PDF invoice and packing slip generation with product compliance reference numbers",
    "Order history and one-click reorder for job-site consumable replenishment",
  ],
  testimonial: {
    quote:
      "Our construction accounts were calling us every week for SDS sheets — we had someone spending half their day just emailing compliance documents. The portal attaches everything at the product level and accounts pull it themselves. That alone justified the build. On top of that, standing orders mean our consumable accounts almost never run out mid-job anymore.",
    name: "Rachel F.",
    company: "Ironguard Safety Supply",
    industry: "Safety Equipment Distribution",
  },
  sectionTitle: "What changes for safety equipment distributors.",
  featuresTitle: "Everything a safety equipment distributor needs.",
  stats: [
    {
      stat: "6+ hrs",
      label: "per week the average safety supply distributor spends processing POs and fielding compliance document requests",
      source: "ISEA Distributor Operations Report 2024",
    },
    {
      stat: "68%",
      label: "of PPE stockout incidents on job sites occur because consumable replenishment is managed manually rather than through automated standing orders",
      source: "NSC Supply Chain Safety Study 2023",
    },
    {
      stat: "< 2 wks",
      label: "from your first call to a fully deployed, branded portal live for your construction, manufacturing, and facility accounts",
      source: "Wholesail build average",
    },
  ],
};

export default function Page() {
  return <IndustryPage config={config} />;
}
