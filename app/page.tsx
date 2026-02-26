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

/* ── Stats Strip ──────────────────────────────────────────────────────── */
const STATS = [
  {
    icon: DollarSign,
    stat: "$12K+",
    label: "average monthly revenue increase when wholesale ordering moves online",
    source: "Industry benchmark",
  },
  {
    icon: Clock,
    stat: "15 hrs",
    label: "per week saved on manual order processing, invoicing, and client follow-ups",
    source: "Client average",
  },
  {
    icon: TrendingUp,
    stat: "3.2x",
    label: "reorder rate increase when clients have self-service portal access",
    source: "Internal data",
  },
  {
    icon: Zap,
    stat: "< 2 wks",
    label: "from intake call to fully deployed, branded wholesale portal",
    source: "Build timeline",
  },
];

/* ── Features ─────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: ShoppingCart,
    label: "Self-Service Ordering",
    title: "Your clients order when they want.",
    body: "Full product catalog with search, filters, and add-to-cart. Saved carts, standing orders, and quick reorder from history. No more phone tag.",
    span: 2,
  },
  {
    icon: LayoutDashboard,
    label: "Admin Panel",
    title: "Run your operation from one screen.",
    body: "25+ admin pages: orders, fulfillment board, client CRM, inventory, quotes, leads, pricing rules, analytics, and CEO dashboard.",
    span: 1,
  },
  {
    icon: CreditCard,
    label: "Stripe Billing",
    title: "Get paid faster. Automatically.",
    body: "Online checkout, Net-30/60/90 invoicing, payment reminders, aging reports, and overdue escalation. Connected to Stripe with full webhook handling.",
    span: 1,
  },
  {
    icon: MessageSquare,
    label: "SMS Ordering",
    title: "Clients text. AI parses. Orders flow.",
    body: "Natural language order parsing via AI. Client texts '2 cases salmon, 5 lb truffles' — system creates the order, sends confirmation, and fulfills on reply.",
    span: 2,
  },
  {
    icon: Globe,
    label: "Marketing Site",
    title: "Your brand, not a marketplace.",
    body: "17-page marketing site: product catalog, about, journal, sourcing stories, wholesale application, referral landing pages — all SEO-optimized.",
    span: 1,
  },
  {
    icon: BarChart3,
    label: "Client Intelligence",
    title: "Know who to call before they lapse.",
    body: "RFM health scoring, smart reorder suggestions, tier auto-upgrades (NEW → REPEAT → VIP), and lapsed client re-engagement — all automated.",
    span: 1,
  },
  {
    icon: Heart,
    label: "Loyalty Program",
    title: "Reward your best clients.",
    body: "Points per dollar spent, tiered loyalty levels, and redemption at checkout. Configurable thresholds and messaging.",
    span: 1,
  },
  {
    icon: Truck,
    label: "Shipment Tracking",
    title: "Real-time delivery visibility.",
    body: "Shipment creation with tracking numbers, status events, cold-chain monitoring, and client-facing tracking pages.",
    span: 1,
  },
];

/* ── What's Included Table ────────────────────────────────────────────── */
const INCLUDED = [
  {
    category: "Client Portal",
    items: [
      "Product catalog with search & filters",
      "Shopping cart with saved carts",
      "Order history & tracking",
      "Invoice payments via Stripe",
      "Standing / recurring orders",
      "Loyalty points & referrals",
      "Support messaging",
      "Personal analytics",
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
    ],
  },
  {
    category: "Automation",
    items: [
      "SMS / iMessage ordering with AI parsing",
      "Automated billing reminders",
      "Abandoned cart recovery emails",
      "Lapsed client re-engagement",
      "Partner nurture sequences (Day 3, Day 7)",
      "Weekly digest emails to clients",
      "Standing order auto-processing",
      "Low stock alerts",
    ],
  },
];

/* ── How It Works ─────────────────────────────────────────────────────── */
const STEPS = [
  {
    step: "01",
    title: "Fill Out the Intake Form",
    desc: "Tell us about your company, products, clients, and feature needs. Takes 5 minutes and gives us everything we need to scope your build.",
    bg: "bg-black text-white",
  },
  {
    step: "02",
    title: "Consultation Call",
    desc: "30-minute call to walk through features, discuss branding, review integrations, and get a timeline with investment estimate.",
    bg: "bg-neutral-700 text-white",
  },
  {
    step: "03",
    title: "We Build Your Portal",
    desc: "Our team configures your portal — branding, products, pricing, integrations, email templates, and all features. Built on battle-tested infrastructure.",
    bg: "bg-neutral-400 text-white",
  },
  {
    step: "04",
    title: "Launch & Onboard Clients",
    desc: "Deploy to production, train your team, invite your first wholesale clients, and activate SMS ordering. You're live.",
    bg: "bg-white text-black",
  },
];

