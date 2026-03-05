import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Seafood & Meat Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for seafood and specialty meat distributors. Publish today's catch or available cuts — restaurants order directly. Daily availability, per-account pricing, automated invoicing. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Seafood & Meat Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for seafood and specialty meat distributors. Publish today's catch or available cuts — restaurants order directly. Daily availability, per-account pricing, automated invoicing. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/seafood-meat" },
};

const config: IndustryConfig = {
  slug: "seafood-meat",
  eyebrow: "For Seafood & Meat Distributors",
  h1Line1: "Your restaurant clients need to know what's fresh today.",
  h1Line2: "A daily phone blast isn't a system. It's a bottleneck.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for seafood and specialty meat distributors. Publish today's catch or available cuts in your portal — restaurants order directly from their phone. Daily availability updates, per-account pricing, and automated invoicing. Live in under 2 weeks.",
  heroStat:
    "Restaurant chefs make protein purchasing decisions before 9am. Most distributors can't reach them before noon.",
  painPoints: [
    {
      before: "Every morning your team calls or texts 40+ restaurants to share what's available today.",
      after: "Daily availability updates publish to your portal in minutes. Chefs check it when they clock in.",
    },
    {
      before: "Pricing varies by cut, grade, and account — and your reps are quoting from memory.",
      after: "Per-cut pricing tiers are locked to each account's profile. The correct price shows at checkout.",
    },
    {
      before: "Unsold inventory goes to waste because you couldn't reach enough buyers before the cutoff.",
      after: "Flash availability alerts push to your entire account list instantly. Orders come in within the hour.",
    },
    {
      before: "Invoice reconciliation takes hours because verbal orders don't leave a paper trail.",
      after: "Every order is confirmed in writing with a timestamped PDF invoice. Disputes drop to near zero.",
    },
  ],
  features: [
    "Daily availability board updated by your team each morning",
    "Per-cut and per-grade pricing tiers locked to each account",
    "Order cutoff times enforced automatically for daily prep planning",
    "Catch and harvest date tracking displayed on each product listing",
    "Flash availability alerts pushed to accounts for surplus inventory",
    "Branded wholesale portal with your logo and domain",
    "Automated PDF invoice generation on every confirmed order",
    "Delivery route grouping for efficient daily distribution",
    "Order history and one-click reorder for returning restaurant accounts",
  ],
  testimonial: {
    quote:
      "I was sending 50 texts a morning just to let people know what came in on the boat. Now I update the portal in five minutes and the orders roll in. It's a completely different business.",
    name: "Tony R.",
    company: "Gulf Coast Provisions",
    industry: "Seafood & Meat Distribution",
  },
  sectionTitle: "What changes for seafood and meat distributors.",
  featuresTitle: "Everything a seafood and meat distributor needs.",
  stats: [
    {
      stat: "71%",
      label: "of independent restaurants report their protein distributor calls them daily to share availability",
      source: "NRA Purchasing Survey 2024",
    },
    {
      stat: "18%",
      label: "of perishable food inventory is wasted due to poor demand forecasting and manual order processes",
      source: "USDA Food Loss Report",
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
