import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { LazyIntakeWizard } from "@/components/lazy-intake-wizard";

export const metadata: Metadata = {
  title: "B2B Ordering Portal for Wholesale Distributors | Wholesail",
  description:
    "Wholesail builds custom B2B ordering portals for wholesale distributors. Your accounts get their own branded login to order 24/7. Live in under 2 weeks.",
  openGraph: {
    title: "B2B Ordering Portal for Wholesale Distributors | Wholesail",
    description:
      "Wholesail builds custom B2B ordering portals for wholesale distributors. Your accounts get their own branded login to order 24/7. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/features/b2b-ordering-portal" },
};

const PAIN_POINTS = [
  {
    before:
      "Your best accounts want to place orders at 9pm when they&apos;re doing end-of-night inventory. Your office is closed. They write it down and call tomorrow.",
    after:
      "The portal is open 24/7. Accounts browse your catalog, build their order, and submit from their phone, anywhere, any time. You see it in the morning.",
  },
  {
    before:
      "Your rep emails a price list PDF to every new account. The PDF is already out of date by the time they open it.",
    after:
      "Every account logs into their private portal and sees their exact pricing — always current, always specific to their account level.",
  },
  {
    before:
      "When a new product lands in the warehouse, you send a group email. Most accounts miss it. The good stuff sells before word gets out.",
    after:
      "New arrivals and featured promotions appear on portal login. Every account sees it the day it&apos;s live.",
  },
  {
    before:
      "You don&apos;t know if an account is looking at your catalog, considering a competitor, or just waiting for someone to follow up.",
    after:
      "You see which accounts logged in, what they browsed, and which ones haven&apos;t ordered in 30+ days. Rep outreach is triggered by data, not guesses.",
  },
];

const FEATURES = [
  "Branded portal with your company&apos;s logo and domain",
  "Per-account catalog and pricing (account only sees what they&apos;re approved to buy)",
  "24/7 online ordering from any device",
  "Order confirmation emails on submission",
  "Standing order automation for recurring accounts",
  "Net-30/60/90 billing with invoice history",
  "New arrival and featured promotions visible on login",
  "Product search by SKU, name, and category",
  "One-click reorder from order history",
];

export default function B2BOrderingPortalPage() {
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
            B2B Self-Service Ordering Portal
          </span>
          <h1
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] mb-6 max-w-3xl"
            style={{ color: "var(--text-headline)" }}
          >
            Your wholesale accounts want to order online.
            <br />
            <span style={{ color: "var(--blue)" }}>You&apos;re still making them call your office.</span>
          </h1>
          <p
            className="font-mono text-sm leading-relaxed max-w-xl mb-10"
            style={{ color: "var(--text-body)" }}
          >
            Wholesail builds a branded B2B ordering portal for your distribution business. Every account gets their own login, sees their own pricing, and can place orders 24/7 without calling your team. Live in under 2 weeks.
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
            B2B buyers complete 70% of their research online before contacting a sales rep. (Gartner, 2024)
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
            What changes when your accounts can order themselves.
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
              I was skeptical that our restaurant accounts would actually use a portal. Within 90 days, 80% of our order volume was coming through digitally. The accounts that adopted it fastest were also our highest spenders — they just wanted the convenience.
            </blockquote>
            <div>
              <div className="font-mono text-[11px] font-semibold" style={{ color: "var(--text-headline)" }}>Maria L.</div>
              <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>Central Valley Specialty Foods</div>
              <div className="font-mono text-[9px] uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>Specialty Food Distribution</div>
            </div>
          </div>
        </section>

        <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0" style={{ border: "1px solid var(--border-strong)" }}>
            {[
              {
                stat: "70%",
                label: "of B2B buyers complete their research online before contacting a sales rep",
                source: "Gartner, 2024",
              },
              {
                stat: "2.4x",
                label: "faster account growth for distributors with online ordering portals vs. those without",
                source: "Wholesail client data",
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
