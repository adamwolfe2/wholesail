import Link from "next/link";
import { NavBar } from "@/components/nav-bar";
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
  X,
  ChefHat,
  GlassWater,
  Wrench,
  Sparkles,
  Building2,
  Utensils,
} from "lucide-react";
import { IntakeWizard } from "@/components/intake-wizard";
import { BuildDemo } from "@/components/build-demo";
import { DemoLauncher } from "@/components/demo-launcher";
import { FAQ } from "@/components/faq";
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
    stat: "3–4 hrs",
    label: "per day the average distribution team spends manually entering orders, confirming inventory, and chasing payments",
    source: "Conexiom, 2024",
  },
  {
    icon: DollarSign,
    stat: "34%",
    label: "increase in repeat purchase frequency when wholesale clients can place orders through a self-service portal",
    source: "Shopify B2B Research",
  },
  {
    icon: TrendingUp,
    stat: "12 days",
    label: "faster invoice collection when clients can pay online — less time chasing, better cash flow, fewer phone calls",
    source: "Industry average",
  },
  {
    icon: Zap,
    stat: "< 2 wks",
    label: "from first call to fully deployed portal — versus 9–12 months for a standard ERP implementation",
    source: "vs. ERP average",
  },
];

/* ── Features ─────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: ShoppingCart,
    label: "Self-Service Ordering",
    title: "Your clients order when they want.",
    body: "Full product catalog, saved carts, standing orders, and quick reorder. No more phone tag or missed voicemails.",
  },
  {
    icon: LayoutDashboard,
    label: "Admin Panel",
    title: "Run your operation from one screen.",
    body: "Orders, fulfillment, CRM, inventory, pricing, analytics — 25+ pages, one dashboard. Everything in one place.",
  },
  {
    icon: CreditCard,
    label: "Billing & Invoicing",
    title: "Get paid faster. On your terms.",
    body: "Online checkout, Net-30/60/90 invoicing, payment reminders, and overdue escalation — without chasing anyone by phone.",
  },
  {
    icon: MessageSquare,
    label: "Text Message Ordering",
    title: "Clients text their order. It shows up in your system.",
    body: "Clients send a text with what they need. Your system receives it, confirms the total, and routes it to your dashboard. No voicemails.",
  },
  {
    icon: Globe,
    label: "Your Own Website",
    title: "Your brand, not a marketplace.",
    body: "A fully branded online catalog your clients can browse and order from. Your domain, your logo — not a marketplace where your competitors are one click away.",
  },
  {
    icon: BarChart3,
    label: "Client Intelligence",
    title: "Know who to call before they go quiet.",
    body: "Health scoring, reorder nudges, and lapse detection — so you always know which accounts need attention before they stop ordering.",
  },
  {
    icon: Heart,
    label: "Loyalty & Referrals",
    title: "Reward your best clients.",
    body: "Points, tiers, referral codes — clients earn credit on every order and redeem it at checkout.",
  },
  {
    icon: Truck,
    label: "Shipment Tracking",
    title: "Clients track their own orders.",
    body: "Real-time tracking pages so clients stop calling to ask 'where's my order?' — and your team stops answering that call.",
  },
  {
    icon: Package,
    label: "Inventory Management",
    title: "Never oversell. Never run dry.",
    body: "Stock levels update as orders come in. Low-stock alerts and batch tracking keep you ahead of what's running low.",
  },
  {
    icon: Shield,
    label: "Custom Domain",
    title: "Your portal. Your brand. Zero watermarks.",
    body: "White-label everything: domain, emails, logo. Your clients see your company name — never ours.",
  },
  {
    icon: Brain,
    label: "24/7 Answer Bot",
    title: "Fewer 'quick question' calls to your office.",
    body: "Clients get product and pricing answers at any hour. Handles common questions and escalates to your team for anything it can't answer.",
  },
  {
    icon: Gift,
    label: "Product Drops",
    title: "Create urgency. Drive reorders.",
    body: "Limited-time releases with instant notifications to your client list. First come, first served.",
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
      "Live chat & support messaging",
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
    category: "Built-in Workflows",
    items: [
      "Text message ordering (clients text, orders flow in)",
      "Live chat with suggested replies",
      "Billing reminders at Day 25, 30 & 35",
      "Abandoned cart recovery emails",
      "Lapsed client re-engagement emails",
      "Partner nurture sequences (Day 3, Day 7)",
      "Weekly digest & report emails",
      "Standing order processing",
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
    desc: "Deploy to production, train your team, invite your first wholesale clients, and activate text message ordering. You're live.",
  },
];

/* ── Before / After ───────────────────────────────────────────────────── */
const BEFORE_AFTER = [
  {
    before: "Orders arrive by phone, email, and voicemail at all hours. Someone types them in manually — and sometimes makes mistakes.",
    after: "Clients log in and place their own orders any time of day. Every order lands in your dashboard the moment it's placed.",
  },
  {
    before: "Invoices go out when someone has time. Late payments are chased one by one with phone calls and follow-up emails.",
    after: "Invoices generate when an order ships. Reminders go out on schedule at Day 25, 30, and 35. You collect 12 days faster on average.",
  },
  {
    before: "Your catalog is in a spreadsheet. Every client has different pricing and only you know it — or think you do.",
    after: "Every client sees their own catalog, their own prices, and their full order history — logged in to their private portal.",
  },
  {
    before: "You don't know a client is about to leave until they've already switched to a competitor.",
    after: "Your dashboard flags clients who haven't ordered in 14+ days. You call them before they're gone.",
  },
  {
    before: "Your team spends 3–4 hours every day on order entry, billing questions, and 'where's my order?' calls.",
    after: "Your team focuses on growing accounts and finding new clients. The portal handles the rest.",
  },
];

