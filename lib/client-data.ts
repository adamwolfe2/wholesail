// ═══════════════════════════════════════════════════════════════════════════
// Wholesail — Client Data Types & Mock Data
// Shared between admin dashboard, client status page, and pricing calculator
// ═══════════════════════════════════════════════════════════════════════════

export type ClientStatus = "inquiry" | "onboarding" | "building" | "review" | "live" | "churned";

export type FeatureDefinition = {
  id: string;
  label: string;
  description: string;
  value: number;
  marketValue: number;
  category: "core" | "commerce" | "automation" | "growth" | "analytics" | "infrastructure";
};

export const FEATURES: FeatureDefinition[] = [
  // ── Core Platform ────────────────────────────────────────────────────
  { id: "client-portal", label: "Client Portal", description: "Clients stop calling to place orders. They log in, browse, order, and pay — anytime, anywhere. No more phone tag.", value: 6000, marketValue: 38000, category: "core" },
  { id: "admin-panel", label: "Admin Panel", description: "See every order, client, invoice, and product in one place. Stop switching between 5 apps to run your business.", value: 10000, marketValue: 65000, category: "core" },
  { id: "supplier-portal", label: "Supplier Portal", description: "Suppliers submit products online instead of emailing you spreadsheets. You approve with one click.", value: 3000, marketValue: 18000, category: "core" },
  { id: "marketing-site", label: "Marketing Website", description: "A professional site that brings in new wholesale leads while you sleep — not a generic marketplace listing.", value: 3000, marketValue: 18000, category: "core" },
  { id: "multi-role-auth", label: "Multi-Role Authentication", description: "Your team, reps, clients, and suppliers each see only what they need. No shared logins or access confusion.", value: 2000, marketValue: 12000, category: "core" },
  { id: "database-architecture", label: "Database Architecture", description: "Your data is structured, connected, and fast. No more scattered spreadsheets or broken formulas.", value: 4000, marketValue: 25000, category: "core" },

  // ── Commerce & Billing ───────────────────────────────────────────────
  { id: "stripe-billing", label: "Stripe Billing & Checkout", description: "Clients pay online in seconds. No more chasing checks, lost invoices, or manual payment tracking.", value: 3000, marketValue: 22000, category: "commerce" },
  { id: "invoice-engine", label: "Net-30/60/90 Invoice Engine", description: "Invoices generate and send themselves. Reminders go out automatically when they're late.", value: 3000, marketValue: 20000, category: "commerce" },
  { id: "standing-orders", label: "Standing / Recurring Orders", description: "Repeat clients set it and forget it. Weekly or monthly orders process automatically — zero re-entry.", value: 2000, marketValue: 12000, category: "commerce" },
  { id: "tiered-pricing", label: "Tiered Wholesale Pricing", description: "VIP clients see VIP prices. New clients see standard prices. No more custom spreadsheets per account.", value: 2000, marketValue: 15000, category: "commerce" },
  { id: "quote-management", label: "Quote Management", description: "Create and send quotes in seconds. Clients approve with one click. Quotes convert to orders automatically.", value: 2000, marketValue: 15000, category: "commerce" },
  { id: "saved-carts", label: "Saved Carts & Quick Reorder", description: "Clients save their usual order and reorder with one click. No rebuilding the same cart every week.", value: 1500, marketValue: 8000, category: "commerce" },

  // ── AI & Automation ──────────────────────────────────────────────────
  { id: "sms-ordering", label: "SMS / iMessage Ordering", description: "Clients text '2 cases salmon, 5lb truffles' — the system creates the order and confirms. No app needed.", value: 5000, marketValue: 35000, category: "automation" },
  { id: "ai-order-parsing", label: "AI Order Parsing", description: "AI reads natural language orders and turns them into real orders — even shorthand and product nicknames.", value: 4000, marketValue: 28000, category: "automation" },
  { id: "ai-chatbot", label: "AI Chatbot", description: "Clients get instant answers about products and pricing 24/7 without your team picking up the phone.", value: 5000, marketValue: 30000, category: "automation" },
  { id: "smart-reorder", label: "Smart Reorder Suggestions", description: "The system notices when regulars haven't ordered in a while and nudges them before they lapse.", value: 2000, marketValue: 15000, category: "automation" },
  { id: "email-automation", label: "Email Automation Suite", description: "Welcome emails, order confirmations, shipping updates, follow-ups — all sent automatically, zero manual work.", value: 3000, marketValue: 18000, category: "automation" },
  { id: "abandoned-cart", label: "Abandoned Cart Recovery", description: "When a client adds to cart but doesn't order, they get a reminder. Recovers revenue you'd otherwise lose.", value: 2000, marketValue: 10000, category: "automation" },
  { id: "billing-reminders", label: "Automated Billing Reminders", description: "Overdue payments get automatic reminder sequences. Your team stops playing collections agent.", value: 1500, marketValue: 8000, category: "automation" },

  // ── Growth & Retention ───────────────────────────────────────────────
  { id: "loyalty-program", label: "Loyalty Program", description: "Reward your best buyers automatically. Points accrue, tiers upgrade, clients redeem — all self-service.", value: 2000, marketValue: 12000, category: "growth" },
  { id: "referral-program", label: "Referral Program", description: "Happy clients share a code, new clients sign up, both get credit. Word of mouth on autopilot.", value: 2000, marketValue: 10000, category: "growth" },
  { id: "product-drops", label: "Product Drops & Alerts", description: "Launch limited products with instant notifications to your best clients. Create urgency and drive reorders.", value: 2000, marketValue: 10000, category: "growth" },
  { id: "sales-rep-tools", label: "Sales Rep Tools", description: "Reps see their clients, build carts for them, track tasks, and close deals — all from one dashboard.", value: 3000, marketValue: 20000, category: "growth" },
  { id: "client-health", label: "Client Health Scoring", description: "Know which clients are thriving, slipping, or about to churn — before it happens.", value: 2000, marketValue: 12000, category: "growth" },
  { id: "wholesale-application", label: "Wholesale Application Flow", description: "New wholesale clients apply online, get reviewed, and onboard themselves. No back-and-forth emails.", value: 1500, marketValue: 8000, category: "growth" },

  // ── Analytics & Reporting ────────────────────────────────────────────
  { id: "ceo-dashboard", label: "CEO Dashboard & KPIs", description: "Open one screen and see revenue, orders, client health, and trends. No more pulling reports manually.", value: 2000, marketValue: 12000, category: "analytics" },
  { id: "revenue-analytics", label: "Revenue & Client Analytics", description: "Understand what's selling, who's buying, and where your revenue is growing — or shrinking.", value: 2000, marketValue: 10000, category: "analytics" },
  { id: "pdf-generation", label: "PDF Generation", description: "Professional branded invoices and price lists generate automatically. No more Word docs or Excel exports.", value: 2000, marketValue: 10000, category: "analytics" },
  { id: "inventory-reports", label: "Inventory Reports & Alerts", description: "Know exactly what's in stock and what's running low — in real time, not after you've already oversold.", value: 1500, marketValue: 8000, category: "analytics" },

  // ── Infrastructure ───────────────────────────────────────────────────
  { id: "shipment-tracking", label: "Shipment Tracking", description: "Clients track their own deliveries instead of calling you to ask 'where's my order?'", value: 3000, marketValue: 18000, category: "infrastructure" },
  { id: "inventory-management", label: "Inventory Management", description: "Stock levels update automatically as orders come in. No more overselling or manual spreadsheet updates.", value: 3000, marketValue: 18000, category: "infrastructure" },
  { id: "blog-journal", label: "Blog / Journal CMS", description: "Share sourcing stories and product spotlights to keep clients engaged and attract new ones.", value: 1500, marketValue: 6000, category: "infrastructure" },
  { id: "cron-automation", label: "Cron Job Automation", description: "Abandoned cart emails, billing reminders, lapsed client alerts, weekly digests — all run on autopilot.", value: 2000, marketValue: 10000, category: "infrastructure" },
  { id: "security", label: "Security & Rate Limiting", description: "Enterprise-grade security and audit logging. Your data and your clients' data stay safe.", value: 1500, marketValue: 8000, category: "infrastructure" },
];

