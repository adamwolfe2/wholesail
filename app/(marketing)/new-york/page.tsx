import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { IntakeWizard } from "@/components/intake-wizard";

export const metadata: Metadata = {
  title: "Wholesale Distribution Portal for New York Businesses | Wholesail",
  description:
    "New York wholesale distributors use Wholesail to give restaurant, food service, and specialty food accounts a self-service ordering portal. No more phone orders. Live in under 2 weeks.",
  openGraph: {
    title: "Wholesale Distribution Portal for New York Businesses | Wholesail",
    description:
      "NYC has 25,000+ food service accounts and the most competitive wholesale market in the US. Wholesail gives your accounts a branded portal so they order from you — not your competitors.",
  },
  alternates: { canonical: "https://wholesailhub.com/new-york" },
};

const PAIN_POINTS = [
  {
    before: "New York restaurants buy from 8 different suppliers. The one who makes ordering easiest gets the most wallet share. Right now that might not be you.",
    after: "Your branded portal becomes the easiest way to order. Accounts log in, reorder their usuals, and check out in under 3 minutes.",
  },
  {
    before: "NYC food service accounts expect the same digital experience from their distributors that they get from their POS and payroll software. Phone ordering feels outdated.",
    after: "Your portal matches the experience your accounts expect — clean, fast, self-service. Account managers stop being order takers.",
  },
  {
    before: "A specialty food account on the Upper West Side and a Midtown deli have completely different pricing, minimums, and delivery windows. Managing this manually is error-prone.",
    after: "Each account sees their own pricing, delivery window, and minimum order rules — automatically. No custom quoting required.",
  },
  {
    before: "Manhattan delivery windows are tight and unforgiving. An order that comes in late because a voicemail wasn&apos;t checked means a missed drop.",
    after: "Orders placed online by your cutoff time route immediately to your fulfillment team. No missed orders from late voicemails or unread emails.",
  },
];

const FEATURES = [
  "Product catalog organized by category — specialty food, produce, dry goods, imported goods, and more",
  "Per-account pricing tiers with borough-specific delivery rules and minimums",
  "Standing orders for your regular weekly NYC restaurant and retail accounts",
  "Delivery cutoff enforcement — orders placed after cutoff route to the next window automatically",
  "Stripe-powered invoice payments — accounts pay online",
  "Text message ordering for accounts who prefer to order from the floor",
  "Order confirmations and delivery window tracking via email and SMS",
  "Admin fulfillment board with route-based grouping and revenue analytics",
  "Bulk client import to onboard your existing New York accounts in minutes",
];

export default function NewYorkPage() {
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
            For New York Wholesale Distributors
          </span>
          <h1
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] mb-6 max-w-3xl"
            style={{ color: "var(--text-headline)" }}
          >
            New York restaurants order from 8 different suppliers.
            <br />
            <span style={{ color: "var(--blue)" }}>Be the one they order from without picking up the phone.</span>
          </h1>
          <p
            className="font-mono text-sm leading-relaxed max-w-xl mb-10"
            style={{ color: "var(--text-body)" }}
          >
            Wholesail builds custom B2B ordering portals for New York specialty food, produce, and beverage
            distributors. Your accounts order online 24/7 — no phone call, no voicemail, no rep required. Every
            order lands in your dashboard the moment it&apos;s placed. Live in under 2 weeks.
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
            New York City alone has 25,000+ food service accounts — the most competitive wholesale market in the country.
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
              We distribute imported specialty foods to about 90 restaurants and specialty retailers across Manhattan and Brooklyn. The competition here is brutal — every supplier is fighting for the same accounts. Wholesail gave us a portal that makes us look and feel like a much bigger operation. Our accounts order on their own schedule, our rep spends time on growth, and we&apos;re closing more accounts than we lose now.
            </blockquote>
            <div>
              <div className="font-mono text-[11px] font-semibold" style={{ color: "var(--text-headline)" }}>Sofia B.</div>
              <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>Adriatic Import Co.</div>
              <div className="font-mono text-[9px] uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>Specialty Food Distribution — New York City</div>
            </div>
          </div>
        </section>

        <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0" style={{ border: "1px solid var(--border-strong)" }}>
            {[
              {
                stat: "25,000+",
                label: "food service accounts in New York City alone — the most competitive wholesale market in the United States",
                source: "NYC Dept. of Health, 2024",
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
          <IntakeWizard />
        </section>
      </div>
    </div>
  );
}
