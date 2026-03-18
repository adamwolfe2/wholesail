import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { IntakeWizard } from "@/components/intake-wizard";

export const metadata: Metadata = {
  title: "B2B Wholesale Ordering Portal for North Carolina Distributors | Wholesail",
  description:
    "North Carolina wholesale distributors use Wholesail to give food/beverage, furniture, agricultural supply, and building materials accounts a self-service ordering portal. Built for the Research Triangle and beyond. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Wholesale Ordering Portal for North Carolina Distributors | Wholesail",
    description:
      "North Carolina is one of the fastest-growing states on the East Coast. Wholesail gives your accounts in Charlotte, Raleigh, and across the state a branded ordering portal so they order online instead of calling your competitors.",
  },
  alternates: { canonical: "https://wholesailhub.com/north-carolina" },
};

const PAIN_POINTS = [
  {
    before: "The Research Triangle — Raleigh, Durham, Chapel Hill — has one of the fastest-growing restaurant and food service markets in the Southeast. Managing order volume from that density by phone and email is unsustainable as you scale.",
    after: "Your branded portal lets every account in the Triangle place orders in under two minutes, any time of day. New accounts onboard in minutes and your reps focus on growing the territory instead of taking calls.",
  },
  {
    before: "North Carolina&apos;s food manufacturing sector — from meat processing in the east to specialty producers across the Piedmont — means your distributor accounts are placing high-frequency, high-volume reorders on tight timelines.",
    after: "Standing orders handle your regular weekly and bi-weekly accounts automatically. Every order routes to your fulfillment board the moment it&apos;s placed, with no manual entry required.",
  },
  {
    before: "Furniture and building materials accounts in Greensboro, High Point, and Winston-Salem expect accurate, contract-specific pricing on large orders. A quoting error on a commercial purchase means a lost account — and sometimes a lost relationship.",
    after: "Each account sees their negotiated pricing automatically. Volume tiers, category rules, and trade pricing apply to every order without a rep touching it — zero room for quoting mistakes.",
  },
  {
    before: "Agricultural supply accounts across the Charlotte region and eastern NC are seasonal, and managing pricing changes, promotional windows, and net-30 collections manually consumes your team every quarter.",
    after: "Seasonal pricing rules update across all accounts at once. Invoices generate on shipment. Automated payment reminders go out at Day 25, 30, and 35 — no collections calls needed.",
  },
];

const FEATURES = [
  "Product catalog organized by category — food/beverage, furniture, agricultural supply, building materials, and more",
  "Per-account pricing tiers with volume, trade, and seasonal discount rules",
  "Standing orders for recurring food service, manufacturing, and retail accounts",
  "Live inventory visibility so accounts know what&apos;s available before ordering",
  "Stripe-powered invoice payments — accounts pay online on their schedule",
  "Text message ordering for buyers who prefer to order from their phone",
  "Order confirmations and delivery tracking via email and SMS",
  "Admin fulfillment board, CRM, and revenue analytics in one dashboard",
  "Bulk client import to onboard your existing North Carolina accounts in minutes",
];