export const TOTAL_MARKET_VALUE = FEATURES.reduce((sum, f) => sum + f.marketValue, 0);
export const TOTAL_WHOLESAIL_VALUE = FEATURES.reduce((sum, f) => sum + f.value, 0);
/** @deprecated Use TOTAL_MARKET_VALUE */
export const TOTAL_PLATFORM_VALUE = TOTAL_MARKET_VALUE;

// ── Tool Replacement Comparison ─────────────────────────────────────────────
// The "Frankenstack" — what wholesale distributors actually duct-tape together
// baseCost = fixed monthly, perSeat = per team member (scales with slider)
export type ToolCategory =
  | "erp"
  | "billing"
  | "crm"
  | "shipping"
  | "analytics"
  | "marketing"
  | "portal"
  | "automation";

export type ToolReplacement = {
  tool: string;
  domain: string; // Clearbit logo: https://logo.clearbit.com/{domain}
  category: ToolCategory;
  painPoint: string;
  baseCost: number;
  perSeat: number;
};

export const TOOL_CATEGORY_META: { id: ToolCategory; label: string }[] = [
  { id: "erp", label: "Order Management / ERP" },
  { id: "billing", label: "Billing & Invoicing" },
  { id: "crm", label: "CRM & Sales" },
  { id: "shipping", label: "Shipping & Fulfillment" },
  { id: "analytics", label: "Analytics & Reporting" },
  { id: "marketing", label: "Marketing & Communication" },
  { id: "portal", label: "Online Ordering / Portal" },
  { id: "automation", label: "Automation & Integrations" },
];

