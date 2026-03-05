import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Coffee & Tea Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for specialty coffee roasters, tea importers, and beverage distributors. Cafes and retailers order online — no calls, no texts required. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Coffee & Tea Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for specialty coffee roasters, tea importers, and beverage distributors. Cafes and retailers order online — no calls, no texts required. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/coffee-tea" },
};

const config: IndustryConfig = {
  slug: "coffee-tea",
  eyebrow: "For Coffee & Tea Distributors",
  h1Line1: "Your coffee accounts are calling to check availability at 7am.",
  h1Line2: "Your team hasn't started yet. That's lost revenue.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for specialty coffee roasters, tea importers, and beverage distributors. Cafes and retailers order online — no call, no text, no rep required. Standing orders auto-replenish weekly. Live in under 2 weeks.",
  heroStat:
    "Most coffee distributors handle 60–80% of their order volume over the phone. That ends when you launch.",
  painPoints: [
    {
      before: "Cafes call or text your reps before opening to place standing orders — every single week.",
      after: "Standing orders auto-replenish on a schedule your accounts control. No call required.",
    },
    {
      before: "When your seasonal espresso or single-origin drops, you're sending a group text to 60 accounts.",
      after: "New arrivals and seasonal SKUs publish instantly to your portal. Accounts see them when they log in.",
    },
    {
      before: "Every account pays a slightly different price, and your reps have to remember who gets what.",
      after: "Per-account pricing is locked in at the portal level. The right price shows up automatically.",
    },
    {
      before: "Invoice disputes drag on because the account swears they only ordered two bags, not four.",
      after: "Every order is timestamped and confirmed in writing. No more he-said-she-said on deliveries.",
    },
  ],
  features: [
    "Roast level and origin catalog with tasting notes and brew guides",
    "Standing order automation with weekly or biweekly replenishment",
    "Per-account wholesale pricing locked to each buyer's profile",
    "Seasonal and new arrival spotlights pushed to your portal on launch",
    "Order cutoff times enforced automatically — no more missed roast runs",
    "Branded wholesale account portal with your logo and domain",
    "PDF invoice generation on every confirmed order",
    "Delivery schedule management with route-based grouping",
    "Order history and reorder in one click for returning accounts",
  ],
  testimonial: {
    quote:
      "We were running our entire business on group texts and a shared Google Sheet. The first week after launching our Wholesail portal, three accounts placed standing orders without ever calling us. That alone paid for it.",
    name: "Sarah K.",
    company: "Pacific Roasters",
    industry: "Coffee & Tea Distribution",
  },
  sectionTitle: "What changes for coffee and tea distributors.",
  featuresTitle: "Everything a coffee and tea distributor needs.",
  stats: [
    {
      stat: "62%",
      label: "of specialty coffee distributors still process orders manually",
      source: "SCA Roaster Research 2024",
    },
    {
      stat: "5–7 hrs",
      label: "per week the average coffee rep spends manually entering standing orders",
      source: "Conexiom 2024",
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
