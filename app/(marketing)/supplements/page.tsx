import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "Ordering Portal for Supplement & Nutraceutical Distributors | Wholesail",
  description: "Wholesail builds custom B2B ordering portals for supplement distributors, nutraceutical wholesalers, and health product distributors. Health stores, gyms, and wellness retailers order from your branded catalog — per-account pricing and compliance docs included. Live in under 2 weeks.",
  openGraph: {
    title: "Ordering Portal for Supplement & Nutraceutical Distributors | Wholesail",
    description: "Wholesail builds custom B2B ordering portals for supplement distributors, nutraceutical wholesalers, and health product distributors. Health stores, gyms, and wellness retailers order from your branded catalog — per-account pricing and compliance docs included. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/supplements" },
};

const config: IndustryConfig = {
  slug: "supplements",
  eyebrow: "For Supplement & Nutraceutical Distributors",
  h1Line1: "Your health store and gym accounts are reordering by email guess.",
  h1Line2: "A branded portal makes you the easiest vendor they work with.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for supplement distributors, nutraceutical wholesalers, and health product distributors. Health stores, gyms, and wellness retailers order from your branded catalog — per-account pricing, label compliance docs, and automated invoicing included. Live in under 2 weeks.",
  heroStat:
    "Health product buyers are researching and reordering constantly. Your portal should be as easy as Amazon.",
  painPoints: [
    {
      before: "Health stores and gyms email a rough reorder request every few weeks and your reps spend an hour interpreting what they need and entering it manually.",
      after: "Accounts view their full order history and reorder with one click. Reorders are accurate, fast, and entered directly — no rep time required.",
    },
    {
      before: "Label and compliance documentation has to be requested separately from orders, and it's handled by email thread with no tracking.",
      after: "Label and compliance documents attach automatically to every product ordered. Retailers always have what they need for their shelves.",
    },
    {
      before: "Each retail account has different pricing based on volume and terms, but reps are quoting manually and invoices require correction after the fact.",
      after: "Per-retailer pricing is configured per account. The price shown in the portal is the price on the invoice — no quoting, no corrections.",
    },
    {
      before: "New product launches require sending email blasts to every account and following up to see if anyone placed an order.",
      after: "New products publish to every active account's portal instantly. Accounts see new arrivals the moment they log in and can order same day.",
    },
  ],
  features: [
    "Full supplement catalog organized by category and brand",
    "Per-account pricing tiers for gyms, health stores, and key accounts",
    "Label and compliance document delivery per product ordered",
    "Subscription and recurring reorder tools for high-frequency buyers",
    "New product launch announcements pushed to all active accounts",
    "Gym and retail account segmentation with separate catalog views",
    "Volume discount configuration for large quantity orders",
    "Net terms invoicing with automated PDF generation",
    "Admin dashboard with account activity and fulfillment tracking",
  ],
  testimonial: {
    quote:
      "Our gym accounts used to email us every two or three weeks with a rough list and we'd spend an hour figuring out what they actually wanted. Now they log in, see exactly what they ordered last time, and hit reorder. It takes them two minutes.",
    name: "Amy R.",
    company: "Core Nutrition Wholesale",
    industry: "Supplement Distribution",
  },
  sectionTitle: "What changes for supplement and nutraceutical distributors.",
  featuresTitle: "Everything a supplement distributor needs.",
  stats: [
    {
      stat: "61%",
      label: "of supplement and health product distributors still process retail reorders manually",
      source: "NBJ Industry Survey 2024",
    },
    {
      stat: "3.2x",
      label: "more frequent reorders when supplement accounts have a self-service portal",
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