export const TOOL_REPLACEMENTS: ToolReplacement[] = [
  // ── Order Management / ERP ─────────────────────────────────────────────
  { tool: "QuickBooks", domain: "intuit.com", category: "erp", painPoint: "Half your team is still on Desktop 2012. Your data lives in a silo nobody can access remotely.", baseCost: 200, perSeat: 20 },
  { tool: "SAP Business One", domain: "sap.com", category: "erp", painPoint: "$150K+ implementation built for manufacturing — not a 50-SKU distributor running Net-30 terms.", baseCost: 800, perSeat: 0 },
  { tool: "NetSuite", domain: "netsuite.com", category: "erp", painPoint: "Enterprise pricing for features you'll never touch. Most distributors use 10% of what they pay for.", baseCost: 750, perSeat: 0 },
  { tool: "Cin7", domain: "cin7.com", category: "erp", painPoint: "Inventory-first, client-last. No self-service portal. You're still taking every order by phone.", baseCost: 350, perSeat: 0 },
  { tool: "Sage", domain: "sage.com", category: "erp", painPoint: "Legacy software from the '90s your team dreads opening every morning. Migration feels impossible.", baseCost: 500, perSeat: 0 },

  // ── Billing & Invoicing ────────────────────────────────────────────────
  { tool: "FreshBooks", domain: "freshbooks.com", category: "billing", painPoint: "Designed for freelancers — not 500-SKU distributors managing Net-60 terms and volume invoicing.", baseCost: 55, perSeat: 11 },
  { tool: "Xero", domain: "xero.com", category: "billing", painPoint: "Another accounting tool that doesn't connect to your orders. Double-entry into two systems, every day.", baseCost: 80, perSeat: 5 },
  { tool: "Wave", domain: "waveapps.com", category: "billing", painPoint: "Free until you actually need it to scale. Zero support for wholesale terms or automated AR follow-ups.", baseCost: 200, perSeat: 0 },

  // ── CRM & Sales ────────────────────────────────────────────────────────
  { tool: "Salesforce", domain: "salesforce.com", category: "crm", painPoint: "$150/seat for a CRM your sales reps refuse to update because it's completely disconnected from orders.", baseCost: 0, perSeat: 150 },
  { tool: "HubSpot", domain: "hubspot.com", category: "crm", painPoint: "Powerful tool — if anyone on your team actually used it. Most distributor HubSpots sit empty for months.", baseCost: 890, perSeat: 0 },
  { tool: "Pipedrive", domain: "pipedrive.com", category: "crm", painPoint: "Better UX, still completely disconnected from your orders, invoices, and delivery schedule.", baseCost: 0, perSeat: 49 },

  // ── Shipping & Fulfillment ─────────────────────────────────────────────
  { tool: "ShipStation", domain: "shipstation.com", category: "shipping", painPoint: "Built for DTC e-commerce — doesn't understand route-based delivery with your own drivers and manifests.", baseCost: 200, perSeat: 0 },
  { tool: "Route4Me", domain: "route4me.com", category: "shipping", painPoint: "Optimizes delivery routes but doesn't connect to your orders. Another tab, another login, another silo.", baseCost: 200, perSeat: 0 },
  { tool: "OptimoRoute", domain: "optimoroute.com", category: "shipping", painPoint: "Solves one problem well — but you still need 8 other tools duct-taped around it.", baseCost: 150, perSeat: 0 },

  // ── Analytics & Reporting ──────────────────────────────────────────────
  { tool: "Metabase", domain: "metabase.com", category: "analytics", painPoint: "Open source BI that requires a developer to set up and maintain. Who's writing your churn queries?", baseCost: 85, perSeat: 8 },
  { tool: "Looker", domain: "looker.com", category: "analytics", painPoint: "Google-grade analytics at Google-grade prices. You just need reorder rates, not a data warehouse.", baseCost: 300, perSeat: 0 },

  // ── Marketing & Communication ──────────────────────────────────────────
  { tool: "Mailchimp", domain: "mailchimp.com", category: "marketing", painPoint: "Batch-and-blast newsletters. No segmentation by order history, purchase frequency, or reorder timing.", baseCost: 350, perSeat: 0 },
  { tool: "Klaviyo", domain: "klaviyo.com", category: "marketing", painPoint: "40 automation flows to configure before sending your first reorder reminder. Who has the time?", baseCost: 500, perSeat: 0 },
  { tool: "Twilio", domain: "twilio.com", category: "marketing", painPoint: "Raw SMS API with no order context. Your team still copies and pastes order confirmations by hand.", baseCost: 500, perSeat: 0 },

  // ── Online Ordering / Portal ───────────────────────────────────────────
  { tool: "Shopify Plus", domain: "shopify.com", category: "portal", painPoint: "Built for DTC retail — no Net-30 terms, no tiered wholesale pricing, no rep tools, no route delivery.", baseCost: 2300, perSeat: 0 },
  { tool: "NuOrder", domain: "nuorder.com", category: "portal", painPoint: "Marketplace model — they own the client relationship. You're just another vendor in their catalog.", baseCost: 1000, perSeat: 0 },
  { tool: "Faire", domain: "faire.com", category: "portal", painPoint: "They take 25% on first orders, 15% on reorders. Your brand disappears behind their marketplace.", baseCost: 500, perSeat: 0 },
  { tool: "Squarespace", domain: "squarespace.com", category: "portal", painPoint: "A beautiful brochure that says 'call us to order.' Not a portal. Not even close.", baseCost: 50, perSeat: 0 },

  // ── Automation & Integrations ──────────────────────────────────────────
  { tool: "Zapier", domain: "zapier.com", category: "automation", painPoint: "The duct tape holding your Frankenstack together. When one zap breaks, the whole chain goes down.", baseCost: 250, perSeat: 0 },
  { tool: "Typeform", domain: "typeform.com", category: "automation", painPoint: "Pretty forms that dump into a spreadsheet. No approval workflow, no auto-onboarding, no follow-up.", baseCost: 100, perSeat: 0 },
];

