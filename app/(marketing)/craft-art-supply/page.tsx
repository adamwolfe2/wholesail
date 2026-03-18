import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "Ordering Portal for Craft & Art Supply Distributors | Wholesail",
  description: "Wholesail builds custom B2B ordering portals for craft supply distributors, art material wholesalers, and hobby product companies. Independent craft stores browse your full searchable catalog — per-account pricing, seasonal promotions, and net-30 billing included. Live in under 2 weeks.",
  openGraph: {
    title: "Ordering Portal for Craft & Art Supply Distributors | Wholesail",
    description: "Wholesail builds custom B2B ordering portals for craft supply distributors, art material wholesalers, and hobby product companies. Independent craft stores browse your full searchable catalog — per-account pricing, seasonal promotions, and net-30 billing included. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/craft-art-supply" },
};

const config: IndustryConfig = {
  slug: "craft-art-supply",
  eyebrow: "For Craft & Art Supply Distributors",
  h1Line1: "Your independent craft stores are ordering from a 200-page catalog by phone.",
  h1Line2: "A searchable online catalog changes everything.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for craft supply distributors, art material wholesalers, and hobby product companies. Independent craft stores and art supply retailers browse your full catalog online — searchable by category, brand, and medium. Per-account pricing, seasonal promotions, and net-30 billing included. Live in under 2 weeks.",
  heroStat:
    "Independent craft retailers carry thousands of SKUs. Help them find and reorder what sells without picking up a phone.",
  painPoints: [
    {
      before: "Store owners call in orders by reading product names out of a 200-page print catalog, and your reps spend hours on the phone navigating it alongside them.",
      after: "Store owners search the full catalog by category, brand, or keyword in seconds. They find exactly what they need and add it to cart without a call.",
    },
    {
      before: "Seasonal product launches — holiday collections, back-to-school, seasonal kits — require sending updated catalogs and following up to see if anyone saw them.",
      after: "New seasonal arrivals and featured collections publish to every account's portal automatically. Retailers see new products the moment they log in.",
    },
    {
      before: "Each retailer has a different pricing tier based on volume and terms, and reps quote manually and correct invoices after orders come in.",
      after: "Per-retailer pricing is configured per account. The price shown in the portal is the price on the invoice — no quoting, no corrections.",
    },
    {
      before: "Busy store owners only have time to place orders after their store closes, but your phone lines are shut and they have to wait until the next day.",
      after: "The portal is available 24/7. Store owners browse and place orders after hours from their phone without waiting for your office to open.",
    },
  ],
  features: [
    "Searchable catalog by category, brand, and medium",
    "New arrival and seasonal highlights section with curated collections",
    "Per-retailer pricing tiers configured per account",
    "Promotional pricing windows for sales events and seasonal markdowns",
    "Backorder management with real-time inventory status",
    "Online reorder tools with order history and one-click repeat",
    "Net-30 invoicing with automated PDF generation",
    "Bulk order entry for large seasonal buys",
    "Admin order dashboard with fulfillment tracking and account activity",
  ],
  testimonial: {
    quote:
      "I used to call in my order every month and spend 45 minutes on the phone going through the catalog with a rep. Now I open the portal after we close on Sunday night, search for what I need, and have it submitted in 15 minutes. I order more often because it's so easy.",
    name: "Grace L.",
    company: "Creative Supply Wholesale",
    industry: "Craft & Art Supply Distribution",
  },
  sectionTitle: "What changes for craft and art supply distributors.",
  featuresTitle: "Everything a craft and art supply distributor needs.",
  stats: [
    {
      stat: "64%",
      label: "of independent craft and hobby retailers report catalog complexity as the top ordering friction with their distributor",
      source: "ABCD Craft Industry Survey 2024",
    },
    {
      stat: "3.5 hrs",
      label: "per order the average craft supply rep spends helping accounts navigate large phone-based catalogs",
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
