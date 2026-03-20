import type { Metadata } from "next";
import { StatePage, type StateConfig } from "@/components/state-page-template";

export const metadata: Metadata = {
  title: "B2B Wholesale Ordering Portal for Michigan Distributors | Wholesail",
  description:
    "Michigan wholesale distributors use Wholesail to give auto parts, food/beverage, building materials, and industrial supply accounts a self-service ordering portal. Built for the manufacturing supply chain. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Wholesale Ordering Portal for Michigan Distributors | Wholesail",
    description:
      "Michigan distributors supply the backbone of American manufacturing. Wholesail gives your accounts a branded ordering portal so they reorder online instead of waiting on a phone rep.",
  },
  alternates: { canonical: "https://wholesailhub.com/michigan" },
};

const config: StateConfig = {
  slug: "michigan",
  eyebrow: "For Michigan Wholesale Distributors",
  h1Line1: "Michigan runs on manufacturing. Your accounts need to reorder faster than a phone call allows.",
  h1Line2: "Give them a portal built for the supply chain.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for Michigan auto parts, food/beverage, industrial supply, and building materials distributors. Your accounts in Detroit, Grand Rapids, Lansing, Ann Arbor, and Flint order online 24/7 \u2014 no phone call, no voicemail, no rep required. Every order lands in your dashboard the moment it\u2019s placed. Live in under 2 weeks.",
  heroStat: "Michigan is home to the most concentrated manufacturing supply chain in North America \u2014 and your accounts expect a buying experience that matches that pace.",
  sectionTitle: "What changes when you launch your portal.",
  featuresTitle: "Everything your distribution business needs.",
  painPoints: [
    {
      before: "Auto parts and industrial supply accounts in Detroit, Flint, and Lansing place repeat orders constantly. Managing those by phone or email means your reps spend all day on order entry instead of growing accounts.",
      after: "Your branded portal lets production managers and shop buyers reorder parts and supplies in under two minutes. Standing orders handle the weekly regulars automatically.",
    },
    {
      before: "Michigan\u2019s Great Lakes food distributors work with hundreds of grocery, restaurant, and food service accounts spread across a wide geographic area. Coordinating order windows by phone for each route is a logistics nightmare.",
      after: "Every account orders online on their own schedule. Your dashboard aggregates orders by route and delivery day so your drivers are never guessing what to load.",
    },
    {
      before: "Building materials and agricultural supply accounts need accurate pricing across dozens of SKUs, seasonal promotions, and volume tiers. Manual quoting means errors \u2014 and errors cost you the account.",
      after: "Each account sees their negotiated pricing automatically. Volume tiers and seasonal rules apply on every order without a rep touching it.",
    },
    {
      before: "Following up on net-30 invoices from 60+ Michigan accounts means hours of calls each week. Accounts that stretch to net-45 quietly hurt your cash flow.",
      after: "Invoices generate on shipment. Automated payment reminders go out at Day 25, 30, and 35. You collect faster without making a single collections call.",
    },
  ],
  features: [
    "Product catalog organized by category \u2014 auto parts, food/beverage, industrial supply, building materials, and more",
    "Per-account pricing tiers with volume, seasonal, and contract discount rules",
    "Standing orders for recurring weekly and bi-weekly accounts",
    "Live inventory visibility so accounts know what\u2019s available before ordering",
    "Stripe-powered invoice payments \u2014 accounts pay online on their schedule",
    "Text message ordering for shop managers and buyers who order from their phone",
    "Order confirmations and delivery tracking via email and SMS",
    "Admin fulfillment board, CRM, and revenue analytics in one dashboard",
    "Bulk client import to onboard your existing Michigan accounts in minutes",
  ],
  testimonial: {
    quote: "We distribute food and beverage to about 90 restaurants and grocery accounts across metro Detroit and Grand Rapids. Our reps were spending most of their day fielding reorder calls and fixing order mistakes. Wholesail changed that completely \u2014 accounts log in, reorder in two minutes, and we actually get to focus on new business again.",
    name: "Marcus T.",
    company: "Great Lakes Provisions",
    industry: "Food & Beverage Distribution \u2014 Southeast Michigan",
  },
  stats: [
    {
      stat: "Top 10",
      label: "Michigan ranks among the top 10 US states for wholesale distribution revenue, driven by manufacturing and auto supply chain volume",
      source: "US Census Bureau, 2024",
    },
    {
      stat: "3\u20134 hrs",
      label: "per day the average distribution team spends on order entry and follow-up calls",
      source: "Conexiom, 2024",
    },
    {
      stat: "< 2 wks",
      label: "from your first call to a fully deployed, branded portal live for your Michigan accounts",
      source: "Wholesail build average",
    },
  ],
};

export default function MichiganPage() {
  return <StatePage config={config} />;
}
