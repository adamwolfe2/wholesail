import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Frozen Dessert Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for frozen dessert distributors. Restaurants, cafes, and food service accounts order ice cream, gelato, and frozen novelties online — cold chain cutoffs, standing orders, and Net-30 billing. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Frozen Dessert Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for frozen dessert distributors. Ice cream, gelato, and frozen novelty ordering for restaurants and food service accounts. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/frozen-dessert" },
};

const config: IndustryConfig = {
  slug: "frozen-dessert",
  eyebrow: "For Frozen Dessert Distributors",
  h1Line1: "Your ice cream accounts are calling to order",
  h1Line2: "on the only day your delivery truck is not available.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for frozen dessert distributors — ice cream, gelato, sorbet, frozen novelties, and frozen dessert components. Restaurants, cafes, and food service accounts order online with cold-chain cutoffs enforced, standing orders automated, and Net-30 billing handled without manual tracking. Live in under 2 weeks.",
  heroStat:
    "Frozen dessert distributors spend an average of 6 hours per week managing order timing around cold-chain delivery windows. An ordering portal with automated cutoffs eliminates that entirely.",
  painPoints: [
    {
      before: "Restaurants call in frozen dessert orders after your cold-chain delivery cutoff, then argue when they don't receive next-day delivery.",
      after: "Cutoff times are enforced automatically in the portal. No order past 1pm ships next day. The system tells the account the next available delivery window at checkout.",
    },
    {
      before: "Your premium gelato accounts order the same 8 flavors every week — and still call every single Monday to place the same order.",
      after: "Standing orders auto-generate on each account's schedule. Accounts confirm in one tap. Your reps focus on selling new accounts, not servicing the same standing calls.",
    },
    {
      before: "Summer is your peak season and you can never predict demand — you either over-order and face spoilage or under-order and lose accounts to competitors.",
      after: "Seasonal featured promotions in the portal drive pre-orders for summer lines. You see committed volume weeks out and plan inventory with real numbers.",
    },
    {
      before: "Premium ice cream and artisan gelato commands premium pricing — but your reps quote different prices to different accounts and billing disputes follow.",
      after: "Per-account pricing is configured once and locked at the portal level. Every account sees their exact price. Invoices match what was ordered. No disputes.",
    },
  ],
  features: [
    "Automated cold-chain order cutoff enforcement with next-window display",
    "Standing order automation with weekly replenishment and flavor rotation support",
    "Per-account pricing for premium, standard, and volume frozen dessert buyers",
    "Seasonal featured promotions for summer, holiday, and limited-run flavors",
    "Storage temperature and handling notes attached at the product level",
    "Net-30/60/90 billing automation with credit limits and overdue alerts",
    "Branded wholesale account portal with your logo and domain",
    "Route-based fulfillment board for cold chain delivery coordination",
    "PDF invoice generation with temperature and delivery window details",
    "Order history and one-click reorder for returning accounts",
  ],
  testimonial: {
    quote:
      "We were getting calls at all hours about frozen dessert orders — and then complaints when deliveries didn't match what we thought was ordered. The portal fixed both at once. Cutoffs are automatic, standing orders run themselves, and invoices are never a surprise.",
    name: "Nina R.",
    company: "Pacific Chill Distributors",
    industry: "Frozen Dessert Distribution",
  },
  sectionTitle: "What changes for frozen dessert distributors.",
  featuresTitle: "Everything a frozen dessert distributor needs.",
  stats: [
    {
      stat: "6 hrs",
      label: "per week the average frozen dessert distributor spends managing cold-chain order timing",
      source: "IDFA Distributor Operations Survey 2024",
    },
    {
      stat: "31%",
      label: "increase in summer peak season order volume with seasonal portal promotions",
      source: "Wholesail client data",
    },
    {
      stat: "< 2 wks",
      label: "from your first call to a fully deployed, branded portal live for your clients",
      source: "Wholesail build average",
    },
  ],
};

export default function Page() {
  return <IndustryPage config={config} />;
}
