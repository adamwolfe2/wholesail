import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { IntakeWizard } from "@/components/intake-wizard";

export const metadata: Metadata = {
  title: "B2B Wholesale Ordering Portal for Arizona Distributors | Wholesail",
  description:
    "Arizona wholesale distributors use Wholesail to give construction/building materials, food/beverage, restaurant supply, and HVAC/plumbing accounts a self-service ordering portal. Built for a fast-growing market. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Wholesale Ordering Portal for Arizona Distributors | Wholesail",
    description:
      "Arizona is one of the fastest-growing markets in the US. Wholesail gives your accounts in Phoenix, Tucson, and Scottsdale a branded ordering portal so they reorder online instead of calling around.",
  },
  alternates: { canonical: "https://wholesailhub.com/arizona" },
};

const PAIN_POINTS = [
  {
    before: "Arizona&apos;s construction boom means building materials and HVAC/plumbing accounts are placing large, time-sensitive orders constantly. Managing those by phone means delays — and delays on a job site cost your accounts money they won&apos;t forget.",
    after: "Your branded portal lets project managers and site buyers place orders instantly, attach job numbers, and track delivery status. No waiting on hold, no voicemail callbacks.",
  },
  {
    before: "Phoenix and Scottsdale&apos;s resort and hospitality sector runs large food and beverage programs. The volume is great, but the ordering chaos — texts, faxes, last-minute calls — is unsustainable as you scale.",
    after: "Every hospitality account gets their own portal with their pricing, product catalog, and standing orders pre-configured. Reorders take two minutes instead of two phone calls.",
  },
  {
    before: "Restaurant supply accounts across Mesa, Chandler, and Tempe are placing orders at all hours to keep up with Arizona&apos;s booming dining scene. Your team can&apos;t staff phones 24/7 to cover it.",
    after: "Your portal takes orders around the clock. Every order routes to your fulfillment board the moment it&apos;s placed — no rep required, no orders missed.",
  },
  {
    before: "Following up on net-30 invoices from 70+ Arizona accounts eats hours every week. Cash flow tightens during slow seasons and payment chasing becomes a second job.",
    after: "Invoices generate on shipment. Automated payment reminders go out at Day 25, 30, and 35. You collect faster without making a single collections call.",
  },
];

const FEATURES = [
  "Product catalog organized by category — construction materials, food/beverage, restaurant supply, HVAC/plumbing, and more",
  "Per-account pricing tiers with volume, contract, and project-based discount rules",
  "Standing orders for recurring restaurant, hospitality, and contractor accounts",
  "Live inventory visibility so accounts know what&apos;s available before ordering",
  "Stripe-powered invoice payments — accounts pay online on their schedule",
  "Text message ordering for site managers and buyers who order from the field",
  "Order confirmations and delivery tracking via email and SMS",
  "Admin fulfillment board, CRM, and revenue analytics in one dashboard",
  "Bulk client import to onboard your existing Arizona accounts in minutes",
];

export default function ArizonaPage() {
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
            For Arizona Wholesale Distributors
          </span>
          <h1
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] mb-6 max-w-3xl"
            style={{ color: "var(--text-headline)" }}
          >
            Arizona is growing faster than any distributor can keep up with manually. Your accounts need to order without waiting on your team.
            <br />
            <span style={{ color: "var(--blue)" }}>Give them a portal built for a boom market.</span>
          </h1>
          <p
            className="font-mono text-sm leading-relaxed max-w-xl mb-10"
            style={{ color: "var(--text-body)" }}
          >
            Wholesail builds custom B2B ordering portals for Arizona construction/building materials, food/beverage,
            restaurant supply, and HVAC/plumbing distributors. Your accounts in Phoenix, Tucson, Mesa, Scottsdale, and
            Chandler order online 24/7 — no phone call, no voicemail, no rep required. Every order lands in your
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
            Arizona is one of the fastest-growing states in the US — and the construction and hospitality sectors driving that growth need a distributor who can keep up.
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
              We supply restaurant equipment and food service supplies to hotels and restaurants across the Phoenix and Scottsdale resort corridor. The volume was growing faster than our reps could handle. Wholesail gave every account their own ordering portal and we went from fielding 40 calls a day to maybe 5. The ones that still call are new accounts — which is exactly how it should be.
            </blockquote>
            <div>
              <div className="font-mono text-[11px] font-semibold" style={{ color: "var(--text-headline)" }}>Ryan M.</div>
              <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>Desert Supply Co.</div>
              <div className="font-mono text-[9px] uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>Restaurant & Hospitality Supply Distribution — Greater Phoenix</div>
            </div>
          </div>
        </section>

        <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0" style={{ border: "1px solid var(--border-strong)" }}>
            {[
              {
                stat: "#1",
                label: "Arizona ranks first in the US for population growth rate, driving sustained demand across construction, hospitality, and food service supply",
                source: "US Census Bureau, 2024",
              },
              {
                stat: "3–4 hrs",
                label: "per day the average distribution team spends on order entry and follow-up calls",
                source: "Conexiom, 2024",
              },
              {
                stat: "< 2 wks",
                label: "from your first call to a fully deployed, branded portal live for your Arizona accounts",
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
