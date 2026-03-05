import {
  ArrowRight,
  Clock,
  DollarSign,
  TrendingUp,
  Zap,
  ShoppingCart,
  LayoutDashboard,
  MessageSquare,
  CreditCard,
  Shield,
  Heart,
  Gift,
  Truck,
  Brain,
  BarChart3,
  Users,
  Globe,
  Package,
  Newspaper,
  Warehouse,
  CheckCircle2,
} from "lucide-react";
import { IntakeWizard } from "@/components/intake-wizard";
import { BuildDemo } from "@/components/build-demo";
import { DemoLauncher } from "@/components/demo-launcher";
import { FAQ } from "@/components/faq";
import { TechMarquee } from "@/components/tech-marquee";
import { PainPointExplorer } from "@/components/pain-point-explorer";

/* ── Wholesail Sail Logo ─────────────────────────────────────────────── */
function SailLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main sail — tall, angular triangle */}
      <path
        d="M16 2L16 28L6 28C6 28 14 16 16 2Z"
        fill="var(--blue)"
        opacity="0.9"
      />
      {/* Secondary sail — shorter, overlapping */}
      <path
        d="M18 8L18 28L26 28C26 28 20 18 18 8Z"
        fill="var(--blue)"
        opacity="0.55"
      />
      {/* Waterline */}
      <path
        d="M4 29L28 29"
        stroke="var(--blue)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}

/* ── Stats Strip ──────────────────────────────────────────────────────── */
const STATS = [
  {
    icon: Clock,
    stat: "45+ hrs",
    label: "your team spends every week on manual work that should be automated",
    source: "Process audit",
  },
  {
    icon: DollarSign,
    stat: "$180K+",
    label: "wasted every year on disconnected software and manual labor",
    source: "Cost analysis",
  },
  {
    icon: TrendingUp,
    stat: "3.2x",
    label: "more reorders when clients can order themselves 24/7 through a portal",
    source: "Client data",
  },
  {
    icon: Zap,
    stat: "< 2 wks",
    label: "from intake call to a fully deployed, branded portal — replacing all your tools",
    source: "Build timeline",
  },
];

/* ── Features ─────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: ShoppingCart,
    label: "Self-Service Ordering",
    title: "Your clients order when they want.",
    body: "Full product catalog, saved carts, standing orders, and quick reorder. No more phone tag.",
  },
  {
    icon: LayoutDashboard,
    label: "Admin Panel",
    title: "Run your operation from one screen.",
    body: "Orders, fulfillment, CRM, inventory, pricing, analytics — 25+ pages, one dashboard.",
  },
  {
    icon: CreditCard,
    label: "Stripe Billing",
    title: "Get paid faster. Automatically.",
    body: "Online checkout, Net-30/60/90 invoicing, reminders, and overdue escalation.",
  },
  {
    icon: MessageSquare,
    label: "SMS Ordering",
    title: "Clients text. AI parses. Orders flow.",
    body: "Clients text orders in plain English — AI creates them and confirms automatically.",
  },
  {
    icon: Globe,
    label: "Marketing Site",
    title: "Your brand, not a marketplace.",
    body: "17 SEO pages: catalog, wholesale application, journal, referral landing pages.",
  },
  {
    icon: BarChart3,
    label: "Client Intelligence",
    title: "Know who to call before they lapse.",
    body: "Health scoring, smart reorder nudges, and churn detection — all automated.",
  },
  {
    icon: Heart,
    label: "Loyalty & Referrals",
    title: "Reward your best clients.",
    body: "Points, tiers, referral codes — clients earn and redeem at checkout automatically.",
  },
  {
    icon: Truck,
    label: "Shipment Tracking",
    title: "Clients track their own orders.",
    body: "Real-time tracking pages so clients stop calling to ask 'where's my order?'",
  },
  {
    icon: Package,
    label: "Inventory Management",
    title: "Never oversell. Never run dry.",
    body: "Stock updates automatically as orders come in. Low-stock alerts and batch tracking.",
  },
  {
    icon: Shield,
    label: "Custom Domain",
    title: "Your portal. Your brand. Zero watermarks.",
    body: "White-label everything: domain, emails, logo. Clients never see our name.",
  },
  {
    icon: Brain,
    label: "AI Chatbot",
    title: "Your team's knowledge, always on.",
    body: "AI answers product and pricing questions 24/7. Escalates to your team when needed.",
  },
  {
    icon: Gift,
    label: "Product Drops",
    title: "Create urgency. Drive reorders.",
    body: "Limited-time releases with instant notifications. First come, first served.",
  },
];

/* ── What's Included Table ────────────────────────────────────────────── */
const INCLUDED = [
  {
    category: "Client Portal",
    items: [
      "Product catalog with search & filters",
      "Shopping cart with saved carts",
      "Order history & shipment tracking",
      "Invoice payments via Stripe",
      "Standing / recurring orders",
      "Loyalty points & referrals",
      "AI chatbot & support messaging",
      "Quote requests & approval",
      "Personal spending analytics",
      "Product drop notifications",
    ],
  },
  {
    category: "Admin Panel",
    items: [
      "Order management & fulfillment board",
      "Client CRM with health scoring",
      "Product & inventory management",
      "Pricing rules by tier & category",
      "Quote creation & management",
      "Lead CRM & wholesale applications",
      "Sales rep tools & task management",
      "Revenue analytics & CEO dashboard",
      "Supplier portal & submissions",
      "Distributor routing & multi-org",
    ],
  },
  {
    category: "Automation",
    items: [
      "SMS / iMessage ordering with AI parsing",
      "AI chatbot with contextual responses",
      "Automated billing reminders",
      "Abandoned cart recovery emails",
      "Lapsed client re-engagement",
      "Partner nurture sequences (Day 3, Day 7)",
      "Weekly digest & report emails",
      "Standing order auto-processing",
      "Low stock alerts & reorder triggers",
      "Product drop blasts & alerts",
    ],
  },
];

