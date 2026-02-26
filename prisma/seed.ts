import { PrismaClient, ProjectStatus, NoteType } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_PROJECTS = [
  {
    company: "Pacific Seafood Co.",
    shortName: "PSC",
    industry: "Seafood",
    website: "pacificseafood.com",
    contactName: "Marcus Chen",
    contactEmail: "marcus@pacificseafood.com",
    contactPhone: "(503) 555-0123",
    contactRole: "CEO / President",
    domain: "order.pacificseafood.com",
    customDomain: "order.pacificseafood.com",
    githubRepo: "adamwolfe2/pacific-seafood-portal",
    vercelProject: "pacific-seafood-portal",
    vercelUrl: "pacific-seafood-portal.vercel.app",
    status: "LIVE" as ProjectStatus,
    currentPhase: 15,
    startDate: new Date("2026-01-10"),
    targetLaunchDate: new Date("2026-01-24"),
    launchDate: new Date("2026-01-22"),
    enabledFeatures: ["client-portal", "admin-panel", "stripe-billing", "marketing-site", "sms-ordering", "loyalty-program", "shipment-tracking", "standing-orders", "smart-reorder"],
    contractValue: 35000,
    retainer: 2500,
    monthlyRevenue: 2500,
    envVars: Object.fromEntries([
      "DATABASE_URL", "DATABASE_URL_UNPOOLED", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      "CLERK_SECRET_KEY", "CLERK_WEBHOOK_SECRET", "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET", "RESEND_API_KEY", "BLOOIO_API_KEY",
      "BLOOIO_PHONE_NUMBER", "BLOOIO_WEBHOOK_SECRET", "GEMINI_API_KEY",
      "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "CRON_SECRET",
    ].map((k) => [k, "configured"])),
    notes: [
      { text: "Monthly check-in — 47 active clients, 312 orders processed this month", type: "UPDATE" as NoteType },
      { text: "Portal launched — 12 clients onboarded day 1", type: "MILESTONE" as NoteType },
      { text: "Final QA complete, deploying to production", type: "UPDATE" as NoteType },
      { text: "Client requested cold-chain monitoring for shipment tracking", type: "NOTE" as NoteType },
      { text: "Kickoff call completed, build started", type: "MILESTONE" as NoteType },
    ],
    tasks: [
      { label: "Monthly health check — review analytics", completed: true, phase: 15 },
      { label: "Review feature usage report", completed: false, phase: 15 },
    ],
  },
  {
    company: "Brooklyn Wine Collective",
    shortName: "BWC",
    industry: "Wine & Spirits",
    website: "brooklynwine.co",
    contactName: "Sarah Martinez",
    contactEmail: "sarah@brooklynwine.co",
    contactPhone: "(718) 555-0456",
    contactRole: "COO / Operations Lead",
    domain: "order.brooklynwine.co",
    githubRepo: "adamwolfe2/brooklyn-wine-portal",
    vercelProject: "brooklyn-wine-portal",
    vercelUrl: "brooklyn-wine-portal.vercel.app",
    status: "BUILDING" as ProjectStatus,
    currentPhase: 8,
    startDate: new Date("2026-02-10"),
    targetLaunchDate: new Date("2026-02-28"),
    enabledFeatures: ["client-portal", "admin-panel", "stripe-billing", "marketing-site", "sms-ordering", "referral-program", "product-drops", "blog-journal"],
    contractValue: 28000,
    retainer: 2000,
    monthlyRevenue: 0,
    envVars: {
      DATABASE_URL: "configured", DATABASE_URL_UNPOOLED: "configured",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "configured", CLERK_SECRET_KEY: "configured",
      CLERK_WEBHOOK_SECRET: "configured", STRIPE_SECRET_KEY: "configured",
      STRIPE_WEBHOOK_SECRET: "configured", RESEND_API_KEY: "configured",
      BLOOIO_API_KEY: "pending", BLOOIO_PHONE_NUMBER: "pending",
      BLOOIO_WEBHOOK_SECRET: "missing", GEMINI_API_KEY: "configured",
      UPSTASH_REDIS_REST_URL: "configured", UPSTASH_REDIS_REST_TOKEN: "configured",
      CRON_SECRET: "configured",
    },
    notes: [
      { text: "Admin panel 60% complete — CRM and order management done", type: "UPDATE" as NoteType },
      { text: "Marketing site deployed, client reviewing copy", type: "UPDATE" as NoteType },
      { text: "Auth + checkout flow complete, starting client portal", type: "MILESTONE" as NoteType },
      { text: "Build started — config populated from intake form", type: "MILESTONE" as NoteType },
    ],
    tasks: [
      { label: "Complete admin fulfillment board", completed: false, phase: 8 },
      { label: "Build admin analytics + CEO dashboard", completed: false, phase: 8 },
      { label: "Set up Bloo.io SMS — awaiting client phone number", completed: false, phase: 10 },
      { label: "Collect product catalog spreadsheet from client", completed: true, phase: 14 },
    ],
  },
  {
    company: "Mountain Spirits Distributors",
    shortName: "MSD",
    industry: "Wine & Spirits",
    website: "mountainspirits.com",
    contactName: "Jake Reeves",
    contactEmail: "jake@mountainspirits.com",
    contactPhone: "(303) 555-0789",
    contactRole: "Founder / Owner",
    domain: "portal.mountainspirits.com",
    githubRepo: "adamwolfe2/mountain-spirits-portal",
    vercelProject: "mountain-spirits-portal",
    status: "BUILDING" as ProjectStatus,
    currentPhase: 4,
    startDate: new Date("2026-02-20"),
    targetLaunchDate: new Date("2026-03-07"),
    enabledFeatures: ["client-portal", "admin-panel", "stripe-billing", "marketing-site", "loyalty-program", "sales-rep-tools"],
    contractValue: 22000,
    retainer: 1500,
    monthlyRevenue: 0,
    envVars: {
      DATABASE_URL: "configured", DATABASE_URL_UNPOOLED: "configured",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "configured", CLERK_SECRET_KEY: "configured",
      CLERK_WEBHOOK_SECRET: "pending", STRIPE_SECRET_KEY: "pending",
      STRIPE_WEBHOOK_SECRET: "missing", RESEND_API_KEY: "pending",
      BLOOIO_API_KEY: "missing", BLOOIO_PHONE_NUMBER: "missing",
      BLOOIO_WEBHOOK_SECRET: "missing", GEMINI_API_KEY: "missing",
      UPSTASH_REDIS_REST_URL: "missing", UPSTASH_REDIS_REST_TOKEN: "missing",
      CRON_SECRET: "configured",
    },
    notes: [
      { text: "Auth system deployed, starting marketing site build", type: "UPDATE" as NoteType },
      { text: "UI components initialized, configuring branding", type: "UPDATE" as NoteType },
      { text: "Kickoff call — client wants sales rep tools prioritized", type: "MILESTONE" as NoteType },
    ],
    tasks: [
      { label: "Finish Clerk webhook configuration", completed: false, phase: 4 },
      { label: "Set up Stripe account — client creating account", completed: false, phase: 6 },
      { label: "Collect brand guidelines and logo files", completed: true, phase: 2 },
    ],
  },
  {
    company: "Gulf Coast Provisions",
    shortName: "GCP",
    industry: "Food & Beverage",
    website: "gulfcoastprovisions.com",
    contactName: "Diana Torres",
    contactEmail: "diana@gulfcoastprovisions.com",
    contactPhone: "(504) 555-0234",
    contactRole: "VP of Sales",
    status: "ONBOARDING" as ProjectStatus,
    currentPhase: 1,
    startDate: new Date("2026-02-26"),
    targetLaunchDate: new Date("2026-03-14"),
    enabledFeatures: ["client-portal", "admin-panel", "stripe-billing", "marketing-site", "sms-ordering", "ai-order-parsing", "shipment-tracking", "loyalty-program", "referral-program", "standing-orders"],
    contractValue: 38000,
    retainer: 3000,
    monthlyRevenue: 0,
    envVars: Object.fromEntries([
      "DATABASE_URL", "DATABASE_URL_UNPOOLED", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      "CLERK_SECRET_KEY", "CLERK_WEBHOOK_SECRET", "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET", "RESEND_API_KEY", "BLOOIO_API_KEY",
      "BLOOIO_PHONE_NUMBER", "BLOOIO_WEBHOOK_SECRET", "GEMINI_API_KEY",
      "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "CRON_SECRET",
    ].map((k) => [k, "missing"])),
    notes: [
      { text: "Intake form received — 10 features selected, 200+ SKUs", type: "MILESTONE" as NoteType },
      { text: "Consultation call scheduled for tomorrow 2pm CT", type: "NOTE" as NoteType },
    ],
    tasks: [
      { label: "Consultation call", completed: false, phase: 1 },
      { label: "Create Neon database project", completed: false, phase: 1 },
      { label: "Create Clerk application", completed: false, phase: 1 },
      { label: "Set up GitHub repo from template", completed: false, phase: 1 },
    ],
  },
  {
    company: "Heritage Cheese Co.",
    shortName: "HCC",
    industry: "Specialty / Gourmet Foods",
    website: "heritagecheese.com",
    contactName: "Robert Klein",
    contactEmail: "robert@heritagecheese.com",
    contactPhone: "(802) 555-0890",
    contactRole: "Founder / Owner",
    domain: "order.heritagecheese.com",
    customDomain: "order.heritagecheese.com",
    githubRepo: "adamwolfe2/heritage-cheese-portal",
    vercelProject: "heritage-cheese-portal",
    vercelUrl: "heritage-cheese-portal.vercel.app",
    status: "LIVE" as ProjectStatus,
    currentPhase: 15,
    startDate: new Date("2025-12-01"),
    targetLaunchDate: new Date("2025-12-15"),
    launchDate: new Date("2025-12-14"),
    enabledFeatures: ["client-portal", "admin-panel", "stripe-billing", "marketing-site", "loyalty-program", "blog-journal", "shipment-tracking"],
    contractValue: 25000,
    retainer: 2000,
    monthlyRevenue: 2000,
    envVars: Object.fromEntries([
      "DATABASE_URL", "DATABASE_URL_UNPOOLED", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      "CLERK_SECRET_KEY", "CLERK_WEBHOOK_SECRET", "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET", "RESEND_API_KEY", "BLOOIO_API_KEY",
      "BLOOIO_PHONE_NUMBER", "BLOOIO_WEBHOOK_SECRET", "GEMINI_API_KEY",
      "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "CRON_SECRET",
    ].map((k) => [k, "configured"])),
    notes: [
      { text: "Q1 review — 28 active clients, wants to add SMS ordering module", type: "NOTE" as NoteType },
      { text: "Running smoothly, 18 orders/week average", type: "UPDATE" as NoteType },
      { text: "Portal launched — smooth deploy, 8 clients onboarded", type: "MILESTONE" as NoteType },
    ],
    tasks: [
      { label: "Scope SMS ordering add-on", completed: false, phase: 10 },
      { label: "Quarterly analytics review", completed: true, phase: 15 },
    ],
  },
];

async function seed() {
  console.log("Seeding portal-intake database...");

  for (const data of SEED_PROJECTS) {
    const { notes, tasks, ...projectData } = data;

    // Upsert by company name
    const existing = await prisma.project.findFirst({
      where: { company: data.company },
    });

    let project;
    if (existing) {
      project = await prisma.project.update({
        where: { id: existing.id },
        data: projectData,
      });
      // Clear existing notes/tasks for clean re-seed
      await prisma.projectNote.deleteMany({ where: { projectId: project.id } });
      await prisma.projectTask.deleteMany({ where: { projectId: project.id } });
    } else {
      project = await prisma.project.create({ data: projectData });
    }

    // Add notes
    for (const note of notes) {
      await prisma.projectNote.create({
        data: { projectId: project.id, text: note.text, type: note.type },
      });
    }

    // Add tasks
    for (const task of tasks) {
      await prisma.projectTask.create({
        data: {
          projectId: project.id,
          label: task.label,
          phase: task.phase,
          completed: task.completed,
          completedAt: task.completed ? new Date() : null,
        },
      });
    }

    console.log(`  ✓ ${data.company} (${data.status})`);
  }

  console.log(`\nSeeded ${SEED_PROJECTS.length} projects.`);
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
