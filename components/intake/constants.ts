import {
  ShoppingCart,
  BarChart3,
  CreditCard,
  Globe,
  MessageSquare,
  Heart,
  Gift,
  Warehouse,
  Brain,
  Truck,
  Clock,
  Package,
  Newspaper,
  Users,
} from "lucide-react";
import { FEATURES as FEATURE_DATA } from "@/lib/client-data";

export const FEATURE_VALUES = Object.fromEntries(
  FEATURE_DATA.map((f) => [f.id, f.value])
);

export function formatValue(n: number) {
  return "$" + (n / 1000).toFixed(0) + "K";
}

export const ROLES = [
  "Founder / Owner",
  "CEO / President",
  "COO / Operations Lead",
  "VP of Sales",
  "Director of Operations",
  "IT / Technology Lead",
  "Other",
];

export const REVENUES = [
  "Under $500K",
  "$500K \u2013 $2M",
  "$2M \u2013 $10M",
  "$10M \u2013 $50M",
  "$50M \u2013 $100M",
  "$100M+",
];

export const INDUSTRIES = [
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

export const SKU_COUNTS = [
  "Under 50",
  "50 \u2013 200",
  "200 \u2013 500",
  "500 \u2013 1,000",
  "1,000+",
];

export const ORDERING_METHODS = [
  "Phone calls",
  "Email / text",
  "Spreadsheets",
  "Paper order forms",
  "Existing portal / ERP",
  "In-person / sales reps",
];

export const CLIENT_COUNTS = [
  "Under 25",
  "25 \u2013 100",
  "100 \u2013 500",
  "500 \u2013 1,000",
  "1,000+",
];

export const ORDER_VALUES = [
  "Under $200",
  "$200 \u2013 $500",
  "$500 \u2013 $2,000",
  "$2,000 \u2013 $10,000",
  "$10,000+",
];

export const PAYMENT_TERMS = [
  "COD / Prepay",
  "Net 15",
  "Net 30",
  "Net 60",
  "Net 90",
  "Credit card at checkout",
];

export const DELIVERY_OPTIONS = [
  "Local only (same metro)",
  "Regional (multi-state)",
  "National",
  "International",
];

export const GO_LIVE_TIMELINES = [
  "ASAP",
  "Within 1 month",
  "Within 3 months",
  "Just exploring",
];

export const MINIMUM_ORDER_VALUES = [
  "No minimum",
  "$150",
  "$250",
  "$500",
  "$1,000+",
];

export const FEATURES = [
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
    desc: "Natural language \u2192 structured order via Gemini",
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

export const STEPS = ["Company", "Distribution", "Features", "Book Call"];
export const DRAFT_KEY = "portal_intake_draft";
export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const STEP_HEADINGS = [
  "Tell us about your company",
  "Tell us about your distribution business",
  "What features does your portal need?",
  "Book your consultation call",
];

export const STEP_SUBTITLES = [
  "Basic company info so we can scope your portal build.",
  "Help us understand your products, clients, and current workflow.",
  "Select the capabilities you want. We'll configure everything during the build.",
  "You're all set. Pick a time and we'll walk through your custom portal plan.",
];

import type { Step1Data, Step2Data, Step3Data } from "./types";

export const STEP1_DEFAULT: Step1Data = {
  companyName: "", shortName: "", website: "", location: "",
  contactName: "", contactEmail: "", contactPhone: "",
  role: "", revenue: "", targetDomain: "", goLiveTimeline: "",
};
export const STEP2_DEFAULT: Step2Data = {
  industry: "", productCategories: "", skuCount: "", coldChain: "",
  currentOrdering: [], activeClients: "", avgOrderValue: "",
  paymentTerms: [], deliveryCoverage: "", minimumOrderValue: "",
};
export const STEP3_DEFAULT: Step3Data = {
  features: [], primaryColor: "", hasBrandGuidelines: "",
  additionalNotes: "", logoUrl: "", brandSecondaryColor: "", inspirationUrls: [],
};

export function loadDraft(): { step: number; step1: Step1Data; step2: Step2Data; step3: Step3Data } | null {
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

export function buildIntakePayload(step1: Step1Data, step2: Step2Data, step3: Step3Data) {
  return {
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
}
