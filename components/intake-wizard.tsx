"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Check,
  Package,
  ShoppingCart,
  CreditCard,
  Truck,
  MessageSquare,
  Gift,
  Users,
  Brain,
  Newspaper,
  Globe,
  BarChart3,
  Clock,
  Heart,
  Warehouse,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type Step1Data = {
  companyName: string;
  shortName: string;
  website: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  role: string;
  revenue: string;
};

type Step2Data = {
  industry: string;
  productCategories: string;
  skuCount: string;
  coldChain: string;
  currentOrdering: string[];
  activeClients: string;
  avgOrderValue: string;
  paymentTerms: string[];
  deliveryCoverage: string;
};

type Step3Data = {
  features: string[];
  primaryColor: string;
  hasBrandGuidelines: string;
  additionalNotes: string;
};

// ── Constants ──────────────────────────────────────────────────────────────
const ROLES = [
  "Founder / Owner",
  "CEO / President",
  "COO / Operations Lead",
  "VP of Sales",
  "Director of Operations",
  "IT / Technology Lead",
  "Other",
];

const REVENUES = [
  "Under $500K",
  "$500K – $2M",
  "$2M – $10M",
  "$10M – $50M",
  "$50M – $100M",
  "$100M+",
];

const INDUSTRIES = [
  "Food & Beverage",
  "Specialty / Gourmet Foods",
  "Seafood",
  "Produce",
  "Meat & Poultry",
  "Wine & Spirits",
  "Coffee & Tea",
  "Health & Supplements",
  "Beauty & Cosmetics",
  "Industrial / MRO",
  "Building Materials",
  "Other",
];

const SKU_COUNTS = [
  "Under 50",
  "50 – 200",
  "200 – 500",
  "500 – 1,000",
  "1,000+",
];

const ORDERING_METHODS = [
  "Phone calls",
  "Email / text",
  "Spreadsheets",
  "Paper order forms",
  "Existing portal / ERP",
  "In-person / sales reps",
];

const CLIENT_COUNTS = [
  "Under 25",
  "25 – 100",
  "100 – 500",
  "500 – 1,000",
  "1,000+",
];

const ORDER_VALUES = [
  "Under $200",
  "$200 – $500",
  "$500 – $2,000",
  "$2,000 – $10,000",
  "$10,000+",
];

const PAYMENT_TERMS = [
  "COD / Prepay",
  "Net 15",
  "Net 30",
  "Net 60",
  "Net 90",
  "Credit card at checkout",
];

const DELIVERY_OPTIONS = [
  "Local only (same metro)",
  "Regional (multi-state)",
  "National",
  "International",
];

const FEATURES = [
  {
    id: "client-portal",
    label: "Client Portal",
    desc: "Self-service ordering, invoice history, tracking",
    icon: ShoppingCart,
  },
  {
    id: "admin-panel",
    label: "Admin Panel",
    desc: "Order management, client CRM, fulfillment board",
    icon: BarChart3,
  },
  {
    id: "stripe-billing",
    label: "Stripe Billing",
    desc: "Online checkout, invoices, Net-30/60/90 terms",
    icon: CreditCard,
  },
  {
    id: "marketing-site",
    label: "Marketing Website",
    desc: "Product catalog, about page, wholesale application",
    icon: Globe,
  },
  {
    id: "sms-ordering",
    label: "SMS / iMessage Ordering",
    desc: "Clients text orders, AI parses them into the system",
    icon: MessageSquare,
  },
  {
    id: "loyalty-program",
    label: "Loyalty Program",
    desc: "Points per dollar, tier upgrades, rewards",
    icon: Heart,
  },
  {
    id: "referral-program",
    label: "Referral Program",
    desc: "Auto-generated codes, credit on conversion",
    icon: Gift,
  },
  {
    id: "supplier-portal",
    label: "Supplier Portal",
    desc: "Supplier product submissions and management",
    icon: Warehouse,
  },
  {
    id: "ai-order-parsing",
    label: "AI Order Parsing",
    desc: "Natural language → structured order via Gemini",
    icon: Brain,
  },
  {
    id: "shipment-tracking",
    label: "Shipment Tracking",
    desc: "Real-time tracking with cold chain monitoring",
    icon: Truck,
  },
  {
    id: "standing-orders",
    label: "Standing / Recurring Orders",
    desc: "Weekly, biweekly, or monthly auto-orders",
    icon: Clock,
  },
  {
    id: "product-drops",
    label: "Product Drops",
    desc: "Limited-time releases with alert signups",
    icon: Package,
  },
  {
    id: "smart-reorder",
    label: "Smart Reorder Suggestions",
    desc: "AI detects overdue clients and suggests products",
    icon: BarChart3,
  },
  {
    id: "blog-journal",
    label: "Blog / Journal",
    desc: "Content marketing for SEO and engagement",
    icon: Newspaper,
  },
  {
    id: "sales-rep-tools",
    label: "Sales Rep Tools",
    desc: "Rep assignment, cart building, task management",
    icon: Users,
  },
];