/* ── Testimonials ─────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    beforeContext: "Before: 200 orders/week managed via text message and Google Sheets",
    quote:
      "We were running everything through text messages and a shared Google Sheet. Our rep would spend Sunday nights entering orders for Monday delivery. Now clients order themselves and we just fulfill. I wish we had done this two years ago.",
    name: "Marcus T.",
    company: "Fresh Coast Specialty Foods",
    industry: "Food & Beverage Distribution",
  },
  {
    beforeContext: "Before: 40+ open invoices being chased manually each month",
    quote:
      "The invoice chasing alone was worth the price. We used to have 30–40 day collection cycles because someone had to manually follow up. Now reminders go out automatically and our average collection is down to 18 days.",
    name: "Elena V.",
    company: "Pacific Rim Wine Imports",
    industry: "Wine & Spirits Distribution",
  },
  {
    beforeContext: "Before: Quoted $120K for a NetSuite implementation",
    quote:
      "I was skeptical because I've tried software before and it always required months of setup and training. This was live in 11 days. My top 20 accounts were placing orders through the portal within the first week.",
    name: "Dave K.",
    company: "Central States Industrial Supply",
    industry: "Industrial Distribution",
  },
];

/* ── FAQ Schema ────────────────────────────────────────────────────────── */
const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How long does a portal build take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most portals are fully built and deployed within 10–14 business days from our first call. The intake form and consultation help us move fast — we already know your products, workflow, and feature needs before we start building.",
      },
    },
    {
      "@type": "Question",
      name: "What does the demo show?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The demo is a live version of the actual portal platform with sample data — not a mockup. When you enter your website, we scrape your logo and brand colors and apply them to the demo so you can see exactly what your clients will experience.",
      },
    },
    {
      "@type": "Question",
      name: "How much does a portal build cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Wholesail builds are high-ticket, white-glove engagements. Pricing depends on the features you need, number of product SKUs, integrations, and customization level. We scope everything on the consultation call and provide a clear investment estimate before you commit.",
      },
    },
    {
      "@type": "Question",
      name: "Do I own the code?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, completely. Your portal is deployed to your own Vercel account, connected to your own database, Stripe account, and domain. You own everything. We also provide full documentation so your team (or any developer) can maintain and extend it.",
      },
    },
    {
      "@type": "Question",
      name: "Can my existing wholesale clients use this?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. The portal includes a client claim flow where existing clients can claim their account by verifying their email or phone number. We also support bulk client import from spreadsheets, and automated invitation emails. Most distributors onboard their first 10–20 clients within the first week.",
      },
    },
    {
      "@type": "Question",
      name: "How does text message ordering work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Clients send a text with what they need. The system matches those items to your product catalog, sends back a confirmation with the order total, and the client replies YES to confirm. The order flows directly into your admin panel — no phone call required.",
      },
    },
  ],
};

