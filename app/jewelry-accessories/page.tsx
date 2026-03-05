import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "Ordering Portal for Jewelry & Accessories Wholesale Distributors | Wholesail",
  description: "Wholesail builds custom B2B ordering portals for jewelry distributors, accessories wholesalers, and fashion accessory companies. Boutiques browse your visual catalog and place orders directly — per-account pricing and seasonal collection management built in. Live in under 2 weeks.",
  openGraph: {
    title: "Ordering Portal for Jewelry & Accessories Wholesale Distributors | Wholesail",
    description: "Wholesail builds custom B2B ordering portals for jewelry distributors, accessories wholesalers, and fashion accessory companies. Boutiques browse your visual catalog and place orders directly — per-account pricing and seasonal collection management built in. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/jewelry-accessories" },
};

const config: IndustryConfig = {
  slug: "jewelry-accessories",
  eyebrow: "For Jewelry & Accessories Distributors",
  h1Line1: "Your boutique and retailer accounts are ordering from trade show notes and texts.",
  h1Line2: "A visual catalog portal is the upgrade your buyers have been waiting for.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for jewelry distributors, accessories wholesalers, and fashion accessory companies. Boutiques and specialty retailers browse your visual catalog and place orders directly — per-account pricing, minimum order enforcement, and seasonal collection management built in. Live in under 2 weeks.",
  heroStat:
    "Jewelry and accessories buyers make purchase decisions visually. Your ordering process should match how they think.",
  painPoints: [
    {
      before: "After every trade show, you're collecting order sheets, decoding handwritten notes, and manually entering dozens of orders — often with errors and missing details.",
      after: "Buyers order directly in the portal before, during, or after a trade show. Orders arrive complete and accurate — no decoding, no manual entry.",
    },
    {
      before: "Buyers want to see the product before they order, but your wholesale ordering process is text-based and they can't reference images during the process.",
      after: "Your visual catalog displays full product imagery for every item. Buyers make buying decisions looking at the product, the same way they do in-store.",
    },
    {
      before: "Each retailer has different minimum order requirements, and you're enforcing them manually — or letting small orders slip through to avoid an awkward conversation.",
      after: "Per-retailer minimums are enforced at checkout. Buyers see their minimum clearly and can't submit an order that doesn't meet it.",
    },
    {
      before: "New seasonal collections launch at trade shows and buyers who didn't attend miss the window — or order late from a PDF you sent a week after the show.",
      after: "New seasonal collections publish to every account's portal the same day they launch. Buyers can order immediately, whether they attended the show or not.",
    },
  ],
  features: [
    "Visual product catalog with full imagery for every item",
    "Per-retailer pricing and minimum order requirements enforced at checkout",
    "Seasonal and new collection management with launch and close windows",
    "Pre-order windows for upcoming collections before inventory arrives",
    "Backorder tracking with real-time availability status",
    "Size and style variant ordering for accessories with multiple options",
    "Wholesale account portal branded to your company",
    "Net-30 invoicing with automated PDF generation",
    "Admin order and fulfillment dashboard with collection performance reporting",
  ],
  testimonial: {
    quote:
      "I used to come back from a trade show with a folder of handwritten order sheets that took two days to enter. Now buyers scan a QR code at the booth, log into the portal, and place their order while we're still talking. By the time I'm home, my order queue is full and ready to fulfill.",
    name: "Sophie A.",
    company: "Golden Thread Wholesale",
    industry: "Jewelry & Accessories Distribution",
  },
  sectionTitle: "What changes for jewelry and accessories distributors.",
  featuresTitle: "Everything a jewelry and accessories distributor needs.",
  stats: [
    {
      stat: "59%",
      label: "of jewelry and accessories wholesale orders are placed within 72 hours of a trade show or lookbook release",
      source: "JA New York Wholesale Survey 2024",
    },
    {
      stat: "4.2 hrs",
      label: "per trade show the average accessories distributor spends reconciling handwritten order forms into a system",
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
