import type { Metadata } from "next";
import { StatePage, type StateConfig } from "@/components/state-page-template";

export const metadata: Metadata = {
  title: "Wholesale Distribution Portal for California Businesses | Wholesail",
  description:
    "California wholesale distributors use Wholesail to give wine, produce, specialty food, and beverage accounts a self-service ordering portal. No more phone orders. Live in under 2 weeks.",
  openGraph: {
    title: "Wholesale Distribution Portal for California Businesses | Wholesail",
    description:
      "California has the most competitive wholesale distribution market in the US. Wholesail gives your accounts a branded portal so they order online instead of calling your competitors.",
  },
  alternates: { canonical: "https://wholesailhub.com/california" },
};

const config: StateConfig = {
  slug: "california",
  eyebrow: "For California Wholesale Distributors",
  h1Line1: "California\u2019s distribution market moves fast. Your clients are ordering from competitors who make it easier.",
  h1Line2: "Give them a portal that works as hard as you do.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for California wine, produce, specialty food, and beverage distributors. Your accounts order online 24/7 \u2014 no phone call, no voicemail, no rep required. Every order lands in your dashboard the moment it\u2019s placed. Live in under 2 weeks.",
  heroStat: "California has the largest wholesale distribution market in the US \u2014 and the highest competition for every account.",
  sectionTitle: "What changes when you launch your portal.",
  featuresTitle: "Everything your distribution business needs.",
  painPoints: [
    {
      before: "Wine, produce, and specialty food accounts in California have 5 distributors competing for every order. The one who makes it easiest to buy wins.",
      after: "Your branded portal makes ordering from you easier than calling anyone else. Accounts log in, reorder, and you\u2019re done.",
    },
    {
      before: "California\u2019s restaurant and retail market is 24/7. Orders come in at 11pm from San Francisco, 6am from LA. Your team can\u2019t cover it all.",
      after: "Your portal takes orders around the clock. Every order routes to your dashboard the moment it\u2019s placed \u2014 no rep required.",
    },
    {
      before: "Seasonal pricing, organic premiums, and region-specific promotions make manual quoting a full-time job. Mistakes cost you accounts.",
      after: "Each account sees their negotiated pricing automatically. Seasonal rules and category tiers apply on every order without rep involvement.",
    },
    {
      before: "Following up on invoices from 80+ California accounts means hours of calls each week. Net-30 accounts stretch to Net-45.",
      after: "Invoices generate on shipment. Automated reminders go out at Day 25, 30, and 35. You collect faster without making a single call.",
    },
  ],
  features: [
    "Product catalog organized by category \u2014 wine, produce, specialty food, dry goods, and more",
    "Per-account pricing tiers with organic, volume, and seasonal discount rules",
    "Standing orders for your regular weekly restaurant and retail accounts",
    "Live inventory visibility so accounts know what\u2019s available before ordering",
    "Stripe-powered invoice payments \u2014 accounts pay online on their schedule",
    "Text message ordering for accounts who prefer to order from their phone",
    "Order confirmations and delivery tracking via email and SMS",
    "Admin fulfillment board, CRM, and revenue analytics in one dashboard",
    "Bulk client import to onboard your existing California accounts in minutes",
  ],
  testimonial: {
    quote: "We distribute specialty and artisan foods to about 120 restaurants and retailers across the Bay Area. Before Wholesail, half our orders came in as texts or voicemails and someone had to decode them Monday morning. Now every account has their own portal with their pricing built in. Order errors went to basically zero and our rep is doing actual selling instead of order entry.",
    name: "Elena R.",
    company: "Bay Provisions Co.",
    industry: "Specialty Food Distribution \u2014 Northern California",
  },
  stats: [
    {
      stat: "#1",
      label: "California is the largest wholesale distribution market in the United States by volume and revenue",
      source: "US Census Bureau, 2024",
    },
    {
      stat: "3\u20134 hrs",
      label: "per day the average distribution team spends on order entry and follow-up calls",
      source: "Conexiom, 2024",
    },
    {
      stat: "< 2 wks",
      label: "from your first call to a fully deployed, branded portal live for your clients",
      source: "Wholesail build average",
    },
  ],
};

export default function CaliforniaPage() {
  return <StatePage config={config} />;
}
