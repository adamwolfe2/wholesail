import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "Ordering Portal for Automotive Parts Distributors | Wholesail",
  description: "Wholesail builds custom B2B ordering portals for auto parts distributors and automotive wholesale suppliers. Shops search by part number or fitment and order directly — live inventory, per-account pricing, and same-day cut-offs included. Live in under 2 weeks.",
  openGraph: {
    title: "Ordering Portal for Automotive Parts Distributors | Wholesail",
    description: "Wholesail builds custom B2B ordering portals for auto parts distributors and automotive wholesale suppliers. Shops search by part number or fitment and order directly — live inventory, per-account pricing, and same-day cut-offs included. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/auto-parts" },
};

const config: IndustryConfig = {
  slug: "auto-parts",
  eyebrow: "For Automotive Parts Distributors",
  h1Line1: "Your shops are calling to check if you have the part before they order.",
  h1Line2: "Live inventory lookup ends the hold music.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for auto parts distributors, automotive wholesale suppliers, and shop supply companies. Mechanics and shop owners search by part number or vehicle fitment and place orders directly — live inventory, per-account pricing, and same-day delivery cut-offs included. Live in under 2 weeks.",
  heroStat:
    "Mechanics need the part today. Every minute they spend on hold with you is a minute they spend looking elsewhere.",
  painPoints: [
    {
      before: "Shops call four times a day just to check if a part is in stock before they even think about ordering — tying up your counter staff constantly.",
      after: "Live inventory is visible in the portal by part number, make, and model. Shops check availability in 10 seconds and place the order without calling.",
    },
    {
      before: "Part number searches over the phone require your staff to navigate multiple systems and read numbers back — it's slow and error-prone.",
      after: "Shops search by part number, OEM number, or vehicle fitment directly in the portal. Results appear instantly with stock levels and pricing.",
    },
    {
      before: "Same-day delivery cut-offs are communicated by word of mouth, and shops miss the window and blame you when their part doesn't arrive.",
      after: "Same-day cut-off countdowns are displayed on every product page. Shops see exactly how long they have to order for same-day delivery.",
    },
    {
      before: "Each shop has different negotiated pricing and credit terms, and your team adjusts invoices manually after orders come in by phone.",
      after: "Per-shop pricing and credit terms are built into every account. The price a shop sees in the portal is the price on the invoice — no adjustments.",
    },
  ],
  features: [
    "Part number and vehicle fitment search with live results",
    "Live inventory by warehouse location and quantity",
    "Same-day order cut-off countdown display per delivery zone",
    "Per-shop pricing tiers configured per account",
    "Core return tracking and credit management",
    "Delivery route scheduling with estimated arrival times",
    "Shop credit account management with balance visibility",
    "Order confirmation with ETA for same-day and next-day orders",
    "Admin fulfillment dashboard with order routing and dispatch tools",
  ],
  testimonial: {
    quote:
      "We used to get 60 inbound calls a day, half of them just asking if we had a part in stock. Now our shops check inventory online, place the order, and we see it in the fulfillment queue. Call volume is down more than half and we haven't lost a single account.",
    name: "Steve L.",
    company: "Pro Auto Parts Distribution",
    industry: "Automotive Parts Distribution",
  },
  sectionTitle: "What changes for automotive parts distributors.",
  featuresTitle: "Everything an auto parts distributor needs.",
  stats: [
    {
      stat: "69%",
      label: "of independent auto shops report calling their parts distributor at least 3 times per day to check availability",
      source: "SEMA Aftermarket Survey 2024",
    },
    {
      stat: "$2,800",
      label: "estimated annual revenue lost per shop account from delayed or missed same-day part orders",
      source: "Wholesail estimate",
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
