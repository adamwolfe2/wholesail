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
import { FEATURES as FEATURE_DATA } from "@/lib/client-data";

const FEATURE_VALUES = Object.fromEntries(
  FEATURE_DATA.map((f) => [f.id, f.value])
);
function formatValue(n: number) {
  return "$" + (n / 1000).toFixed(0) + "K";
}

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
  targetDomain: string;
  goLiveTimeline: string;
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
  minimumOrderValue: string;
};

type Step3Data = {
  features: string[];
  primaryColor: string;
  hasBrandGuidelines: string;
  additionalNotes: string;
  logoUrl: string;
  brandSecondaryColor: string;
  inspirationUrls: string[];
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

const GO_LIVE_TIMELINES = [
  "ASAP",
  "Within 1 month",
  "Within 3 months",
  "Just exploring",
];

const MINIMUM_ORDER_VALUES = [
  "No minimum",
  "$150",
  "$250",
  "$500",
  "$1,000+",
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
      className="text-left px-4 py-3 border font-mono text-xs uppercase tracking-wide transition-all"
      style={{
        backgroundColor: selected ? "var(--blue)" : "var(--bg-white)",
        color: selected ? "white" : "var(--text-body)",
        borderColor: selected ? "var(--blue)" : "var(--border)",
        borderRadius: "4px",
      }}
    >
      {children}
    </button>
  );
}

