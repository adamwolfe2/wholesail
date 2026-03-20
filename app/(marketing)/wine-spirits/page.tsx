import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { LazyIntakeWizard } from "@/components/lazy-intake-wizard";

export const metadata: Metadata = {
  title: "Ordering Portal for Wine & Spirits Distributors | Wholesail",
  description:
    "Custom B2B ordering portals for wine importers and spirits distributors. Manage allocations, vintage changes, and standing orders — all in a client self-service portal. Live in under 2 weeks.",
  openGraph: {
    title: "Ordering Portal for Wine & Spirits Distributors | Wholesail",
    description:
      "Wine importers and spirits distributors use Wholesail to give on-premise and retail accounts a self-service ordering portal. Allocation management, vintage catalogs, Stripe billing.",
  },
  alternates: { canonical: "https://wholesailhub.com/wine-spirits" },
};

const PAIN_POINTS = [
  {
    before: "Allocation calls take hours. Retailers and restaurants call to ask what's available, what's allocated, and when shipments arrive.",
    after: "Clients check live allocation status inside their portal. They see exactly what's available and place their order without calling.",
  },
  {
    before: "Vintage changes and new releases require sending email blasts and hoping clients read them. Most don't.",
    after: "New releases and vintage updates trigger automatic notifications to relevant accounts. Clients see them in their portal and pre-order.",
  },
  {
    before: "Net-30 and Net-60 billing creates a collection backlog. You're chasing 40+ invoices manually each month.",
    after: "Invoices generate automatically. Clients pay online. Automated reminders go out at Day 25, 30, and 35. You collect faster.",
  },
  {
    before: "Reps manually track who gets what allocation. Spreadsheets conflict. Accounts get over-allocated or missed.",
    after: "Allocation rules live in the portal. Each account's limits are enforced on every order — no spreadsheet required.",
  },
];

const FEATURES = [
  "Vintage-level product catalog with tasting notes and allocations",
  "Per-account allocation caps enforced on every order",
  "Pre-order windows for new releases and seasonal arrivals",
  "Standing orders for recurring on-premise accounts",
  "Net-30 / Net-60 invoicing with automated payment reminders",
  "Stripe-powered online invoice payments",
  "Compliance notes and license tracking per account",
  "Order confirmations with full vintage and SKU details",
  "Admin dashboard: fulfillment, CRM, revenue by account and SKU",
];

export default function WineSpiritsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* NAV */}
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
        {/* HERO */}
        <section className="py-20 sm:py-28" style={{ borderBottom: "1px solid var(--border)" }}>
          <span
            className="font-mono text-[10px] uppercase tracking-widest mb-5 block"
            style={{ color: "var(--text-muted)" }}
          >
            For Wine Importers & Spirits Distributors
          </span>
          <h1
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] mb-6 max-w-3xl"
            style={{ color: "var(--text-headline)" }}
          >
            Your allocation calls are taking 3 hours a day.
            <br />
            <span style={{ color: "var(--blue)" }}>Your portal would take 3 seconds.</span>
          </h1>
          <p
            className="font-mono text-sm leading-relaxed max-w-xl mb-10"
            style={{ color: "var(--text-body)" }}
          >
            Wholesail builds custom ordering portals for wine importers and spirits distributors.
            Your on-premise and retail accounts check live allocations, place orders, and pay
            invoices — without calling. No more spreadsheet allocation tracking. No more
            callbacks. Deployed in under 2 weeks.
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
        </section>

        {/* BEFORE / AFTER */}
        <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
          <span className="font-mono text-xs uppercase tracking-widest mb-6 block" style={{ color: "var(--text-muted)" }}>
            The Transformation
          </span>
          <h2 className="font-serif text-3xl font-normal mb-10" style={{ color: "var(--text-headline)" }}>
            What changes for wine & spirits distributors.
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0" style={{ border: "1px solid var(--border-strong)" }}>
            <div className="p-8 border-b lg:border-b-0 lg:border-r" style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}>
              <div className="font-mono text-[9px] uppercase tracking-widest mb-6" style={{ color: "var(--text-muted)" }}>Before Wholesail</div>
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
              <div className="font-mono text-[9px] uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>After Wholesail</div>
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

        {/* FEATURES */}
        <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
          <span className="font-mono text-xs uppercase tracking-widest mb-6 block" style={{ color: "var(--text-muted)" }}>
            What's Included
          </span>
          <h2 className="font-serif text-3xl font-normal mb-10" style={{ color: "var(--text-headline)" }}>
            Built for how wine & spirits distribution actually works.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0" style={{ border: "1px solid var(--border-strong)" }}>
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

        {/* TESTIMONIAL */}
        <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="p-8 sm:p-12" style={{ border: "1px solid var(--border-strong)", backgroundColor: "var(--bg-white)" }}>
            <p className="font-serif text-4xl leading-none mb-6 select-none" style={{ color: "var(--border-strong)" }}>&ldquo;</p>
            <blockquote className="font-mono text-sm leading-relaxed mb-8 max-w-2xl" style={{ color: "var(--text-body)" }}>
              The invoice chasing alone was worth the price. We used to have 30–40 day collection cycles because someone had to manually follow up. Now reminders go out automatically and our average collection is down to 18 days.
            </blockquote>
            <div>
              <div className="font-mono text-[11px] font-semibold" style={{ color: "var(--text-headline)" }}>Elena V.</div>
              <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>Pacific Rim Wine Imports</div>
              <div className="font-mono text-[9px] uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>Wine & Spirits Distribution</div>
            </div>
          </div>
        </section>

        {/* INTAKE FORM */}
        <section className="py-16" id="intake-form">
          <span className="font-mono text-xs uppercase tracking-widest mb-4 block" style={{ color: "var(--text-muted)" }}>
            Start Your Build
          </span>
          <h2 className="font-serif text-3xl font-normal mb-3" style={{ color: "var(--text-headline)" }}>
            Tell us about your wine or spirits distribution business.
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
