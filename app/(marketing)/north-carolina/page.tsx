import type { Metadata } from "next";
import { StatePage, type StateConfig } from "@/components/state-page-template";

export const metadata: Metadata = {
  title: "B2B Wholesale Ordering Portal for North Carolina Distributors | Wholesail",
  description:
    "North Carolina wholesale distributors use Wholesail to give food/beverage, furniture, agricultural supply, and building materials accounts a self-service ordering portal. Built for the Research Triangle and beyond. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Wholesale Ordering Portal for North Carolina Distributors | Wholesail",
    description:
      "North Carolina is one of the fastest-growing states on the East Coast. Wholesail gives your accounts in Charlotte, Raleigh, and across the state a branded ordering portal so they order online instead of calling your competitors.",
  },
  alternates: { canonical: "https://wholesailhub.com/north-carolina" },
};

const config: StateConfig = {
  slug: "north-carolina",
  eyebrow: "For North Carolina Wholesale Distributors",
  h1Line1: "North Carolina is growing in every direction. Your accounts expect to order on their schedule, not yours.",
  h1Line2: "Give them a portal that keeps up with the Triangle.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for North Carolina food/beverage, furniture, agricultural supply, and building materials distributors. Your accounts in Charlotte, Raleigh, Greensboro, Durham, and Winston-Salem order online 24/7 \u2014 no phone call, no voicemail, no rep required. Every order lands in your dashboard the moment it\u2019s placed. Live in under 2 weeks.",
  heroStat: "North Carolina is home to the Research Triangle, the furniture capital of the world, and one of the Southeast\u2019s largest food manufacturing sectors \u2014 and it\u2019s all growing.",
  sectionTitle: "What changes when you launch your portal.",
  featuresTitle: "Everything your distribution business needs.",
  painPoints: [
    {
      before: "The Research Triangle \u2014 Raleigh, Durham, Chapel Hill \u2014 has one of the fastest-growing restaurant and food service markets in the Southeast. Managing order volume from that density by phone and email is unsustainable as you scale.",
      after: "Your branded portal lets every account in the Triangle place orders in under two minutes, any time of day. New accounts onboard in minutes and your reps focus on growing the territory instead of taking calls.",
    },
    {
      before: "North Carolina\u2019s food manufacturing sector \u2014 from meat processing in the east to specialty producers across the Piedmont \u2014 means your distributor accounts are placing high-frequency, high-volume reorders on tight timelines.",
      after: "Standing orders handle your regular weekly and bi-weekly accounts automatically. Every order routes to your fulfillment board the moment it\u2019s placed, with no manual entry required.",
    },
    {
      before: "Furniture and building materials accounts in Greensboro, High Point, and Winston-Salem expect accurate, contract-specific pricing on large orders. A quoting error on a commercial purchase means a lost account \u2014 and sometimes a lost relationship.",
      after: "Each account sees their negotiated pricing automatically. Volume tiers, category rules, and trade pricing apply to every order without a rep touching it \u2014 zero room for quoting mistakes.",
    },
    {
      before: "Agricultural supply accounts across the Charlotte region and eastern NC are seasonal, and managing pricing changes, promotional windows, and net-30 collections manually consumes your team every quarter.",
      after: "Seasonal pricing rules update across all accounts at once. Invoices generate on shipment. Automated payment reminders go out at Day 25, 30, and 35 \u2014 no collections calls needed.",
    },
  ],
  features: [
    "Product catalog organized by category \u2014 food/beverage, furniture, agricultural supply, building materials, and more",
    "Per-account pricing tiers with volume, trade, and seasonal discount rules",
    "Standing orders for recurring food service, manufacturing, and retail accounts",
    "Live inventory visibility so accounts know what\u2019s available before ordering",
    "Stripe-powered invoice payments \u2014 accounts pay online on their schedule",
    "Text message ordering for buyers who prefer to order from their phone",
    "Order confirmations and delivery tracking via email and SMS",
    "Admin fulfillment board, CRM, and revenue analytics in one dashboard",
    "Bulk client import to onboard your existing North Carolina accounts in minutes",
  ],
  testimonial: {
    quote: "We distribute specialty food and beverage to about 100 restaurants in the Raleigh-Durham area. The Triangle is growing so fast that we were adding accounts faster than we could manage orders. Wholesail gave every account a portal in their brand and our ordering volume doubled without us adding a single rep. That\u2019s the kind of leverage we needed.",
    name: "James F.",
    company: "Piedmont Food Partners",
    industry: "Specialty Food & Beverage Distribution \u2014 Research Triangle, NC",
  },
  stats: [
    {
      stat: "Top 10",
      label: "North Carolina ranks among the top 10 US states for food manufacturing output, with a fast-growing restaurant and food service market in the Research Triangle",
      source: "USDA ERS, 2024",
    },
    {
      stat: "3\u20134 hrs",
      label: "per day the average distribution team spends on order entry and follow-up calls",
      source: "Conexiom, 2024",
    },
    {
      stat: "< 2 wks",
      label: "from your first call to a fully deployed, branded portal live for your North Carolina accounts",
      source: "Wholesail build average",
    },
  ],
};

export default function NorthCarolinaPage() {
  return <StatePage config={config} />;
}
