import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Flooring Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for flooring distributors. Contractors, interior designers, and retail flooring accounts order online — complex SKU management, per-account contractor pricing, and Net-30 billing. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Flooring Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for flooring distributors. Roll dimensions, box counts, and room estimates handled automatically. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/flooring-distributor" },
};

const config: IndustryConfig = {
  slug: "flooring-distributor",
  eyebrow: "For Flooring Distributors",
  h1Line1: "Your flooring contractors order by the roll, by the box, and by the room.",
  h1Line2: "Your current ordering system doesn't know the difference.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for flooring distributors. Contractors, interior designers, and retail flooring accounts order online — with complex SKU management (roll dimensions, box counts, room estimates), per-account contractor pricing, and Net-30 billing all handled automatically. Live in under 2 weeks.",
  heroStat:
    "Flooring distributors managing complex SKU variants (roll/box/sqft) by phone spend an average of 8 hours per week clarifying order specifications and correcting miscommunications.",
  painPoints: [
    {
      before: "Contractors call in orders specifying square footage, but your system only tracks by box or roll — your team manually converts every order and mistakes get cut into the job site.",
      after: "The portal lets accounts order by square foot, box, or roll — your configured conversion logic handles the math automatically. Orders arrive in exact units you actually fulfill.",
    },
    {
      before: "You have three contractor tiers, two designer discount levels, and retail pricing — and your reps quote different rates depending on who picks up the phone.",
      after: "Per-account pricing is configured once at the portal level. Contractors see their tier price. Designers see their program price. No reps involved, no discrepancies, no disputes.",
    },
    {
      before: "Big commercial jobs require dye lot matching across multiple rolls — contractors don't know to ask, and you find out the order is wrong after it ships.",
      after: "Dye lot and run number fields are required at checkout for commercial quantities. Accounts capture the matching requirement before the order is placed, not after delivery.",
    },
    {
      before: "Your showroom accounts run out of sample inventory and call your office to request restocks — the same 12 samples, every 6 weeks, by phone.",
      after: "Sample and swatch replenishment runs as a standing order on each showroom account's schedule. They get automatic restock alerts and confirm in a single click.",
    },
  ],
  features: [
    "Unit-of-measure flexibility — order by roll, box, square foot, or linear foot per product",
    "Dye lot and run number capture required for commercial-quantity line items",
    "Per-account contractor, designer, and retail tier pricing with locked rates",
    "Sample and swatch standing order automation for showroom accounts",
    "Product spec sheets and installation guides attached at the SKU level",
    "Net-30/60/90 billing with credit limits and overdue account alerts",
    "Branded wholesale account portal with your logo and domain",
    "Commercial project quoting with room-by-room estimate builder",
    "Minimum order quantity enforcement per product and account type",
    "Order history and one-click reorder for repeat job-site purchases",
  ],
  testimonial: {
    quote:
      "We were manually converting square footage to boxes on every contractor order — and we still got it wrong enough to cause real problems on job sites. The portal does the conversion automatically, captures dye lot requirements upfront, and our contractor accounts actually prefer ordering this way. Returns are down and our order desk has time to do something other than math.",
    name: "Derek M.",
    company: "Cascade Flooring Supply",
    industry: "Flooring Distribution",
  },
  sectionTitle: "What changes for flooring distributors.",
  featuresTitle: "Everything a flooring distributor needs.",
  stats: [
    {
      stat: "8 hrs",
      label: "per week the average flooring distributor spends clarifying SKU specifications and correcting order miscommunications by phone",
      source: "FCICA Distributor Operations Report 2024",
    },
    {
      stat: "42%",
      label: "of commercial flooring order errors originate from unit-of-measure mismatches between contractor request and distributor fulfillment",
      source: "WFCA Industry Survey 2023",
    },
    {
      stat: "< 2 wks",
      label: "from your first call to a fully deployed, branded portal live for your contractor and retail accounts",
      source: "Wholesail build average",
    },
  ],
};

export default function Page() {
  return <IndustryPage config={config} />;
}
