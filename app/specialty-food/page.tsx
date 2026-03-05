import type { Metadata } from "next";
import { IndustryPage, type IndustryConfig } from "@/components/industry-page-template";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Specialty Food Importers & Distributors | Wholesail",
  description: "Wholesail builds custom wholesale ordering portals for specialty food importers, artisan food distributors, and premium grocery suppliers. Accounts browse, order, and track deliveries without calling a rep. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Specialty Food Importers & Distributors | Wholesail",
    description: "Wholesail builds custom wholesale ordering portals for specialty food importers, artisan food distributors, and premium grocery suppliers. Accounts browse, order, and track deliveries without calling a rep. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/specialty-food" },
};

const config: IndustryConfig = {
  slug: "specialty-food",
  eyebrow: "For Specialty Food Importers & Distributors",
  h1Line1: "Your specialty accounts want to discover and order new products.",
  h1Line2: "A PDF catalog and a phone call isn't the experience they expect.",
  heroBody:
    "Wholesail builds custom B2B ordering portals for specialty food importers, artisan food distributors, and premium grocery suppliers. Your accounts browse your catalog, place orders, and track deliveries without calling a rep. New arrivals and seasonal items push to your portal automatically. Live in under 2 weeks.",
  heroStat:
    "Specialty food buyers expect a curated discovery experience — not a 40-page PDF emailed monthly.",
  painPoints: [
    {
      before: "Your catalog is a PDF or a spreadsheet that buyers skim once and file away — new products go unnoticed.",
      after: "Your portal surfaces new arrivals, seasonal picks, and curated collections every time a buyer logs in.",
    },
    {
      before: "Communicating new arrivals means emailing 80 accounts and hoping the right buyer reads it.",
      after: "New arrival spotlights publish to your portal instantly. Buyers discover and order in the same session.",
    },
    {
      before: "Specialty items carry different pricing for different account tiers — and reps are quoting inconsistently.",
      after: "Per-account pricing is set at the portal level. Every buyer sees the correct price, every time.",
    },
    {
      before: "Verbal orders for specialty items lead to SKU errors that damage relationships with your best accounts.",
      after: "Written, confirmed orders with product photos and SKU details eliminate substitution errors completely.",
    },
  ],
  features: [
    "Curated catalog with tasting notes, origin stories, and certifications per product",
    "New arrival spotlight section updated with each import or seasonal release",
    "Country of origin, certifications, and producer background on each listing",
    "Per-account pricing tiers for different buyer types and volume levels",
    "Branded wholesale portal with your logo and domain",
    "PDF invoice generation on every confirmed order",
    "Seasonal and limited availability windows with automatic archiving",
    "Reorder alerts when favorite items come back in stock",
    "Order history and one-click reorder for returning specialty accounts",
  ],
  testimonial: {
    quote:
      "Our buyers are food professionals — they want to discover, research, and order on their own timeline. Wholesail gave them that. Our average order value went up 40% in the first two months because buyers were actually browsing the catalog instead of just calling for the same five items.",
    name: "Priya S.",
    company: "Artisan Source Imports",
    industry: "Specialty Food Distribution",
  },
  sectionTitle: "What changes for specialty food importers and distributors.",
  featuresTitle: "Everything a specialty food distributor needs.",
  stats: [
    {
      stat: "3.2x",
      label: "more SKUs ordered per session when specialty buyers have a self-service portal vs. rep-driven sales",
      source: "Wholesail customer data",
    },
    {
      stat: "45%",
      label: "of specialty food distributor revenue growth comes from existing account upsells",
      source: "SPINS 2024",
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
