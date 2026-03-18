import { PrismaClient, ProjectStatus, NoteType, UserRole, OrgTier, OrderStatus, InvoiceStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

if (process.env.NODE_ENV === "production") {
  throw new Error("Seed script must not run in production. Aborting.");
}

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

  // ── Operational seed data: users, org, products, orders, invoices ──

  console.log("\nSeeding operational data...");

  // Organization
  const org = await prisma.organization.upsert({
    where: { id: "seed-org-demo" },
    update: {},
    create: {
      id: "seed-org-demo",
      name: "Demo Restaurant Group",
      tier: OrgTier.REPEAT,
      contactPerson: "Alex Rivera",
      email: "alex@demorestaurants.com",
      phone: "(555) 123-4567",
      website: "demorestaurants.com",
      paymentTerms: "NET30",
      referralCode: "DEMO2026",
      onboardingStep: 4,
      approvedAt: new Date("2026-01-15"),
    },
  });

  // Users (Clerk IDs are placeholders — won't match real Clerk users)
  const adminUser = await prisma.user.upsert({
    where: { id: "seed-admin-user" },
    update: {},
    create: {
      id: "seed-admin-user",
      email: "admin@wholesailhub.com",
      name: "Wholesail Admin",
      role: UserRole.ADMIN,
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { id: "seed-client-user" },
    update: {},
    create: {
      id: "seed-client-user",
      email: "alex@demorestaurants.com",
      name: "Alex Rivera",
      role: UserRole.CLIENT,
      organizationId: org.id,
    },
  });

  console.log("  + Users: admin + client");

  // Address
  const address = await prisma.address.upsert({
    where: { id: "seed-address-1" },
    update: {},
    create: {
      id: "seed-address-1",
      organizationId: org.id,
      type: "SHIPPING",
      street: "123 Restaurant Row",
      city: "Portland",
      state: "OR",
      zip: "97201",
      isDefault: true,
    },
  });

  // Products (5 items across categories)
  const productData = [
    { id: "seed-prod-1", slug: "wild-salmon-fillet", name: "Wild Salmon Fillet", description: "Fresh wild-caught Pacific salmon, 6oz portions", price: 14.50, costPrice: 9.00, unit: "lb", category: "Seafood", available: true },
    { id: "seed-prod-2", slug: "organic-olive-oil", name: "Organic Extra Virgin Olive Oil", description: "Cold-pressed Italian EVOO, 1L bottle", price: 18.00, costPrice: 11.50, unit: "bottle", category: "Pantry", available: true },
    { id: "seed-prod-3", slug: "aged-parmesan", name: "Aged Parmigiano Reggiano", description: "24-month aged, DOP certified", price: 22.00, costPrice: 15.00, unit: "lb", category: "Dairy & Cheese", available: true },
    { id: "seed-prod-4", slug: "wagyu-ribeye", name: "A5 Wagyu Ribeye", description: "Japanese A5 Wagyu, marble score 10+", price: 120.00, costPrice: 85.00, unit: "lb", category: "Meat", available: true, prepayRequired: true },
    { id: "seed-prod-5", slug: "heirloom-tomatoes", name: "Heirloom Tomatoes Mix", description: "Seasonal mix of heirloom varieties", price: 6.50, costPrice: 3.50, unit: "lb", category: "Produce", available: true },
  ];

  for (const p of productData) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, sortOrder: productData.indexOf(p) },
    });
  }
  console.log(`  + ${productData.length} products`);

  // Orders (3 orders in different statuses)
  const orderData = [
    {
      id: "seed-order-1",
      orderNumber: "WS-DEMO-001",
      status: OrderStatus.DELIVERED,
      items: [
        { productId: "seed-prod-1", name: "Wild Salmon Fillet", quantity: 10, unitPrice: 14.50 },
        { productId: "seed-prod-3", name: "Aged Parmigiano Reggiano", quantity: 5, unitPrice: 22.00 },
      ],
    },
    {
      id: "seed-order-2",
      orderNumber: "WS-DEMO-002",
      status: OrderStatus.CONFIRMED,
      items: [
        { productId: "seed-prod-2", name: "Organic Extra Virgin Olive Oil", quantity: 12, unitPrice: 18.00 },
        { productId: "seed-prod-5", name: "Heirloom Tomatoes Mix", quantity: 20, unitPrice: 6.50 },
      ],
    },
    {
      id: "seed-order-3",
      orderNumber: "WS-DEMO-003",
      status: OrderStatus.PENDING,
      items: [
        { productId: "seed-prod-4", name: "A5 Wagyu Ribeye", quantity: 3, unitPrice: 120.00 },
        { productId: "seed-prod-1", name: "Wild Salmon Fillet", quantity: 8, unitPrice: 14.50 },
      ],
    },
  ];

  for (const o of orderData) {
    const subtotal = o.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + tax;

    const order = await prisma.order.upsert({
      where: { id: o.id },
      update: {},
      create: {
        id: o.id,
        orderNumber: o.orderNumber,
        organizationId: org.id,
        userId: clientUser.id,
        status: o.status,
        subtotal,
        tax,
        total,
        shippingAddressId: address.id,
        paidAt: o.status !== OrderStatus.PENDING ? new Date() : null,
      },
    });

    // Upsert order items
    for (const item of o.items) {
      await prisma.orderItem.upsert({
        where: { id: `${o.id}-${item.productId}` },
        update: {},
        create: {
          id: `${o.id}-${item.productId}`,
          orderId: order.id,
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        },
      });
    }
  }
  console.log(`  + ${orderData.length} orders with items`);

  // Invoices (2 invoices)
  const invoiceData = [
    {
      id: "seed-inv-1",
      invoiceNumber: "INV-DEMO-001",
      orderId: "seed-order-1",
      status: InvoiceStatus.PAID,
      paidAt: new Date(),
    },
    {
      id: "seed-inv-2",
      invoiceNumber: "INV-DEMO-002",
      orderId: "seed-order-2",
      status: InvoiceStatus.PENDING,
      paidAt: null,
    },
  ];

  for (const inv of invoiceData) {
    const order = await prisma.order.findUnique({ where: { id: inv.orderId }, select: { subtotal: true, tax: true, total: true } });
    if (!order) continue;

    await prisma.invoice.upsert({
      where: { id: inv.id },
      update: {},
      create: {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        orderId: inv.orderId,
        organizationId: org.id,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: inv.status,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        paidAt: inv.paidAt,
      },
    });
  }
  console.log(`  + ${invoiceData.length} invoices`);

  console.log("\nOperational seed data complete.");
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
