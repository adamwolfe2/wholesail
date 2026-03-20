import type { Metadata } from "next";
import { StatePage, type StateConfig } from "@/components/state-page-template";

export const metadata: Metadata = {
  title: "Wholesale Distribution Portal for Illinois Businesses | Wholesail",
  description:
    "Illinois wholesale distributors use Wholesail to give Chicago restaurant, food service, and industrial supply accounts a self-service ordering portal. No more after-hours missed orders.",
  openGraph: {
    title: "Wholesale Distribution Portal for Illinois Businesses | Wholesail",
    description:
      "The Chicago metro is the 3rd largest food distribution hub in the US. Wholesail gives your Illinois accounts a branded portal so they order online \u2014 24/7, no phone required.",
  },
  alternates: { canonical: "https://wholesailhub.com/illinois" },
};

const config: StateConfig = {
  slug: "illinois",
  eyebrow: "For Illinois Wholesale Distributors",
  h1Line1: "Chicago\u2019s food scene orders on their schedule, not yours.",
  h1Line2: "Stop missing orders that come in after 5pm.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for Illinois food, beverage, and industrial supply distributors. Your accounts order online 24/7 \u2014 no phone call, no voicemail, no rep required. Every order lands in your dashboard the moment it\u2019s placed. Live in under 2 weeks.",
  heroStat: "The Chicago metro area is the 3rd largest food distribution hub in the United States.",
  sectionTitle: "What changes when you launch your portal.",
  featuresTitle: "Everything your distribution business needs.",
  painPoints: [
    {
      before: "Chicago\u2019s restaurant accounts order on their schedule \u2014 often after your team is gone. Orders left on voicemail get entered the next morning, already behind.",
      after: "Your portal takes orders around the clock. Everything placed after hours is waiting, organized, in your dashboard when your team arrives.",
    },
    {
      before: "Chicago\u2019s food scene spans Michelin-starred restaurants to large-scale catering operations. Each has different pricing, product lists, and minimums.",
      after: "Each account sees a catalog and pricing built for them. No confusion, no manual quoting, no errors from reps quoting from memory.",
    },
    {
      before: "Industrial supply accounts across Chicagoland need live availability visibility before they can commit to an order. Phone calls slow that down.",
      after: "Live inventory visibility is built into every account\u2019s portal. They check availability themselves and order with confidence.",
    },
    {
      before: "Midwest logistics complexity means your team is already stretched. Order entry on top of fulfillment and delivery coordination leaves no room.",
      after: "Order entry is eliminated. Accounts place their own orders. Your team focuses on fulfillment, routing, and delivery \u2014 not data entry.",
    },
  ],
  features: [
    "Product catalog organized by category \u2014 food service, specialty food, industrial, and janitorial supply",
    "Per-account pricing tiers with volume discounts and account-specific minimums",
    "Standing orders for weekly Chicago restaurant and food service accounts",
    "Live inventory visibility so accounts know what\u2019s available before ordering",
    "Stripe-powered invoice payments \u2014 accounts pay online",
    "Text message ordering for accounts and kitchen managers who prefer to order from their phone",
    "Order confirmations and delivery tracking via email and SMS",
    "Admin fulfillment board with route-based grouping and revenue analytics",
    "Bulk client import to onboard your existing Illinois accounts in minutes",
  ],
  testimonial: {
    quote: "We supply dry goods and specialty food items to restaurants across Chicagoland. Our accounts were placing orders by texting our sales rep directly \u2014 which meant if she was unavailable, orders just waited. With Wholesail, every account has their own login. They order when it\u2019s convenient for them and we see it instantly. Our Monday morning used to be chaos. Now it\u2019s just fulfillment.",
    name: "Diane K.",
    company: "Midwest Provisions Group",
    industry: "Food Service Distribution \u2014 Chicagoland",
  },
  stats: [
    {
      stat: "3rd",
      label: "The Chicago metro area is the 3rd largest food distribution hub in the United States by volume",
      source: "USDA Economic Research Service, 2024",
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

export default function IllinoisPage() {
  return <StatePage config={config} />;
}