export default function PortalPage() {
  return (
    <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
      {/* ── Navigation ───────────────────────────────────────────── */}
      <nav className="py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black" />
          <span className="font-serif text-xl tracking-tight">Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="#demo"
            className="font-mono text-xs uppercase tracking-wide text-neutral-500 hover:text-black transition-colors hidden sm:block"
          >
            Explore Platform
          </a>
          <a
            href="#intake-form"
            className="bg-black text-white px-4 py-2 font-mono text-xs uppercase tracking-wide border border-black hover:bg-neutral-800 transition-colors"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-black/10">
        <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-5 block">
          Custom B2B Wholesale Ordering Portals
        </span>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-normal leading-[1.08] tracking-tight font-serif mb-7">
              Your wholesale clients
              <br />
              deserve better than
              <br />
              <span className="text-neutral-400">
                phone calls and spreadsheets.
              </span>
            </h1>
            <p className="font-mono text-sm sm:text-base text-neutral-600 leading-relaxed mb-8 max-w-lg">
              We build fully custom B2B ordering portals for distribution
              companies. Client portal, admin panel, SMS ordering, Stripe
              billing, automated invoicing — all white-labeled to your brand.
              Deployed in under 2 weeks.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 font-mono text-sm uppercase tracking-wide hover:bg-neutral-800 transition-all border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Explore the Platform <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#intake-form"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 font-mono text-sm uppercase tracking-wide border border-black text-black hover:bg-white transition-all"
              >
                Start Your Build
              </a>
            </div>
            <div className="font-mono text-xs text-neutral-400 uppercase tracking-wider">
              No signup required to explore
            </div>
          </div>

          {/* Right side — animated build demo */}
          <div>
            <BuildDemo />
          </div>
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────── */}
      <section className="py-16 border-t border-black/10">
        <div className="mb-8">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            Why distributors are moving online
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-black">
          {STATS.map((item, i) => (
            <div
              key={item.stat}
              className={`p-6 ${
                i < STATS.length - 1
                  ? "border-b sm:border-b lg:border-b-0 sm:border-r border-black"
                  : ""
              }`}
            >
              <item.icon
                className="w-4 h-4 text-black mb-3"
                strokeWidth={1.5}
              />
              <div className="text-4xl font-serif font-normal mb-2">
                {item.stat}
              </div>
              <p className="font-mono text-[11px] text-neutral-600 leading-relaxed mb-2">
                {item.label}
              </p>
              <div className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider">
                {item.source}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Explore Platform Demo ────────────────────────────────── */}
      <section className="py-16 border-t border-black/10" id="demo">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4 block">
              Try Before You Buy
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-normal mb-6">
              See the platform with{" "}
              <span className="italic">your brand</span> in 30 seconds.
            </h2>
            <p className="font-mono text-sm text-neutral-500 leading-relaxed mb-6">
              Enter your website URL. We&apos;ll scrape your logo and brand
              colors, apply them to a live demo portal loaded with sample
              data, and let you click through every feature — client portal,
              admin panel, orders, invoicing, SMS flow, and more.
            </p>
            <div className="space-y-3">
              {[
                "Full product catalog with your branding",
                "Client portal with order history and tracking",
                "Admin panel with CRM, analytics, and fulfillment",
                "SMS ordering demo with AI parsing",
                "Invoice management with Stripe integration",
                "Loyalty program, referrals, and standing orders",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black flex-shrink-0" />
                  <span className="font-mono text-xs text-neutral-600">
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

      {/* ── Tech Stack Marquee ────────────────────────────────────── */}
      <section className="py-10 border-t border-black/10 overflow-hidden">
        <div className="mb-4">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            Built on
          </span>
        </div>
        <TechMarquee />
      </section>

      {/* ── Features Grid ────────────────────────────────────────── */}
      <section className="py-16 border-t border-black/10">
        <div className="mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4 block">
            Platform Capabilities
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-normal">
            Everything your distribution business needs.
            <br />
            <span className="text-neutral-400">Nothing it doesn&apos;t.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border border-black">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            const isLast = i === FEATURES.length - 1;
            return (
              <div
                key={feature.label}
                className={`p-6 ${
                  feature.span === 2 ? "sm:col-span-2" : ""
                } ${!isLast ? "border-b border-black lg:border-r" : ""}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 border border-black/20 flex items-center justify-center bg-white">
                    <Icon
                      className="w-4 h-4 text-neutral-600"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    {feature.label}
                  </span>
                </div>
                <h3 className="font-serif text-lg mb-2">{feature.title}</h3>
                <p className="font-mono text-xs text-neutral-500 leading-relaxed">
                  {feature.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── What's Included ──────────────────────────────────────── */}
      <section className="py-16 border-t border-black/10">
        <div className="mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4 block">
            Full Feature Breakdown
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-normal">
            39 database models. 200+ API routes. 60+ pages.
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-black">
          {INCLUDED.map((col, ci) => (
            <div
              key={col.category}
              className={
                ci < INCLUDED.length - 1
                  ? "border-b lg:border-b-0 lg:border-r border-black"
                  : ""
              }
            >
              <div className="px-6 py-4 border-b border-black bg-white">
                <span className="font-mono text-xs uppercase tracking-wide font-semibold">
                  {col.category}
                </span>
              </div>
              <div className="px-6 py-4 space-y-2.5">
                {col.items.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 text-black flex-shrink-0 mt-0.5" />
                    <span className="font-mono text-[11px] text-neutral-600 leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className="py-16 border-t border-black/10">
        <div className="mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4 block">
            Process
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-normal">
            From intake to live portal in under 2 weeks.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-black">
          {STEPS.map((item, i) => (
            <div
              key={item.step}
              className={`p-6 ${item.bg} ${
                i < STEPS.length - 1
                  ? "border-b sm:border-b-0 sm:border-r border-black"
                  : ""
              }`}
            >
              <div
                className={`font-mono text-[9px] uppercase tracking-widest mb-3 ${
                  item.bg.includes("white")
                    ? "text-neutral-400"
                    : "text-white/50"
                }`}
              >
                Step {item.step}
              </div>
              <div className="font-serif text-lg mb-2">{item.title}</div>
              <p
                className={`font-mono text-[11px] leading-relaxed ${
                  item.bg.includes("white")
                    ? "text-neutral-500"
                    : "text-white/70"
                }`}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Additional Features Icons ────────────────────────────── */}
      <section className="py-16 border-t border-black/10">
        <div className="mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4 block">
            Also Included
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-normal">
            Every feature a modern distributor needs.
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0 border border-black">
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
                  i < 9 ? "border-b border-r border-black" : "border-r border-black"
                }`}
              >
                <Icon
                  className="w-5 h-5 text-neutral-400 mb-2"
                  strokeWidth={1.5}
                />
                <span className="font-mono text-[9px] uppercase tracking-wide text-neutral-500">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-16 border-t border-black/10">
        <div className="mb-10 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4 block">
            Questions
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-normal">
            Frequently asked questions.
          </h2>
        </div>
        <FAQ />
      </section>

      {/* ── Black CTA Section ────────────────────────────────────── */}
      <section className="py-20 -mx-4 sm:-mx-6 px-4 sm:px-6 bg-black text-white mb-0">
        <div className="max-w-3xl mx-auto text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-6 block">
            Ready to modernize your wholesale ordering?
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-normal mb-6 leading-tight">
            Your clients get a portal.
            <br />
            Your team gets their time back.
          </h2>
          <p className="font-mono text-sm text-neutral-400 leading-relaxed mb-10 max-w-xl mx-auto">
            Stop losing orders to missed calls and buried emails. Stop chasing
            invoices manually. Stop wondering which clients are about to churn.
            Get a portal that handles all of it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 font-mono text-sm uppercase tracking-wide border border-white hover:bg-neutral-100 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Explore the Platform <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#intake-form"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 font-mono text-sm uppercase tracking-wide border border-neutral-600 text-neutral-300 hover:text-white hover:border-white transition-all"
            >
              Start Your Build
            </a>
          </div>
          <div className="font-mono text-[10px] text-neutral-600 uppercase tracking-wider">
            No credit card required · Try the demo instantly · Builds start
            within 48 hours of your call
          </div>
        </div>
      </section>

      {/* ── Intake Form ──────────────────────────────────────────── */}
      <section className="py-16 border-t border-black/10" id="intake-form">
        <div className="mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4 block">
            Start Your Build
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-normal mb-3">
            Tell us about your distribution business.
          </h2>
          <p className="font-mono text-sm text-neutral-500 max-w-xl leading-relaxed">
            5 minutes. We review your answers before your call so every minute
            is spent on building your portal, not discovery.
          </p>
        </div>
        <IntakeWizard />
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-black/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-black" />
              <span className="font-serif text-lg">Portal</span>
            </div>
            <p className="font-mono text-xs text-neutral-400 max-w-sm">
              Custom B2B wholesale ordering portals for distribution companies.
              Built on battle-tested infrastructure, deployed in under 2 weeks.
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">
                Product
              </div>
              <div className="space-y-1">
                <a
                  href="#demo"
                  className="block font-mono text-xs text-neutral-600 hover:text-black transition-colors"
                >
                  Explore Platform
                </a>
                <a
                  href="#intake-form"
                  className="block font-mono text-xs text-neutral-600 hover:text-black transition-colors"
                >
                  Start a Build
                </a>
              </div>
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">
                Company
              </div>
              <div className="space-y-1">
                <a
                  href="#"
                  className="block font-mono text-xs text-neutral-600 hover:text-black transition-colors"
                >
                  About
                </a>
                <a
                  href="#"
                  className="block font-mono text-xs text-neutral-600 hover:text-black transition-colors"
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-black/10 flex items-center justify-between">
          <span className="font-mono text-[10px] text-neutral-400">
            &copy; {new Date().getFullYear()} Portal. All rights reserved.
          </span>
          <div className="flex gap-4">
            <a
              href="#"
              className="font-mono text-[10px] text-neutral-400 hover:text-black transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="font-mono text-[10px] text-neutral-400 hover:text-black transition-colors"
            >
              Terms
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
