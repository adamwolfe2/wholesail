import type { Metadata } from "next";
import { StatePage, type StateConfig } from "@/components/state-page-template";

export const metadata: Metadata = {
  title: "B2B Wholesale Ordering Portal for Washington Distributors | Wholesail",
  description:
    "Washington wholesale distributors use Wholesail to give seafood, wine/spirits, agricultural, specialty food, and tech company supply accounts a self-service ordering portal. Built for the Pacific Northwest. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Wholesale Ordering Portal for Washington Distributors | Wholesail",
    description:
      "Washington state distributors move some of the most in-demand products on the West Coast \u2014 seafood, wine, coffee, specialty food. Wholesail gives your accounts a branded ordering portal so they order online instead of calling around.",
  },
  alternates: { canonical: "https://wholesailhub.com/washington" },
};

const config: StateConfig = {
  slug: "washington",
  eyebrow: "For Washington Wholesale Distributors",
  h1Line1: "Washington distributes the Pacific Northwest\u2019s best \u2014 seafood, wine, coffee, specialty food. Your accounts need to order without waiting on a phone rep.",
  h1Line2: "Give them a portal built for the Pacific Northwest.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for Washington seafood, wine/spirits, agricultural, specialty food, and tech company supply distributors. Your accounts in Seattle, Spokane, Tacoma, Bellevue, and Olympia order online 24/7 \u2014 no phone call, no voicemail, no rep required. Every order lands in your dashboard the moment it\u2019s placed. Live in under 2 weeks.",
  heroStat: "Washington state is home to the country\u2019s premier seafood, wine, and coffee supply chains \u2014 and accounts expect the buying experience to match the product quality.",
  sectionTitle: "What changes when you launch your portal.",
  featuresTitle: "Everything your distribution business needs.",
  painPoints: [
    {
      before: "Seattle\u2019s tech campuses and corporate food programs place large, complex orders across dozens of product categories. Managing those through email and phone means errors and delays that reflect poorly on your operation.",
      after: "Your branded portal gives corporate buyers and tech campus food program managers a clean ordering experience with their specific catalog and pricing. Orders route to your fulfillment board instantly \u2014 no manual entry.",
    },
    {
      before: "Pacific Northwest seafood distribution is time-critical. Accounts need to know what\u2019s available that day and order before the window closes. Chasing inventory by phone call wastes time everyone on both sides doesn\u2019t have.",
      after: "Live inventory visibility lets seafood buyers see what\u2019s available in real time. They order from their portal, you get the order immediately, and nothing sits on voicemail past the freshness window.",
    },
    {
      before: "Washington wine and spirits accounts \u2014 restaurants, retailers, bars across Seattle, Bellevue, and Spokane \u2014 each have different pricing arrangements and product access. Managing that manually by rep is error-prone and scales poorly.",
      after: "Each account sees their negotiated pricing and approved catalog automatically. Volume tiers and category rules apply on every order without rep involvement \u2014 whether you have 30 accounts or 300.",
    },
    {
      before: "Following up on net-30 invoices from agricultural and specialty food accounts across a state this spread out eats hours of calls every week. Western and eastern WA accounts operate on completely different schedules.",
      after: "Invoices generate on shipment. Automated payment reminders go out at Day 25, 30, and 35. You collect on time without making a single collections call \u2014 regardless of which side of the Cascades the account is on.",
    },
  ],
  features: [
    "Product catalog organized by category \u2014 seafood, wine/spirits, agricultural, specialty food, coffee supply, and more",
    "Per-account pricing tiers with volume, regional, and contract discount rules",
    "Live inventory visibility \u2014 critical for time-sensitive seafood and seasonal agricultural products",
    "Standing orders for recurring tech campus, restaurant, and retail accounts",
    "Stripe-powered invoice payments \u2014 accounts pay online on their schedule",
    "Text message ordering for buyers who prefer to order from their phone",
    "Order confirmations and delivery tracking via email and SMS",
    "Admin fulfillment board, CRM, and revenue analytics in one dashboard",
    "Bulk client import to onboard your existing Washington accounts in minutes",
  ],
  testimonial: {
    quote: "We distribute Pacific Northwest seafood and specialty agricultural products to restaurants and corporate food programs across the Seattle metro. The time-sensitivity of seafood makes phone ordering a liability \u2014 by the time someone calls back, the window is gone. Wholesail\u2019s live inventory and instant ordering changed everything. Accounts check what\u2019s fresh, order in two minutes, and we\u2019re done.",
    name: "Sarah L.",
    company: "Cascade Provisions",
    industry: "Seafood & Specialty Food Distribution \u2014 Greater Seattle",
  },
  stats: [
    {
      stat: "#1",
      label: "Washington leads the US in seafood processing volume and is among the top wine-producing states \u2014 two of the most demanding wholesale distribution categories",
      source: "NOAA Fisheries, 2024",
    },
    {
      stat: "3\u20134 hrs",
      label: "per day the average distribution team spends on order entry and follow-up calls",
      source: "Conexiom, 2024",
    },
    {
      stat: "< 2 wks",
      label: "from your first call to a fully deployed, branded portal live for your Washington accounts",
      source: "Wholesail build average",
    },
  ],
};

export default function WashingtonPage() {
  return <StatePage config={config} />;
}
