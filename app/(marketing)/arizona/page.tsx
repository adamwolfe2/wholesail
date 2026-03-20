import type { Metadata } from "next";
import { StatePage, type StateConfig } from "@/components/state-page-template";

export const metadata: Metadata = {
  title: "B2B Wholesale Ordering Portal for Arizona Distributors | Wholesail",
  description:
    "Arizona wholesale distributors use Wholesail to give construction/building materials, food/beverage, restaurant supply, and HVAC/plumbing accounts a self-service ordering portal. Built for a fast-growing market. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Wholesale Ordering Portal for Arizona Distributors | Wholesail",
    description:
      "Arizona is one of the fastest-growing markets in the US. Wholesail gives your accounts in Phoenix, Tucson, and Scottsdale a branded ordering portal so they reorder online instead of calling around.",
  },
  alternates: { canonical: "https://wholesailhub.com/arizona" },
};

const config: StateConfig = {
  slug: "arizona",
  eyebrow: "For Arizona Wholesale Distributors",
  h1Line1: "Arizona is growing faster than any distributor can keep up with manually. Your accounts need to order without waiting on your team.",
  h1Line2: "Give them a portal built for a boom market.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for Arizona construction/building materials, food/beverage, restaurant supply, and HVAC/plumbing distributors. Your accounts in Phoenix, Tucson, Mesa, Scottsdale, and Chandler order online 24/7 \u2014 no phone call, no voicemail, no rep required. Every order lands in your dashboard the moment it\u2019s placed. Live in under 2 weeks.",
  heroStat: "Arizona is one of the fastest-growing states in the US \u2014 and the construction and hospitality sectors driving that growth need a distributor who can keep up.",
  sectionTitle: "What changes when you launch your portal.",
  featuresTitle: "Everything your distribution business needs.",
  painPoints: [
    {
      before: "Arizona\u2019s construction boom means building materials and HVAC/plumbing accounts are placing large, time-sensitive orders constantly. Managing those by phone means delays \u2014 and delays on a job site cost your accounts money they won\u2019t forget.",
      after: "Your branded portal lets project managers and site buyers place orders instantly, attach job numbers, and track delivery status. No waiting on hold, no voicemail callbacks.",
    },
    {
      before: "Phoenix and Scottsdale\u2019s resort and hospitality sector runs large food and beverage programs. The volume is great, but the ordering chaos \u2014 texts, faxes, last-minute calls \u2014 is unsustainable as you scale.",
      after: "Every hospitality account gets their own portal with their pricing, product catalog, and standing orders pre-configured. Reorders take two minutes instead of two phone calls.",
    },
    {
      before: "Restaurant supply accounts across Mesa, Chandler, and Tempe are placing orders at all hours to keep up with Arizona\u2019s booming dining scene. Your team can\u2019t staff phones 24/7 to cover it.",
      after: "Your portal takes orders around the clock. Every order routes to your fulfillment board the moment it\u2019s placed \u2014 no rep required, no orders missed.",
    },
    {
      before: "Following up on net-30 invoices from 70+ Arizona accounts eats hours every week. Cash flow tightens during slow seasons and payment chasing becomes a second job.",
      after: "Invoices generate on shipment. Automated payment reminders go out at Day 25, 30, and 35. You collect faster without making a single collections call.",
    },
  ],
  features: [
    "Product catalog organized by category \u2014 construction materials, food/beverage, restaurant supply, HVAC/plumbing, and more",
    "Per-account pricing tiers with volume, contract, and project-based discount rules",
    "Standing orders for recurring restaurant, hospitality, and contractor accounts",
    "Live inventory visibility so accounts know what\u2019s available before ordering",
    "Stripe-powered invoice payments \u2014 accounts pay online on their schedule",
    "Text message ordering for site managers and buyers who order from the field",
    "Order confirmations and delivery tracking via email and SMS",
    "Admin fulfillment board, CRM, and revenue analytics in one dashboard",
    "Bulk client import to onboard your existing Arizona accounts in minutes",
  ],
  testimonial: {
    quote: "We supply restaurant equipment and food service supplies to hotels and restaurants across the Phoenix and Scottsdale resort corridor. The volume was growing faster than our reps could handle. Wholesail gave every account their own ordering portal and we went from fielding 40 calls a day to maybe 5. The ones that still call are new accounts \u2014 which is exactly how it should be.",
    name: "Ryan M.",
    company: "Desert Supply Co.",
    industry: "Restaurant & Hospitality Supply Distribution \u2014 Greater Phoenix",
  },
  stats: [
    {
      stat: "#1",
      label: "Arizona ranks first in the US for population growth rate, driving sustained demand across construction, hospitality, and food service supply",
      source: "US Census Bureau, 2024",
    },
    {
      stat: "3\u20134 hrs",
      label: "per day the average distribution team spends on order entry and follow-up calls",
      source: "Conexiom, 2024",
    },
    {
      stat: "< 2 wks",
      label: "from your first call to a fully deployed, branded portal live for your Arizona accounts",
      source: "Wholesail build average",
    },
  ],
};

export default function ArizonaPage() {
  return <StatePage config={config} />;
}