// ── Step 1: Company & Contact ────────────────────────────────────────────
function Step1({
  data,
  onChange,
  attempted,
}: {
  data: Step1Data;
  onChange: (d: Partial<Step1Data>) => void;
  attempted: boolean;
}) {
  const err = (val: string) => attempted && val.trim().length === 0;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Company Name *
          </label>
          <input
            type="text"
            value={data.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
            placeholder="Pacific Seafood Co."
            className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none" style={{ borderColor: err(data.companyName) ? "var(--destructive)" : "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
          />
          {err(data.companyName) && <span className="font-mono text-[10px] mt-1 block" style={{ color: "var(--destructive)" }}>Required</span>}
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Short Name / Abbreviation
          </label>
          <input
            type="text"
            value={data.shortName}
            onChange={(e) => onChange({ shortName: e.target.value })}
            placeholder="PSC"
            className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none" style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
          />
          <span className="font-mono text-[9px] mt-1 block" style={{ color: "var(--text-muted)" }}>
            Used in SMS messages and notifications
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Website
          </label>
          <input
            type="text"
            value={data.website}
            onChange={(e) => onChange({ website: e.target.value })}
            placeholder="pacificseafood.com"
            className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none" style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
          />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Location
          </label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="Portland, OR"
            className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none" style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Target Domain
          </label>
          <input
            type="text"
            value={data.targetDomain}
            onChange={(e) => onChange({ targetDomain: e.target.value })}
            placeholder="acmewholesale.com or your preferred domain"
            className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none" style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
          />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            When do you want to go live?
          </label>
          <div className="grid grid-cols-1 gap-2">
            {GO_LIVE_TIMELINES.map((t) => (
              <OptionButton
                key={t}
                selected={data.goLiveTimeline === t}
                onClick={() => onChange({ goLiveTimeline: t })}
              >
                {t}
              </OptionButton>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Your Name *
          </label>
          <input
            type="text"
            value={data.contactName}
            onChange={(e) => onChange({ contactName: e.target.value })}
            placeholder="John Smith"
            className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none" style={{ borderColor: err(data.contactName) ? "var(--destructive)" : "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
          />
          {err(data.contactName) && <span className="font-mono text-[10px] mt-1 block" style={{ color: "var(--destructive)" }}>Required</span>}
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Email *
          </label>
          <input
            type="email"
            value={data.contactEmail}
            onChange={(e) => onChange({ contactEmail: e.target.value })}
            placeholder="john@pacificseafood.com"
            className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none" style={{ borderColor: err(data.contactEmail) ? "var(--destructive)" : "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
          />
          {err(data.contactEmail) && <span className="font-mono text-[10px] mt-1 block" style={{ color: "var(--destructive)" }}>Required</span>}
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Phone
          </label>
          <input
            type="tel"
            value={data.contactPhone}
            onChange={(e) => onChange({ contactPhone: e.target.value })}
            placeholder="(503) 555-0123"
            className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none" style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
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
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
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
        <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
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
        <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
          Main product categories (comma-separated)
        </label>
        <input
          type="text"
          value={data.productCategories}
          onChange={(e) => onChange({ productCategories: e.target.value })}
          placeholder="e.g. Fresh Truffles, Oils & Vinegars, Specialty Cheese, Cured Meats"
          className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none" style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
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
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
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
        <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
          How do clients currently place orders? (select all)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ORDERING_METHODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => toggleOrdering(m)}
              className="text-left px-3 py-2.5 border font-mono text-xs uppercase tracking-wide transition-all flex items-center gap-2"
              style={{
                backgroundColor: data.currentOrdering.includes(m) ? "var(--blue)" : "var(--bg-white)",
                color: data.currentOrdering.includes(m) ? "white" : "var(--text-body)",
                borderColor: data.currentOrdering.includes(m) ? "var(--blue)" : "var(--border)",
                borderRadius: "4px",
              }}
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
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
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
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
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
        <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
          Payment terms you offer (select all)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PAYMENT_TERMS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => togglePayment(t)}
              className="text-left px-3 py-2.5 border font-mono text-xs uppercase tracking-wide transition-all flex items-center gap-2"
              style={{
                backgroundColor: data.paymentTerms.includes(t) ? "var(--blue)" : "var(--bg-white)",
                color: data.paymentTerms.includes(t) ? "white" : "var(--text-body)",
                borderColor: data.paymentTerms.includes(t) ? "var(--blue)" : "var(--border)",
                borderRadius: "4px",
              }}
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
        <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
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

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
          Minimum order value
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {MINIMUM_ORDER_VALUES.map((v) => (
            <OptionButton
              key={v}
              selected={data.minimumOrderValue === v}
              onClick={() => onChange({ minimumOrderValue: v })}
            >
              {v}
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
        <label className="font-mono text-[10px] uppercase tracking-widest block mb-3" style={{ color: "var(--text-muted)" }}>
          Which features do you need? (select all that apply)
          <span className="ml-2">
            ({data.features.length} selected
            {data.features.length > 0 && (
              <> · {formatValue(data.features.reduce((sum, id) => sum + (FEATURE_VALUES[id] || 0), 0))} market value</>
            )})
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
                className="text-left px-4 py-3 border font-mono transition-all flex items-start gap-3"
                style={{
                  backgroundColor: selected ? "var(--blue)" : "var(--bg-white)",
                  color: selected ? "white" : "var(--text-body)",
                  borderColor: selected ? "var(--blue)" : "var(--border)",
                  borderRadius: "4px",
                }}
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: selected ? "white" : "var(--text-muted)" }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs uppercase tracking-wide font-semibold">
                      {f.label}
                    </span>
                    <span
                      className="text-[10px] font-bold flex-shrink-0"
                      style={{ color: selected ? "rgba(255,255,255,0.8)" : "var(--text-body)" }}
                    >
                      {formatValue(FEATURE_VALUES[f.id] || 0)}
                    </span>
                  </div>
                  <div
                    className="text-[10px] mt-0.5 leading-snug"
                    style={{ color: selected ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }}
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
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Primary Brand Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={data.primaryColor || "#000000"}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              className="w-12 h-12 border cursor-pointer p-0"
              style={{ borderColor: "var(--border-strong)", borderRadius: "4px" }}
            />
            <input
              type="text"
              value={data.primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              placeholder="#1A1A1A"
              className="flex-1 border px-4 py-3 font-mono text-sm bg-white focus:outline-none"
              style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
            />
          </div>
          <span className="font-mono text-[9px] mt-1 block" style={{ color: "var(--text-muted)" }}>
            Used for buttons, headers, and accents throughout your portal
          </span>
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Logo File URL
          </label>
          <input
            type="text"
            value={data.logoUrl}
            onChange={(e) => onChange({ logoUrl: e.target.value })}
            placeholder="Link to your logo file (website, Google Drive, Dropbox)"
            className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none"
            style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
          />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Secondary / Accent Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={data.brandSecondaryColor || "#666666"}
              onChange={(e) => onChange({ brandSecondaryColor: e.target.value })}
              className="w-12 h-12 border cursor-pointer p-0"
              style={{ borderColor: "var(--border-strong)", borderRadius: "4px" }}
            />
            <input
              type="text"
              value={data.brandSecondaryColor}
              onChange={(e) => onChange({ brandSecondaryColor: e.target.value })}
              placeholder="#666666"
              className="flex-1 border px-4 py-3 font-mono text-sm bg-white focus:outline-none"
              style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest block mb-1" style={{ color: "var(--text-muted)" }}>
          Websites you like the look or format of
        </label>
        <p className="font-mono text-[9px] mb-3" style={{ color: "var(--text-muted)" }}>
          Competitors, design references, or any site you&apos;d like us to draw inspiration from
        </p>
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <input
              key={i}
              type="text"
              value={data.inspirationUrls[i] || ""}
              onChange={(e) => {
                const updated = [...data.inspirationUrls];
                updated[i] = e.target.value;
                // Trim trailing empty entries
                while (updated.length > 0 && !updated[updated.length - 1]) updated.pop();
                onChange({ inspirationUrls: updated });
              }}
              placeholder={`Inspiration site ${i + 1}`}
              className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none"
              style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
          Anything else we should know?
        </label>
        <textarea
          value={data.additionalNotes}
          onChange={(e) => onChange({ additionalNotes: e.target.value })}
          placeholder="e.g. We need to migrate from an existing system. We have specific compliance requirements. We want to integrate with our ERP..."
          rows={4}
          className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none resize-none"
          style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
        />
      </div>
    </div>
  );
}

// ── Cal.com Embed ────────────────────────────────────────────────────────
function CalEmbed({ name, email }: { name?: string; email?: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).__calWholesailInitialized) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__calWholesailInitialized = true;

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
    Cal("init", "wholesail", { origin: "https://app.cal.com" });
    Cal.ns.wholesail("inline", {
      elementOrSelector: "#my-cal-inline-wholesail",
      config: {
        layout: "month_view",
        useSlotsViewOnSmallScreen: "true",
        theme: "light",
        ...(name || email ? { prefill: { name: name ?? "", email: email ?? "" } } : {}),
      },
      calLink: process.env.NEXT_PUBLIC_CAL_LINK ?? "adamwolfe/wholesail",
    });
    Cal.ns.wholesail("ui", {
      theme: "light",
      cssVarsPerTheme: { light: { "cal-brand": "#5194ca" } },
      hideEventTypeDetails: true,
      layout: "month_view",
    });
  }, []);

  return (
    <div
      id="my-cal-inline-wholesail"
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
      <div className="border p-6" style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-primary)", borderRadius: "8px" }}>
        <div className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
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
              <div className="font-mono text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>
                {item.label}
              </div>
              <div className="font-mono text-xs font-medium truncate" style={{ color: "var(--text-headline)" }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
        {featureLabels.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="font-mono text-[9px] uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
              Selected Features
            </div>
            <div className="flex flex-wrap gap-1.5">
              {featureLabels.map((label) => (
                <span
                  key={label}
                  className="font-mono text-[9px] text-white px-2 py-1"
                  style={{ backgroundColor: "var(--blue)", borderRadius: "4px" }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* What happens next */}
      <div className="border p-6" style={{ borderColor: "var(--border-strong)", borderRadius: "8px" }}>
        <div className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
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
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: "var(--blue)" }}
                strokeWidth={2}
              />
              <span className="font-mono text-xs" style={{ color: "var(--text-body)" }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cal.com embed */}
      <div>
        <div className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
          Select a time to speak with our team
        </div>
        <div className="border bg-white overflow-hidden" style={{ borderColor: "var(--border-strong)", borderRadius: "8px" }}>
          <CalEmbed name={step1.contactName} email={step1.contactEmail} />
        </div>
      </div>
    </div>
  );
}

// ── Main Wizard ──────────────────────────────────────────────────────────
const STEPS = ["Company", "Distribution", "Features", "Book Call"];
const DRAFT_KEY = "wholesail_intake_draft";
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const STEP1_DEFAULT: Step1Data = {
  companyName: "", shortName: "", website: "", location: "",
  contactName: "", contactEmail: "", contactPhone: "",
  role: "", revenue: "", targetDomain: "", goLiveTimeline: "",
};
const STEP2_DEFAULT: Step2Data = {
  industry: "", productCategories: "", skuCount: "", coldChain: "",
  currentOrdering: [], activeClients: "", avgOrderValue: "",
  paymentTerms: [], deliveryCoverage: "", minimumOrderValue: "",
};
const STEP3_DEFAULT: Step3Data = {
  features: [], primaryColor: "", hasBrandGuidelines: "",
  additionalNotes: "", logoUrl: "", brandSecondaryColor: "", inspirationUrls: [],
};

function loadDraft(): { step: number; step1: Step1Data; step2: Step2Data; step3: Step3Data } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft?.savedAt || Date.now() - draft.savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function IntakeWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [step1, setStep1] = useState<Step1Data>(STEP1_DEFAULT);
  const [step2, setStep2] = useState<Step2Data>(STEP2_DEFAULT);
  const [step3, setStep3] = useState<Step3Data>(STEP3_DEFAULT);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [draft, setDraft] = useState<ReturnType<typeof loadDraft>>(null);
  const [draftChecked, setDraftChecked] = useState(false);

  // Check for saved draft on mount (client-only)
  useEffect(() => {
    const saved = loadDraft();
    if (saved && saved.step1.companyName) {
      setDraft(saved);
    }
    setDraftChecked(true);
  }, []);

  // Persist to localStorage on every change (steps 0-2 only)
  useEffect(() => {
    if (!draftChecked || submitted || currentStep === 3) return;
    if (!step1.companyName && !step1.contactEmail) return; // Don't save empty forms
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        step: currentStep, step1, step2, step3, savedAt: Date.now(),
      }));
    } catch { /* quota exceeded or SSR — ignore */ }
  }, [currentStep, step1, step2, step3, submitted, draftChecked]);

  function handleResumeDraft() {
    if (!draft) return;
    setStep1(draft.step1);
    setStep2(draft.step2);
    setStep3(draft.step3);
    setCurrentStep(draft.step);
    setDraft(null);
  }

  function handleDiscardDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    setDraft(null);
  }

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

  const handleNext = async () => {
    if (!canProceed()) {
      setAttempted(true);
      return;
    }
    setAttempted(false);
    // On the final data step (step 2 → step 3), submit to API
    if (currentStep === 2 && !submitted) {
      setSubmitting(true);
      try {
        const payload = {
          companyName: step1.companyName,
          shortName: step1.shortName || undefined,
          website: step1.website || undefined,
          location: step1.location || undefined,
          contactName: step1.contactName,
          contactEmail: step1.contactEmail,
          contactPhone: step1.contactPhone || undefined,
          contactRole: step1.role || undefined,
          annualRevenue: step1.revenue || undefined,
          targetDomain: step1.targetDomain || undefined,
          goLiveTimeline: step1.goLiveTimeline || undefined,
          industry: step2.industry,
          productCategories: step2.productCategories || undefined,
          skuCount: step2.skuCount || undefined,
          coldChain: step2.coldChain || undefined,
          currentOrdering: step2.currentOrdering,
          activeClients: step2.activeClients || undefined,
          avgOrderValue: step2.avgOrderValue || undefined,
          paymentTerms: step2.paymentTerms,
          deliveryCoverage: step2.deliveryCoverage || undefined,
          minimumOrderValue: step2.minimumOrderValue || undefined,
          selectedFeatures: step3.features,
          primaryColor: step3.primaryColor || undefined,
          hasBrandGuidelines: step3.hasBrandGuidelines || undefined,
          additionalNotes: step3.additionalNotes || undefined,
          logoUrl: step3.logoUrl || undefined,
          brandSecondaryColor: step3.brandSecondaryColor || undefined,
          inspirationUrls: step3.inspirationUrls.filter(Boolean),
        };
        const res = await fetch("/api/intake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setSubmitted(true);
          // Clear saved draft on successful submission
          try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
        } else {
          console.warn("Intake API returned", res.status, "— proceeding to booking");
        }
      } catch {
        console.warn("Intake API unavailable — proceeding to booking");
      } finally {
        setSubmitting(false);
      }
    }
    setCurrentStep((p) => p + 1);
  };

  return (
    <div className="border bg-white" style={{ borderColor: "var(--border-strong)", borderRadius: "8px", overflow: "hidden" }}>
      {/* Resume draft banner */}
      {draft && (
        <div
          className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap"
          style={{ backgroundColor: "var(--blue-light)", borderBottom: "1px solid var(--border-strong)" }}
        >
          <p className="font-mono text-xs" style={{ color: "var(--blue)" }}>
            Welcome back — continue your application
            {draft.step1.companyName ? ` for ${draft.step1.companyName}` : ""}?
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleResumeDraft}
              className="font-mono text-xs font-semibold underline underline-offset-2"
              style={{ color: "var(--blue)" }}
            >
              Resume
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="font-mono text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Start over
            </button>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="border-b" style={{ borderColor: "var(--border-strong)" }}>
        <div className="flex">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className="flex-1 px-4 py-3 text-center transition-colors"
              style={{
                borderRight: i < STEPS.length - 1 ? "1px solid var(--border-strong)" : "none",
                backgroundColor: i === currentStep ? "var(--blue)" : i < currentStep ? "var(--blue-light)" : "var(--bg-white)",
                color: i === currentStep ? "white" : i < currentStep ? "var(--blue)" : "var(--text-muted)",
              }}
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
      <div className="border-b px-4 sm:px-6 py-4 sm:py-5" style={{ borderColor: "var(--border)" }}>
        <h3 className="font-serif text-lg sm:text-xl font-normal" style={{ color: "var(--text-headline)" }}>
          {currentStep === 0 && "Tell us about your company"}
          {currentStep === 1 && "Tell us about your distribution business"}
          {currentStep === 2 && "What features does your portal need?"}
          {currentStep === 3 && "Book your consultation call"}
        </h3>
        <p className="font-mono text-xs mt-1" style={{ color: "var(--text-body)" }}>
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
      <div className="px-3 sm:px-6 py-4 sm:py-6">
        {currentStep === 0 && (
          <Step1 data={step1} onChange={(d) => setStep1((p) => ({ ...p, ...d }))} attempted={attempted} />
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
        <div className="px-4 sm:px-6 py-4 border-t" style={{ borderColor: "var(--border)" }}>
          {currentStep === 2 && (
            <p className="font-mono text-[10px] text-center mb-3" style={{ color: "var(--text-muted)" }}>
              Typical build: 3–5 weeks · White-glove setup included
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep((p) => p - 1)}
              disabled={currentStep === 0}
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ color: "var(--text-body)" }}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <div className="flex flex-col items-end gap-1">
              {attempted && !canProceed() && (
                <span className="font-mono text-[10px]" style={{ color: "var(--destructive)" }}>
                  Fill in the required fields above
                </span>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={submitting}
                className="flex items-center justify-center gap-2 text-white px-5 py-3 font-mono text-xs font-semibold tracking-wide disabled:opacity-40 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
                style={{ backgroundColor: "var(--blue)", borderRadius: "6px" }}
              >
                {submitting ? "Submitting..." : currentStep === 2 ? "Book My Call" : "Continue"}{" "}
                {!submitting && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
