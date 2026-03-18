import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { IntakeWizard } from "@/components/intake-wizard";

export const metadata: Metadata = {
  title: "Ordering Portal for Industrial Supply Distributors | Wholesail",
  description:
    "Custom B2B ordering portals for MRO, safety, and industrial supply distributors. Contract pricing, large SKU catalogs, PO management — all in a self-service client portal. Live in under 2 weeks.",
  openGraph: {
    title: "Ordering Portal for Industrial Supply Distributors | Wholesail",
    description:
      "Industrial supply and MRO distributors use Wholesail to give maintenance, operations, and procurement teams a self-service ordering portal with contract pricing and PO management.",
  },
  alternates: { canonical: "https://wholesailhub.com/industrial-supply" },
};

const PAIN_POINTS = [
  {
    before: "Procurement teams place the same reorder every week by calling your rep or emailing a spreadsheet. It takes time on both sides.",
    after: "Clients log into their portal, see their order history, and reorder in 2 clicks. No call, no email, no rep required.",
  },
  {
    before: "Contract pricing is managed in spreadsheets. Reps quote from memory or have to look it up. Billing errors are common.",
    after: "Each account's contract pricing is locked into the portal. They see only their price on every SKU — no calls, no errors.",
  },
  {
    before: "Clients need a PO number on every order. Getting it right means back-and-forth to confirm, causing delays and errors.",
    after: "The portal has a PO field on every order. Clients enter it themselves. It flows through to the invoice automatically.",
  },
  {
    before: "Large SKU counts (500–2000+ items) make it impossible for clients to find what they need without calling.",
    after: "Clients search your catalog by part number, description, or category. Stock levels show in real time.",
  },
];

const FEATURES = [
  "Full product catalog with SKU search, categories, and filters",
  "Contract pricing per account — clients see only their rates",
  "PO number field on every order, passed through to invoice",
  "Standing / recurring orders for regular maintenance supplies",
  "Inventory visibility — clients see live stock before ordering",
  "Net-30 / Net-60 invoicing with automatic payment reminders",
  "Stripe-powered online invoice payments",
  "Order confirmations with full SKU and PO details",
  "Admin panel: fulfillment board, CRM, revenue by account",
];

export default function IndustrialSupplyPage() {
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
            For Industrial Supply & MRO Distributors
          </span>
          <h1
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] mb-6 max-w-3xl"
            style={{ color: "var(--text-headline)" }}
          >
            500 SKUs. 40 contract accounts.
            <br />
            <span style={{ color: "var(--blue)" }}>All managed in a spreadsheet. Not for much longer.</span>
          </h1>
          <p
            className="font-mono text-sm leading-relaxed max-w-xl mb-10"
            style={{ color: "var(--text-body)" }}
          >
            Wholesail builds custom B2B ordering portals for industrial supply and MRO distributors.
            Contract pricing locked per account, PO field on every order, full SKU search — everything
            your maintenance and procurement clients need to reorder without picking up the phone.
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
            What changes for industrial supply distributors.
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
            Built for industrial distribution workflows.
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
              I was skeptical because I&apos;ve tried software before and it always required months of setup and training. This was live in 11 days. My top 20 accounts were placing orders through the portal within the first week.
            </blockquote>
            <div>
              <div className="font-mono text-[11px] font-semibold" style={{ color: "var(--text-headline)" }}>Dave K.</div>
              <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>Central States Industrial Supply</div>
              <div className="font-mono text-[9px] uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>Industrial Distribution</div>
            </div>
          </div>
        </section>

        {/* INTAKE FORM */}
        <section className="py-16" id="intake-form">
          <span className="font-mono text-xs uppercase tracking-widest mb-4 block" style={{ color: "var(--text-muted)" }}>
            Start Your Build
          </span>
          <h2 className="font-serif text-3xl font-normal mb-3" style={{ color: "var(--text-headline)" }}>
            Tell us about your industrial supply business.
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
