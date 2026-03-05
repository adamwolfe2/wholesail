import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "Ordering Portal for Plumbing & HVAC Supply Distributors | Wholesail",
  description: "Wholesail builds custom B2B ordering portals for plumbing and HVAC supply distributors. Plumbers and HVAC contractors check live inventory by part number, place orders, and schedule will-call or delivery — per-contractor pricing and net-30 billing included. Live in under 2 weeks.",
  openGraph: {
    title: "Ordering Portal for Plumbing & HVAC Supply Distributors | Wholesail",
    description: "Wholesail builds custom B2B ordering portals for plumbing and HVAC supply distributors. Plumbers and HVAC contractors check live inventory by part number, place orders, and schedule will-call or delivery — per-contractor pricing and net-30 billing included. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/plumbing-hvac" },
};

const config: IndustryConfig = {
  slug: "plumbing-hvac",
  eyebrow: "For Plumbing & HVAC Distributors",
  h1Line1: "Your plumbers and HVAC techs need parts when a job is on the line.",
  h1Line2: "Live inventory lookup means they call you first.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for plumbing and HVAC supply distributors. Plumbers and HVAC contractors check live inventory by part number, place orders, and schedule will-call or delivery — per-contractor pricing, job site address book, and net-30 billing included. Live in under 2 weeks.",
  heroStat:
    "A plumber or HVAC tech without the right part is costing their customer $150+ per hour. They need confirmation fast.",
  painPoints: [
    {
      before: "Contractors call before every order to ask if you have the part in stock — and your counter staff spends the first half of every day on availability calls.",
      after: "Live inventory by part number and spec is visible in the portal around the clock. Contractors confirm availability in seconds and place the order without a call.",
    },
    {
      before: "Emergency jobs mean contractors need parts immediately, but after-hours phone orders don't reach your team until the morning and the job sits.",
      after: "Orders placed after hours queue automatically and are prioritized at first fulfillment. Contractors get confirmation immediately and know their part is coming.",
    },
    {
      before: "Every contractor has negotiated pricing and your counter staff is manually checking rates and fixing invoices after every phone order.",
      after: "Per-contractor pricing is configured in every account. The rate shown at checkout is the rate on the invoice — no rate checks, no corrections.",
    },
    {
      before: "Delivery to job sites requires a phone call to give the address, and addresses have to be re-provided on every single order.",
      after: "Contractors maintain a job site address book in the portal. Selecting a delivery address at checkout takes five seconds.",
    },
  ],
  features: [
    "Part number and spec search with live inventory results",
    "Live inventory display by warehouse location",
    "Will-call scheduling with confirmed ready-time notification",
    "Same-day delivery cut-off display with order deadline countdown",
    "Per-contractor pricing tiers configured per account",
    "Job site address book saved per contractor account",
    "Net-30 invoicing with automated PDF generation",
    "Core return tracking and credit management",
    "Admin order and fulfillment board with will-call queue and delivery routing",
  ],
  testimonial: {
    quote:
      "I was on a rooftop replacing an HVAC unit and realized I needed a specific part. I checked inventory on my phone, saw it was in stock, placed the order, and scheduled a pickup for when I got down. By the time I was back on the ground, the order was being pulled. That would have been a 20-minute phone call before.",
    name: "Tom B.",
    company: "Northwest Plumbing & HVAC Supply",
    industry: "Plumbing & HVAC Distribution",
  },
  sectionTitle: "What changes for plumbing and HVAC distributors.",
  featuresTitle: "Everything a plumbing and HVAC distributor needs.",
  stats: [
    {
      stat: "71%",
      label: "of plumbing and HVAC contractors call their supply house before ordering to confirm availability",
      source: "PHCC Member Survey 2024",
    },
    {
      stat: "$180",
      label: "average hourly cost to a residential customer when a plumber or HVAC tech is waiting for parts",
      source: "Wholesail estimate",
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