/* ── Industries ───────────────────────────────────────────────────────── */
const INDUSTRIES = [
  { icon: Utensils, name: "Food & Beverage", desc: "Specialty foods, produce, dairy", href: "/food-beverage" },
  { icon: GlassWater, name: "Wine & Spirits", desc: "Importers and distributors", href: "/wine-spirits" },
  { icon: Wrench, name: "Industrial Supply", desc: "MRO and safety equipment", href: "/industrial-supply" },
  { icon: Sparkles, name: "Beauty & Cosmetics", desc: "Salon and retail wholesale", href: null },
  { icon: ChefHat, name: "Restaurant Supply", desc: "Foodservice distribution", href: null },
  { icon: Package, name: "Specialty Goods", desc: "Artisan and niche products", href: null },
  { icon: Building2, name: "Building Materials", desc: "Trade and contractor supply", href: null },
  { icon: Heart, name: "Medical Supply", desc: "Healthcare distribution", href: null },
];

export default function WholesailPage() {
  return (
    <>
      <NavBar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="py-20" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 items-center">
          <div>
            {/* Eyebrow pill */}
            <span
              className="inline-block font-mono text-[12px] font-semibold tracking-[0.04em] mb-2"
              style={{
                backgroundColor: "var(--blue-light)",
                color: "var(--blue)",
                borderRadius: "100px",
                padding: "4px 14px",
              }}
            >
              For wholesale distributors doing $1M–$20M
            </span>
            <h1
              className="text-2xl sm:text-3xl md:text-5xl lg:text-[3.25rem] font-normal leading-[1.08] tracking-tight font-serif mb-7"
              style={{ color: "var(--text-headline)" }}
            >
              Your Entire Wholesale Business
              <br />
              <span className="italic"><Link href="/ai-ified" style={{ color: "inherit", textDecoration: "none", position: "relative", display: "inline-block" }}>AI-ified<svg aria-hidden="true" viewBox="0 0 120 8" preserveAspectRatio="none" style={{ position: "absolute", bottom: "-6px", left: 0, width: "100%", height: "8px", overflow: "visible" }}><path d="M2 5 Q15 1 30 5 Q45 9 60 5 Q75 1 90 5 Q105 9 118 5" fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round"/></svg></Link> &amp; Fully Automated.</span>
            </h1>
            <p
              className="font-mono text-sm sm:text-base leading-relaxed mb-8 max-w-lg"
              style={{ color: "var(--text-body)" }}
            >
              Wholesail builds your custom wholesale ordering portal in under 2
              weeks. Your clients order themselves. Your team stops managing
              orders by hand. Invoices collect automatically. You own the code.
              Forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold btn-blue"
                style={{ padding: "14px 28px", borderRadius: "6px" }}
              >
                See Your Portal in 30 Seconds <ArrowRight className="w-4 h-4" />
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
              No signup required · Starting at $25K · Live in under 2 weeks
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
                className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal mb-2"
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

      {/* ── Before / After ───────────────────────────────────────── */}
      <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mb-10">
          <span
            className="font-mono text-xs uppercase tracking-widest mb-4 block"
            style={{ color: "var(--text-muted)" }}
          >
            The Transformation
          </span>
          <h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal"
            style={{ color: "var(--text-headline)" }}
          >
            What changes when you go live.
          </h2>
        </div>
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-0"
          style={{ border: "1px solid var(--border-strong)" }}
        >
          {/* Before column */}
          <div
            className="p-4 sm:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r"
            style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}
          >
            <div
              className="font-mono text-[9px] uppercase tracking-widest mb-6"
              style={{ color: "var(--text-muted)" }}
            >
              Before Wholesail
            </div>
            <div className="space-y-5">
              {BEFORE_AFTER.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <X
                    className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                    style={{ color: "#dc2626" }}
                    strokeWidth={2.5}
                  />
                  <p
                    className="font-mono text-xs leading-relaxed"
                    style={{ color: "var(--text-body)" }}
                  >
                    {item.before}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {/* After column */}
          <div
            className="p-4 sm:p-6 lg:p-8"
            style={{ backgroundColor: "var(--bg-blue)" }}
          >
            <div
              className="font-mono text-[9px] uppercase tracking-widest mb-6"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              After Wholesail
            </div>
            <div className="space-y-5">
              {BEFORE_AFTER.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2
                    className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                    strokeWidth={2}
                  />
                  <p
                    className="font-mono text-xs leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    {item.after}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ERP Alternative ──────────────────────────────────────── */}
      <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mb-10">
          <span
            className="font-mono text-xs uppercase tracking-widest mb-4 block"
            style={{ color: "var(--text-muted)" }}
          >
            The Alternative
          </span>
          <h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal mb-4 max-w-2xl"
            style={{ color: "var(--text-headline)" }}
          >
            You&apos;ve been quoted $75K and told to wait a year.
            <br />
            <span style={{ color: "var(--blue)" }}>There&apos;s another way.</span>
          </h2>
          <p
            className="font-mono text-sm leading-relaxed max-w-xl"
            style={{ color: "var(--text-body)" }}
          >
            NetSuite, SAP, and Acumatica are built for enterprises with IT departments and
            implementation teams. Independent distributors get quoted $50K–$150K, handed a
            9-month project plan, and told to figure it out. Most walk away and go back to
            spreadsheets. Wholesail exists for those distributors.
          </p>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-0"
          style={{ border: "1px solid var(--border-strong)" }}
        >
          {[
            {
              label: "Traditional ERP",
              stat: "9–12 months",
              sub: "average implementation timeline",
              cost: "$75K–$150K",
              costSub: "typical upfront investment",
              dark: false,
            },
            {
              label: "Wholesail",
              stat: "< 2 weeks",
              sub: "from first call to live portal",
              cost: "Starting at $25K",
              costSub: "one-time build, you own it forever",
              dark: true,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 sm:p-6 lg:p-8"
              style={{
                backgroundColor: item.dark ? "var(--bg-blue)" : "var(--bg-white)",
              }}
            >
              <div
                className="font-mono text-[9px] uppercase tracking-widest mb-6"
                style={{ color: item.dark ? "rgba(255,255,255,0.4)" : "var(--text-muted)" }}
              >
                {item.label}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div
                    className="font-serif text-2xl sm:text-3xl lg:text-4xl mb-1"
                    style={{ color: item.dark ? "rgba(255,255,255,0.9)" : "var(--text-headline)" }}
                  >
                    {item.stat}
                  </div>
                  <div
                    className="font-mono text-[11px]"
                    style={{ color: item.dark ? "rgba(255,255,255,0.5)" : "var(--text-muted)" }}
                  >
                    {item.sub}
                  </div>
                </div>
                <div>
                  <div
                    className="font-serif text-2xl sm:text-3xl lg:text-4xl mb-1"
                    style={{ color: item.dark ? "rgba(255,255,255,0.9)" : "var(--text-headline)" }}
                  >
                    {item.cost}
                  </div>
                  <div
                    className="font-mono text-[11px]"
                    style={{ color: item.dark ? "rgba(255,255,255,0.5)" : "var(--text-muted)" }}
                  >
                    {item.costSub}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mb-10">
          <span
            className="font-mono text-xs uppercase tracking-widest mb-4 block"
            style={{ color: "var(--text-muted)" }}
          >
            From the Field
          </span>
          <h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal"
            style={{ color: "var(--text-headline)" }}
          >
            What distribution owners say.
          </h2>
        </div>
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-0"
          style={{ border: "1px solid var(--border-strong)" }}
        >
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className={`p-4 sm:p-6 lg:p-8 ${i < TESTIMONIALS.length - 1 ? "border-b lg:border-b-0 lg:border-r" : ""}`}
              style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}
            >
              <div
                className="font-mono text-[10px] uppercase tracking-widest mb-5 px-3 py-1.5 inline-block"
                style={{
                  backgroundColor: "var(--blue-light)",
                  color: "var(--blue)",
                  borderRadius: "4px",
                }}
              >
                {t.beforeContext}
              </div>
              <p
                className="font-serif text-3xl sm:text-4xl leading-none mb-4 select-none"
                style={{ color: "var(--border-strong)" }}
              >
                &ldquo;
              </p>
              <p
                className="font-mono text-xs leading-relaxed mb-8"
                style={{ color: "var(--text-body)" }}
              >
                {t.quote}
              </p>
              <div>
                <div
                  className="font-mono text-[11px] font-semibold"
                  style={{ color: "var(--text-headline)" }}
                >
                  {t.name}
                </div>
                <div
                  className="font-mono text-[10px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {t.company}
                </div>
                <div
                  className="font-mono text-[9px] uppercase tracking-wider mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {t.industry}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Explore Platform Demo ────────────────────────────────── */}
      <section className="py-16" id="demo" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — copy */}
          <div>
            <span
              className="font-mono text-xs uppercase tracking-widest mb-4 block"
              style={{ color: "var(--text-muted)" }}
            >
              Try Before You Buy
            </span>
            <h2
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal mb-6"
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
              admin panel, orders, invoicing, and more.
            </p>
            <div className="space-y-3">
              {[
                "Full product catalog with your branding",
                "Client portal with order history and tracking",
                "Admin panel with CRM, analytics, and fulfillment",
                "Text message ordering demo",
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
          {/* Right — demo launcher */}
          <div>
            <DemoLauncher />
          </div>
        </div>
      </section>

      {/* ── Your Clients Expect This ─────────────────────────────── */}
      <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span
              className="font-mono text-xs uppercase tracking-widest mb-4 block"
              style={{ color: "var(--text-muted)" }}
            >
              The Amazon Effect
            </span>
            <h2
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal mb-4"
              style={{ color: "var(--text-headline)" }}
            >
              83% of your clients now prefer to order online.
              <br />
              <span style={{ color: "var(--blue)" }}>The ones who can&apos;t are choosing someone who lets them.</span>
            </h2>
            <p
              className="font-mono text-sm leading-relaxed mb-6"
              style={{ color: "var(--text-body)" }}
            >
              B2B buyers have been trained by Amazon, DoorDash, and every consumer app they use.
              They expect to place orders at 11pm on a Sunday, see their history, and get a
              confirmation — without calling anyone. Distributors who don&apos;t offer this are
              losing accounts to the ones who do.
            </p>
            <p
              className="font-mono text-sm leading-relaxed"
              style={{ color: "var(--text-body)" }}
            >
              Your portal doesn&apos;t just save you time. It&apos;s a competitive moat. When your
              clients can order themselves, reorder in 2 clicks, and pay invoices online — they
              don&apos;t switch. Convenience is stickier than price.
            </p>
          </div>
          <div
            className="p-4 sm:p-6 lg:p-8"
            style={{ border: "1px solid var(--border-strong)", backgroundColor: "var(--bg-white)" }}
          >
            {[
              { stat: "83%", label: "of B2B buyers prefer self-service ordering over sales rep interaction", source: "Gartner B2B Buyer Report" },
              { stat: "74%", label: "of B2B buyers would switch suppliers for a better digital ordering experience", source: "Forrester, 2024" },
              { stat: "3×", label: "more likely to reorder when clients have a self-service portal vs. email/phone", source: "Shopify B2B Research" },
            ].map((item, i) => (
              <div
                key={item.stat}
                className={`py-5 ${i < 2 ? "border-b" : ""}`}
                style={{ borderColor: "var(--border-strong)" }}
              >
                <div
                  className="font-serif text-3xl mb-1"
                  style={{ color: "var(--text-headline)" }}
                >
                  {item.stat}
                </div>
                <p
                  className="font-mono text-[11px] leading-relaxed mb-1"
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
        </div>
      </section>

      {/* ── Industries We Serve ──────────────────────────────────── */}
      <section className="py-12" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mb-8 text-center">
          <span
            className="font-mono text-xs uppercase tracking-widest mb-3 block"
            style={{ color: "var(--text-muted)" }}
          >
            Who this is built for
          </span>
          <p
            className="font-mono text-sm max-w-2xl leading-relaxed mx-auto"
            style={{ color: "var(--text-body)" }}
          >
            Built specifically for independent wholesale distributors. Not a marketplace. Not a generic B2B tool.
            If you&apos;re a specialty distributor doing $1M–$20M with 2–25 employees, still taking orders by phone
            or spreadsheet, and you&apos;ve been scared off by ERP pricing — this is for you.
          </p>
        </div>
        <div
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-0"
          style={{ border: "1px solid var(--border-strong)" }}
        >
          {INDUSTRIES.map((industry, i) => {
            const Icon = industry.icon;
            const Tag = industry.href ? "a" : "div";
            return (
              <Tag
                key={industry.name}
                {...(industry.href ? { href: industry.href } : {})}
                className={`p-4 flex flex-col items-center text-center transition-colors ${
                  i < INDUSTRIES.length - 1 ? "border-b sm:border-b-0 sm:border-r" : ""
                } ${industry.href ? "hover:opacity-80 cursor-pointer" : ""}`}
                style={{
                  borderColor: "var(--border-strong)",
                  backgroundColor: "var(--bg-white)",
                  textDecoration: "none",
                }}
              >
                <Icon
                  className="w-5 h-5 mb-2"
                  style={{ color: "var(--blue)" }}
                  strokeWidth={1.5}
                />
                <div
                  className="font-mono text-[9px] uppercase tracking-wide font-semibold mb-0.5"
                  style={{ color: "var(--text-headline)" }}
                >
                  {industry.name}
                </div>
                <div
                  className="font-mono text-[8px] leading-tight"
                  style={{ color: "var(--text-muted)" }}
                >
                  {industry.desc}
                </div>
                {industry.href && (
                  <div className="font-mono text-[7px] uppercase tracking-wider mt-1" style={{ color: "var(--blue)" }}>
                    Learn more →
                  </div>
                )}
              </Tag>
            );
          })}
        </div>
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
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal mb-3"
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
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal"
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
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal"
            style={{ color: "var(--text-headline)" }}
          >
            Three parts. One platform. Everything your distribution business runs on.
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
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal mb-3"
            style={{ color: "var(--text-headline)" }}
          >
            One build. One retainer.
            <br />
            <span style={{ color: "var(--blue)" }}>The ERP you couldn&apos;t afford — replaced.</span>
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
            className="p-4 sm:p-6 lg:p-8 border-b md:border-b-0 md:border-r"
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
            <div className="font-serif text-2xl sm:text-3xl lg:text-4xl mb-1">Starting at $25K</div>
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
                "45+ hours/week of manual work — eliminated",
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
            className="p-4 sm:p-6 lg:p-8"
            style={{ backgroundColor: "var(--bg-white)" }}
          >
            <div
              className="font-mono text-[9px] uppercase tracking-widest mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Monthly Retainer
            </div>
            <div
              className="font-serif text-2xl sm:text-3xl lg:text-4xl mb-1"
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
        {/* What Wholesail replaces */}
        <div
          className="border border-t-0 p-6"
          style={{
            borderColor: "var(--border-strong)",
            backgroundColor: "var(--bg-white)",
          }}
        >
          <div
            className="font-mono text-[9px] uppercase tracking-widest mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            What Wholesail replaces
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              "QuickBooks for invoicing",
              "Spreadsheets for orders",
              "Phone ordering workflows",
              "NetSuite / SAP / ERP",
              "CRM for client tracking",
              "Manual invoice follow-up",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 px-3 py-2"
                style={{
                  border: "1px solid var(--border-strong)",
                  borderRadius: "4px",
                }}
              >
                <X className="w-3 h-3 flex-shrink-0" style={{ color: "#dc2626" }} strokeWidth={2.5} />
                <span className="font-mono text-[10px] leading-tight" style={{ color: "var(--text-body)" }}>
                  {item}
                </span>
              </div>
            ))}
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
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal mb-3"
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
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal"
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
        <div className="mb-10 text-center">
          <span
            className="font-mono text-xs uppercase tracking-widest mb-4 block"
            style={{ color: "var(--text-muted)" }}
          >
            Also Included
          </span>
          <h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal"
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
            { icon: Brain, label: "Text Order Entry" },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mb-10 text-center">
          <span
            className="font-mono text-xs uppercase tracking-widest mb-4 block"
            style={{ color: "var(--text-muted)" }}
          >
            Questions
          </span>
          <h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal"
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
            className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-serif font-normal mb-6 leading-tight"
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
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal mb-3"
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
                <a
                  href="/blog"
                  className="block font-mono text-xs transition-colors"
                  style={{ color: "var(--text-body)" }}
                >
                  Blog
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
    </>
  );
}