/* ── How It Works ─────────────────────────────────────────────────────── */
const STEPS = [
  {
    step: "01",
    title: "Fill Out the Intake Form",
    desc: "Tell us about your company, products, clients, and feature needs. Takes 5 minutes and gives us everything we need to scope your build.",
  },
  {
    step: "02",
    title: "Consultation Call",
    desc: "30-minute call to walk through features, discuss branding, review integrations, and get a timeline with investment estimate.",
  },
  {
    step: "03",
    title: "We Build Your Portal",
    desc: "Our team configures your portal — branding, products, pricing, integrations, email templates, and all features. Built on battle-tested infrastructure.",
  },
  {
    step: "04",
    title: "Launch & Onboard Clients",
    desc: "Deploy to production, train your team, invite your first wholesale clients, and activate SMS ordering. You're live.",
  },
];

export default function WholesailPage() {
  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6">
      {/* ── Navigation ───────────────────────────────────────────── */}
      <nav
        className="py-5 flex items-center justify-between sticky top-0 z-50"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span className="flex items-center gap-2">
          <SailLogo className="w-5 h-5" />
          <span
            className="font-serif text-lg tracking-[0.05em] font-bold"
            style={{ color: "var(--text-headline)" }}
          >
            WHOLESAIL
          </span>
        </span>
        <div className="flex items-center gap-4">
          <a
            href="#demo"
            className="font-mono text-[13px] hidden sm:block link-body"
          >
            Explore Platform
          </a>
          <a
            href="/blog"
            className="font-mono text-[13px] hidden sm:block link-body"
          >
            Blog
          </a>
          <a
            href="#intake-form"
            className="font-mono text-[13px] font-semibold btn-blue"
            style={{ padding: "9px 20px", borderRadius: "6px" }}
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="py-20" style={{ borderTop: "1px solid var(--border)" }}>
        {/* Eyebrow pill */}
        <span
          className="inline-block font-mono text-[12px] font-semibold tracking-[0.04em] mb-5"
          style={{
            backgroundColor: "var(--blue-light)",
            color: "var(--blue)",
            borderRadius: "100px",
            padding: "4px 14px",
          }}
        >
          Built for distribution companies
        </span>
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 items-start">
          <div>
            <h1
              className="text-4xl md:text-5xl lg:text-[3.25rem] font-normal leading-[1.08] tracking-tight font-serif mb-7"
              style={{ color: "var(--text-headline)" }}
            >
              Your clients order online.
              <br />
              You stop managing orders
              <br />
              <span className="italic">by hand.</span>
            </h1>
            <p
              className="font-mono text-sm sm:text-base leading-relaxed mb-8 max-w-lg"
              style={{ color: "var(--text-body)" }}
            >
              We build custom ordering portals for distribution companies. Your
              clients get a professional online store with their pricing, their
              products, and their history. You get a complete admin panel to
              manage orders, invoices, clients, and inventory — all in one
              place. Live in under 2 weeks.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold btn-blue"
                style={{ padding: "14px 28px", borderRadius: "6px" }}
              >
                See How It Works <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#intake-form"
                className="inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold btn-outline"
                style={{ padding: "14px 28px", borderRadius: "6px" }}
              >
                Start Your Build
              </a>
            </div>
            <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              No signup required · See a live demo in 30 seconds
            </div>
          </div>

          {/* Right side — animated build demo */}
          <div>
            <BuildDemo />
          </div>
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────── */}
      <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mb-8">
          <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            The numbers don&apos;t lie
          </span>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0"
          style={{ border: "1px solid var(--border-strong)" }}
        >
          {STATS.map((item, i) => (
            <div
              key={item.stat}
              className={`p-6 ${
                i < STATS.length - 1
                  ? "border-b sm:border-b lg:border-b-0 sm:border-r"
                  : ""
              }`}
              style={{
                borderColor: "var(--border-strong)",
                backgroundColor: "var(--bg-white)",
              }}
            >
              <item.icon
                className="w-4 h-4 mb-3"
                style={{ color: "var(--blue)" }}
                strokeWidth={1.5}
              />
              <div
                className="text-4xl font-serif font-normal mb-2"
                style={{ color: "var(--text-headline)" }}
              >
                {item.stat}
              </div>
              <p
                className="font-mono text-[11px] leading-relaxed mb-2"
                style={{ color: "var(--text-body)" }}
              >
                {item.label}
              </p>
              <div
                className="font-mono text-[9px] uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                {item.source}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Explore Platform Demo ────────────────────────────────── */}
      <section className="py-16" id="demo" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-2xl mx-auto text-center mb-10">
          <span
            className="font-mono text-xs uppercase tracking-widest mb-4 block"
            style={{ color: "var(--text-muted)" }}
          >
            Try Before You Buy
          </span>
          <h2
            className="text-3xl md:text-4xl font-serif font-normal mb-6"
            style={{ color: "var(--text-headline)" }}
          >
            See the platform with{" "}
            <span className="italic">your brand</span> in 30 seconds.
          </h2>
          <p
            className="font-mono text-sm leading-relaxed mb-8"
            style={{ color: "var(--text-body)" }}
          >
            Enter your website URL. We&apos;ll scrape your logo and brand
            colors, apply them to a live demo portal loaded with sample
            data, and let you click through every feature — client portal,
            admin panel, orders, invoicing, SMS flow, and more.
          </p>
          <div className="space-y-3 text-left">
            {[
              "Full product catalog with your branding",
              "Client portal with order history and tracking",
              "Admin panel with CRM, analytics, and fulfillment",
              "SMS ordering demo with AI parsing",
              "Invoice management with Stripe integration",
              "Loyalty program, referrals, and standing orders",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: "var(--blue)" }}
                />
                <span className="font-mono text-xs" style={{ color: "var(--text-body)" }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-lg mx-auto">
          <DemoLauncher />
        </div>
      </section>

      {/* ── Tech Stack Marquee ────────────────────────────────────── */}
      <section
        className="py-10 overflow-hidden"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="mb-4">
          <span
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Built on
          </span>
        </div>
        <TechMarquee />
      </section>

      {/* ── Pain Point Explorer ──────────────────────────────────── */}
      <section className="py-16" id="compare" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mb-10">
          <span
            className="font-mono text-xs uppercase tracking-widest mb-4 block"
            style={{ color: "var(--text-muted)" }}
          >
            See the Real Cost
          </span>
          <h2
            className="text-3xl md:text-4xl font-serif font-normal mb-3"
            style={{ color: "var(--text-headline)" }}
          >
            What&apos;s your biggest challenge right now?
          </h2>
          <p
            className="font-mono text-sm max-w-xl leading-relaxed"
            style={{ color: "var(--text-body)" }}
          >
            Select a pain point below and see exactly what it&apos;s costing
            your business — in hours, dollars, and disconnected tools.
          </p>
        </div>
        <PainPointExplorer />
      </section>

      {/* ── Features Grid ────────────────────────────────────────── */}
      <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mb-10">
          <span
            className="font-mono text-xs uppercase tracking-widest mb-4 block"
            style={{ color: "var(--text-muted)" }}
          >
            Platform Capabilities
          </span>
          <h2
            className="text-3xl md:text-4xl font-serif font-normal"
            style={{ color: "var(--text-headline)" }}
          >
            Everything your distribution business needs.
            <br />
            <span style={{ color: "var(--text-muted)" }}>Nothing it doesn&apos;t.</span>
          </h2>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border"
          style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--border-strong)", gap: "1px" }}
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.label}
                className="p-6"
                style={{
                  backgroundColor: "var(--bg-white)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-8 h-8 flex items-center justify-center"
                    style={{
                      backgroundColor: "var(--blue-light)",
                      borderRadius: "6px",
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: "var(--blue)" }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <span
                    className="font-mono text-[9px] uppercase tracking-widest"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {feature.label}
                  </span>
                </div>
                <h3
                  className="font-serif text-lg mb-2"
                  style={{ color: "var(--text-headline)" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="font-mono text-xs leading-relaxed"
                  style={{ color: "var(--text-body)" }}
                >
                  {feature.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── What's Included ──────────────────────────────────────── */}
      <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mb-10">
          <span
            className="font-mono text-xs uppercase tracking-widest mb-4 block"
            style={{ color: "var(--text-muted)" }}
          >
            Full Feature Breakdown
          </span>
          <h2
            className="text-3xl md:text-4xl font-serif font-normal"
            style={{ color: "var(--text-headline)" }}
          >
            32 database models. 133 API routes. 76 pages.
          </h2>
        </div>
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-0"
          style={{ border: "1px solid var(--border-strong)" }}
        >
          {INCLUDED.map((col, ci) => (
            <div
              key={col.category}
              className={
                ci < INCLUDED.length - 1
                  ? "border-b lg:border-b-0 lg:border-r"
                  : ""
              }
              style={{ borderColor: "var(--border-strong)" }}
            >
              <div
                className="px-6 py-4 border-b"
                style={{
                  borderColor: "var(--border-strong)",
                  backgroundColor: "var(--bg-white)",
                }}
              >
                <span
                  className="font-mono text-xs uppercase tracking-wide font-semibold"
                  style={{ color: "var(--text-headline)" }}
                >
                  {col.category}
                </span>
              </div>
              <div className="px-6 py-4 space-y-2.5">
                {col.items.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2
                      className="w-3 h-3 flex-shrink-0 mt-0.5"
                      style={{ color: "var(--blue)" }}
                    />
                    <span
                      className="font-mono text-[11px] leading-snug"
                      style={{ color: "var(--text-body)" }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Your Investment ───────────────────────────────────────── */}
      <section className="py-16" id="pricing" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mb-10">
          <span
            className="font-mono text-xs uppercase tracking-widest mb-4 block"
            style={{ color: "var(--text-muted)" }}
          >
            Your Investment
          </span>
          <h2
            className="text-3xl md:text-4xl font-serif font-normal mb-3"
            style={{ color: "var(--text-headline)" }}
          >
            One build. One retainer.
            <br />
            <span style={{ color: "var(--text-muted)" }}>Every tool above — replaced.</span>
          </h2>
          <p
            className="font-mono text-sm max-w-xl leading-relaxed"
            style={{ color: "var(--text-body)" }}
          >
            No more juggling subscriptions. No more duct-taping platforms
            together. We build your portal, migrate your data, train your
            team, and keep everything running.
          </p>
        </div>
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-0"
          style={{ border: "1px solid var(--border-strong)" }}
        >
          {/* Build */}
          <div
            className="p-8 border-b md:border-b-0 md:border-r"
            style={{
              borderColor: "var(--border-strong)",
              backgroundColor: "var(--bg-blue)",
              color: "var(--text-on-blue)",
            }}
          >
            <div
              className="font-mono text-[9px] uppercase tracking-widest mb-2"
              style={{ opacity: 0.5 }}
            >
              One-Time Build
            </div>
            <div className="font-serif text-4xl mb-1">Starting at $25K</div>
            <p
              className="font-mono text-[11px] leading-relaxed mb-6"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Custom portal built to your exact business, branded to your
              company, deployed in under 2 weeks.
            </p>
            <div className="space-y-2.5">
              {[
                "Every feature selected in your build",
                "Your logo, colors, and custom domain",
                "Data migration from existing tools",
                "Team training and onboarding",
                "All 18 software platforms — replaced",
                "45+ hours/week of manual work — automated",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  />
                  <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Retainer */}
          <div
            className="p-8"
            style={{ backgroundColor: "var(--bg-white)" }}
          >
            <div
              className="font-mono text-[9px] uppercase tracking-widest mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Monthly Retainer
            </div>
            <div
              className="font-serif text-4xl mb-1"
              style={{ color: "var(--text-headline)" }}
            >
              Starting at $5K
              <span
                className="font-mono text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                /mo
              </span>
            </div>
            <p
              className="font-mono text-[11px] leading-relaxed mb-6"
              style={{ color: "var(--text-body)" }}
            >
              Direct access to our team. We maintain your portal, make
              changes when you need them, and keep everything running
              smoothly.
            </p>
            <div className="space-y-2.5">
              {[
                "Unlimited change requests",
                "Bug fixes and platform updates",
                "Performance monitoring",
                "Priority support — direct access to our team",
                "New feature additions as your business grows",
                "No more software subscriptions to manage",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                    style={{ color: "var(--blue)" }}
                  />
                  <span
                    className="font-mono text-xs"
                    style={{ color: "var(--text-body)" }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* ROI callout */}
        <div
          className="border border-t-0 p-6"
          style={{
            borderColor: "var(--border-strong)",
            backgroundColor: "var(--blue-light)",
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div
                className="font-serif text-2xl mb-0.5"
                style={{ color: "var(--text-headline)" }}
              >
                $180K+
                <span
                  className="font-mono text-[10px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  /yr
                </span>
              </div>
              <span
                className="font-mono text-[10px]"
                style={{ color: "var(--text-body)" }}
              >
                What you&apos;re spending now on software + manual labor
              </span>
            </div>
            <div>
              <div
                className="font-serif text-2xl mb-0.5"
                style={{ color: "var(--blue)" }}
              >
                $60K–$85K
                <span
                  className="font-mono text-[10px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  /yr
                </span>
              </div>
              <span
                className="font-mono text-[10px]"
                style={{ color: "var(--text-body)" }}
              >
                Wholesail retainer — everything included
              </span>
            </div>
            <div>
              <div
                className="font-serif text-2xl mb-0.5"
                style={{ color: "var(--blue)" }}
              >
                Pays for itself
              </div>
              <span
                className="font-mono text-[10px]"
                style={{ color: "var(--text-body)" }}
              >
                Within 2–3 months of going live
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Growth Packages ────────────────────────────────────── */}
      <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mb-10">
          <span
            className="font-mono text-xs uppercase tracking-widest mb-4 block"
            style={{ color: "var(--text-muted)" }}
          >
            Also Available
          </span>
          <h2
            className="text-3xl md:text-4xl font-serif font-normal mb-3"
            style={{ color: "var(--text-headline)" }}
          >
            Want more clients?
            <br />
            <span style={{ color: "var(--text-muted)" }}>We do that too.</span>
          </h2>
          <p
            className="font-mono text-sm max-w-xl leading-relaxed"
            style={{ color: "var(--text-body)" }}
          >
            Beyond your portal, we offer growth packages to help you find
            and convert new wholesale clients — powered by our lead
            intelligence platform.
          </p>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0"
          style={{ border: "1px solid var(--border-strong)" }}
        >
          {[
            {
              icon: Users,
              label: "Website Visitor ID",
              title: "See who visits your site.",
              body: "Identify anonymous website visitors by company. Know exactly which prospects are looking at your catalog — even if they never fill out a form.",
            },
            {
              icon: BarChart3,
              label: "Data Enrichment",
              title: "Know everything about your leads.",
              body: "Enrich contacts with company size, revenue, industry, and decision-maker info. Build targeted outreach lists from your ideal customer profile.",
            },
            {
              icon: TrendingUp,
              label: "Lookalike Audiences",
              title: "Find more clients like your best ones.",
              body: "We analyze your top wholesale accounts and find businesses that match — same size, same industry, same buying patterns.",
            },
            {
              icon: Zap,
              label: "Lead Capture",
              title: "Turn visitors into wholesale clients.",
              body: "Capture website visitors, score them automatically, and route qualified leads directly into your portal's CRM — ready for your sales team.",
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`p-6 ${
                  i < 3 ? "border-b sm:border-b-0 sm:border-r" : ""
                }`}
                style={{
                  borderColor: "var(--border-strong)",
                  backgroundColor: "var(--bg-white)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-8 h-8 flex items-center justify-center"
                    style={{
                      backgroundColor: "var(--blue-light)",
                      borderRadius: "6px",
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: "var(--blue)" }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <span
                    className="font-mono text-[9px] uppercase tracking-widest"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item.label}
                  </span>
                </div>
                <h3
                  className="font-serif text-lg mb-2"
                  style={{ color: "var(--text-headline)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="font-mono text-xs leading-relaxed"
                  style={{ color: "var(--text-body)" }}
                >
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
        <div
          className="border border-t-0 p-4 text-center"
          style={{
            borderColor: "var(--border-strong)",
            backgroundColor: "var(--bg-white)",
          }}
        >
          <span
            className="font-mono text-[10px]"
            style={{ color: "var(--text-muted)" }}
          >
            Growth packages available as add-ons to any Wholesail retainer.
            Powered by our lead intelligence platform.
          </span>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mb-10">
          <span
            className="font-mono text-xs uppercase tracking-widest mb-4 block"
            style={{ color: "var(--text-muted)" }}
          >
            Process
          </span>
          <h2
            className="text-3xl md:text-4xl font-serif font-normal"
            style={{ color: "var(--text-headline)" }}
          >
            From intake to live portal in under 2 weeks.
          </h2>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0"
          style={{ border: "1px solid var(--border-strong)" }}
        >
          {STEPS.map((item, i) => {
            const isFirst = i === 0;
            const isLast = i === STEPS.length - 1;
            return (
              <div
                key={item.step}
                className={`p-6 ${
                  i < STEPS.length - 1
                    ? "border-b sm:border-b-0 sm:border-r"
                    : ""
                }`}
                style={{
                  borderColor: "var(--border-strong)",
                  backgroundColor: isFirst
                    ? "var(--bg-blue)"
                    : i === 1
                    ? "var(--bg-blue-dark)"
                    : "var(--bg-white)",
                  color: i < 2 ? "var(--text-on-blue)" : "var(--text-headline)",
                }}
              >
                <div
                  className="font-mono text-[9px] uppercase tracking-widest mb-3"
                  style={{ opacity: i < 2 ? 0.5 : undefined, color: i >= 2 ? "var(--text-muted)" : undefined }}
                >
                  Step {item.step}
                </div>
                <div className="font-serif text-lg mb-2">{item.title}</div>
                <p
                  className="font-mono text-[11px] leading-relaxed"
                  style={{
                    color: i < 2 ? "rgba(255,255,255,0.7)" : "var(--text-body)",
                  }}
                >
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Additional Features Icons ────────────────────────────── */}
      <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mb-10">
          <span
            className="font-mono text-xs uppercase tracking-widest mb-4 block"
            style={{ color: "var(--text-muted)" }}
          >
            Also Included
          </span>
          <h2
            className="text-3xl md:text-4xl font-serif font-normal"
            style={{ color: "var(--text-headline)" }}
          >
            Every feature a modern distributor needs.
          </h2>
        </div>
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0"
          style={{ border: "1px solid var(--border-strong)" }}
        >
          {[
            { icon: Gift, label: "Referral Program" },
            { icon: Package, label: "Product Drops" },
            { icon: Warehouse, label: "Supplier Portal" },
            { icon: Brain, label: "AI Order Parsing" },
            { icon: Newspaper, label: "Blog / Journal" },
            { icon: Shield, label: "Rate Limiting" },
            { icon: Users, label: "Sales Rep Tools" },
            { icon: Globe, label: "SEO Optimized" },
            { icon: BarChart3, label: "CEO Dashboard" },
            { icon: Clock, label: "Cron Automation" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`p-4 flex flex-col items-center text-center ${
                  i < 9 ? "border-b border-r" : "border-r"
                }`}
                style={{
                  borderColor: "var(--border-strong)",
                  backgroundColor: "var(--bg-white)",
                }}
              >
                <Icon
                  className="w-5 h-5 mb-2"
                  style={{ color: "var(--blue)" }}
                  strokeWidth={1.5}
                />
                <span
                  className="font-mono text-[9px] uppercase tracking-wide"
                  style={{ color: "var(--text-body)" }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mb-10 text-center">
          <span
            className="font-mono text-xs uppercase tracking-widest mb-4 block"
            style={{ color: "var(--text-muted)" }}
          >
            Questions
          </span>
          <h2
            className="text-3xl md:text-4xl font-serif font-normal"
            style={{ color: "var(--text-headline)" }}
          >
            Frequently asked questions.
          </h2>
        </div>
        <FAQ />
      </section>

      {/* ── Navy CTA Section ────────────────────────────────────── */}
      <section
        className="py-20 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-0"
        style={{ backgroundColor: "var(--bg-blue)", color: "var(--text-on-blue)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <span
            className="font-mono text-xs uppercase tracking-widest mb-6 block"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Ready to modernize your wholesale ordering?
          </span>
          <h2
            className="text-3xl md:text-5xl font-serif font-normal mb-6 leading-tight"
            style={{ color: "var(--text-on-blue)" }}
          >
            Your clients get a portal.
            <br />
            Your team gets their time back.
          </h2>
          <p
            className="font-mono text-sm leading-relaxed mb-10 max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Stop losing orders to missed calls and buried emails. Stop chasing
            invoices manually. Stop wondering which clients are about to churn.
            Get a portal that handles all of it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold"
              style={{
                backgroundColor: "white",
                color: "var(--bg-blue)",
                padding: "14px 28px",
                borderRadius: "6px",
              }}
            >
              Explore the Platform <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#intake-form"
              className="inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold btn-outline-white"
              style={{ padding: "14px 28px", borderRadius: "6px" }}
            >
              Start Your Build
            </a>
          </div>
          <div
            className="font-mono text-[10px] uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            No credit card required · Try the demo instantly · Builds start
            within 48 hours of your call
          </div>
        </div>
      </section>

      {/* ── Intake Form ──────────────────────────────────────────── */}
      <section className="py-16" id="intake-form" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mb-10">
          <span
            className="font-mono text-xs uppercase tracking-widest mb-4 block"
            style={{ color: "var(--text-muted)" }}
          >
            Start Your Build
          </span>
          <h2
            className="text-3xl md:text-4xl font-serif font-normal mb-3"
            style={{ color: "var(--text-headline)" }}
          >
            Tell us about your distribution business.
          </h2>
          <p
            className="font-mono text-sm max-w-xl leading-relaxed"
            style={{ color: "var(--text-body)" }}
          >
            5 minutes. We review your answers before your call so every minute
            is spent on building your portal, not discovery.
          </p>
        </div>
        <IntakeWizard />
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="py-12" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SailLogo className="w-5 h-5" />
              <span
                className="font-serif text-lg font-bold tracking-[0.05em]"
                style={{ color: "var(--text-headline)" }}
              >
                WHOLESAIL
              </span>
            </div>
            <p
              className="font-mono text-xs max-w-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Custom B2B wholesale ordering portals for distribution companies.
              Built on battle-tested infrastructure, deployed in under 2 weeks.
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <div
                className="font-mono text-[9px] uppercase tracking-widest mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                Product
              </div>
              <div className="space-y-1">
                <a
                  href="#demo"
                  className="block font-mono text-xs transition-colors"
                  style={{ color: "var(--text-body)" }}
                >
                  Explore Platform
                </a>
                <a
                  href="#intake-form"
                  className="block font-mono text-xs transition-colors"
                  style={{ color: "var(--text-body)" }}
                >
                  Start a Build
                </a>
                <a
                  href="#pricing"
                  className="block font-mono text-xs transition-colors"
                  style={{ color: "var(--text-body)" }}
                >
                  Pricing
                </a>
              </div>
            </div>
            <div>
              <div
                className="font-mono text-[9px] uppercase tracking-widest mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                Company
              </div>
              <div className="space-y-1">
                <a
                  href="/status"
                  className="block font-mono text-xs transition-colors"
                  style={{ color: "var(--text-body)" }}
                >
                  Build Status
                </a>
                <a
                  href="mailto:adam@wholesailhub.com"
                  className="block font-mono text-xs transition-colors"
                  style={{ color: "var(--text-body)" }}
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
        <div
          className="mt-8 pt-6 flex items-center justify-between"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
            &copy; {new Date().getFullYear()} Wholesail. All rights reserved.
          </span>
          <div className="flex gap-4">
            <a
              href="/privacy"
              className="font-mono text-[10px] transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="font-mono text-[10px] transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
