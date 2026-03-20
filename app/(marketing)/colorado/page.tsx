import type { Metadata } from "next";
import { StatePage, type StateConfig } from "@/components/state-page-template";

export const metadata: Metadata = {
  title: "B2B Wholesale Ordering Portal for Colorado Distributors | Wholesail",
  description:
    "Colorado wholesale distributors use Wholesail to give craft beverage, natural/organic food, outdoor/sporting goods, and restaurant supply accounts a self-service ordering portal. Built for the craft beverage and natural food capital. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Wholesale Ordering Portal for Colorado Distributors | Wholesail",
    description:
      "Colorado is the craft beverage and natural food capital of the US. Wholesail gives your accounts in Denver, Boulder, Fort Collins, and beyond a branded ordering portal so they order online instead of calling around.",
  },
  alternates: { canonical: "https://wholesailhub.com/colorado" },
};

const config: StateConfig = {
  slug: "colorado",
  eyebrow: "For Colorado Wholesale Distributors",
  h1Line1: "Colorado is the craft beverage and natural food capital of the US. Your accounts expect to order as fast as they can tap a keg.",
  h1Line2: "Give them a portal built for this market.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for Colorado craft beverage, natural/organic food, outdoor supply, and restaurant supply distributors. Your accounts in Denver, Colorado Springs, Aurora, Fort Collins, and Boulder order online 24/7 \u2014 no phone call, no voicemail, no rep required. Every order lands in your dashboard the moment it\u2019s placed. Live in under 2 weeks.",
  heroStat: "Colorado has more craft breweries per capita than almost any state in the US \u2014 and a natural food and outdoor industry supply chain to match. The accounts here are sophisticated. The portal should be too.",
  sectionTitle: "What changes when you launch your portal.",
  featuresTitle: "Everything your distribution business needs.",
  painPoints: [
    {
      before: "Colorado has more craft breweries and distilleries per capita than almost any state in the country. Distributing across that many producers \u2014 each with their own SKUs, pricing, and seasonal releases \u2014 while managing accounts by phone is a full-time firefight.",
      after: "Your branded portal organizes your entire craft beverage catalog \u2014 beer, spirits, wine, cider \u2014 by producer and category. Each account sees only what they\u2019re approved to buy, with their pricing built in.",
    },
    {
      before: "Natural and organic food accounts in Boulder, Denver, and the Front Range are sophisticated buyers who expect accuracy and transparency. Manual quoting with spreadsheets puts you at risk the moment a price changes.",
      after: "Every account sees live, accurate pricing on every order. Organic premiums, volume tiers, and co-op program discounts apply automatically \u2014 no spreadsheet errors, no rep guesswork.",
    },
    {
      before: "Restaurant supply accounts across Denver, Colorado Springs, and Aurora are placing orders at all hours. Your team can\u2019t staff phones for a market that runs 7 days a week across ski season, summer tourism, and everything in between.",
      after: "Your portal takes orders around the clock, every day of the year. Every order routes to your dashboard the moment it\u2019s placed. Tourism spikes and seasonal surges don\u2019t overwhelm your team \u2014 the portal absorbs the volume.",
    },
    {
      before: "Outdoor and sporting goods supply accounts \u2014 pro shops, outfitters, resort retailers \u2014 have seasonal order patterns that require careful inventory management. Missing a pre-season order window means a lost account for 6 months.",
      after: "Standing pre-season orders and order windows ensure your accounts never miss a booking cycle. Automated reminders go out before each window closes so you capture every order.",
    },
  ],
  features: [
    "Product catalog organized by category \u2014 craft beer/spirits, natural food, outdoor supply, restaurant goods, and more",
    "Per-account pricing tiers with volume, organic premium, and contract discount rules",
    "Seasonal order windows and pre-season booking for outdoor and sporting goods accounts",
    "Live inventory visibility so accounts know what\u2019s available before ordering",
    "Stripe-powered invoice payments \u2014 accounts pay online on their schedule",
    "Text message ordering for buyers who prefer to order from their phone",
    "Order confirmations and delivery tracking via email and SMS",
    "Admin fulfillment board, CRM, and revenue analytics in one dashboard",
    "Bulk client import to onboard your existing Colorado accounts in minutes",
  ],
  testimonial: {
    quote: "We distribute craft beer and spirits to about 130 bars, restaurants, and retailers across the Front Range. Managing seasonal releases and limited SKUs by phone was killing our team every time a new batch dropped. Wholesail lets us set the catalog, set the pricing, and accounts place their own orders. We actually enjoy launch days now instead of dreading the call volume.",
    name: "Tom B.",
    company: "Mile High Craft Distribution",
    industry: "Craft Beer & Spirits Distribution \u2014 Denver / Front Range",
  },
  stats: [
    {
      stat: "#1",
      label: "Colorado ranks first in the US for craft breweries per capita and is a national leader in natural and organic food distribution volume",
      source: "Brewers Association, 2024",
    },
    {
      stat: "3\u20134 hrs",
      label: "per day the average distribution team spends on order entry and follow-up calls",
      source: "Conexiom, 2024",
    },
    {
      stat: "< 2 wks",
      label: "from your first call to a fully deployed, branded portal live for your Colorado accounts",
      source: "Wholesail build average",
    },
  ],
};

export default function ColoradoPage() {
  return <StatePage config={config} />;
}
