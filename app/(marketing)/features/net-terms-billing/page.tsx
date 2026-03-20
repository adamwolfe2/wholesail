import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { LazyIntakeWizard } from "@/components/lazy-intake-wizard";

export const metadata: Metadata = {
  title: "Net Terms & Wholesale Billing Automation | Wholesail",
  description:
    "Wholesail automates Net terms invoicing and payment collection for wholesale distributors. Invoices generate on shipment, reminders send automatically, and accounts pay online.",
  openGraph: {
    title: "Net Terms & Wholesale Billing Automation | Wholesail",
    description:
      "Distributors with automated invoice reminders collect 12 days faster than those sending manual follow-ups. Wholesail automates your entire billing cycle.",
  },
  alternates: { canonical: "https://wholesailhub.com/features/net-terms-billing" },
};

const PAIN_POINTS = [
  {
    before: "You extended Net-30 to 40 accounts. Now you spend 4 hours a week calling to remind people their invoice is due. This is not a good use of anyone&apos;s time.",
    after: "Automated reminders go out at Day 25, Day 30, and Day 35. Accounts get a clear, professional notice with a payment link — no call required.",
  },
  {
    before: "Invoices go out when someone has time to generate them — which is often days after the order shipped. Your 30-day clock starts late every time.",
    after: "Invoices generate automatically when the order ships. The Net clock starts on time, every time, without anyone on your team doing anything.",
  },
  {
    before: "Accounts who want to pay online have to email you for a payment link or mail a check. Friction in the payment process means slower collection.",
    after: "Every invoice has a Stripe-powered online payment link. Accounts pay with a credit card or ACH in 60 seconds. No checks, no wires, no friction.",
  },
  {
    before: "You don&apos;t have a clear view of what&apos;s current, what&apos;s at 30 days, and what&apos;s past due across all your accounts at once. AR is a spreadsheet.",
    after: "Your aging report is live in your admin dashboard — current, 30 days, 60 days, 90+ days, all in one view. You see exactly where to focus.",
  },
];

const FEATURES = [
  "Automatic invoice generation when orders ship — no manual invoice creation",
  "Configurable Net terms per account — Net-15, Net-30, Net-45, or custom",
  "Automated payment reminder emails at Day 25, Day 30, and Day 35",
  "Stripe-powered online payment — credit card and ACH bank transfer",
  "Live accounts receivable aging report in the admin dashboard",
  "Per-account credit limit enforcement — orders above credit limit require approval",
  "Partial payment recording and outstanding balance tracking",
  "Invoice PDF generation for accounts who need records for their own accounting",
  "Payment history visible to accounts inside their portal",
];

export default function NetTermsBillingPage() {
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
            Net Terms & Invoice Automation
          </span>
          <h1
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] mb-6 max-w-3xl"
            style={{ color: "var(--text-headline)" }}
          >
            You extended Net-30 to 40 accounts. Now you spend 4 hours a week chasing payments.
            <br />
            <span style={{ color: "var(--blue)" }}>That ends when your billing runs itself.</span>
          </h1>
          <p
            className="font-mono text-sm leading-relaxed max-w-xl mb-10"
            style={{ color: "var(--text-body)" }}
          >
            Wholesail automates your entire billing cycle — from invoice generation on shipment to automated
            reminders to online payment collection. Invoices go out on time, reminders fire automatically, and
            accounts pay with a click. Your team focuses on selling, not collecting. Live in under 2 weeks.
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
            Distributors with automated invoice reminders collect 12 days faster than those sending manual follow-ups.
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
            What changes when billing runs on autopilot.
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
              We were carrying $80,000 in outstanding receivables at any given time, mostly from accounts that just needed a reminder but weren&apos;t getting one consistently. Wholesail&apos;s automated reminders changed everything. Invoices go out the day the order ships, reminders fire on schedule, and accounts can pay with one click. Our AR is down to under $30,000 and I stopped spending my Fridays making collection calls.
            </blockquote>
            <div>
              <div className="font-mono text-[11px] font-semibold" style={{ color: "var(--text-headline)" }}>Sandra L.</div>
              <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>Lakeview Distribution Co.</div>
              <div className="font-mono text-[9px] uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>Food & Specialty Distribution</div>
            </div>
          </div>
        </section>

        <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0" style={{ border: "1px solid var(--border-strong)" }}>
            {[
              {
                stat: "12 days",
                label: "faster collection for distributors using automated invoice reminders versus those following up manually",
                source: "Billtrust AR Automation Report, 2024",
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