// ── Reusable option button ───────────────────────────────────────────────
function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left px-4 py-3 border font-mono text-xs uppercase tracking-wide transition-all ${
        selected
          ? "bg-black text-white border-black"
          : "bg-white text-neutral-700 border-neutral-300 hover:border-black"
      }`}
    >
      {children}
    </button>
  );
}

// ── Step 1: Company & Contact ────────────────────────────────────────────
function Step1({
  data,
  onChange,
}: {
  data: Step1Data;
  onChange: (d: Partial<Step1Data>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={data.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
            placeholder="Pacific Seafood Co."
            className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
            Short Name / Abbreviation
          </label>
          <input
            type="text"
            value={data.shortName}
            onChange={(e) => onChange({ shortName: e.target.value })}
            placeholder="PSC"
            className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none"
          />
          <span className="font-mono text-[9px] text-neutral-400 mt-1 block">
            Used in SMS messages and notifications
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
            Website
          </label>
          <input
            type="text"
            value={data.website}
            onChange={(e) => onChange({ website: e.target.value })}
            placeholder="pacificseafood.com"
            className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
            Location
          </label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="Portland, OR"
            className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
            Your Name *
          </label>
          <input
            type="text"
            value={data.contactName}
            onChange={(e) => onChange({ contactName: e.target.value })}
            placeholder="John Smith"
            className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
            Email *
          </label>
          <input
            type="email"
            value={data.contactEmail}
            onChange={(e) => onChange({ contactEmail: e.target.value })}
            placeholder="john@pacificseafood.com"
            className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={data.contactPhone}
            onChange={(e) => onChange({ contactPhone: e.target.value })}
            placeholder="(503) 555-0123"
            className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
            Your Role
          </label>
          <div className="grid grid-cols-1 gap-2">
            {ROLES.map((r) => (
              <OptionButton
                key={r}
                selected={data.role === r}
                onClick={() => onChange({ role: r })}
              >
                {r}
              </OptionButton>
            ))}
          </div>
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
            Annual Revenue
          </label>
          <div className="grid grid-cols-1 gap-2">
            {REVENUES.map((r) => (
              <OptionButton
                key={r}
                selected={data.revenue === r}
                onClick={() => onChange({ revenue: r })}
              >
                {r}
              </OptionButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Distribution Details ─────────────────────────────────────────
function Step2({
  data,
  onChange,
}: {
  data: Step2Data;
  onChange: (d: Partial<Step2Data>) => void;
}) {
  const toggleOrdering = (method: string) => {
    const current = data.currentOrdering;
    onChange({
      currentOrdering: current.includes(method)
        ? current.filter((m) => m !== method)
        : [...current, method],
    });
  };

  const togglePayment = (term: string) => {
    const current = data.paymentTerms;
    onChange({
      paymentTerms: current.includes(term)
        ? current.filter((t) => t !== term)
        : [...current, term],
    });
  };

  return (
    <div className="space-y-7">
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
          What industry / category do you distribute in? *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {INDUSTRIES.map((ind) => (
            <OptionButton
              key={ind}
              selected={data.industry === ind}
              onClick={() => onChange({ industry: ind })}
            >
              {ind}
            </OptionButton>
          ))}
        </div>
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
          Main product categories (comma-separated)
        </label>
        <input
          type="text"
          value={data.productCategories}
          onChange={(e) => onChange({ productCategories: e.target.value })}
          placeholder="e.g. Fresh Truffles, Oils & Vinegars, Specialty Cheese, Cured Meats"
          className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
            How many SKUs / products?
          </label>
          <div className="grid grid-cols-1 gap-2">
            {SKU_COUNTS.map((s) => (
              <OptionButton
                key={s}
                selected={data.skuCount === s}
                onClick={() => onChange({ skuCount: s })}
              >
                {s}
              </OptionButton>
            ))}
          </div>
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
            Do your products require cold chain / temperature control?
          </label>
          <div className="grid grid-cols-1 gap-2">
            {["Yes — refrigerated / frozen", "Partially — some items", "No — shelf stable"].map(
              (opt) => (
                <OptionButton
                  key={opt}
                  selected={data.coldChain === opt}
                  onClick={() => onChange({ coldChain: opt })}
                >
                  {opt}
                </OptionButton>
              )
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
          How do clients currently place orders? (select all)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ORDERING_METHODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => toggleOrdering(m)}
              className={`text-left px-3 py-2.5 border font-mono text-xs uppercase tracking-wide transition-all flex items-center gap-2 ${
                data.currentOrdering.includes(m)
                  ? "bg-black text-white border-black"
                  : "bg-white text-neutral-700 border-neutral-300 hover:border-black"
              }`}
            >
              {data.currentOrdering.includes(m) && (
                <Check className="w-3 h-3 flex-shrink-0" />
              )}
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
            Number of active wholesale clients
          </label>
          <div className="grid grid-cols-1 gap-2">
            {CLIENT_COUNTS.map((c) => (
              <OptionButton
                key={c}
                selected={data.activeClients === c}
                onClick={() => onChange({ activeClients: c })}
              >
                {c}
              </OptionButton>
            ))}
          </div>
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
            Average order value
          </label>
          <div className="grid grid-cols-1 gap-2">
            {ORDER_VALUES.map((v) => (
              <OptionButton
                key={v}
                selected={data.avgOrderValue === v}
                onClick={() => onChange({ avgOrderValue: v })}
              >
                {v}
              </OptionButton>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
          Payment terms you offer (select all)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PAYMENT_TERMS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => togglePayment(t)}
              className={`text-left px-3 py-2.5 border font-mono text-xs uppercase tracking-wide transition-all flex items-center gap-2 ${
                data.paymentTerms.includes(t)
                  ? "bg-black text-white border-black"
                  : "bg-white text-neutral-700 border-neutral-300 hover:border-black"
              }`}
            >
              {data.paymentTerms.includes(t) && (
                <Check className="w-3 h-3 flex-shrink-0" />
              )}
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
          Delivery coverage
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DELIVERY_OPTIONS.map((d) => (
            <OptionButton
              key={d}
              selected={data.deliveryCoverage === d}
              onClick={() => onChange({ deliveryCoverage: d })}
            >
              {d}
            </OptionButton>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Features & Branding ──────────────────────────────────────────
function Step3({
  data,
  onChange,
}: {
  data: Step3Data;
  onChange: (d: Partial<Step3Data>) => void;
}) {
  const toggleFeature = (id: string) => {
    const current = data.features;
    onChange({
      features: current.includes(id)
        ? current.filter((f) => f !== id)
        : [...current, id],
    });
  };

  return (
    <div className="space-y-7">
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-3">
          Which features do you need? (select all that apply)
          <span className="ml-2 text-neutral-400">
            ({data.features.length} selected)
          </span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FEATURES.map((f) => {
            const selected = data.features.includes(f.id);
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggleFeature(f.id)}
                className={`text-left px-4 py-3 border font-mono transition-all flex items-start gap-3 ${
                  selected
                    ? "bg-black text-white border-black"
                    : "bg-white text-neutral-700 border-neutral-300 hover:border-black"
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                    selected ? "text-white" : "text-neutral-400"
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide font-semibold">
                    {f.label}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 leading-snug ${
                      selected ? "text-neutral-300" : "text-neutral-400"
                    }`}
                  >
                    {f.desc}
                  </div>
                </div>
                {selected && (
                  <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 ml-auto" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
            Primary Brand Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={data.primaryColor || "#000000"}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              className="w-12 h-12 border border-black cursor-pointer p-0"
            />
            <input
              type="text"
              value={data.primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              placeholder="#1A1A1A"
              className="flex-1 border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none"
            />
          </div>
          <span className="font-mono text-[9px] text-neutral-400 mt-1 block">
            Used for buttons, headers, and accents throughout your portal
          </span>
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
            Do you have brand guidelines / logo files?
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              "Yes — I have full brand guidelines",
              "I have a logo but no guidelines",
              "No — I need help with branding",
            ].map((opt) => (
              <OptionButton
                key={opt}
                selected={data.hasBrandGuidelines === opt}
                onClick={() => onChange({ hasBrandGuidelines: opt })}
              >
                {opt}
              </OptionButton>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
          Anything else we should know?
        </label>
        <textarea
          value={data.additionalNotes}
          onChange={(e) => onChange({ additionalNotes: e.target.value })}
          placeholder="e.g. We need to migrate from an existing system. We have specific compliance requirements. We want to integrate with our ERP..."
          rows={4}
          className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none resize-none"
        />
      </div>
    </div>
  );
}

// ── Cal.com Embed ────────────────────────────────────────────────────────
function CalEmbed() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).__calPortalInitialized) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__calPortalInitialized = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(window as any).Cal) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      (function (C: any, A: string, L: string) {
        const p = function (a: any, ar: any) {
          a.q.push(ar);
        };
        const d = C.document;
        C.Cal =
          C.Cal ||
          function () {
            const cal = C.Cal;
            const ar = arguments;
            if (!cal.loaded) {
              cal.ns = {};
              cal.q = cal.q || [];
              d.head.appendChild(d.createElement("script")).src = A;
              cal.loaded = true;
            }
            if (ar[0] === L) {
              const api: any = function () {
                p(api, arguments);
              };
              const namespace = ar[1];
              api.q = api.q || [];
              if (typeof namespace === "string") {
                cal.ns[namespace] = cal.ns[namespace] || api;
                p(cal.ns[namespace], ar);
                p(cal, ["initNamespace", namespace]);
              } else p(cal, ar);
              return;
            }
            p(cal, ar);
          };
      })(window, "https://app.cal.com/embed/embed.js", "init");
      /* eslint-enable @typescript-eslint/no-explicit-any */
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Cal = (window as any).Cal;
    Cal("init", "portal", { origin: "https://app.cal.com" });
    Cal.ns.portal("inline", {
      elementOrSelector: "#my-cal-inline-portal",
      config: {
        layout: "month_view",
        useSlotsViewOnSmallScreen: "true",
        theme: "light",
      },
      calLink: "adamwolfe/trackr",
    });
    Cal.ns.portal("ui", {
      theme: "light",
      hideEventTypeDetails: true,
      layout: "month_view",
    });
  }, []);

  return (
    <div
      id="my-cal-inline-portal"
      style={{ width: "100%", minHeight: "660px", overflow: "scroll" }}
    />
  );
}

// ── Step 4: Book Call ────────────────────────────────────────────────────
function Step4({ step1, step2, step3 }: { step1: Step1Data; step2: Step2Data; step3: Step3Data }) {
  const featureLabels = FEATURES.filter((f) =>
    step3.features.includes(f.id)
  ).map((f) => f.label);

  return (
    <div className="space-y-8">
      {/* Summary card */}
      <div className="border border-black p-6 bg-[#F3F3EF]">
        <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">
          Your Portal Build Profile
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Company", value: step1.companyName || "—" },
            { label: "Industry", value: step2.industry || "—" },
            { label: "SKUs", value: step2.skuCount || "—" },
            { label: "Clients", value: step2.activeClients || "—" },
            { label: "Avg Order", value: step2.avgOrderValue || "—" },
            {
              label: "Features",
              value: featureLabels.length
                ? `${featureLabels.length} selected`
                : "—",
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-0.5">
                {item.label}
              </div>
              <div className="font-mono text-xs font-medium text-black truncate">
                {item.value}
              </div>
            </div>
          ))}
        </div>
        {featureLabels.length > 0 && (
          <div className="mt-4 pt-4 border-t border-black/10">
            <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">
              Selected Features
            </div>
            <div className="flex flex-wrap gap-1.5">
              {featureLabels.map((label) => (
                <span
                  key={label}
                  className="font-mono text-[9px] bg-black text-white px-2 py-1"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* What happens next */}
      <div className="border border-black p-6">
        <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">
          What happens on your call
        </div>
        <div className="space-y-3">
          {[
            "Review your distribution workflow and identify quick wins",
            "Walk through each feature and how it maps to your operation",
            "Discuss branding, integrations, and custom requirements",
            "Get a timeline and investment estimate for your portal build",
            "Map out your product catalog import and client onboarding plan",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2
                className="w-4 h-4 text-black flex-shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <span className="font-mono text-xs text-neutral-700">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cal.com embed */}
      <div>
        <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">
          Select a time to speak with our team
        </div>
        <div className="border border-black bg-white overflow-hidden">
          <CalEmbed />
        </div>
      </div>
    </div>
  );
}

// ── Main Wizard ──────────────────────────────────────────────────────────
const STEPS = ["Company", "Distribution", "Features", "Book Call"];

export function IntakeWizard() {
  const [currentStep, setCurrentStep] = useState(0);

  const [step1, setStep1] = useState<Step1Data>({
    companyName: "",
    shortName: "",
    website: "",
    location: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    role: "",
    revenue: "",
  });
  const [step2, setStep2] = useState<Step2Data>({
    industry: "",
    productCategories: "",
    skuCount: "",
    coldChain: "",
    currentOrdering: [],
    activeClients: "",
    avgOrderValue: "",
    paymentTerms: [],
    deliveryCoverage: "",
  });
  const [step3, setStep3] = useState<Step3Data>({
    features: [],
    primaryColor: "",
    hasBrandGuidelines: "",
    additionalNotes: "",
  });

  const canProceed = () => {
    if (currentStep === 0)
      return (
        step1.companyName.trim().length > 0 &&
        step1.contactName.trim().length > 0 &&
        step1.contactEmail.trim().length > 0
      );
    if (currentStep === 1) return step2.industry.trim().length > 0;
    return true;
  };

  return (
    <div className="border border-black bg-white">
      {/* Progress bar */}
      <div className="border-b border-black">
        <div className="flex">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className={`flex-1 px-4 py-3 text-center border-r border-black last:border-r-0 transition-colors ${
                i === currentStep
                  ? "bg-black text-white"
                  : i < currentStep
                  ? "bg-[#F3F3EF] text-black"
                  : "bg-white text-neutral-400"
              }`}
            >
              <div className="font-mono text-[9px] uppercase tracking-widest">{`0${
                i + 1
              }`}</div>
              <div className="font-mono text-[10px] hidden sm:block mt-0.5">
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step heading */}
      <div className="border-b border-black px-6 py-5">
        <h3 className="font-serif text-xl font-normal">
          {currentStep === 0 && "Tell us about your company"}
          {currentStep === 1 && "Tell us about your distribution business"}
          {currentStep === 2 && "What features does your portal need?"}
          {currentStep === 3 && "Book your consultation call"}
        </h3>
        <p className="font-mono text-xs text-neutral-500 mt-1">
          {currentStep === 0 &&
            "Basic company info so we can scope your portal build."}
          {currentStep === 1 &&
            "Help us understand your products, clients, and current workflow."}
          {currentStep === 2 &&
            "Select the capabilities you want. We'll configure everything during the build."}
          {currentStep === 3 &&
            "You're all set. Pick a time and we'll walk through your custom portal plan."}
        </p>
      </div>

      {/* Step content */}
      <div className="px-6 py-6">
        {currentStep === 0 && (
          <Step1 data={step1} onChange={(d) => setStep1((p) => ({ ...p, ...d }))} />
        )}
        {currentStep === 1 && (
          <Step2 data={step2} onChange={(d) => setStep2((p) => ({ ...p, ...d }))} />
        )}
        {currentStep === 2 && (
          <Step3 data={step3} onChange={(d) => setStep3((p) => ({ ...p, ...d }))} />
        )}
        {currentStep === 3 && (
          <Step4 step1={step1} step2={step2} step3={step3} />
        )}
      </div>

      {/* Navigation */}
      {currentStep < 3 && (
        <div className="px-6 py-4 border-t border-black flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep((p) => p - 1)}
            disabled={currentStep === 0}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-neutral-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep((p) => p + 1)}
            disabled={!canProceed()}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-wide hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-black"
          >
            {currentStep === 2 ? "Book My Call" : "Continue"}{" "}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
