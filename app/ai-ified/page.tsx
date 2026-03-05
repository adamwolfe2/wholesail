import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap, ShoppingCart, CreditCard, BarChart3, MessageSquare, Clock } from "lucide-react";
import { NavBar } from "@/components/nav-bar";
import { IntakeWizard } from "@/components/intake-wizard";
import { DemoLauncher } from "@/components/demo-launcher";

export const metadata: Metadata = {
  title: "What Is AI-ified? | Wholesail",
  description:
    "AI-ified means your entire wholesale distribution business runs automatically — orders, invoices, client management — without you manually managing every step.",
  openGraph: {
    title: "What Is AI-ified? | Wholesail",
    description:
      "The distributors who automate first will be miles ahead. AI-ified means your portal handles orders, billing, and client relationships 24/7 — so you can focus on growth.",
  },
  alternates: { canonical: "https://wholesailhub.com/ai-ified" },
};

/* ── Mock UI Components ─────────────────────────────────────────────── */

function ClientPortalMock() {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid var(--border-strong)", backgroundColor: "var(--bg-white)" }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border-strong)", backgroundColor: "var(--bg-primary)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--blue)" }} />
          <span className="font-mono text-[11px] font-semibold" style={{ color: "var(--text-headline)" }}>
            Fresh Coast Specialty Foods
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Order Portal
        </span>
      </div>
      <div className="p-4 space-y-2">
        {[
          { name: "Organic Arugula 5lb", sku: "ARG-005", price: "$12.50", qty: 4 },
          { name: "Rainbow Chard Bundle", sku: "CHD-RBW", price: "$8.75", qty: 2 },
          { name: "Heirloom Tomatoes 10lb", sku: "TOM-HLM", price: "$28.00", qty: 1 },
        ].map((product) => (
          <div
            key={product.sku}
            className="flex items-center justify-between py-2.5"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div>
              <div className="font-mono text-[11px] font-semibold" style={{ color: "var(--text-headline)" }}>
                {product.name}
              </div>
              <div className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>
                {product.sku} · {product.price}/unit
              </div>
            </div>
            <div
              className="font-mono text-xs px-3 py-1 font-semibold"
              style={{ border: "1px solid var(--border-strong)", borderRadius: "4px", color: "var(--blue)" }}
            >
              ×{product.qty}
            </div>
          </div>
        ))}
        <div className="pt-2 flex items-center justify-between">
          <span className="font-mono text-xs font-semibold" style={{ color: "var(--text-headline)" }}>
            Order Total
          </span>
          <span className="font-mono text-sm font-bold" style={{ color: "var(--blue)" }}>
            $143.25
          </span>
        </div>
        <div
          className="font-mono text-[11px] font-semibold text-center py-2.5 mt-1"
          style={{ backgroundColor: "var(--blue)", color: "#fff", borderRadius: "6px" }}
        >
          Place Order
        </div>
      </div>
      <div
        className="px-4 py-2.5"
        style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg-primary)" }}
      >
        <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Placed 2:47 AM · Sunday · Auto-confirmed
        </span>
      </div>
    </div>
  );
}

