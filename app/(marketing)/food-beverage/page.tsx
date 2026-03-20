import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { LazyIntakeWizard } from "@/components/lazy-intake-wizard";

export const metadata: Metadata = {
  title: "Ordering Portal for Food & Beverage Distributors | Wholesail",
  description:
    "Custom B2B ordering portals for specialty food, produce, dairy, and beverage distributors. Clients order online 24/7 — you stop taking orders by phone. Built and deployed in under 2 weeks.",
  openGraph: {
    title: "Ordering Portal for Food & Beverage Distributors | Wholesail",
    description:
      "Specialty food and beverage distributors use Wholesail to give clients a self-service ordering portal. No more phone orders. No more missed calls. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/food-beverage" },
};

const PAIN_POINTS = [
  {
    before: "Clients call in orders during the day — or worse, after hours — and someone has to write it down and enter it by hand.",
    after: "Clients log in and place their own order any time. It appears in your admin panel the moment it's submitted.",
  },
  {
    before: "Pricing varies by account, season, and product category. Mistakes happen when reps quote from memory.",
    after: "Each client sees only their pricing tier. Volume discounts and category rules apply automatically on every order.",
  },
  {
    before: "Clients call to ask what's in stock, what's on promo, and when their last delivery was. Each call is 5–10 minutes.",
    after: "Clients check their own order history, view live inventory, and see active promotions inside their portal.",
  },
  {
    before: "Invoices go out when someone has time. Following up on late payments means more phone calls and more time lost.",
    after: "Invoices generate when orders ship. Reminders go out automatically at Day 25, 30, and 35. You collect faster.",
  },
];

const FEATURES = [
  "Product catalog organized by category (produce, dairy, dry goods, etc.)",
  "Per-account pricing tiers with volume discounts",
  "Standing / recurring orders for regular weekly accounts",
  "Inventory visibility so clients know what's available before ordering",
  "Stripe-powered invoice payments — clients pay online",
  "Text message ordering for clients who prefer to order by phone",
  "Order confirmations and shipment tracking via email",
  "Admin panel: fulfillment board, CRM, revenue analytics",
  "Bulk client import — onboard your existing accounts in minutes",
];

export default function FoodBeveragePage() {
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
            For Food & Beverage Distributors
          </span>
          <h1
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] mb-6 max-w-3xl"
            style={{ color: "var(--text-headline)" }}
          >
            Your specialty food clients are placing orders at 11pm.
            <br />
            <span style={{ color: "var(--blue)" }}>Your team is asleep. That&apos;s a problem.</span>
          </h1>
          <p
            className="font-mono text-sm leading-relaxed max-w-xl mb-10"
            style={{ color: "var(--text-body)" }}
          >
            Wholesail builds custom B2B ordering portals for specialty food, produce, dairy, and
            beverage distributors. Your clients order online 24/7 — no phone call, no voicemail,
            no rep required. Every order lands in your dashboard the moment it&apos;s placed.
            Live in under 2 weeks.
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
            73% of food & beverage distributors still take orders by phone or email. That changes when you launch.
          </p>
        </section>

        {/* BEFORE / AFTER */}
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
            What changes for food & beverage distributors.
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

        {/* FEATURES */}
        <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
          <span className="font-mono text-xs uppercase tracking-widest mb-6 block" style={{ color: "var(--text-muted)" }}>
            What's Included
          </span>
          <h2 className="font-serif text-3xl font-normal mb-10" style={{ color: "var(--text-headline)" }}>
            Everything a food & beverage distributor needs.
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

        {/* TESTIMONIAL */}
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
              We were running everything through text messages and a shared Google Sheet. Our rep would spend Sunday nights entering orders for Monday delivery. Now clients order themselves and we just fulfill. I wish we had done this two years ago.
            </blockquote>
            <div>
              <div className="font-mono text-[11px] font-semibold" style={{ color: "var(--text-headline)" }}>Marcus T.</div>
              <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>Fresh Coast Specialty Foods</div>
              <div className="font-mono text-[9px] uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>Food & Beverage Distribution</div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0" style={{ border: "1px solid var(--border-strong)" }}>
            {[
              { stat: "73%", label: "of food & beverage distributors still take orders by phone or email", source: "USDA Distribution Survey" },
              { stat: "3–4 hrs", label: "per day the average distribution team spends on order entry and follow-up calls", source: "Conexiom, 2024" },
              { stat: "< 2 wks", label: "from your first call to a fully deployed, branded portal live for your clients", source: "Wholesail build average" },
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

        {/* INTAKE FORM */}
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
