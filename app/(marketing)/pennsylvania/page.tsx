import type { Metadata } from "next";
import { StatePage, type StateConfig } from "@/components/state-page-template";

export const metadata: Metadata = {
  title: "B2B Wholesale Ordering Portal for Pennsylvania Distributors | Wholesail",
  description:
    "Pennsylvania wholesale distributors use Wholesail to give food/beverage, healthcare supply, industrial, and specialty food accounts a self-service ordering portal. Built for the East Coast\u2019s densest food service market. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Wholesale Ordering Portal for Pennsylvania Distributors | Wholesail",
    description:
      "Pennsylvania sits at the center of the East Coast supply chain. Wholesail gives your accounts in Philadelphia, Pittsburgh, and beyond a branded ordering portal so they order online instead of waiting on a rep.",
  },
  alternates: { canonical: "https://wholesailhub.com/pennsylvania" },
};

const config: StateConfig = {
  slug: "pennsylvania",
  eyebrow: "For Pennsylvania Wholesale Distributors",
  h1Line1: "Pennsylvania is the East Coast\u2019s distribution hub. Your accounts expect to order as fast as they can drive to your warehouse.",
  h1Line2: "Give them a portal that makes it that easy.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for Pennsylvania food/beverage, healthcare supply, industrial, and specialty food distributors. Your accounts in Philadelphia, Pittsburgh, Allentown, Erie, and Reading order online 24/7 \u2014 no phone call, no voicemail, no rep required. Every order lands in your dashboard the moment it\u2019s placed. Live in under 2 weeks.",
  heroStat: "Pennsylvania has one of the densest food service and restaurant markets on the East Coast \u2014 and the most demanding buyers to match.",
  sectionTitle: "What changes when you launch your portal.",
  featuresTitle: "Everything your distribution business needs.",
  painPoints: [
    {
      before: "Pennsylvania\u2019s dense restaurant and hospitality corridor \u2014 from Philadelphia\u2019s Passyunk Ave to Pittsburgh\u2019s Strip District \u2014 generates constant reorder volume. Managing those orders by phone means your team is always playing catch-up.",
      after: "Your branded portal lets restaurant and food service buyers place reorders in under two minutes, any time of day. Every order hits your dashboard the moment it\u2019s placed.",
    },
    {
      before: "Healthcare supply and industrial accounts in the Philadelphia suburbs and Lehigh Valley expect accurate, consistent pricing on every order. A single quote mistake puts the account at risk.",
      after: "Each account sees their contract pricing automatically. Volume tiers and category rules apply to every order without a rep touching it \u2014 zero room for quoting errors.",
    },
    {
      before: "Specialty food and agricultural supply distributors serving the Reading, Allentown, and Erie markets work across wildly different account types. One set of pricing and ordering rules doesn\u2019t fit all of them.",
      after: "Every account gets a portal configured to their specific pricing, product access, and payment terms. The same system handles your restaurant, retail, and institutional accounts without friction.",
    },
    {
      before: "Following up on net-30 invoices from 80+ Pennsylvania accounts eats hours every week. Accounts that stretch to net-45 quietly squeeze your cash flow.",
      after: "Invoices generate on shipment. Automated reminders go out at Day 25, 30, and 35. You collect faster without making a single collections call.",
    },
  ],
  features: [
    "Product catalog organized by category \u2014 food/beverage, healthcare supply, industrial, specialty food, and more",
    "Per-account pricing tiers with volume, contract, and seasonal discount rules",
    "Standing orders for recurring restaurant, institutional, and retail accounts",
    "Live inventory visibility so accounts know what\u2019s available before ordering",
    "Stripe-powered invoice payments \u2014 accounts pay online on their schedule",
    "Text message ordering for buyers who prefer to order from their phone",
    "Order confirmations and delivery tracking via email and SMS",
    "Admin fulfillment board, CRM, and revenue analytics in one dashboard",
    "Bulk client import to onboard your existing Pennsylvania accounts in minutes",
  ],
  testimonial: {
    quote: "We distribute specialty food to about 110 restaurants and retailers in the Philadelphia metro. Before Wholesail, we were drowning in texts, emails, and voicemails every Monday. Now accounts log in, see their pricing, reorder what they need, and we\u2019re done. Our error rate dropped to almost nothing and our reps finally have time to sell.",
    name: "Diane K.",
    company: "Keystone Fine Foods",
    industry: "Specialty Food Distribution \u2014 Greater Philadelphia",
  },
  stats: [
    {
      stat: "Top 5",
      label: "Pennsylvania ranks among the top 5 East Coast states for wholesale food and beverage distribution volume",
      source: "US Census Bureau, 2024",
    },
    {
      stat: "3\u20134 hrs",
      label: "per day the average distribution team spends on order entry and follow-up calls",
      source: "Conexiom, 2024",
    },
    {
      stat: "< 2 wks",
      label: "from your first call to a fully deployed, branded portal live for your Pennsylvania accounts",
      source: "Wholesail build average",
    },
  ],
};

export default function PennsylvaniaPage() {
  return <StatePage config={config} />;
}