export function getToolCost(tool: ToolReplacement, teamSize: number): number {
  return tool.baseCost + tool.perSeat * teamSize;
}

export function getTotalMonthlyCost(teamSize: number): number {
  return TOOL_REPLACEMENTS.reduce((sum, t) => sum + getToolCost(t, teamSize), 0);
}

// ── Manual Processes / Time Savings ──────────────────────────────────────────
// What teams spend their week doing manually that Wholesail automates
export type ManualProcess = {
  task: string;
  hoursPerWeek: number;
  automatedBy: string;
  plainEnglish: string; // outcome in plain english
};

export const MANUAL_PROCESSES: ManualProcess[] = [
  { task: "Taking orders by phone, email, and text", hoursPerWeek: 10, automatedBy: "Self-service ordering portal + SMS ordering", plainEnglish: "Clients order themselves, 24/7" },
  { task: "Creating and sending invoices", hoursPerWeek: 6, automatedBy: "Automated billing engine", plainEnglish: "Invoices generate and send themselves" },
  { task: "Chasing overdue payments", hoursPerWeek: 3, automatedBy: "Automated payment reminders", plainEnglish: "Payment reminders go out automatically" },
  { task: "Updating inventory in spreadsheets", hoursPerWeek: 4, automatedBy: "Real-time inventory management", plainEnglish: "Inventory updates when orders ship" },
  { task: "Managing client info in spreadsheets or CRM", hoursPerWeek: 4, automatedBy: "Built-in CRM with auto-updates", plainEnglish: "Client data stays current automatically" },
  { task: "Tracking deliveries and shipments", hoursPerWeek: 3, automatedBy: "Automated shipment tracking", plainEnglish: "Clients track their own deliveries" },
  { task: "Processing new wholesale applications", hoursPerWeek: 2, automatedBy: "Online application + auto-onboarding", plainEnglish: "New clients onboard themselves" },
  { task: "Building price lists and catalogs", hoursPerWeek: 2, automatedBy: "Dynamic catalog + PDF export", plainEnglish: "Price lists update in real-time" },
  { task: "Sending marketing emails and follow-ups", hoursPerWeek: 3, automatedBy: "Automated email sequences", plainEnglish: "Emails send based on client behavior" },
  { task: "Pulling reports for the team", hoursPerWeek: 2, automatedBy: "Real-time analytics dashboard", plainEnglish: "Reports are always live and up-to-date" },
  { task: "Coordinating sales reps and tasks", hoursPerWeek: 2, automatedBy: "Built-in task + rep management", plainEnglish: "Reps see their tasks and clients in one place" },
  { task: "Answering the same client questions over and over", hoursPerWeek: 4, automatedBy: "AI chatbot trained on your business", plainEnglish: "AI answers instantly, escalates when needed" },
];

