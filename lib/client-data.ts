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
  category: "core" | "automation" | "growth" | "content";
};

export const FEATURES: FeatureDefinition[] = [
  { id: "client-portal", label: "Client Portal", description: "Self-service ordering, order history, invoice payments, saved carts, standing orders", value: 18000, category: "core" },
  { id: "admin-panel", label: "Admin Panel", description: "25+ pages: orders, fulfillment, CRM, inventory, pricing, quotes, leads, analytics, CEO dashboard", value: 30000, category: "core" },
  { id: "stripe-billing", label: "Stripe Billing", description: "Online checkout, Net-30/60/90 invoicing, payment reminders, aging reports, webhook handling", value: 15000, category: "core" },
  { id: "marketing-site", label: "Marketing Website", description: "17 SEO-optimized pages: catalog, about, journal, wholesale application, referral landing", value: 10000, category: "core" },
  { id: "sms-ordering", label: "SMS / iMessage Ordering", description: "Natural language order parsing via AI — clients text orders, system creates them automatically", value: 20000, category: "automation" },
  { id: "loyalty-program", label: "Loyalty Program", description: "Points per dollar, tier upgrades (NEW → REPEAT → VIP), redemption at checkout", value: 8000, category: "growth" },
  { id: "referral-program", label: "Referral Program", description: "Auto-generated codes, credit on conversion, referral tracking dashboard", value: 6000, category: "growth" },
  { id: "supplier-portal", label: "Supplier Portal", description: "Supplier login, product submission form, submission status tracking", value: 10000, category: "core" },
  { id: "ai-order-parsing", label: "AI Order Parsing", description: "Gemini-powered natural language → structured order with fuzzy matching fallback", value: 18000, category: "automation" },
  { id: "shipment-tracking", label: "Shipment Tracking", description: "Real-time tracking, cold-chain monitoring, client-facing tracking pages", value: 12000, category: "core" },
  { id: "standing-orders", label: "Standing / Recurring Orders", description: "Weekly, biweekly, or monthly auto-orders with smart scheduling", value: 8000, category: "automation" },
  { id: "product-drops", label: "Product Drops", description: "Limited-time releases with alert signups and blast notifications", value: 6000, category: "growth" },
  { id: "smart-reorder", label: "Smart Reorder Suggestions", description: "AI detects overdue clients and suggests products based on purchase history", value: 10000, category: "automation" },
  { id: "blog-journal", label: "Blog / Journal", description: "Content marketing pages for SEO and client engagement", value: 5000, category: "content" },
  { id: "sales-rep-tools", label: "Sales Rep Tools", description: "Rep assignment, cart building for clients, task management, commission tracking", value: 12000, category: "core" },
];

export const TOTAL_PLATFORM_VALUE = FEATURES.reduce((sum, f) => sum + f.value, 0);

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