export default function NorthCarolinaPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <nav
        className="sticky top-0 z-50 px-4 sm:px-6 py-4 flex items-center justify-between"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link
          href="/"
          className="font-serif text-lg font-bold tracking-[0.05em]"
          style={{ color: "var(--text-headline)" }}
        >
          WHOLESAIL
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/#demo" className="font-mono text-[13px] hidden sm:block" style={{ color: "var(--text-body)" }}>
            See the Demo
          </Link>
          <Link
            href="/#intake-form"
            className="font-mono text-[13px] font-semibold btn-blue"
            style={{ padding: "9px 20px", borderRadius: "6px" }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <section className="py-20 sm:py-28" style={{ borderBottom: "1px solid var(--border)" }}>
          <span
            className="font-mono text-[10px] uppercase tracking-widest mb-5 block"
            style={{ color: "var(--text-muted)" }}
          >
            For North Carolina Wholesale Distributors
          </span>
          <h1
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] mb-6 max-w-3xl"
            style={{ color: "var(--text-headline)" }}
          >
            North Carolina is growing in every direction. Your accounts expect to order on their schedule, not yours.
            <br />
            <span style={{ color: "var(--blue)" }}>Give them a portal that keeps up with the Triangle.</span>
          </h1>
          <p
            className="font-mono text-sm leading-relaxed max-w-xl mb-10"
            style={{ color: "var(--text-body)" }}
          >
            Wholesail builds custom B2B ordering portals for North Carolina food/beverage, furniture, agricultural
            supply, and building materials distributors. Your accounts in Charlotte, Raleigh, Greensboro, Durham, and
            Winston-Salem order online 24/7 — no phone call, no voicemail, no rep required. Every order lands in your
            dashboard the moment it&apos;s placed. Live in under 2 weeks.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/#demo"
              className="inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold btn-blue"
              style={{ padding: "14px 28px", borderRadius: "6px" }}
            >
              See the Platform Demo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/#intake-form"
              className="inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold"
              style={{
                padding: "14px 28px",
                borderRadius: "6px",
                border: "1px solid var(--border-strong)",
                color: "var(--text-headline)",
              }}
            >
              Start Your Build
            </Link>
          </div>
          <p
            className="font-mono text-[11px] mt-4"
            style={{ color: "var(--text-muted)" }}
          >
            North Carolina is home to the Research Triangle, the furniture capital of the world, and one of the Southeast&apos;s largest food manufacturing sectors — and it&apos;s all growing.
          </p>
        </section>

        <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
          <span
            className="font-mono text-xs uppercase tracking-widest mb-6 block"
            style={{ color: "var(--text-muted)" }}
          >
            The Transformation
          </span>
          <h2
            className="font-serif text-3xl font-normal mb-10"
            style={{ color: "var(--text-headline)" }}
          >
            What changes when you launch your portal.
          </h2>
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-0"
            style={{ border: "1px solid var(--border-strong)" }}
          >
            <div
              className="p-8 border-b lg:border-b-0 lg:border-r"
              style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}
            >
              <div className="font-mono text-[9px] uppercase tracking-widest mb-6" style={{ color: "var(--text-muted)" }}>
                Before Wholesail
              </div>
              <div className="space-y-5">
                {PAIN_POINTS.map((p, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#dc2626" }} strokeWidth={2.5} />
                    <p className="font-mono text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>{p.before}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8" style={{ backgroundColor: "var(--bg-blue)" }}>
              <div className="font-mono text-[9px] uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
                After Wholesail
              </div>
              <div className="space-y-5">
                {PAIN_POINTS.map((p, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }} strokeWidth={2} />
                    <p className="font-mono text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>{p.after}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
          <span className="font-mono text-xs uppercase tracking-widest mb-6 block" style={{ color: "var(--text-muted)" }}>
            What&apos;s Included
          </span>
          <h2 className="font-serif text-3xl font-normal mb-10" style={{ color: "var(--text-headline)" }}>
            Everything your distribution business needs.
          </h2>
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-0"
            style={{ border: "1px solid var(--border-strong)" }}
          >
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`p-5 flex items-start gap-3 ${i < FEATURES.length - 1 ? "border-b sm:border-b-0 sm:border-r" : ""}`}
                style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--blue)" }} strokeWidth={2} />
                <span className="font-mono text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>{f}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
          <div
            className="p-8 sm:p-12"
            style={{ border: "1px solid var(--border-strong)", backgroundColor: "var(--bg-white)" }}
          >
            <p className="font-serif text-4xl leading-none mb-6 select-none" style={{ color: "var(--border-strong)" }}>&ldquo;</p>
            <blockquote
              className="font-mono text-sm leading-relaxed mb-8 max-w-2xl"
              style={{ color: "var(--text-body)" }}
            >
              We distribute specialty food and beverage to about 100 restaurants in the Raleigh-Durham area. The Triangle is growing so fast that we were adding accounts faster than we could manage orders. Wholesail gave every account a portal in their brand and our ordering volume doubled without us adding a single rep. That&apos;s the kind of leverage we needed.
            </blockquote>
            <div>
              <div className="font-mono text-[11px] font-semibold" style={{ color: "var(--text-headline)" }}>James F.</div>
              <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>Piedmont Food Partners</div>
              <div className="font-mono text-[9px] uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>Specialty Food & Beverage Distribution — Research Triangle, NC</div>
            </div>
          </div>
        </section>

        <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0" style={{ border: "1px solid var(--border-strong)" }}>
            {[
              {
                stat: "Top 10",
                label: "North Carolina ranks among the top 10 US states for food manufacturing output, with a fast-growing restaurant and food service market in the Research Triangle",
                source: "USDA ERS, 2024",
              },
              {
                stat: "3–4 hrs",
                label: "per day the average distribution team spends on order entry and follow-up calls",
                source: "Conexiom, 2024",
              },
              {
                stat: "< 2 wks",
                label: "from your first call to a fully deployed, branded portal live for your North Carolina accounts",
                source: "Wholesail build average",
              },
            ].map((s, i) => (
              <div
                key={i}
                className={`p-8 ${i < 2 ? "border-b sm:border-b-0 sm:border-r" : ""}`}
                style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}
              >
                <div className="text-4xl font-serif font-normal mb-2" style={{ color: "var(--text-headline)" }}>{s.stat}</div>
                <p className="font-mono text-[11px] leading-relaxed mb-2" style={{ color: "var(--text-body)" }}>{s.label}</p>
                <div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.source}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16" id="intake-form">
          <span className="font-mono text-xs uppercase tracking-widest mb-4 block" style={{ color: "var(--text-muted)" }}>
            Start Your Build
          </span>
          <h2 className="font-serif text-3xl font-normal mb-3" style={{ color: "var(--text-headline)" }}>
            Tell us about your distribution business.
          </h2>
          <p className="font-mono text-sm max-w-xl leading-relaxed mb-10" style={{ color: "var(--text-body)" }}>
            5 minutes. We review your answers before your call so every minute is spent on building your portal, not discovery.
          </p>
          <IntakeWizard />
        </section>
      </div>
    </div>
  );
}
