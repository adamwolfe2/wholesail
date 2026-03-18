import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "Ordering Portal for Agricultural Supply Distributors | Wholesail",
  description: "Wholesail builds custom B2B ordering portals for agricultural supply distributors, farm co-ops, and agri-input companies. Farmers order seed, fertilizer, and chemicals from the field — seasonal catalog management and Net-30 billing included. Live in under 2 weeks.",
  openGraph: {
    title: "Ordering Portal for Agricultural Supply Distributors | Wholesail",
    description: "Wholesail builds custom B2B ordering portals for agricultural supply distributors, farm co-ops, and agri-input companies. Farmers order seed, fertilizer, and chemicals from the field — seasonal catalog management and Net-30 billing included. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/agricultural-supply" },
};

const config: IndustryConfig = {
  slug: "agricultural-supply",
  eyebrow: "For Agricultural Supply Distributors",
  h1Line1: "Your farmers are ordering seed and inputs in the middle of planting season.",
  h1Line2: "A missed order in April costs them the whole season.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for agricultural supply distributors, farm co-ops, and agri-input companies. Farmers order seed, fertilizer, chemicals, and equipment from their phone or tablet — anytime, even from the field. Seasonal catalog management, per-farm pricing, and Net-30 billing included. Live in under 2 weeks.",
  heroStat:
    "Agricultural purchasing is seasonal and urgent. Your ordering system needs to be faster than the weather.",
  painPoints: [
    {
      before: "During a 3-week planting window, every farmer in your territory calls at once and your reps can't keep up with inbound order volume.",
      after: "Farmers place orders directly in the portal from their phone or tablet — day or night, without waiting for a rep. Your team focuses on fulfillment, not phone intake.",
    },
    {
      before: "Seasonal catalog changes — new seed varieties, discontinued chemicals, updated input packages — have to be communicated by phone or printed flyer.",
      after: "Seasonal catalog updates publish instantly. Every farm account sees the current available products the moment they log in.",
    },
    {
      before: "Every farm account has different negotiated pricing and credit terms, and reps spend time quoting and adjusting invoices after every order.",
      after: "Per-farm pricing and credit terms are configured per account. Each farmer sees their correct price at checkout — no callbacks, no invoice corrections.",
    },
    {
      before: "Farmers in the field can't call in — and by the time they get to a landline, the product they needed is on backorder.",
      after: "Mobile-first portal works on any smartphone with a browser. Farmers order from the cab of a tractor if they need to.",
    },
  ],
  features: [
    "Seasonal catalog management with availability windows per product",
    "Per-farm pricing tiers and credit term configuration",
    "Mobile-first ordering interface optimized for field use",
    "Order history and one-click reorder for recurring inputs",
    "Credit account management with balance and limit visibility",
    "Chemical and compliance documentation delivery per product",
    "Delivery scheduling with date selection and field address capture",
    "Bulk order entry for large input purchases by the ton or pallet",
    "Admin crop-season reporting by product, account, and delivery date",
  ],
  testimonial: {
    quote:
      "I ordered fertilizer from the cab of my tractor at 7pm during planting. It was at the co-op the next morning. I don't know why it took this long for someone to build this, but I'm not going back to calling in orders.",
    name: "Bill C.",
    company: "Heartland Agri Supply",
    industry: "Agricultural Supply Distribution",
  },
  sectionTitle: "What changes for agricultural supply distributors.",
  featuresTitle: "Everything an agricultural supply distributor needs.",
  stats: [
    {
      stat: "78%",
      label: "of agricultural supply distributors see 60%+ of annual order volume in a 6-week planting window",
      source: "ARA Distribution Report 2024",
    },
    {
      stat: "4.5 hrs",
      label: "per day during peak season spent on inbound order calls from farm accounts",
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
