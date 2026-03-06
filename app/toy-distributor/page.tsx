import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Toy & Game Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for toy and game distributors. Independent toy stores, museum shops, and specialty retailers order online — seasonal pre-orders with deposit collection, assortment minimums, and Net-30 billing. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Toy & Game Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for toy distributors. Holiday pre-orders and assortment minimums managed automatically for specialty retail accounts. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/toy-distributor" },
};

const config: IndustryConfig = {
  slug: "toy-distributor",
  eyebrow: "For Toy & Game Distributors",
  h1Line1: "Q4 is your entire year. You're still taking",
  h1Line2: "holiday pre-orders through email threads.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for toy and game distributors. Independent toy stores, museum shops, and specialty retailers order online — seasonal pre-orders with deposit collection, assortment minimums by account type, and Net-30 billing for established retail buyers. Live in under 2 weeks.",
  heroStat:
    "Toy distributors who offer online pre-ordering capture 35% more confirmed holiday season orders than those managing pre-books by phone and email.",
  painPoints: [
    {
      before: "Your holiday pre-order window is 8 weeks and you spend the first 4 chasing confirmations by phone and email — half your retail accounts miss the window and you under-order because your committed volume isn't real.",
      after: "Pre-order windows open and close automatically in the portal. Retailers get one link, place their holiday pre-books online, and you see committed volume in real time from day one. No chasing, no spreadsheets, no guessing.",
    },
    {
      before: "Independent toy stores and museum shops order differently — toy stores want top-sellers in depth, museum shops want thematic assortments by collection — and your reps build custom orders for each one by hand.",
      after: "Account-type catalog views and assortment minimums are configured per segment. Museum accounts see curated collection groupings. Toy stores see bestsellers with depth-of-buy guidance. Each account orders from a catalog built for them.",
    },
    {
      before: "New licensed lines and exclusives sell through before your smaller retail accounts can react — they find out on the phone after you're already allocated out and they lose the sale for the season.",
      after: "New arrivals and limited-allocation products are published as featured drops in the portal with account-tier visibility controls. Priority accounts see and claim allocation before general availability opens.",
    },
    {
      before: "Your Net-30 retail accounts have credit limits — but when order season hits, your team manually checks balances before releasing orders, and high-volume periods back up because approval becomes a bottleneck.",
      after: "Credit limit checks happen automatically at checkout. Accounts over their limit see their available credit and can't submit orders that exceed it. No manual approval queue during your busiest weeks.",
    },
  ],
  features: [
    "Seasonal pre-order windows with open/close date enforcement and real-time committed volume tracking",
    "Assortment minimum configuration by account type — toy stores, museum shops, specialty retailers",
    "Limited-allocation featured drops with account-tier visibility controls for priority buyers",
    "Automated credit limit enforcement at checkout with available credit displayed to accounts",
    "Per-account pricing for established buyers, new accounts, and wholesale program tiers",
    "Net-30/60/90 billing with credit limits and overdue alerts for retail accounts",
    "Branded wholesale account portal with your logo and domain",
    "Deposit collection for pre-order confirmation with balance billing at ship date",
    "PDF order confirmation and invoice generation for retail buyer records",
    "Order history and one-click reorder for in-season replenishment and fill orders",
  ],
  testimonial: {
    quote:
      "Holiday pre-orders used to be a month-long scramble of emails and callbacks. We'd close the window still not sure if half our accounts were in. The portal opened and accounts just ordered — we hit 90% of our pre-book targets in the first two weeks. And the credit limit check at checkout alone saved us from three accounts that would have overextended in Q4.",
    name: "Meredith K.",
    company: "Brightplay Toy Distributors",
    industry: "Toy & Game Distribution",
  },
  sectionTitle: "What changes for toy and game distributors.",
  featuresTitle: "Everything a toy and game distributor needs.",
  stats: [
    {
      stat: "35%",
      label: "more confirmed holiday pre-orders captured by toy distributors offering online pre-booking vs. phone and email management",
      source: "ASTRA Specialty Toy Distributor Survey 2024",
    },
    {
      stat: "Q4",
      label: "accounts for over 60% of annual revenue for the average specialty toy distributor — making pre-order confirmation the most important operational process of the year",
      source: "Toy Industry Association Annual Report 2024",
    },
    {
      stat: "< 2 wks",
      label: "from your first call to a fully deployed, branded portal live for your independent toy store, museum shop, and specialty retail accounts",
      source: "Wholesail build average",
    },
  ],
};

export default function Page() {
  return <IndustryPage config={config} />;
}