export const TOTAL_HOURS_SAVED = MANUAL_PROCESSES.reduce((sum, p) => sum + p.hoursPerWeek, 0);
export const DEFAULT_HOURLY_RATE = 30; // conservative $/hr for employee time
export const ANNUAL_TIME_COST = TOTAL_HOURS_SAVED * DEFAULT_HOURLY_RATE * 52;

export const BUILD_PHASES = [
  { phase: 1, label: "Project Initialization", description: "Dependencies installed, database connected, dev environment running" },
  { phase: 2, label: "Partner Configuration", description: "portal.config.ts customized with branding, products, pricing rules" },
  { phase: 3, label: "UI Components", description: "57 shadcn/ui components initialized + custom shared components" },
  { phase: 4, label: "Authentication", description: "Clerk auth with 5 role types, webhook handler, auto-linking" },
  { phase: 5, label: "Marketing Site", description: "17 public pages: catalog, about, journal, wholesale application" },
  { phase: 6, label: "Checkout Flow", description: "Cart → Stripe checkout → order creation → confirmation" },
  { phase: 7, label: "Client Portal", description: "14 authenticated pages: dashboard, orders, invoices, payments" },
  { phase: 8, label: "Admin Panel", description: "25+ admin pages: orders, fulfillment, CRM, inventory, analytics" },
  { phase: 9, label: "Supplier Portal", description: "Supplier login, product submission form, submission tracking" },
  { phase: 10, label: "SMS Integration", description: "Two-way SMS/iMessage with AI order parsing and confirmation flow" },
  { phase: 11, label: "Cron Jobs", description: "Abandoned carts, billing reminders, lapsed clients, weekly digests" },
  { phase: 12, label: "PDF Generation", description: "Invoice PDFs and tiered price list PDFs" },
  { phase: 13, label: "Billing Engine", description: "Automated Net-30 invoice generation, payment reminders" },
  { phase: 14, label: "Seed Script", description: "Partner product catalog populated with real data" },
  { phase: 15, label: "Deployment", description: "Vercel deploy, webhooks configured, custom domain, SSL" },
];

