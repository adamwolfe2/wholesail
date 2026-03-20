import type { Metadata } from "next";
import { StatePage, type StateConfig } from "@/components/state-page-template";

export const metadata: Metadata = {
  title: "Wholesale Distribution Portal for Georgia Businesses | Wholesail",
  description:
    "Georgia wholesale distributors use Wholesail to give Atlanta food service, poultry, and consumer goods accounts a self-service ordering portal. Live in under 2 weeks.",
  openGraph: {
    title: "Wholesale Distribution Portal for Georgia Businesses | Wholesail",
    description:
      "Georgia processes $85B+ in annual wholesale trade. Wholesail gives your Atlanta-area food, poultry, and consumer goods accounts a branded portal \u2014 your competitors already have one.",
  },
  alternates: { canonical: "https://wholesailhub.com/georgia" },
};

const config: StateConfig = {
  slug: "georgia",
  eyebrow: "For Georgia Wholesale Distributors",
  h1Line1: "Atlanta is one of the fastest-growing food distribution markets in the Southeast.",
  h1Line2: "Your accounts expect a portal. Your competitors already have one.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for Georgia food, poultry, and consumer goods distributors. Your accounts order online 24/7 \u2014 no phone call, no voicemail, no rep required. Every order lands in your dashboard the moment it\u2019s placed. Live in under 2 weeks.",
  heroStat: "Georgia processes over $85B in annual wholesale trade, led by food, poultry, and consumer goods.",
  sectionTitle: "What changes when you launch your portal.",
  featuresTitle: "Everything your distribution business needs.",
  painPoints: [
    {
      before: "Atlanta is one of the fastest-growing food distribution markets in the Southeast. New distributors are entering with better digital tools and stealing accounts from established operators.",
      after: "Your Wholesail portal matches and beats the experience newer competitors are offering. Accounts stay because ordering from you is easier.",
    },
    {
      before: "Georgia\u2019s poultry and food processing supply chain moves fast. Orders placed by phone introduce delays that ripple through your fulfillment and delivery operations.",
      after: "Online orders route to fulfillment the instant they\u2019re placed. No phone tag, no decoding handwritten notes, no delays from missed calls.",
    },
    {
      before: "Atlanta restaurant and food service accounts are growing rapidly. Your team can\u2019t scale headcount fast enough to handle order volume by phone and email.",
      after: "Accounts are fully self-service. Order volume can double without adding a single person to your order intake process.",
    },
    {
      before: "Net-30 invoice collection from accounts across metro Atlanta, Savannah, and other Georgia markets means hours of manual follow-up each week.",
      after: "Invoices generate on shipment. Automated reminders go out on schedule. Accounts pay online. Your AR cleans up without manual effort.",
    },
  ],
  features: [
    "Product catalog organized by category \u2014 poultry, food service, produce, consumer goods, and specialty",
    "Per-account pricing tiers with volume discounts and regional delivery rules",
    "Standing orders for weekly Atlanta restaurant and food service accounts",
    "Live inventory visibility so accounts can order with confidence without calling to check",
    "Stripe-powered invoice payments \u2014 accounts pay online with Net terms built in",
    "Text message ordering for kitchen managers and purchasing staff on the go",
    "Order confirmations and delivery tracking via email and SMS",
    "Admin fulfillment board with metro-Atlanta route grouping and revenue analytics",
    "Bulk client import to onboard your existing Georgia accounts in minutes",
  ],
  testimonial: {
    quote: "We distribute fresh and processed poultry products to about 85 food service accounts across metro Atlanta. The market here is growing fast and the competition is real. Wholesail gave us a portal that makes ordering from us frictionless \u2014 accounts log in, see their pricing, and order in minutes. We stopped losing accounts to larger distributors simply because they had better technology.",
    name: "Reuben J.",
    company: "Southern Protein Distributors",
    industry: "Poultry & Food Distribution \u2014 Atlanta Metro",
  },
  stats: [
    {
      stat: "$85B+",
      label: "in annual wholesale trade processed in Georgia, led by food, poultry, and consumer goods distribution",
      source: "Georgia Dept. of Economic Development, 2024",
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

export default function GeorgiaPage() {
  return <StatePage config={config} />;
}
