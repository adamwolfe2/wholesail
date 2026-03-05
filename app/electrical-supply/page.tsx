import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "Ordering Portal for Electrical Supply Distributors | Wholesail",
  description: "Wholesail builds custom B2B ordering portals for electrical supply distributors and commercial electrical wholesalers. Contractors check live inventory by part number, place orders, and schedule pickups — per-contractor pricing and net-30 billing included. Live in under 2 weeks.",
  openGraph: {
    title: "Ordering Portal for Electrical Supply Distributors | Wholesail",
    description: "Wholesail builds custom B2B ordering portals for electrical supply distributors and commercial electrical wholesalers. Contractors check live inventory by part number, place orders, and schedule pickups — per-contractor pricing and net-30 billing included. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/electrical-supply" },
};

const config: IndustryConfig = {
  slug: "electrical-supply",
  eyebrow: "For Electrical Supply Distributors",
  h1Line1: "Your electrical contractors are ordering parts from three different will-calls.",
  h1Line2: "A live inventory portal makes you the first call and the last.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for electrical supply distributors and commercial electrical wholesalers. Electrical contractors check live inventory by part number, place orders, and schedule pickups or delivery — per-contractor pricing, project account management, and net-30 billing included. Live in under 2 weeks.",
  heroStat:
    "Electrical contractors move fast. They'll buy from whoever can confirm availability in under 60 seconds.",
  painPoints: [
    {
      before: "Contractors call before every order to confirm you have the part — and your counter staff spends all day on availability calls instead of fulfillment.",
      after: "Live inventory by part number and spec is visible in the portal 24/7. Contractors confirm availability in seconds and place the order without calling.",
    },
    {
      before: "Commercial electrical projects span months and involve dozens of orders — tracking what was ordered for which project is a mess of spreadsheets and emails.",
      after: "Contractors create project accounts in the portal and all orders are tagged by project. Order history by project is visible at any time.",
    },
    {
      before: "Every contractor has a negotiated pricing structure, and your team is manually checking rates and adjusting invoices after orders come in.",
      after: "Per-contractor pricing is built into every account. The rate shown at checkout is the rate on the invoice — no manual adjustments.",
    },
    {
      before: "Will-call vs. delivery coordination happens by phone, and contractors show up to pick up orders that haven't been pulled yet.",
      after: "Contractors choose will-call or delivery at checkout and get a confirmed ready time or delivery window. No surprises when they arrive.",
    },
  ],
  features: [
    "Live inventory search by part number, spec, and product type",
    "Will-call scheduling with ready-time confirmation",
    "Delivery routing with date and address selection",
    "Per-contractor pricing tiers configured per account",
    "Project account management with order history by project",
    "Net-30 invoicing with automated PDF generation",
    "Order history by project for easy tracking and reorder",
    "Bulk order entry for large commercial electrical jobs",
    "Admin order and fulfillment board with will-call queue and delivery tracking",
  ],
  testimonial: {
    quote:
      "My guys used to call from the job site, get put on hold, and half the time the part wasn't there. Now they check inventory on their phone, place the order, and schedule pickup while they're still on the roof. I haven't lost an order to a competitor in months.",
    name: "Ray K.",
    company: "Apex Electrical Supply",
    industry: "Electrical Supply Distribution",
  },
  sectionTitle: "What changes for electrical supply distributors.",
  featuresTitle: "Everything an electrical supply distributor needs.",
  stats: [
    {
      stat: "73%",
      label: "of electrical contractors report calling their supply house at least 4 times per day for availability checks",
      source: "NAED Distribution Report 2024",
    },
    {
      stat: "5.1 hrs",
      label: "per day spent by electrical supply reps on inbound availability and order calls",
      source: "Wholesail customer survey",
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
