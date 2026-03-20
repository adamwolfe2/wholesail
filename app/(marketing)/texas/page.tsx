import type { Metadata } from "next";
import { StatePage, type StateConfig } from "@/components/state-page-template";

export const metadata: Metadata = {
  title: "Wholesale Distribution Portal for Texas Businesses | Wholesail",
  description:
    "Texas wholesale distributors use Wholesail to give food, beverage, and industrial supply accounts a self-service ordering portal. Built and deployed in under 2 weeks.",
  openGraph: {
    title: "Wholesale Distribution Portal for Texas Businesses | Wholesail",
    description:
      "Texas is the 2nd largest wholesale distribution market in the US. Wholesail gives your accounts a branded portal so they order online \u2014 no phone calls, no spreadsheets.",
  },
  alternates: { canonical: "https://wholesailhub.com/texas" },
};

const config: StateConfig = {
  slug: "texas",
  eyebrow: "For Texas Wholesale Distributors",
  h1Line1: "Texas distribution runs on relationships. Your relationships deserve better tools than a shared spreadsheet.",
  h1Line2: "Give your accounts a portal that reflects the size of your operation.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for Texas food, beverage, and industrial supply distributors. Your accounts order online 24/7 \u2014 no phone call, no voicemail, no rep required. Every order lands in your dashboard the moment it\u2019s placed. Live in under 2 weeks.",
  heroStat: "Texas is the 2nd largest wholesale distribution market in the US, with $400B+ in annual wholesale revenue.",
  sectionTitle: "What changes when you launch your portal.",
  featuresTitle: "Everything your distribution business needs.",
  painPoints: [
    {
      before: "Your best accounts in Dallas, Houston, and San Antonio are spread across hundreds of miles. A rep can only cover so much ground in a week.",
      after: "Every account gets a portal they can access from anywhere. Orders come in from all across Texas without a single rep visit.",
    },
    {
      before: "Texas accounts \u2014 especially in food service and industrial supply \u2014 expect fast turnaround. Phone and email orders slow everything down.",
      after: "Accounts order online in under 3 minutes. Orders route to your fulfillment team the instant they\u2019re placed. No lag, no lost orders.",
    },
    {
      before: "Pricing agreements vary by account, delivery zone, and product type. Your reps quote from memory and occasionally get it wrong.",
      after: "Each account sees only their contracted pricing. Volume tiers and delivery zone rules apply automatically on every order.",
    },
    {
      before: "Invoice collection from accounts spread across multiple Texas cities means weeks of follow-up calls and growing outstanding balances.",
      after: "Invoices generate on shipment. Automated reminders go out at Day 25, 30, and 35. Accounts pay online. You collect faster.",
    },
  ],
  features: [
    "Product catalog organized by category \u2014 food, beverage, industrial, and specialty goods",
    "Per-account pricing with delivery zone rules and volume discount tiers",
    "Standing orders for weekly restaurant, food service, and industrial accounts",
    "Live inventory visibility so accounts know what\u2019s in stock before placing orders",
    "Stripe-powered invoice payments \u2014 accounts pay online at their convenience",
    "Text message ordering for accounts who prefer to order from the field",
    "Order confirmations and delivery tracking via email and SMS",
    "Admin fulfillment board, route management, and revenue analytics",
    "Bulk client import to onboard your existing Texas accounts in minutes",
  ],
  testimonial: {
    quote: "We cover the whole Dallas-Fort Worth metroplex \u2014 over 200 restaurant and food service accounts. Managing orders by phone and email was killing our operations team. With Wholesail, our accounts just log in and order. We see everything in real time, fulfillment is cleaner, and our reps are focused on growing accounts instead of entering orders they already took.",
    name: "James H.",
    company: "Lone Star Provisions Group",
    industry: "Food & Beverage Distribution \u2014 Dallas-Fort Worth",
  },
  stats: [
    {
      stat: "$400B+",
      label: "in annual wholesale revenue generated across Texas \u2014 the 2nd largest distribution market in the United States",
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

export default function TexasPage() {
  return <StatePage config={config} />;
}