function InvoiceMock() {
  const invoices = [
    { client: "Riverside Restaurant", amount: "$1,240", due: "Due in 3 days", status: "Reminder sent", color: "#f59e0b" },
    { client: "Oak & Vine Bistro", amount: "$845", due: "Due today", status: "Auto-reminder", color: "#f59e0b" },
    { client: "Harbor Fish House", amount: "$2,100", due: "Paid", status: "Collected", color: "#10b981" },
    { client: "Metro Café Group", amount: "$620", due: "3 days overdue", status: "Escalated", color: "#dc2626" },
  ];
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid var(--border-strong)", backgroundColor: "var(--bg-white)" }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border-strong)", backgroundColor: "var(--bg-primary)" }}
      >
        <span className="font-mono text-[11px] font-semibold" style={{ color: "var(--text-headline)" }}>
          Invoice Management
        </span>
        <div
          className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5"
          style={{ backgroundColor: "var(--blue-light)", color: "var(--blue)", borderRadius: "100px" }}
        >
          Automated
        </div>
      </div>
      {invoices.map((inv, i) => (
        <div
          key={i}
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: i < invoices.length - 1 ? "1px solid var(--border)" : "none" }}
        >
          <div>
            <div className="font-mono text-[11px] font-semibold" style={{ color: "var(--text-headline)" }}>
              {inv.client}
            </div>
            <div className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>
              {inv.due}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs font-semibold" style={{ color: "var(--text-headline)" }}>
              {inv.amount}
            </div>
            <div className="font-mono text-[9px] font-semibold" style={{ color: inv.color }}>
              {inv.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminMock() {
  const clients = [
    { name: "Riverside Restaurant Group", score: 98, lastOrder: "2 days ago", monthly: "$3,200" },
    { name: "Metro Café Alliance", score: 72, lastOrder: "11 days ago", monthly: "$1,800" },
    { name: "Oak & Vine Bistro", score: 45, lastOrder: "23 days ago", monthly: "$900" },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {[
          { stat: "$48,200", label: "MRR", color: "var(--text-headline)" },
          { stat: "94%", label: "On-time", color: "#10b981" },
          { stat: "2 at risk", label: "Flagged", color: "#dc2626" },
        ].map((m) => (
          <div
            key={m.label}
            className="p-3 text-center"
            style={{ border: "1px solid var(--border-strong)", backgroundColor: "var(--bg-white)", borderRadius: "6px" }}
          >
            <div className="font-serif text-xl" style={{ color: m.color }}>
              {m.stat}
            </div>
            <div className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid var(--border-strong)", backgroundColor: "var(--bg-white)" }}
      >
        <div
          className="px-4 py-3"
          style={{ borderBottom: "1px solid var(--border-strong)", backgroundColor: "var(--bg-primary)" }}
        >
          <span className="font-mono text-[11px] font-semibold" style={{ color: "var(--text-headline)" }}>
            Client Health Scores
          </span>
        </div>
        {clients.map((c, i) => {
          const scoreColor = c.score > 80 ? "#16a34a" : c.score > 60 ? "#d97706" : "#dc2626";
          const scoreBg = c.score > 80 ? "#dcfce7" : c.score > 60 ? "#fef3c7" : "#fee2e2";
          return (
            <div
              key={i}
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: i < clients.length - 1 ? "1px solid var(--border)" : "none" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 flex items-center justify-center font-mono text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: scoreBg, color: scoreColor, borderRadius: "4px" }}
                >
                  {c.score}
                </div>
                <div>
                  <div className="font-mono text-[11px] font-semibold" style={{ color: "var(--text-headline)" }}>
                    {c.name}
                  </div>
                  <div className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>
                    Last order: {c.lastOrder}
                  </div>
                </div>
              </div>
              <div className="font-mono text-xs font-semibold" style={{ color: "var(--text-body)" }}>
                {c.monthly}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AutomationMock() {
  const events = [
    { time: "2:47 AM", action: "Order placed", detail: "Metro Café — $643 via portal", type: "order" },
    { time: "3:15 AM", action: "Standing order processed", detail: "Riverside Restaurant — 12 items auto-placed", type: "order" },
    { time: "6:00 AM", action: "Invoice reminder sent", detail: "Oak & Vine — Day 25 reminder", type: "billing" },
    { time: "7:22 AM", action: "Text order received", detail: '"2 cases arugula pls" → confirmed $47.50', type: "sms" },
    { time: "8:45 AM", action: "Lapse alert triggered", detail: "Harbor Fish House — 14 days inactive", type: "alert" },
    { time: "9:30 AM", action: "AI answered question", detail: '"Do you carry organic?" → replied instantly', type: "ai" },
  ];
  const typeColor: Record<string, string> = {
    order: "var(--blue)",
    billing: "#f59e0b",
    sms: "#10b981",
    alert: "#dc2626",
    ai: "#8b5cf6",
  };
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid var(--border-strong)", backgroundColor: "var(--bg-white)" }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border-strong)", backgroundColor: "var(--bg-primary)" }}
      >
        <span className="font-mono text-[11px] font-semibold" style={{ color: "var(--text-headline)" }}>
          Automation Log
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" style={{ animation: "pulse 2s infinite" }} />
          <span className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>
            LIVE
          </span>
        </div>
      </div>
      {events.map((e, i) => (
        <div
          key={i}
          className="px-4 py-2.5 flex items-start gap-3"
          style={{ borderBottom: i < events.length - 1 ? "1px solid var(--border)" : "none" }}
        >
          <span className="font-mono text-[9px] flex-shrink-0 mt-0.5 w-12" style={{ color: "var(--text-muted)" }}>
            {e.time}
          </span>
          <div
            className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5"
            style={{ backgroundColor: typeColor[e.type] }}
          />
          <div>
            <div className="font-mono text-[10px] font-semibold" style={{ color: "var(--text-headline)" }}>
              {e.action}
            </div>
            <div className="font-mono text-[9px]" style={{ color: "var(--text-body)" }}>
              {e.detail}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Feature Section ──────────────────────────────────────────────────── */
const FEATURES = [
  {
    tag: "// Self-Service Ordering",
    icon: ShoppingCart,
    h3: "Your phone stops ringing at 6am.",
    body: "Your clients log into their branded portal, browse your catalog, see their pricing tier, and place orders any time — day, night, or weekend. No call, no voicemail, no manual entry. Every order lands in your dashboard the moment it's submitted.",
    mock: <ClientPortalMock />,
    reverse: false,
  },
  {
    tag: "// Automated Billing",
    icon: CreditCard,
    h3: "12 days faster. Without a single call.",
    body: "Invoices generate when orders ship. Reminders go out automatically at Day 25, 30, and 35. Clients pay online with Stripe. You see your average collection cycle improve before the end of month one — without chasing anyone.",
    mock: <InvoiceMock />,
    reverse: true,
  },
  {
    tag: "// Client Intelligence",
    icon: BarChart3,
    h3: "Know who's about to leave before they do.",
    body: "Your dashboard scores every client's health — order frequency, cart size trends, days since last order, payment history. When a client goes quiet, you get a flag. You call before they're gone. Retention becomes proactive, not reactive.",
    mock: <AdminMock />,
    reverse: false,
  },
  {
    tag: "// Automation Layer",
    icon: Zap,
    h3: "Every routine decision, handled.",
    body: "Reorder nudges sent automatically. Standing orders placed without anyone touching them. Text message orders processed and confirmed without a rep. 24/7 AI answer bot handles product and pricing questions. Your team focuses on what matters: relationships and growth.",
    mock: <AutomationMock />,
    reverse: true,
  },
];

export default function AIifiedPage() {
  return (
    <>
      <NavBar />
      <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* HERO */}
          <section className="py-20 sm:py-28" style={{ borderBottom: "1px solid var(--border)" }}>
            <span
              className="font-mono text-[10px] uppercase tracking-widest mb-5 block"
              style={{ color: "var(--text-muted)" }}
            >
              // AI-ified
            </span>
            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.08] mb-6 max-w-4xl"
              style={{ color: "var(--text-headline)" }}
            >
              What does it mean to be{" "}
              <span style={{ color: "var(--blue)" }}>AI-ified?</span>
            </h1>
            <p
              className="font-mono text-sm leading-relaxed max-w-xl mb-6"
              style={{ color: "var(--text-body)" }}
            >
              Most wholesale distributors are running their business the same way they did in 1995.
              Phone orders. Spreadsheets. Manual invoicing. Saturday morning catch-up emails.
            </p>
            <p
              className="font-mono text-sm leading-relaxed max-w-xl mb-10"
              style={{ color: "var(--text-body)" }}
            >
              AI-ified means that changes. Every. Single. Part of it. Your portal handles orders,
              invoices, client management, reorder nudges, and payment collection — automatically,
              24/7, without you managing it by hand.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/#intake-form"
                className="inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold btn-blue"
                style={{ padding: "14px 28px", borderRadius: "6px" }}
              >
                Start Your Build <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/#demo"
                className="inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold"
                style={{
                  padding: "14px 28px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-strong)",
                  color: "var(--text-headline)",
                }}
              >
                See the Platform
              </Link>
            </div>
          </section>

          {/* THE INFLECTION POINT */}
          <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span
                  className="font-mono text-xs uppercase tracking-widest mb-4 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  The Moment
                </span>
                <h2
                  className="font-serif text-3xl font-normal mb-5"
                  style={{ color: "var(--text-headline)" }}
                >
                  The distributor who automates first wins.
                  <br />
                  <span style={{ color: "var(--blue)" }}>By a lot.</span>
                </h2>
                <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: "var(--text-body)" }}>
                  We&apos;re at an inflection point in distribution. The companies who adopt AI-powered
                  systems in the next 18–24 months will operate at 3× efficiency with the same headcount.
                  The ones who wait will be managing spreadsheets while their competitors are managing growth.
                </p>
                <p className="font-mono text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
                  Your clients are already expecting this. 83% of B2B buyers now prefer self-service
                  ordering over calling a rep. The distributors giving them that experience are winning
                  accounts. The ones who aren&apos;t are losing them — slowly, quietly, permanently.
                </p>
              </div>
              <div
                className="p-8"
                style={{ border: "1px solid var(--border-strong)", backgroundColor: "var(--bg-white)" }}
              >
                {[
                  { stat: "4 hrs/day", label: "Average time spent on manual order entry, invoicing, and status calls", source: "Conexiom, 2024" },
                  { stat: "83%", label: "of B2B buyers prefer self-service ordering to calling a rep", source: "Gartner, 2024" },
                  { stat: "18–24 mo", label: "Window before AI-early adopters build an insurmountable operations gap", source: "McKinsey Distribution Report" },
                ].map((s, i) => (
                  <div
                    key={s.stat}
                    className="py-5"
                    style={{ borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}
                  >
                    <div className="font-serif text-3xl mb-1" style={{ color: "var(--text-headline)" }}>
                      {s.stat}
                    </div>
                    <p className="font-mono text-[11px] leading-relaxed mb-1" style={{ color: "var(--text-body)" }}>
                      {s.label}
                    </p>
                    <div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      {s.source}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FEATURE SHOWCASES */}
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <section
                key={f.tag}
                className="py-16"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                    f.reverse ? "lg:[direction:rtl]" : ""
                  }`}
                >
                  {/* Mock UI */}
                  <div className={f.reverse ? "lg:[direction:ltr]" : ""}>{f.mock}</div>
                  {/* Copy */}
                  <div className={f.reverse ? "lg:[direction:ltr]" : ""}>
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="w-8 h-8 flex items-center justify-center"
                        style={{ backgroundColor: "var(--blue-light)", borderRadius: "6px" }}
                      >
                        <Icon className="w-4 h-4" style={{ color: "var(--blue)" }} strokeWidth={1.5} />
                      </div>
                      <span
                        className="font-mono text-[10px] uppercase tracking-widest"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {f.tag}
                      </span>
                    </div>
                    <h2
                      className="font-serif text-3xl font-normal mb-4"
                      style={{ color: "var(--text-headline)" }}
                    >
                      {f.h3}
                    </h2>
                    <p className="font-mono text-sm leading-relaxed mb-6" style={{ color: "var(--text-body)" }}>
                      {f.body}
                    </p>
                    <Link
                      href="/#demo"
                      className="inline-flex items-center gap-1 font-mono text-sm font-semibold"
                      style={{ color: "var(--blue)", textDecoration: "none" }}
                    >
                      See it in the demo <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </section>
            );
          })}

          {/* THE BIGGER PICTURE */}
          <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span
                className="font-mono text-xs uppercase tracking-widest mb-4 block"
                style={{ color: "var(--text-muted)" }}
              >
                The bigger picture
              </span>
              <h2
                className="font-serif text-3xl sm:text-4xl font-normal mb-5"
                style={{ color: "var(--text-headline)" }}
              >
                What will you do with the 4 hours a day you get back?
              </h2>
              <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: "var(--text-body)" }}>
                The distributors who automate fastest won&apos;t just save time — they&apos;ll build an
                insurmountable competitive advantage. While your competitors are answering order calls,
                you&apos;re building new wholesale partnerships. While they&apos;re chasing invoices,
                you&apos;re focused on lead generation and landing new accounts.
              </p>
              <p className="font-mono text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
                That&apos;s the AI-ified distribution business. AI-native from day one. Focused on the
                relationships, the growth, the strategy — not the spreadsheets. Working on the business,
                not in it. Spending evenings with your family, not entering orders on Sunday night.
              </p>
            </div>

            {/* Before / After */}
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-0"
              style={{ border: "1px solid var(--border-strong)" }}
            >
              <div
                className="p-8 border-b lg:border-b-0 lg:border-r"
                style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}
              >
                <div
                  className="font-mono text-[9px] uppercase tracking-widest mb-6"
                  style={{ color: "var(--text-muted)" }}
                >
                  What you stop doing
                </div>
                <div className="space-y-3">
                  {[
                    "Answering order calls at 6am and 9pm",
                    "Manually entering orders from voicemails",
                    "Building and maintaining pricing spreadsheets",
                    "Chasing invoices by phone and email",
                    "Guessing which clients might be about to churn",
                    "Spending Sunday nights on catch-up work",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Clock
                        className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                        style={{ color: "#dc2626" }}
                        strokeWidth={2}
                      />
                      <span className="font-mono text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-8" style={{ backgroundColor: "var(--bg-blue)" }}>
                <div
                  className="font-mono text-[9px] uppercase tracking-widest mb-6"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  What you start doing
                </div>
                <div className="space-y-3">
                  {[
                    "Building new wholesale distribution partnerships",
                    "Focused outreach to land high-value accounts",
                    "Strategic pricing decisions — not data entry",
                    "Proactive client calls before anyone leaves",
                    "Expanding to new product categories and regions",
                    "Actually taking weekends back",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2
                        className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                        style={{ color: "rgba(255,255,255,0.6)" }}
                        strokeWidth={2}
                      />
                      <span
                        className="font-mono text-xs leading-relaxed"
                        style={{ color: "rgba(255,255,255,0.85)" }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* INTERACTIVE DEMO */}
          <section className="py-16" id="demo" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <span
                  className="font-mono text-xs uppercase tracking-widest mb-4 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  Try It Now
                </span>
                <h2
                  className="font-serif text-3xl font-normal mb-4"
                  style={{ color: "var(--text-headline)" }}
                >
                  See your portal{" "}
                  <span className="italic">with your brand</span> in 30 seconds.
                </h2>
                <p className="font-mono text-sm leading-relaxed mb-6" style={{ color: "var(--text-body)" }}>
                  Enter your website. We scrape your logo and brand colors, apply them to a live demo
                  portal loaded with sample data, and let you click through every feature — client
                  ordering, admin panel, invoice management, AI answer bot, and more.
                </p>
                <div className="space-y-2.5">
                  {[
                    "Client portal with your branding and catalog",
                    "Admin panel: orders, CRM, fulfillment, analytics",
                    "Invoice management and Stripe payment flow",
                    "Text message ordering demo",
                    "AI answer bot and client health scoring",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--blue)" }} />
                      <span className="font-mono text-xs" style={{ color: "var(--text-body)" }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <DemoLauncher />
              </div>
            </div>
          </section>

          {/* INTAKE */}
          <section className="py-16" id="intake-form">
            <span
              className="font-mono text-xs uppercase tracking-widest mb-4 block"
              style={{ color: "var(--text-muted)" }}
            >
              Ready to Be AI-ified?
            </span>
            <h2
              className="font-serif text-3xl font-normal mb-3"
              style={{ color: "var(--text-headline)" }}
            >
              Tell us about your distribution business.
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
