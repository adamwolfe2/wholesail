import type { Metadata } from "next";
import { StatePage, type StateConfig } from "@/components/state-page-template";

export const metadata: Metadata = {
  title: "Wholesale Distribution Portal for New York Businesses | Wholesail",
  description:
    "New York wholesale distributors use Wholesail to give restaurant, food service, and specialty food accounts a self-service ordering portal. No more phone orders. Live in under 2 weeks.",
  openGraph: {
    title: "Wholesale Distribution Portal for New York Businesses | Wholesail",
    description:
      "NYC has 25,000+ food service accounts and the most competitive wholesale market in the US. Wholesail gives your accounts a branded portal so they order from you \u2014 not your competitors.",
  },
  alternates: { canonical: "https://wholesailhub.com/new-york" },
};

const config: StateConfig = {
  slug: "new-york",
  eyebrow: "For New York Wholesale Distributors",
  h1Line1: "New York restaurants order from 8 different suppliers.",
  h1Line2: "Be the one they order from without picking up the phone.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for New York specialty food, produce, and beverage distributors. Your accounts order online 24/7 \u2014 no phone call, no voicemail, no rep required. Every order lands in your dashboard the moment it\u2019s placed. Live in under 2 weeks.",
  heroStat: "New York City alone has 25,000+ food service accounts \u2014 the most competitive wholesale market in the country.",
  sectionTitle: "What changes when you launch your portal.",
  featuresTitle: "Everything your distribution business needs.",
  painPoints: [
    {
      before: "New York restaurants buy from 8 different suppliers. The one who makes ordering easiest gets the most wallet share. Right now that might not be you.",
      after: "Your branded portal becomes the easiest way to order. Accounts log in, reorder their usuals, and check out in under 3 minutes.",
    },
    {
      before: "NYC food service accounts expect the same digital experience from their distributors that they get from their POS and payroll software. Phone ordering feels outdated.",
      after: "Your portal matches the experience your accounts expect \u2014 clean, fast, self-service. Account managers stop being order takers.",
    },
    {
      before: "A specialty food account on the Upper West Side and a Midtown deli have completely different pricing, minimums, and delivery windows. Managing this manually is error-prone.",
      after: "Each account sees their own pricing, delivery window, and minimum order rules \u2014 automatically. No custom quoting required.",
    },
    {
      before: "Manhattan delivery windows are tight and unforgiving. An order that comes in late because a voicemail wasn\u2019t checked means a missed drop.",
      after: "Orders placed online by your cutoff time route immediately to your fulfillment team. No missed orders from late voicemails or unread emails.",
    },
  ],
  features: [
    "Product catalog organized by category \u2014 specialty food, produce, dry goods, imported goods, and more",
    "Per-account pricing tiers with borough-specific delivery rules and minimums",
    "Standing orders for your regular weekly NYC restaurant and retail accounts",
    "Delivery cutoff enforcement \u2014 orders placed after cutoff route to the next window automatically",
    "Stripe-powered invoice payments \u2014 accounts pay online",
    "Text message ordering for accounts who prefer to order from the floor",
    "Order confirmations and delivery window tracking via email and SMS",
    "Admin fulfillment board with route-based grouping and revenue analytics",
    "Bulk client import to onboard your existing New York accounts in minutes",
  ],
  testimonial: {
    quote: "We distribute imported specialty foods to about 90 restaurants and specialty retailers across Manhattan and Brooklyn. The competition here is brutal \u2014 every supplier is fighting for the same accounts. Wholesail gave us a portal that makes us look and feel like a much bigger operation. Our accounts order on their own schedule, our rep spends time on growth, and we\u2019re closing more accounts than we lose now.",
    name: "Sofia B.",
    company: "Adriatic Import Co.",
    industry: "Specialty Food Distribution \u2014 New York City",
  },
  stats: [
    {
      stat: "25,000+",
      label: "food service accounts in New York City alone \u2014 the most competitive wholesale market in the United States",
      source: "NYC Dept. of Health, 2024",
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

export default function NewYorkPage() {
  return <StatePage config={config} />;
}