export const ENV_VARS = [
  { key: "DATABASE_URL", label: "Neon DB (pooled)", required: true },
  { key: "DATABASE_URL_UNPOOLED", label: "Neon DB (direct)", required: true },
  { key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", label: "Clerk Public", required: true },
  { key: "CLERK_SECRET_KEY", label: "Clerk Secret", required: true },
  { key: "CLERK_WEBHOOK_SECRET", label: "Clerk Webhook", required: true },
  { key: "STRIPE_SECRET_KEY", label: "Stripe", required: true },
  { key: "STRIPE_WEBHOOK_SECRET", label: "Stripe Webhook", required: true },
  { key: "RESEND_API_KEY", label: "Resend", required: true },
  { key: "BLOOIO_API_KEY", label: "Bloo.io SMS", required: false },
  { key: "BLOOIO_PHONE_NUMBER", label: "Bloo.io Phone", required: false },
  { key: "BLOOIO_WEBHOOK_SECRET", label: "Bloo.io Webhook", required: false },
  { key: "GEMINI_API_KEY", label: "Google Gemini", required: false },
  { key: "UPSTASH_REDIS_REST_URL", label: "Upstash Redis", required: false },
  { key: "UPSTASH_REDIS_REST_TOKEN", label: "Upstash Token", required: false },
  { key: "CRON_SECRET", label: "Cron Auth", required: true },
];

export type EnvVarStatus = "configured" | "pending" | "missing";
export type ClientNote = { date: string; text: string; type: "note" | "update" | "milestone" };

interface ProjectRow {
  id: string;
  company: string;
  shortName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  contactRole?: string | null;
  domain?: string | null;
  website?: string | null;
  industry: string;
  status: string;
  currentPhase: number;
  startDate?: Date | string | null;
  targetLaunchDate?: Date | string | null;
  launchDate?: Date | string | null;
  enabledFeatures?: string[] | null;
  githubRepo?: string | null;
  vercelProject?: string | null;
  vercelUrl?: string | null;
  customDomain?: string | null;
  envVars?: unknown;
  contractValue?: number;
  retainer?: number;
  monthlyRevenue?: number;
  notes?: Array<{ createdAt: Date | string; text: string; type: string }>;
  tasks?: Array<{ id: string; label: string; completed: boolean; phase: number }>;
}

export function mapProjectsForDashboard(projects: ProjectRow[]): ClientProject[] {
  return projects.map((p) => ({
    id: p.id,
    company: p.company,
    shortName: p.shortName,
    contact: {
      name: p.contactName,
      email: p.contactEmail,
      phone: p.contactPhone || "",
      role: p.contactRole || "",
    },
    domain: p.domain || "",
    website: p.website || "",
    industry: p.industry,
    status: p.status.toLowerCase() as ClientStatus,
    currentPhase: p.currentPhase,
    startDate: p.startDate ? new Date(p.startDate).toISOString().split("T")[0] : "",
    targetLaunchDate: p.targetLaunchDate ? new Date(p.targetLaunchDate).toISOString().split("T")[0] : "",
    launchDate: p.launchDate ? new Date(p.launchDate).toISOString().split("T")[0] : undefined,
    enabledFeatures: p.enabledFeatures || [],
    githubRepo: p.githubRepo ?? undefined,
    vercelProject: p.vercelProject ?? undefined,
    vercelUrl: p.vercelUrl ?? undefined,
    customDomain: p.customDomain ?? undefined,
    envVars: (typeof p.envVars === "object" && p.envVars !== null ? p.envVars : {}) as Record<string, EnvVarStatus>,
    contractValue: p.contractValue ?? 0,
    retainer: p.retainer ?? 0,
    monthlyRevenue: p.monthlyRevenue ?? 0,
    notes: (p.notes || []).map((n: { createdAt: Date | string; text: string; type: string }) => ({
      date: typeof n.createdAt === "string" ? n.createdAt.split("T")[0] : new Date(n.createdAt).toISOString().split("T")[0],
      text: n.text,
      type: n.type.toLowerCase() as "note" | "update" | "milestone",
    })),
    tasks: (p.tasks || []).map((t: { id: string; label: string; completed: boolean; phase: number }) => ({
      id: t.id,
      label: t.label,
      completed: t.completed,
      phase: t.phase,
    })),
  }));
}

export type ClientProject = {
  id: string;
  company: string;
  shortName: string;
  contact: { name: string; email: string; phone: string; role: string };
  domain: string;
  website: string;
  industry: string;
  status: ClientStatus;
  currentPhase: number;
  startDate: string;
  targetLaunchDate: string;
  launchDate?: string;
  enabledFeatures: string[];
  githubRepo?: string;
  vercelProject?: string;
  vercelUrl?: string;
  customDomain?: string;
  envVars: Record<string, EnvVarStatus>;
  contractValue: number;
  retainer: number;
  monthlyRevenue: number;
  notes: ClientNote[];
  tasks: { id: string; label: string; completed: boolean; phase: number }[];
};

const allConfigured = Object.fromEntries(ENV_VARS.map((v) => [v.key, "configured" as const]));

export const MOCK_CLIENTS: ClientProject[] = [
  {
    id: "cl_001",
    company: "Pacific Seafood Co.",
    shortName: "PSC",
    contact: { name: "Marcus Chen", email: "marcus@pacificseafood.com", phone: "(503) 555-0123", role: "CEO / President" },
    domain: "order.pacificseafood.com",
    website: "pacificseafood.com",
    industry: "Seafood",
    status: "live",
    currentPhase: 15,
    startDate: "2026-01-10",
    targetLaunchDate: "2026-01-24",
    launchDate: "2026-01-22",
    enabledFeatures: ["client-portal", "admin-panel", "stripe-billing", "marketing-site", "sms-ordering", "loyalty-program", "shipment-tracking", "standing-orders", "smart-reorder"],
    githubRepo: "adamwolfe2/pacific-seafood-portal",
    vercelProject: "pacific-seafood-portal",
    vercelUrl: "pacific-seafood-portal.vercel.app",
    customDomain: "order.pacificseafood.com",
    envVars: allConfigured,
    contractValue: 35000,
    retainer: 2500,
    monthlyRevenue: 2500,
    notes: [
      { date: "2026-02-15", text: "Monthly check-in — 47 active clients, 312 orders processed this month", type: "update" },
      { date: "2026-01-22", text: "Portal launched — 12 clients onboarded day 1", type: "milestone" },
      { date: "2026-01-20", text: "Final QA complete, deploying to production", type: "update" },
      { date: "2026-01-15", text: "Client requested cold-chain monitoring for shipment tracking", type: "note" },
      { date: "2026-01-10", text: "Kickoff call completed, build started", type: "milestone" },
    ],
    tasks: [
      { id: "t1", label: "Monthly health check — review analytics", completed: true, phase: 15 },
      { id: "t2", label: "Review feature usage report", completed: false, phase: 15 },
    ],
  },
  {
    id: "cl_002",
    company: "Brooklyn Wine Collective",
    shortName: "BWC",
    contact: { name: "Sarah Martinez", email: "sarah@brooklynwine.co", phone: "(718) 555-0456", role: "COO / Operations Lead" },
    domain: "order.brooklynwine.co",
    website: "brooklynwine.co",
    industry: "Wine & Spirits",
    status: "building",
    currentPhase: 8,
    startDate: "2026-02-10",
    targetLaunchDate: "2026-02-28",
    enabledFeatures: ["client-portal", "admin-panel", "stripe-billing", "marketing-site", "sms-ordering", "referral-program", "product-drops", "blog-journal"],
    githubRepo: "adamwolfe2/brooklyn-wine-portal",
    vercelProject: "brooklyn-wine-portal",
    vercelUrl: "brooklyn-wine-portal.vercel.app",
    envVars: {
      ...allConfigured,
      BLOOIO_API_KEY: "pending",
      BLOOIO_PHONE_NUMBER: "pending",
      BLOOIO_WEBHOOK_SECRET: "missing",
      GEMINI_API_KEY: "configured",
      UPSTASH_REDIS_REST_URL: "configured",
      UPSTASH_REDIS_REST_TOKEN: "configured",
    },
    contractValue: 28000,
    retainer: 2000,
    monthlyRevenue: 0,
    notes: [
      { date: "2026-02-24", text: "Admin panel 60% complete — CRM and order management done", type: "update" },
      { date: "2026-02-18", text: "Marketing site deployed, client reviewing copy", type: "update" },
      { date: "2026-02-14", text: "Auth + checkout flow complete, starting client portal", type: "milestone" },
      { date: "2026-02-10", text: "Build started — config populated from intake form", type: "milestone" },
    ],
    tasks: [
      { id: "t3", label: "Complete admin fulfillment board", completed: false, phase: 8 },
      { id: "t4", label: "Build admin analytics + CEO dashboard", completed: false, phase: 8 },
      { id: "t5", label: "Set up Bloo.io SMS — awaiting client phone number", completed: false, phase: 10 },
      { id: "t6", label: "Collect product catalog spreadsheet from client", completed: true, phase: 14 },
    ],
  },
  {
    id: "cl_003",
    company: "Mountain Spirits Distributors",
    shortName: "MSD",
    contact: { name: "Jake Reeves", email: "jake@mountainspirits.com", phone: "(303) 555-0789", role: "Founder / Owner" },
    domain: "portal.mountainspirits.com",
    website: "mountainspirits.com",
    industry: "Wine & Spirits",
    status: "building",
    currentPhase: 4,
    startDate: "2026-02-20",
    targetLaunchDate: "2026-03-07",
    enabledFeatures: ["client-portal", "admin-panel", "stripe-billing", "marketing-site", "loyalty-program", "sales-rep-tools"],
    githubRepo: "adamwolfe2/mountain-spirits-portal",
    vercelProject: "mountain-spirits-portal",
    envVars: {
      DATABASE_URL: "configured",
      DATABASE_URL_UNPOOLED: "configured",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "configured",
      CLERK_SECRET_KEY: "configured",
      CLERK_WEBHOOK_SECRET: "pending",
      STRIPE_SECRET_KEY: "pending",
      STRIPE_WEBHOOK_SECRET: "missing",
      RESEND_API_KEY: "pending",
      BLOOIO_API_KEY: "missing",
      BLOOIO_PHONE_NUMBER: "missing",
      BLOOIO_WEBHOOK_SECRET: "missing",
      GEMINI_API_KEY: "missing",
      UPSTASH_REDIS_REST_URL: "missing",
      UPSTASH_REDIS_REST_TOKEN: "missing",
      CRON_SECRET: "configured",
    },
    contractValue: 22000,
    retainer: 1500,
    monthlyRevenue: 0,
    notes: [
      { date: "2026-02-25", text: "Auth system deployed, starting marketing site build", type: "update" },
      { date: "2026-02-22", text: "UI components initialized, configuring branding", type: "update" },
      { date: "2026-02-20", text: "Kickoff call — client wants sales rep tools prioritized", type: "milestone" },
    ],
    tasks: [
      { id: "t7", label: "Finish Clerk webhook configuration", completed: false, phase: 4 },
      { id: "t8", label: "Set up Stripe account — client creating account", completed: false, phase: 6 },
      { id: "t9", label: "Collect brand guidelines and logo files", completed: true, phase: 2 },
    ],
  },
  {
    id: "cl_004",
    company: "Gulf Coast Provisions",
    shortName: "GCP",
    contact: { name: "Diana Torres", email: "diana@gulfcoastprovisions.com", phone: "(504) 555-0234", role: "VP of Sales" },
    domain: "",
    website: "gulfcoastprovisions.com",
    industry: "Food & Beverage",
    status: "onboarding",
    currentPhase: 1,
    startDate: "2026-02-26",
    targetLaunchDate: "2026-03-14",
    enabledFeatures: ["client-portal", "admin-panel", "stripe-billing", "marketing-site", "sms-ordering", "ai-order-parsing", "shipment-tracking", "loyalty-program", "referral-program", "standing-orders"],
    envVars: {
      DATABASE_URL: "missing",
      DATABASE_URL_UNPOOLED: "missing",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "missing",
      CLERK_SECRET_KEY: "missing",
      CLERK_WEBHOOK_SECRET: "missing",
      STRIPE_SECRET_KEY: "missing",
      STRIPE_WEBHOOK_SECRET: "missing",
      RESEND_API_KEY: "missing",
      BLOOIO_API_KEY: "missing",
      BLOOIO_PHONE_NUMBER: "missing",
      BLOOIO_WEBHOOK_SECRET: "missing",
      GEMINI_API_KEY: "missing",
      UPSTASH_REDIS_REST_URL: "missing",
      UPSTASH_REDIS_REST_TOKEN: "missing",
      CRON_SECRET: "missing",
    },
    contractValue: 38000,
    retainer: 3000,
    monthlyRevenue: 0,
    notes: [
      { date: "2026-02-26", text: "Intake form received — 10 features selected, 200+ SKUs", type: "milestone" },
      { date: "2026-02-26", text: "Consultation call scheduled for tomorrow 2pm CT", type: "note" },
    ],
    tasks: [
      { id: "t10", label: "Consultation call", completed: false, phase: 1 },
      { id: "t11", label: "Create Neon database project", completed: false, phase: 1 },
      { id: "t12", label: "Create Clerk application", completed: false, phase: 1 },
      { id: "t13", label: "Set up GitHub repo from template", completed: false, phase: 1 },
    ],
  },
  {
    id: "cl_005",
    company: "Prairie Organics",
    shortName: "PO",
    contact: { name: "Tom Hayward", email: "tom@prairieorganics.com", phone: "(316) 555-0567", role: "Director of Operations" },
    domain: "",
    website: "prairieorganics.com",
    industry: "Produce",
    status: "inquiry",
    currentPhase: 0,
    startDate: "",
    targetLaunchDate: "",
    enabledFeatures: ["client-portal", "admin-panel", "stripe-billing", "marketing-site"],
    envVars: Object.fromEntries(ENV_VARS.map((v) => [v.key, "missing" as const])),
    contractValue: 0,
    retainer: 0,
    monthlyRevenue: 0,
    notes: [
      { date: "2026-02-25", text: "Intake form submitted — basic features only, exploring options", type: "note" },
    ],
    tasks: [],
  },
  {
    id: "cl_006",
    company: "Heritage Cheese Co.",
    shortName: "HCC",
    contact: { name: "Robert Klein", email: "robert@heritagecheese.com", phone: "(802) 555-0890", role: "Founder / Owner" },
    domain: "order.heritagecheese.com",
    website: "heritagecheese.com",
    industry: "Specialty / Gourmet Foods",
    status: "live",
    currentPhase: 15,
    startDate: "2025-12-01",
    targetLaunchDate: "2025-12-15",
    launchDate: "2025-12-14",
    enabledFeatures: ["client-portal", "admin-panel", "stripe-billing", "marketing-site", "loyalty-program", "blog-journal", "shipment-tracking"],
    githubRepo: "adamwolfe2/heritage-cheese-portal",
    vercelProject: "heritage-cheese-portal",
    vercelUrl: "heritage-cheese-portal.vercel.app",
    customDomain: "order.heritagecheese.com",
    envVars: allConfigured,
    contractValue: 25000,
    retainer: 2000,
    monthlyRevenue: 2000,
    notes: [
      { date: "2026-02-10", text: "Q1 review — 28 active clients, wants to add SMS ordering module", type: "note" },
      { date: "2026-01-15", text: "Running smoothly, 18 orders/week average", type: "update" },
      { date: "2025-12-14", text: "Portal launched — smooth deploy, 8 clients onboarded", type: "milestone" },
    ],
    tasks: [
      { id: "t14", label: "Scope SMS ordering add-on", completed: false, phase: 10 },
      { id: "t15", label: "Quarterly analytics review", completed: true, phase: 15 },
    ],
  },
];

export const STATUS_CONFIG: Record<ClientStatus, { label: string; color: string; bg: string }> = {
  inquiry: { label: "Inquiry", color: "#8B92A5", bg: "#F0EFF3" },
  onboarding: { label: "Onboarding", color: "#B45309", bg: "#FEF3C7" },
  building: { label: "Building", color: "#2A52BE", bg: "#EEF2FB" },
  review: { label: "In Review", color: "#7C3AED", bg: "#F3EEFF" },
  live: { label: "Live", color: "#059669", bg: "#D1FAE5" },
  churned: { label: "Churned", color: "#DC2626", bg: "#FEE2E2" },
};
