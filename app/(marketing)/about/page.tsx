import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { NavBar } from "@/components/nav-bar";
import { IntakeWizard } from "@/components/intake-wizard";

export const metadata: Metadata = {
  title: "About Wholesail | Wholesale Distribution Automation",
  description:
    "Wholesail builds custom AI-powered ordering portals for independent wholesale distributors. We believe every distributor deserves to stop working in their business and start working on it.",
  openGraph: {
    title: "About Wholesail",
    description:
      "We build the AI-powered infrastructure independent distributors need to compete, grow, and reclaim their time. Custom portals. Live in under 2 weeks.",
  },
  alternates: { canonical: "https://wholesailhub.com/about" },
};

export default function AboutPage() {
  return (
    <>
      <NavBar />
      <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* HERO */}
          <section className="py-20 sm:py-28" style={{ borderBottom: "1px solid var(--border)" }}>
            <span
              className="font-mono text-[10px] uppercase tracking-widest mb-5 block"
              style={{ color: "var(--text-muted)" }}
            >
              About Wholesail
            </span>
            <h1
              className="font-serif text-2xl sm:text-4xl lg:text-5xl font-normal leading-[1.08] mb-6 max-w-3xl"
              style={{ color: "var(--text-headline)" }}
            >
              We build the infrastructure
              <br />
              <span style={{ color: "var(--blue)" }}>independent distributors never had.</span>
            </h1>
            <p
              className="font-mono text-sm leading-relaxed max-w-xl mb-6"
              style={{ color: "var(--text-body)" }}
            >
              Wholesail is a Los Angeles–based technology company. We build custom AI-powered
              wholesale ordering portals for independent distribution companies — the ones doing
              $1M–$20M who can&apos;t afford a $100K ERP implementation and don&apos;t have an
              IT department to run one.
            </p>
            <p
              className="font-mono text-sm leading-relaxed max-w-xl mb-10"
              style={{ color: "var(--text-body)" }}
            >
              Our clients are owner-operators. They built their distribution businesses through
              relationships, hustle, and deep product knowledge — not technology. We give them the
              technology layer so they can keep doing what they do best.
            </p>
            <Link
              href="/#intake-form"
              className="inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold btn-blue"
              style={{ padding: "14px 28px", borderRadius: "6px" }}
            >
              Start Your Build <ArrowRight className="w-4 h-4" />
            </Link>
          </section>

          {/* THE PROBLEM WE SOLVE */}
          <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
            <span
              className="font-mono text-xs uppercase tracking-widest mb-4 block"
              style={{ color: "var(--text-muted)" }}
            >
              Why We Exist
            </span>
            <h2
              className="font-serif text-xl sm:text-2xl md:text-3xl font-normal mb-8 max-w-2xl"
              style={{ color: "var(--text-headline)" }}
            >
              The wholesale distribution industry runs on antiquated systems.
              <br />
              <span style={{ color: "var(--blue)" }}>That&apos;s about to change.</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-5">
                <p className="font-mono text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
                  73% of independent wholesale distributors are still taking orders by phone,
                  email, or text message. Their catalog is in a spreadsheet. Their pricing is in
                  someone&apos;s head. Their invoices go out when someone has time to send them.
                </p>
                <p className="font-mono text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
                  These businesses aren&apos;t failing — they&apos;re thriving. They have loyal
                  clients, deep relationships, and real competitive advantages. But they&apos;re
                  spending 3–4 hours every day on tasks that software should handle. And as AI
                  transforms every other industry, the gap between manual-operations distributors
                  and AI-native ones is widening fast.
                </p>
                <p className="font-mono text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
                  The distributors who get in now — who build their AI-powered infrastructure
                  before their competitors do — will be miles ahead. They&apos;ll operate at
                  higher efficiency, serve clients better, and have the headspace to actually
                  grow. The window is open. Not for long.
                </p>
              </div>
              <div
                className="p-4 sm:p-6 lg:p-8"
                style={{ border: "1px solid var(--border-strong)", backgroundColor: "var(--bg-white)" }}
              >
                <div
                  className="font-mono text-[9px] uppercase tracking-widest mb-6"
                  style={{ color: "var(--text-muted)" }}
                >
                  The reality for most distributors today
                </div>
                <div className="space-y-4">
                  {[
                    "Taking orders by phone, text, and email at all hours",
                    "Pricing managed in spreadsheets only reps understand",
                    "Invoices chased manually by phone and follow-up email",
                    "No visibility into which clients are about to churn",
                    "Every minute spent on operations = a minute not spent on growth",
                    "Quoted $75K–$150K for ERP and told to wait 9 months",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                        style={{ backgroundColor: "#dc2626" }}
                      />
                      <span className="font-mono text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* OUR BELIEF */}
          <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
            <div
              className="p-4 sm:p-8 lg:p-12"
              style={{ border: "1px solid var(--border-strong)", backgroundColor: "var(--bg-blue)" }}
            >
              <span
                className="font-mono text-[10px] uppercase tracking-widest mb-6 block"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Our belief
              </span>
              <p
                className="font-serif text-lg sm:text-2xl leading-snug mb-6 max-w-3xl"
                style={{ color: "rgba(255,255,255,0.95)" }}
              >
                &ldquo;Every distributor should be focused on their partnerships, their lead
                generation, and their client relationships — not on entering orders, chasing
                invoices, or maintaining spreadsheets. You should be working on the business,
                not in it.&rdquo;
              </p>
              <p className="font-mono text-sm leading-relaxed max-w-2xl" style={{ color: "rgba(255,255,255,0.7)" }}>
                The owner-operators we work with built real businesses. They deserve
                infrastructure that matches their ambition — not duct-taped tools that create
                more work than they solve. That&apos;s what we build.
              </p>
            </div>
          </section>

          {/* WHAT WE BUILD */}
          <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
            <span
              className="font-mono text-xs uppercase tracking-widest mb-4 block"
              style={{ color: "var(--text-muted)" }}
            >
              What We Build
            </span>
            <h2
              className="font-serif text-xl sm:text-2xl md:text-3xl font-normal mb-10"
              style={{ color: "var(--text-headline)" }}
            >
              Three portals. One seamless platform.
            </h2>
            <div
              className="grid grid-cols-1 lg:grid-cols-3 gap-0"
              style={{ border: "1px solid var(--border-strong)" }}
            >
              {[
                {
                  title: "Client Portal",
                  desc: "Your wholesale clients log in to browse your catalog, see their pricing tier, place orders, view order history, track shipments, and pay invoices — without calling you. Available 24/7.",
                  items: ["Branded to your company", "Per-account pricing", "Self-service ordering", "Online invoice payments"],
                },
                {
                  title: "Admin Panel",
                  desc: "Your team manages everything from one screen — orders, fulfillment, CRM, inventory, pricing rules, analytics, and client health scoring. 25+ pages. No training required.",
                  items: ["Order & fulfillment board", "Client CRM + health scores", "Revenue analytics", "Inventory management"],
                },
                {
                  title: "AI Layer",
                  desc: "The automation that runs underneath everything. Standing orders placed automatically. Invoice reminders sent on schedule. Text orders processed without a rep. AI answers client questions 24/7.",
                  items: ["Standing order automation", "Invoice collection automation", "SMS order processing", "24/7 AI answer bot"],
                },
              ].map((col, i) => (
                <div
                  key={col.title}
                  className={`p-4 sm:p-6 lg:p-8 ${i < 2 ? "border-b lg:border-b-0 lg:border-r" : ""}`}
                  style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}
                >
                  <div
                    className="font-mono text-[9px] uppercase tracking-widest mb-3"
                    style={{ color: "var(--blue)" }}
                  >
                    {col.title}
                  </div>
                  <p
                    className="font-mono text-xs leading-relaxed mb-5"
                    style={{ color: "var(--text-body)" }}
                  >
                    {col.desc}
                  </p>
                  <div className="space-y-2">
                    {col.items.map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <CheckCircle2
                          className="w-3 h-3 flex-shrink-0"
                          style={{ color: "var(--blue)" }}
                        />
                        <span className="font-mono text-[11px]" style={{ color: "var(--text-body)" }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* WHO WE BUILD FOR */}
          <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span
                  className="font-mono text-xs uppercase tracking-widest mb-4 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  Who We Build For
                </span>
                <h2
                  className="font-serif text-xl sm:text-2xl md:text-3xl font-normal mb-5"
                  style={{ color: "var(--text-headline)" }}
                >
                  Built for the independent distributor.
                  <br />
                  <span style={{ color: "var(--blue)" }}>Not the enterprise.</span>
                </h2>
                <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: "var(--text-body)" }}>
                  Our clients are independent wholesale distributors doing $1M–$20M in annual
                  revenue. They have 2–25 employees. They&apos;re owner-operated. They&apos;ve been
                  quoted $50K–$150K for ERP implementations and walked away.
                </p>
                <p className="font-mono text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
                  They operate in specialty food, produce, wine & spirits, industrial supply,
                  beauty, and dozens of other distribution categories. What they share: the desire
                  to run a modern, AI-native business — and the need for a partner who builds it
                  for them in under 2 weeks.
                </p>
              </div>
              <div
                className="p-4 sm:p-6 lg:p-8"
                style={{ border: "1px solid var(--border-strong)", backgroundColor: "var(--bg-white)" }}
              >
                <div
                  className="font-mono text-[9px] uppercase tracking-widest mb-5"
                  style={{ color: "var(--text-muted)" }}
                >
                  The Wholesail Client Profile
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Revenue", value: "$1M–$20M annual" },
                    { label: "Team size", value: "2–25 employees" },
                    { label: "Current tools", value: "Phone, email, spreadsheets" },
                    { label: "Industries", value: "Food, beverage, industrial, beauty, and more" },
                    { label: "ERP quote received", value: "Yes — walked away" },
                    { label: "Timeline to launch", value: "Under 2 weeks" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between py-2"
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {row.label}
                      </span>
                      <span className="font-mono text-[11px] font-semibold" style={{ color: "var(--text-headline)" }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16" id="intake-form">
            <span
              className="font-mono text-xs uppercase tracking-widest mb-4 block"
              style={{ color: "var(--text-muted)" }}
            >
              Work With Us
            </span>
            <h2
              className="font-serif text-xl sm:text-2xl md:text-3xl font-normal mb-3"
              style={{ color: "var(--text-headline)" }}
            >
              Ready to build your portal?
            </h2>
            <p
              className="font-mono text-sm max-w-xl leading-relaxed mb-10"
              style={{ color: "var(--text-body)" }}
            >
              5 minutes. We review your answers before your call so every minute is spent on
              building your portal, not discovery.
            </p>
            <IntakeWizard />
          </section>

        </div>
      </div>
    </>
  );
}
