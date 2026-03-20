import type { Metadata } from "next";
import { StatePage, type StateConfig } from "@/components/state-page-template";

export const metadata: Metadata = {
  title: "Wholesale Distribution Portal for Ohio Businesses | Wholesail",
  description:
    "Ohio wholesale distributors use Wholesail to give manufacturing, food service, and industrial supply accounts a self-service ordering portal. Live in under 2 weeks.",
  openGraph: {
    title: "Wholesale Distribution Portal for Ohio Businesses | Wholesail",
    description:
      "Ohio ranks 7th nationally in wholesale trade. Wholesail gives your food, industrial, and manufacturing accounts a branded ordering portal \u2014 no phone calls, no spreadsheets.",
  },
  alternates: { canonical: "https://wholesailhub.com/ohio" },
};

const config: StateConfig = {
  slug: "ohio",
  eyebrow: "For Ohio Wholesale Distributors",
  h1Line1: "Ohio\u2019s manufacturing and food industries are your best accounts.",
  h1Line2: "Give them the ordering experience they get from every other supplier.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for Ohio food, industrial, and manufacturing supply distributors. Your accounts order online 24/7 \u2014 no phone call, no voicemail, no rep required. Every order lands in your dashboard the moment it\u2019s placed. Live in under 2 weeks.",
  heroStat: "Ohio ranks 7th nationally in wholesale trade volume, with strength in food, industrial, and consumer goods.",
  sectionTitle: "What changes when you launch your portal.",
  featuresTitle: "Everything your distribution business needs.",
  painPoints: [
    {
      before: "Ohio manufacturing and food processing accounts expect the same efficiency from their suppliers that they run on their own production floor. Phone ordering doesn\u2019t match that standard.",
      after: "Your portal gives manufacturing accounts a structured, reliable ordering experience. They order on their schedule, your fulfillment team sees it immediately.",
    },
    {
      before: "Accounts across Cleveland, Columbus, and Cincinnati have different pricing, product needs, and delivery routes. Managing that manually across cities is error-prone.",
      after: "Each account has their own pricing tier, catalog view, and delivery parameters built in. No custom quoting or rep memory required.",
    },
    {
      before: "Ohio food distributors competing for the same restaurant and institutional accounts get undercut on convenience \u2014 the distributor with the easiest ordering wins.",
      after: "Your portal makes ordering from you the most convenient option. Accounts log in, reorder their usuals, and check out in under 3 minutes.",
    },
    {
      before: "Net-30 invoice collection from accounts spread across multiple Ohio cities means weekly manual follow-up calls and growing outstanding balances.",
      after: "Invoices generate on shipment. Automated reminders fire at Day 25, 30, and 35. Accounts pay online. You collect faster without calling.",
    },
  ],
  features: [
    "Product catalog organized by category \u2014 food, industrial, manufacturing supply, and consumer goods",
    "Per-account pricing tiers with volume discounts and regional delivery rules",
    "Standing orders for weekly restaurant, institutional, and manufacturing accounts",
    "Live inventory visibility so accounts can plan orders without calling to check stock",
    "Stripe-powered invoice payments \u2014 accounts pay online with Net terms enforced automatically",
    "Text message ordering for accounts who prefer to order from the plant floor or kitchen",
    "Order confirmations and delivery tracking via email and SMS",
    "Admin fulfillment board with city-based route grouping and revenue analytics",
    "Bulk client import to onboard your existing Ohio accounts in minutes",
  ],
  testimonial: {
    quote: "We distribute specialty food and packaging supplies to manufacturers and food producers across central Ohio. Our accounts are professional operations \u2014 they expect their suppliers to run the same way. Wholesail gave us a portal that matches that expectation. Orders are organized, pricing is automatic, and we\u2019re no longer fielding calls just to tell people what\u2019s in stock.",
    name: "Tom W.",
    company: "Heartland Supply Partners",
    industry: "Food & Industrial Distribution \u2014 Central Ohio",
  },
  stats: [
    {
      stat: "Top 10",
      label: "Ohio ranks 7th nationally in wholesale trade volume, with particular strength in food, industrial, and consumer goods",
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

export default function OhioPage() {
  return <StatePage config={config} />;
}
