import type { Metadata } from "next";
import { StatePage, type StateConfig } from "@/components/state-page-template";

export const metadata: Metadata = {
  title: "Wholesale Distribution Portal for Florida Businesses | Wholesail",
  description:
    "Florida wholesale distributors use Wholesail to give hotel, restaurant, and food service accounts a self-service ordering portal. 24/7 ordering for the hospitality market. Live in under 2 weeks.",
  openGraph: {
    title: "Wholesale Distribution Portal for Florida Businesses | Wholesail",
    description:
      "Florida has 47,000+ food service establishments. Wholesail gives your hospitality and food service accounts a branded 24/7 ordering portal \u2014 no phone calls, no missed orders.",
  },
  alternates: { canonical: "https://wholesailhub.com/florida" },
};

const config: StateConfig = {
  slug: "florida",
  eyebrow: "For Florida Wholesale Distributors",
  h1Line1: "Florida\u2019s hospitality market never sleeps. Your ordering system should work the same way.",
  h1Line2: "Give your hotel and restaurant accounts 24/7 self-service.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for Florida seafood, produce, and specialty food distributors serving the hospitality market. Your accounts order online 24/7 \u2014 no phone call, no voicemail, no rep required. Every order lands in your dashboard the moment it\u2019s placed. Live in under 2 weeks.",
  heroStat: "Florida has over 47,000 food service establishments \u2014 the 3rd highest concentration in the US.",
  sectionTitle: "What changes when you launch your portal.",
  featuresTitle: "Everything your distribution business needs.",
  painPoints: [
    {
      before: "Florida hotels and resorts run 24/7 and their procurement teams order at all hours. Your business hours don\u2019t match their schedule.",
      after: "Your portal takes orders around the clock. A resort in Miami Beach can submit their order at 2am and it\u2019s waiting in your dashboard when your team arrives.",
    },
    {
      before: "Seasonal surges in tourist markets mean order volume spikes with no warning. Your reps get overwhelmed and orders get missed.",
      after: "Accounts order online and your admin dashboard shows every order the moment it\u2019s placed. Volume peaks don\u2019t overwhelm your team.",
    },
    {
      before: "Florida\u2019s seafood, produce, and specialty food markets have tight freshness windows. Delayed ordering communication means delivery problems.",
      after: "Orders route immediately to fulfillment. Cutoff times enforce themselves automatically. Your delivery windows are protected.",
    },
    {
      before: "Following up on invoices from 60+ hospitality accounts spread across Miami, Orlando, and Tampa takes hours every week.",
      after: "Invoices generate on shipment. Automated reminders go out at Day 25, 30, and 35. Accounts pay online. Collections happen without calls.",
    },
  ],
  features: [
    "Product catalog organized by category \u2014 seafood, produce, specialty food, hospitality staples",
    "Per-account pricing tiers with hotel, resort, and independent restaurant tiers",
    "Standing orders for weekly hotel and food service accounts",
    "Delivery cutoff enforcement for time-sensitive seafood and produce orders",
    "Stripe-powered invoice payments \u2014 accounts pay online at their convenience",
    "Text message ordering for kitchen managers and procurement staff on the floor",
    "Order confirmations and delivery tracking via email and SMS",
    "Admin fulfillment board with freshness-priority flagging and revenue analytics",
    "Bulk client import to onboard your existing Florida accounts in minutes",
  ],
  testimonial: {
    quote: "We supply fresh seafood to about 70 restaurants and hotel kitchens across Miami-Dade and Broward. The hospitality market here is non-stop \u2014 procurement people order at midnight, weekend mornings, whenever they realize they\u2019re short. Wholesail handles all of that without waking anyone up on our end. Every order is there in the morning, organized, ready to pick. It\u2019s transformed how we run fulfillment.",
    name: "Carlos M.",
    company: "Gulf Coast Seafood Supply",
    industry: "Seafood Distribution \u2014 South Florida",
  },
  stats: [
    {
      stat: "47,000+",
      label: "food service establishments in Florida \u2014 the 3rd highest concentration of hospitality accounts in the United States",
      source: "Florida Restaurant & Lodging Assoc., 2024",
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

export default function FloridaPage() {
  return <StatePage config={config} />;
}
