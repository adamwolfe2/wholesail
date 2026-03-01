/**
 * Seed TBGC as a live Wholesail client project.
 * Run: pnpm tsx scripts/seed-tbgc-client.ts
 *
 * TBGC is a real client whose portal Wholesail built and manages.
 * Their codebase became the Wholesail template — that's an internal
 * implementation detail. From a business POV they are a paying client.
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import type { HTTPQueryOptions } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL not set — check .env.local");

const adapter = new PrismaNeonHttp(connectionString, {} as HTTPQueryOptions<boolean, boolean>);
const prisma = new PrismaClient({ adapter });

const TBGC_FEATURES = [
  "client-portal",
  "admin-panel",
  "stripe-billing",
  "marketing-site",
  "sms-ordering",
  "ai-order-parsing",
  "loyalty-program",
  "referral-program",
  "shipment-tracking",
  "standing-orders",
  "product-drops",
  "smart-reorder",
  "blog-journal",
  "sales-rep-tools",
  "supplier-portal",
];

const BUILD_CHECKLIST = {
  // Automated
  configGenerated: true,
  githubRepoCreated: true,
  vercelProjectCreated: true,
  // Admin
  clerkSetup: true,
  neonDbProvisioned: true,
  stripeConfigured: true,
  customDomainConnected: false, // truffleboys.com migration in progress
  envVarsConfigured: true,
  contentPopulated: true,
  // Client
  logoReceived: true,
  productCatalogReceived: true,
  marketingPhotosReceived: true,
  domainTransferred: false, // migration in progress
  clientApproved: true,
};

const BUILD_LOG = [
  "[2025-11-01T10:00:00.000Z] Project kickoff — TBGC luxury food distributor portal",
  "[2025-11-05T14:00:00.000Z] Config generated — Specialty Gourmet Foods, primary #0A0A0A",
  "[2025-11-06T09:00:00.000Z] GitHub repo created: adamwolfe2/TBGC",
  "[2025-11-10T11:00:00.000Z] Clerk app created, Neon DB provisioned",
  "[2025-11-15T16:00:00.000Z] Stripe configured, 122 SKUs seeded from distribution list",
  "[2025-11-20T13:00:00.000Z] Client portal live — 15 authenticated pages",
  "[2025-11-25T10:00:00.000Z] Admin panel live — orders, clients, fulfillment, CRM",
  "[2025-12-01T12:00:00.000Z] SMS/iMessage ordering via Bloo.io connected",
  "[2025-12-05T14:00:00.000Z] Loyalty program, referral program activated",
  "[2025-12-10T11:00:00.000Z] 313 historical orgs imported ($993K revenue, 1,661 invoices)",
  "[2025-12-12T09:00:00.000Z] Deployed to tbgclub.vercel.app — portal LIVE",
  "[2025-12-14T10:00:00.000Z] Client approved — all systems operational",
  "[2026-02-25T08:00:00.000Z] Intelligence layer: client health scoring, AI reply suggestions",
  "[2026-02-25T12:00:00.000Z] Referral program, provenance pages, seasonal calendar shipped",
  "[2026-03-01T10:00:00.000Z] Domain migration to truffleboys.com — in progress",
];

async function main() {
  // Check if TBGC project already exists
  const existing = await prisma.project.findFirst({
    where: {
      OR: [
        { githubRepo: "adamwolfe2/TBGC" },
        { shortName: "TBGC" },
      ],
    },
  });

  if (existing) {
    console.log(`TBGC project already exists (id: ${existing.id}) — updating...`);
    await prisma.project.update({
      where: { id: existing.id },
      data: {
        status: "LIVE",
        currentPhase: 15,
        enabledFeatures: TBGC_FEATURES,
        githubRepo: "adamwolfe2/TBGC",
        vercelProject: "prj_GxMgXdOYErqgqg6Hsabk5oom5M94",
        vercelUrl: "https://tbgclub.vercel.app",
        customDomain: "truffleboys.com",
        domain: "truffleboys.com",
        buildChecklist: BUILD_CHECKLIST,
        buildLog: BUILD_LOG,
        website: "truffleboys.com",
        startDate: new Date("2025-11-01"),
        targetLaunchDate: new Date("2025-12-15"),
        launchDate: new Date("2025-12-14"),
      },
    });
    console.log("✓ TBGC project updated");
    return;
  }

  const project = await prisma.project.create({
    data: {
      company: "Truffle Boys & Girls Club",
      shortName: "TBGC",
      industry: "Specialty / Gourmet Foods",
      website: "truffleboys.com",
      contactName: "Adam Wolfe",
      contactEmail: "adam@truffleboys.com",
      contactPhone: "(714) 317-0561",
      contactRole: "Founder / Owner",

      // Portal infrastructure
      domain: "truffleboys.com",
      customDomain: "truffleboys.com",
      githubRepo: "adamwolfe2/TBGC",
      vercelProject: "prj_GxMgXdOYErqgqg6Hsabk5oom5M94",
      vercelUrl: "https://tbgclub.vercel.app",

      // Build status — fully live
      status: "LIVE",
      currentPhase: 15,
      enabledFeatures: TBGC_FEATURES,

      // Dates
      startDate: new Date("2025-11-01"),
      targetLaunchDate: new Date("2025-12-15"),
      launchDate: new Date("2025-12-14"),

      // Financials — update with real numbers
      contractValue: 0,
      retainer: 0,
      monthlyRevenue: 0,

      // Build automation records
      buildChecklist: BUILD_CHECKLIST,
      buildLog: BUILD_LOG,
      generatedConfig: "// Generated config stored in adamwolfe2/TBGC repo",

      // Env vars — all configured (live portal)
      envVars: {
        DATABASE_URL: "configured",
        DATABASE_URL_UNPOOLED: "configured",
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "configured",
        CLERK_SECRET_KEY: "configured",
        CLERK_WEBHOOK_SECRET: "configured",
        STRIPE_SECRET_KEY: "configured",
        STRIPE_WEBHOOK_SECRET: "configured",
        RESEND_API_KEY: "configured",
        BLOOIO_API_KEY: "configured",
        BLOOIO_PHONE_NUMBER: "configured",
        BLOOIO_WEBHOOK_SECRET: "configured",
        GEMINI_API_KEY: "configured",
        UPSTASH_REDIS_REST_URL: "missing",
        UPSTASH_REDIS_REST_TOKEN: "missing",
        CRON_SECRET: "configured",
      },

      callNotes:
        "TBGC is a luxury specialty food distributor (LA-based). 342+ wholesale clients — Michelin restaurants, hotels, private chefs. 122+ SKUs: truffles, caviar, wagyu, foie gras. Seasonal/perishable, cold chain required. iMessage ordering via Bloo.io is critical to their workflow. 313 historical clients imported, domain migration to truffleboys.com in progress.",
    },
  });

  // Add milestone notes (individual creates — HTTP adapter doesn't support createMany transactions)
  await prisma.projectNote.create({
    data: {
      projectId: project.id,
      text: "Portal launched — 342+ wholesale clients migrated. 313 historical orgs + 1,661 invoices imported.",
      type: "MILESTONE",
      createdAt: new Date("2025-12-14"),
    },
  });
  await prisma.projectNote.create({
    data: {
      projectId: project.id,
      text: "Intelligence layer shipped: client health scoring (RFM 0-100), AI reply suggestions (Gemini), smart reorder alerts.",
      type: "UPDATE",
      createdAt: new Date("2026-02-25"),
    },
  });
  await prisma.projectNote.create({
    data: {
      projectId: project.id,
      text: "Domain migration to truffleboys.com underway — Clerk, Stripe, Bloo.io, Resend webhooks pending update.",
      type: "UPDATE",
      createdAt: new Date("2026-03-01"),
    },
  });

  console.log(`✓ TBGC project created (id: ${project.id})`);
  console.log(`  Status: LIVE | Phase: 15/15 | Features: ${TBGC_FEATURES.length}`);
  console.log(`  GitHub: adamwolfe2/TBGC`);
  console.log(`  Vercel: tbgclub.vercel.app → truffleboys.com (migration pending)`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
