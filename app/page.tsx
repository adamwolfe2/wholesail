import {
  ArrowRight,
  Zap,
  Clock,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Shield,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { IntakeWizard } from "@/components/intake-wizard";
import { BuildDemo } from "@/components/build-demo";

const URGENCY_STATS = [
  {
    icon: DollarSign,
    stat: "$12K+",
    label: "average monthly revenue increase for distributors who move ordering online",
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

export default function IntakePage() {
  return (
    <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="py-6 flex items-center justify-between">
        <div className="font-serif text-xl font-normal tracking-tight">
          Distribution Portal
        </div>
        <a
          href="#intake-form"
          className="font-mono text-xs uppercase tracking-wide text-neutral-500 hover:text-black transition-colors"
        >
          Get Started
        </a>
      </header>

      {/* ── VSL Hero ─────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-black/10">
        <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-5 block">
          Custom B2B Ordering Portal
        </span>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight font-serif mb-7">
              Your wholesale clients
              <br />
              deserve better than
              <br />
              <span className="text-neutral-400">
                phone calls and spreadsheets.
              </span>
            </h1>
            <p className="font-mono text-base text-neutral-600 leading-relaxed mb-8 max-w-lg">
              We build fully custom B2B wholesale ordering portals for
              distribution companies. Client portal, admin panel, SMS ordering,
              Stripe billing, automated invoicing — all white-labeled to your
              brand.
            </p>
            <p className="font-mono text-base text-neutral-600 leading-relaxed mb-10 max-w-lg">
              No templates. No DIY page builders. A complete platform built
              specifically for how distributors sell — with the integrations,
              automation, and client management tools your team actually needs.
            </p>
            <a
              href="#intake-form"
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 font-mono text-sm uppercase tracking-wide hover:bg-neutral-800 transition-all border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Start Your Portal Build <ArrowRight className="w-4 h-4" />
            </a>
            <div className="font-mono text-xs text-neutral-400 mt-3 uppercase tracking-wider">
              5 minutes · We review and call within 24 hours
            </div>
          </div>

          {/* Right side — interactive build demo */}
          <div>
            <BuildDemo />
          </div>
        </div>
      </section>

      {/* ── Urgency Stats ─────────────────────────────────────────────── */}
      <section className="py-16 border-t border-black/10">
        <div className="mb-8">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            Why distributors are moving online
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-black">
          {URGENCY_STATS.map((item, i) => (
            <div
              key={item.stat}
              className={`p-6 ${
                i < URGENCY_STATS.length - 1
                  ? "border-b sm:border-b-0 sm:border-r border-black"
                  : ""
              }`}
            >
              <item.icon className="w-4 h-4 text-black mb-3" strokeWidth={1.5} />
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

      {/* ── What You Get ──────────────────────────────────────────────── */}
      <section className="py-16 border-t border-black/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4 block">
              Not a template — a full custom build
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-normal mb-6">
              Everything your distribution business needs. Nothing it doesn&apos;t.
            </h2>
            <p className="font-mono text-sm text-neutral-500 leading-relaxed mb-6">
              Every portal is built from our battle-tested infrastructure — 39
              database models, 200+ API routes, 60+ pages — then customized to
              your brand, products, pricing, and workflow.
            </p>
            <p className="font-mono text-sm text-neutral-500 leading-relaxed">
              We&apos;ve built portals for luxury food distributors, specialty
              seafood companies, and regional produce suppliers. The platform
              handles everything from first wholesale application to recurring
              standing orders.
            </p>
          </div>
          <div className="space-y-0 border border-black">
            {[
              {
                icon: ShoppingCart,
                label: "Client Portal",
                body: "Self-service ordering, order history, invoice payments, shipment tracking, saved carts, standing orders, loyalty points — your clients manage everything themselves.",
              },
              {
                icon: BarChart3,
                label: "Admin Panel",
                body: "25+ admin pages: order management, fulfillment board, client CRM with health scoring, pricing rules, inventory, quotes, leads, analytics, and CEO dashboard.",
              },
              {
                icon: MessageSquare,
                label: "SMS / iMessage Ordering",
                body: "Clients text their orders. AI parses natural language into structured orders. One reply to confirm. Orders flow into your admin panel automatically.",
              },
              {
                icon: Shield,
                label: "Stripe Billing & Invoicing",
                body: "Online checkout, automated Net-30/60/90 invoicing, payment reminders, aging reports, overdue escalation — all connected to Stripe with full webhook handling.",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`p-6 ${i < 3 ? "border-b border-black" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-black" strokeWidth={1.5} />
                    <div className="font-serif text-base">{item.label}</div>
                  </div>
                  <p className="font-mono text-xs text-neutral-500 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
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
          {[
            {
              step: "01",
              title: "Intake Form",
              desc: "Fill out the form below with your company details, products, and feature needs. Takes 5 minutes.",
            },
            {
              step: "02",
              title: "Consultation Call",
              desc: "We review your intake, walk through features, discuss branding, and scope the build. 30-minute call.",
            },
            {
              step: "03",
              title: "Portal Build",
              desc: "Our team builds your fully custom portal — branding, products, integrations, and all features configured.",
            },
            {
              step: "04",
              title: "Launch & Onboard",
              desc: "We deploy to production, train your team, onboard your first clients, and hand over the keys.",
            },
          ].map((item, i) => (
            <div
              key={item.step}
              className={`p-6 ${
                i < 3
                  ? "border-b sm:border-b-0 sm:border-r border-black"
                  : ""
              }`}
            >
              <div className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest mb-3">
                Step {item.step}
              </div>
              <div className="font-serif text-lg mb-2">{item.title}</div>
              <p className="font-mono text-[11px] text-neutral-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── The Intake Form ────────────────────────────────────────────── */}
      <section className="py-16 border-t border-black/10" id="intake-form">
        <div className="mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4 block">
            Start Here
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

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-black/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-serif text-lg">Distribution Portal</div>
          <div className="font-mono text-xs text-neutral-400">
            Custom B2B wholesale ordering portals for distribution companies.
          </div>
        </div>
      </footer>
    </main>
  );
}
