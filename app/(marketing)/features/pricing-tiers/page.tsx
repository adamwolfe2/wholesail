import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { LazyIntakeWizard } from "@/components/lazy-intake-wizard";

export const metadata: Metadata = {
  title: "Per-Account Pricing for Wholesale Distributors | Wholesail",
  description:
    "Wholesail automates per-account pricing for wholesale distributors. Every account sees their own negotiated price on every product — no manual quoting, no rep memory, no mistakes.",
  openGraph: {
    title: "Per-Account Pricing for Wholesale Distributors | Wholesail",
    description:
      "The average distributor has 3–5 pricing tiers and 12+ accounts with custom prices. Wholesail applies the right price automatically on every order, every time.",
  },
  alternates: { canonical: "https://wholesailhub.com/features/pricing-tiers" },
};

const PAIN_POINTS = [
  {
    before: "You have 40 accounts and every one has different pricing. Your rep quotes from memory on calls and occasionally gets it wrong. The mistake costs you margin or the relationship.",
    after: "Every account&apos;s pricing is locked into their portal. They see their price when they browse — no quotes, no calls, no margin errors.",
  },
  {
    before: "Volume discount tiers, category-specific pricing, and seasonal rate changes have to be communicated to reps manually. Accounts who know their discount argue when they don&apos;t see it.",
    after: "Volume tiers calculate automatically at checkout. Seasonal rules apply on their effective date. No rep involvement required.",
  },
  {
    before: "When a rep leaves or you onboard a new one, institutional pricing knowledge walks out the door. New reps quote incorrectly for months before getting up to speed.",
    after: "All pricing lives in the platform, not in a rep&apos;s head. New reps inherit perfect pricing the day they start.",
  },
  {
    before: "Giving a custom price to a key account means updating a spreadsheet, informing the rep, and hoping they remember it on every future call. There&apos;s no enforcement.",
    after: "Custom account pricing is set once in the admin panel and applies automatically on every order that account places — until you change it.",
  },
];

const FEATURES = [
  "Named pricing tiers — Retail, Wholesale, Preferred, and fully custom tier names",
  "Per-SKU custom pricing overrides for individual accounts",
  "Volume discount rules: percentage off or flat price breaks at quantity thresholds",
  "Category-level pricing rules applied automatically across product groups",
  "Seasonal and promotional pricing with start and end date ranges",
  "Accounts only see their own pricing — never another account&apos;s rates",
  "Admin pricing dashboard with per-account and per-tier override visibility",
  "Bulk pricing import — update hundreds of account prices from a CSV upload",
  "Pricing audit log so you always know who changed what and when",
];

export default function PricingTiersPage() {
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
            Per-Account Pricing Automation
          </span>
          <h1
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] mb-6 max-w-3xl"
            style={{ color: "var(--text-headline)" }}
          >
            You have 40 accounts. Every one has different pricing.
            <br />
            <span style={{ color: "var(--blue)" }}>Your reps can&apos;t memorize that. Your portal can handle it automatically.</span>
          </h1>
          <p
            className="font-mono text-sm leading-relaxed max-w-xl mb-10"
            style={{ color: "var(--text-body)" }}
          >
            Wholesail&apos;s pricing engine applies the right price for every account on every order — automatically.
            Named tiers, custom SKU overrides, volume breaks, category rules, and seasonal pricing all live in
            the platform. Your reps never quote from memory again. Live in under 2 weeks.
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
            The average distributor has 3–5 distinct pricing tiers and 12+ accounts with custom negotiated prices.
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
            What changes when pricing runs on autopilot.
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
              We had pricing agreements with every account and no good way to enforce them. Our rep would quote the wrong price, the client would push back, and we&apos;d end up eating margin to keep the peace. With Wholesail, every account logs in and sees exactly their price on every product. We haven&apos;t had a pricing dispute in 6 months. It&apos;s saved us thousands and dozens of uncomfortable conversations.
            </blockquote>
            <div>
              <div className="font-mono text-[11px] font-semibold" style={{ color: "var(--text-headline)" }}>Marcus D.</div>
              <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>Cascade Specialty Distribution</div>
              <div className="font-mono text-[9px] uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>Specialty Food Distribution</div>
            </div>
          </div>
        </section>

        <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0" style={{ border: "1px solid var(--border-strong)" }}>
            {[
              {
                stat: "3–5",
                label: "distinct pricing tiers the average wholesale distributor maintains, plus 12+ accounts with fully custom negotiated prices",
                source: "NAED Distribution Survey, 2024",
              },
              {
                stat: "3–4 hrs",
                label: "per day the average distribution team spends on order entry and follow-up calls",
                source: "Conexiom, 2024",
              },
              {
                stat: "< 2 wks",
                label: "from your first call to a fully deployed, branded portal live for your clients",
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
          <LazyIntakeWizard />
        </section>
      </div>
    </div>
  );
}
