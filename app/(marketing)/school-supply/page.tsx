import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for School & Office Supply Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for school and office supply distributors. Schools, districts, and institutional buyers order online — contract pricing, purchase orders, and Net terms built in. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for School & Office Supply Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for school and office supply distributors. Contract pricing, purchase order workflows, and institutional billing in one portal. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/school-supply" },
};

const config: IndustryConfig = {
  slug: "school-supply",
  eyebrow: "For School & Office Supply Distributors",
  h1Line1: "Back-to-school season is 60% of your annual revenue.",
  h1Line2: "It shouldn't depend on phone calls and fax orders.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for school and office supply distributors. Schools, districts, and institutional buyers order online — with contract pricing, purchase order workflows, and Net-30 billing built in. Live in under 2 weeks.",
  heroStat:
    "School districts that shift to online procurement reduce administrative ordering time by 65% and reduce order errors by 40% compared to phone and fax.",
  painPoints: [
    {
      before: "School districts send purchase orders via email or fax, you manually enter them, and errors happen every other week because handwriting is illegible.",
      after: "Purchasing directors submit POs directly through the portal. Orders are digital from the moment they're placed. No transcription, no lost faxes, no Monday-morning error corrections.",
    },
    {
      before: "Every district has a different contract price — and your reps need to confirm pricing before every order to avoid a billing dispute.",
      after: "Contract pricing is locked to each district or institutional account at the portal level. The buyer sees their price. Billing matches what they ordered. No disputes.",
    },
    {
      before: "August is chaos — every account needs everything at once and you can't tell who's confirmed versus who's still getting budget approval.",
      after: "Orders are confirmed in writing the moment they're placed. You see committed August volume in June. Staffing and inventory planning is based on real numbers.",
    },
    {
      before: "Net-30 on institutional accounts means 45-to-60-day actual payment cycles, and tracking them across 60 accounts is a billing nightmare.",
      after: "Payment terms are configured once per account and automated. Invoices generate on shipment. Overdue alerts track every account automatically — no spreadsheet required.",
    },
  ],
  features: [
    "Purchase order upload and digital PO submission workflow",
    "Contract pricing locked to each institutional account's negotiated rates",
    "Catalog organized by school supply category, classroom, and office use case",
    "Seasonal demand pre-ordering with defined back-to-school windows",
    "Standing order automation for recurring consumable replenishment",
    "Net-30/60/90 billing with purchase order number tracking per invoice",
    "Branded wholesale account portal with your logo and domain",
    "Multi-location support for districts ordering to multiple school sites",
    "PDF invoice and packing list with PO reference numbers included",
    "Order history and one-click reorder for returning institutional buyers",
  ],
  testimonial: {
    quote:
      "Purchasing directors used to fax us purchase orders. We would lose one a week. Now every order is digital, every PO is logged in the portal, and invoices match exactly what was ordered. Our August cycle went from three weeks of firefighting to one week of clean execution.",
    name: "Carol B.",
    company: "Northeast Educational Supply",
    industry: "School & Office Supply Distribution",
  },
  sectionTitle: "What changes for school and office supply distributors.",
  featuresTitle: "Everything a school supply distributor needs.",
  stats: [
    {
      stat: "65%",
      label: "reduction in administrative ordering time when districts shift to online procurement",
      source: "AASA Technology in Schools Report 2024",
    },
    {
      stat: "40%",
      label: "fewer order errors when schools submit digitally vs. phone and fax",
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
