import Anthropic from "@anthropic-ai/sdk";

export interface ReadmeInput {
  companyName: string;
  shortName: string;
  industry: string;
  website: string | null;
  location: string | null;
  contactEmail: string;
  primaryColor: string;
  brandSecondaryColor: string | null;
  logoUrl: string | null;
  selectedFeatures: string[];
  productCategories: string | null;
  coldChain: string | null;
  paymentTerms: string[];
  deliveryCoverage: string | null;
  additionalNotes: string | null;
  targetDomain: string | null;
  minimumOrderValue: string | null;
  // From research pipeline (may be null if research skipped)
  researchData: {
    industryLandscape?: string;
    companyIntelligence?: string;
    painPoints?: string;
    competitorSoftware?: string;
    seoKeywords?: string[];
    marketingAngles?: string[];
    catalogCategories?: string[];
    industryTerminology?: Record<string, string>;
    synthesizedBrief?: string;
  } | null;
  // From Firecrawl scrape
  scrapeData: {
    website?: {
      data?: {
        extract?: {
          brandColors?: string[];
          logoUrl?: string;
          companyDescription?: string;
          productTypes?: string[];
        };
        markdown?: string;
      };
    };
  } | null;
  // The generated portal.config.ts content
  generatedConfig: string;
}

// ── Feature registry ────────────────────────────────────────────────────────
// Maps feature IDs (from intake-wizard) to display info and relevant file paths.

interface FeatureSpec {
  label: string;
  description: string;
  filePaths: string[];
  configKey: string | null;
  envVars: string[];
  enableInstructions: string;
  disableInstructions: string;
}

const FEATURE_REGISTRY: Record<string, FeatureSpec> = {
  "admin-dashboard": {
    label: "Admin Dashboard",
    description: "Order management, client CRM, fulfillment board",
    filePaths: [
      "app/admin/ (entire directory)",
      "app/admin/orders/ — order management",
      "app/admin/clients/ — client CRM",
      "app/admin/fulfillment/ — fulfillment board with pick lists",
      "app/admin/analytics/ — analytics dashboard",
      "app/admin/inventory/ — inventory management",
      "app/admin/invoices/ — invoice management with aging reports",
      "app/admin/pricing/ — pricing tier configuration",
      "app/admin/settings/ — portal settings and team management",
    ],
    configKey: null,
    envVars: [],
    enableInstructions:
      "Core feature, always enabled. Verify all admin routes render correctly with the client's branding.",
    disableInstructions:
      "Cannot be disabled — this is the core admin interface.",
  },
  "stripe-billing": {
    label: "Stripe Billing",
    description: "Online checkout, invoices, Net-30/60/90 terms",
    filePaths: [
      "lib/stripe/ — Stripe integration utilities",
      "lib/payments/stripe.ts — payment processing logic",
      "app/api/webhooks/stripe/ — Stripe webhook handler",
      "app/client-portal/payments/ — client payment page",
      "app/client-portal/invoices/ — client invoice view",
      "app/admin/invoices/ — admin invoice management",
      "app/admin/invoices/aging/ — invoice aging reports",
    ],
    configKey: "pricing.netTermOptions",
    envVars: ["STRIPE_CONNECT_ACCOUNT_ID", "PLATFORM_FEE_PERCENT"],
    enableInstructions:
      "Uses Stripe Connect (auto-provisioned). STRIPE_CONNECT_ACCOUNT_ID is set after the client completes onboarding via the emailed link. PLATFORM_FEE_PERCENT defaults to 2.5%. The platform Stripe key handles webhook verification at /api/webhooks/stripe for events: checkout.session.completed, invoice.paid, invoice.payment_failed, customer.subscription.updated.",
    disableInstructions:
      "Remove Stripe env vars. Hide payment-related nav items in app/client-portal/layout.tsx. Remove invoice and payment pages from client portal navigation.",
  },
  "marketing-site": {
    label: "Marketing Website",
    description: "Product catalog, about page, wholesale application",
    filePaths: [
      "app/page.tsx — marketing landing page",
      "app/(marketing)/ — marketing routes (if present)",
      "components/industry-page-template.tsx — industry-specific landing pages",
      "app/features/ — feature pages for SEO",
    ],
    configKey: null,
    envVars: [],
    enableInstructions:
      "Customize app/page.tsx hero copy, value propositions, and CTA text. Update meta tags in app/layout.tsx. Replace placeholder images with client branding.",
    disableInstructions:
      "Simplify app/page.tsx to a login redirect or minimal landing page if client does not want a public marketing site.",
  },
  "sms-ordering": {
    label: "SMS / iMessage Ordering",
    description: "Clients text orders, AI parses them into the system",
    filePaths: [
      "lib/sms-ordering.ts — SMS order processing logic",
      "lib/integrations/blooio.ts — Bloo.io SMS gateway integration",
      "lib/ai/order-parser.ts — AI-powered natural language order parsing",
      "app/api/webhooks/blooio/ — Bloo.io webhook handler for incoming SMS",
    ],
    configKey: "smsOrdering.enabled",
    envVars: [
      "BLOOIO_API_KEY",
      "BLOOIO_PHONE_NUMBER",
      "BLOOIO_WEBHOOK_SECRET",
    ],
    enableInstructions:
      "Requires Bloo.io account. Set BLOOIO_API_KEY, BLOOIO_PHONE_NUMBER, and BLOOIO_WEBHOOK_SECRET. Configure Bloo.io webhook to point at /api/webhooks/blooio. Verify smsOrdering.enabled is true in portal.config.ts.",
    disableInstructions:
      "Set smsOrdering.enabled to false in portal.config.ts. Remove Bloo.io env vars. The webhook route can remain but will be inactive.",
  },
  "loyalty-program": {
    label: "Loyalty Program",
    description: "Points per dollar, tier upgrades, rewards",
    filePaths: [
      "lib/loyalty.ts — loyalty point calculations and tier logic",
      "lib/tier-upgrade.ts — client tier upgrade logic",
      "portal.config.ts — loyalty.enabled, loyalty.pointsPerDollar, loyalty.redemptionRate",
    ],
    configKey: "loyalty.enabled",
    envVars: [],
    enableInstructions:
      "Set loyalty.enabled to true in portal.config.ts. Configure pointsPerDollar and redemptionRate. Verify lib/loyalty.ts point calculations match the config values. Loyalty data displays on the client dashboard.",
    disableInstructions:
      "Set loyalty.enabled to false in portal.config.ts. Hide loyalty widgets from client dashboard. The loyalty library can remain but will not be active.",
  },
  "referral-program": {
    label: "Referral Program",
    description: "Auto-generated codes, credit on conversion",
    filePaths: [
      "app/client-portal/referrals/ — client referral page",
      "lib/credit.ts — referral credit logic",
      "portal.config.ts — referrals.enabled, referrals.creditAmount",
    ],
    configKey: "referrals.enabled",
    envVars: [],
    enableInstructions:
      "Set referrals.enabled to true in portal.config.ts. Configure creditAmount. Verify the referral page at app/client-portal/referrals/ renders correctly.",
    disableInstructions:
      "Set referrals.enabled to false in portal.config.ts. Remove the referral nav link from app/client-portal/layout.tsx. The referral page can remain but hide it from navigation.",
  },
  "supplier-portal": {
    label: "Supplier Portal",
    description: "Supplier product submissions and management",
    filePaths: [
      "app/admin/suppliers/ — admin supplier management",
      "portal.config.ts — marketing.supplierPortalEnabled",
    ],
    configKey: "marketing.supplierPortalEnabled",
    envVars: [],
    enableInstructions:
      "Set marketing.supplierPortalEnabled to true in portal.config.ts. Configure supplier-facing pages and invite flow.",
    disableInstructions:
      "Set marketing.supplierPortalEnabled to false in portal.config.ts. Hide supplier nav items from admin sidebar.",
  },
  "ai-order-parsing": {
    label: "AI Order Parsing",
    description: "Natural language to structured order via Gemini",
    filePaths: [
      "lib/ai/order-parser.ts — AI order parsing logic",
      "lib/ai/ai-tools.ts — AI tool definitions",
      "lib/ai/tool-cache.ts — tool result caching",
      "lib/ai/platform-knowledge.ts — platform context for AI",
      "app/admin/chat/ — admin AI chat interface",
    ],
    configKey: null,
    envVars: ["ANTHROPIC_API_KEY", "GEMINI_API_KEY"],
    enableInstructions:
      "Requires ANTHROPIC_API_KEY and/or GEMINI_API_KEY. Both are auto-provisioned by the build pipeline. Verify the AI chat interface at app/admin/chat/ works correctly.",
    disableInstructions:
      "Remove AI-related env vars. Hide the chat nav item from admin sidebar. Order parsing will fall back to manual entry.",
  },
  "shipment-tracking": {
    label: "Shipment Tracking",
    description: "Real-time tracking with cold chain monitoring",
    filePaths: [
      "app/admin/shipments/ — admin shipment management",
      "app/client-portal/fulfillment/ — client fulfillment tracking",
      "app/client-portal/orders/[orderNumber]/tracking/ — per-order tracking page",
    ],
    configKey: null,
    envVars: [],
    enableInstructions:
      "Verify shipment tracking pages render correctly. If cold chain monitoring is enabled, ensure temperature logging fields are visible.",
    disableInstructions:
      "Hide shipment-related nav items from both admin and client portal. Remove tracking links from order detail pages.",
  },
  "standing-orders": {
    label: "Standing / Recurring Orders",
    description: "Weekly, biweekly, or monthly auto-orders",
    filePaths: [
      "app/client-portal/standing-orders/ — client standing order management",
      "lib/smart-reorder.ts — reorder suggestion logic",
    ],
    configKey: null,
    envVars: [],
    enableInstructions:
      "Verify the standing orders page at app/client-portal/standing-orders/ renders. Configure cron job for recurring order processing.",
    disableInstructions:
      "Remove standing-orders nav link from app/client-portal/layout.tsx. The page can remain but hide from navigation.",
  },
  "product-drops": {
    label: "Product Drops",
    description: "Limited-time releases with alert signups",
    filePaths: [
      "app/admin/drops/ — admin drop management",
      "app/admin/subscribers/ — drop subscriber management",
      "portal.config.ts — marketing.dropsEnabled",
    ],
    configKey: "marketing.dropsEnabled",
    envVars: [],
    enableInstructions:
      "Set marketing.dropsEnabled to true in portal.config.ts. Verify the drops management page at app/admin/drops/ renders. Configure subscriber notification emails in lib/email/.",
    disableInstructions:
      "Set marketing.dropsEnabled to false in portal.config.ts. Hide drops and subscriber nav items from admin sidebar.",
  },
  "smart-reorder": {
    label: "Smart Reorder Suggestions",
    description: "AI detects overdue clients and suggests products",
    filePaths: [
      "lib/smart-reorder.ts — reorder suggestion logic",
      "lib/client-health.ts — client health scoring",
    ],
    configKey: null,
    envVars: ["ANTHROPIC_API_KEY"],
    enableInstructions:
      "Requires AI API keys (auto-provisioned). Verify reorder suggestions appear on the admin dashboard and client detail pages.",
    disableInstructions:
      "Remove smart reorder widget from admin dashboard. The library can remain inactive.",
  },
  "blog-journal": {
    label: "Blog / Journal",
    description: "Content marketing for SEO and engagement",
    filePaths: [
      "lib/journal/articles.ts — journal article management",
      "lib/blog/posts.ts — blog post utilities",
      "portal.config.ts — marketing.journalEnabled",
    ],
    configKey: "marketing.journalEnabled",
    envVars: [],
    enableInstructions:
      "Set marketing.journalEnabled to true in portal.config.ts. Create initial blog/journal content. Configure SEO metadata for journal pages.",
    disableInstructions:
      "Set marketing.journalEnabled to false in portal.config.ts. Hide journal/blog nav items. The library files can remain.",
  },
  "sales-rep-tools": {
    label: "Sales Rep Tools",
    description: "Rep assignment, cart building, task management",
    filePaths: [
      "app/admin/reps/ — sales rep management",
      "app/admin/reps/build-cart/ — rep cart building tool",
      "app/admin/reps/[id]/ — individual rep detail page",
      "app/admin/tasks/ — task management",
      "app/admin/leads/ — lead management",
    ],
    configKey: null,
    envVars: [],
    enableInstructions:
      "Verify rep management pages render. Configure rep assignment logic for new clients.",
    disableInstructions:
      "Hide reps, tasks, and leads nav items from admin sidebar if not needed.",
  },
};

// All feature IDs in display order
const ALL_FEATURE_IDS = [
  "admin-dashboard",
  "stripe-billing",
  "marketing-site",
  "sms-ordering",
  "loyalty-program",
  "referral-program",
  "supplier-portal",
  "ai-order-parsing",
  "shipment-tracking",
  "standing-orders",
  "product-drops",
  "smart-reorder",
  "blog-journal",
  "sales-rep-tools",
];

// ── Helper: check if a feature is selected ──────────────────────────────────

function isFeatureSelected(
  selectedFeatures: string[],
  featureId: string
): boolean {
  const normalized = selectedFeatures.map((f) => f.toLowerCase());
  const spec = FEATURE_REGISTRY[featureId];
  if (!spec) return false;

  // Match on ID or label (intake form stores IDs like "loyalty-program")
  return (
    normalized.includes(featureId.toLowerCase()) ||
    normalized.some(
      (f) =>
        f.includes(featureId.replace(/-/g, " ")) ||
        f.includes(spec.label.toLowerCase())
    )
  );
}

// ── generateReadme ──────────────────────────────────────────────────────────

export async function generateReadme(input: ReadmeInput): Promise<string> {
  const {
    companyName,
    shortName,
    industry,
    website,
    location,
    contactEmail,
    primaryColor,
    brandSecondaryColor,
    logoUrl,
    selectedFeatures,
    productCategories,
    coldChain,
    paymentTerms,
    deliveryCoverage,
    additionalNotes,
    targetDomain,
    minimumOrderValue,
    researchData,
    scrapeData,
    generatedConfig,
  } = input;

  const extract = scrapeData?.website?.data?.extract;
  const hasSMS = selectedFeatures.some(
    (f) => f.toLowerCase().includes("sms") || f.toLowerCase().includes("bloo")
  );

  // Build enabled/disabled feature sections
  const enabledFeatures: string[] = [];
  const disabledFeatures: string[] = [];

  for (const featureId of ALL_FEATURE_IDS) {
    const spec = FEATURE_REGISTRY[featureId];
    if (!spec) continue;

    const selected = isFeatureSelected(selectedFeatures, featureId);

    if (selected) {
      const paths = spec.filePaths.map((p) => `  - \`${p}\``).join("\n");
      const envSection =
        spec.envVars.length > 0
          ? `\n- **Required env vars**: ${spec.envVars.map((v) => `\`${v}\``).join(", ")}`
          : "";
      const configSection = spec.configKey
        ? `\n- **Config key**: \`${spec.configKey}\``
        : "";

      enabledFeatures.push(
        `### ${spec.label} [ENABLED]\n${spec.description}\n\n` +
          `**Instructions**: ${spec.enableInstructions}${configSection}${envSection}\n\n` +
          `**Relevant files**:\n${paths}`
      );
    } else {
      const paths = spec.filePaths.map((p) => `  - \`${p}\``).join("\n");

      disabledFeatures.push(
        `### ${spec.label} [NOT SELECTED]\n\n` +
          `**Action**: ${spec.disableInstructions}\n\n` +
          `**Files to review**:\n${paths}`
      );
    }
  }

  // Build env var checklist
  const envVarRows: string[] = [];

  // Auto-provisioned vars
  envVarRows.push(
    "| DATABASE_URL | Auto-provisioned | None |",
    "| DATABASE_URL_UNPOOLED | Auto-provisioned | None |",
    "| UPSTASH_REDIS_REST_URL | Auto-provisioned | None |",
    "| UPSTASH_REDIS_REST_TOKEN | Auto-provisioned | None |",
    "| CRON_SECRET | Auto-generated | None |",
    "| NEXT_PUBLIC_APP_URL | Auto-set | None |",
    "| ANTHROPIC_API_KEY | Shared key | None |",
    "| GEMINI_API_KEY | Shared key | None |",
    "| RESEND_API_KEY | Auto-provisioned (dedicated) | None |",
    "| RESEND_FROM_EMAIL | Auto-set | Update if client has custom domain |",
    "| SENTRY_DSN | Auto-provisioned | None |",
    "| NEXT_PUBLIC_SENTRY_DSN | Auto-provisioned | None |"
  );

  // Pending / Connect vars
  envVarRows.push(
    "| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | Pending | Create Clerk app for client |",
    "| CLERK_SECRET_KEY | Pending | Create Clerk app for client |",
    "| CLERK_WEBHOOK_SECRET | Pending | Configure Clerk webhook |",
    "| STRIPE_CONNECT_ACCOUNT_ID | Auto-provisioned | Client completes Stripe onboarding via emailed link |",
    "| PLATFORM_FEE_PERCENT | Auto-set (2.5%) | Adjust if client has custom fee agreement |"
  );

  if (hasSMS) {
    envVarRows.push(
      "| BLOOIO_API_KEY | Pending | Set up Bloo.io account |",
      "| BLOOIO_PHONE_NUMBER | Pending | Provision SMS number via Bloo.io |",
      "| BLOOIO_WEBHOOK_SECRET | Pending | Configure Bloo.io webhook |"
    );
  }

  // Build the CLAUDE.md content
  const sections: string[] = [];

  // ── Header + Execution Directive ──────────────────────────────────────────
  sections.push(`# ${companyName} — Distribution Portal Build Guide`);
  sections.push(
    [
      `> Auto-generated by Wholesail build pipeline.`,
      ``,
      `## EXECUTION INSTRUCTIONS`,
      ``,
      `You are Claude Code, customizing this portal template for **${companyName}** (${industry}).`,
      `This repo was forked from the Wholesail master template and already contains the full codebase.`,
      `Your job is to apply the client-specific customizations described below.`,
      ``,
      `**Execute all 4 build phases in order. Do not ask for confirmation between steps.**`,
      `**Do not create new files unless explicitly needed — edit existing files.**`,
      `**Do not add comments explaining what you changed — just make the changes.**`,
      `**After each phase, run \`npm run build\` to verify no TypeScript errors.**`,
      ``,
      `Read \`portal.config.ts\` first — it contains all client-specific values.`,
      `Read \`docs/research.md\` for industry context.`,
      `Read \`docs/marketing-copy.md\` for pre-written copy to insert into pages.`,
    ].join("\n")
  );

  // ── Company Profile ───────────────────────────────────────────────────────
  const profileLines = [
    `- **Company Name**: ${companyName}`,
    `- **Short Name**: ${shortName}`,
    `- **Industry**: ${industry}`,
    `- **Website**: ${website ?? "Not provided"}`,
    `- **Location**: ${location ?? "Not provided"}`,
    `- **Contact Email**: ${contactEmail}`,
    `- **Target Domain**: ${targetDomain ?? "Not configured"}`,
    `- **Delivery Coverage**: ${deliveryCoverage ?? "Not specified"}`,
    `- **Minimum Order Value**: ${minimumOrderValue ?? "No minimum"}`,
    `- **Payment Terms**: ${paymentTerms.length > 0 ? paymentTerms.join(", ") : "Not specified"}`,
  ];

  if (additionalNotes) {
    profileLines.push(`- **Additional Notes**: ${additionalNotes}`);
  }

  if (extract?.companyDescription) {
    profileLines.push(
      `- **Company Description** (scraped): ${extract.companyDescription}`
    );
  }

  sections.push(`## Company Profile\n\n${profileLines.join("\n")}`);

  // ── Research Brief (if available) ─────────────────────────────────────────
  if (researchData?.synthesizedBrief) {
    sections.push(
      `## Industry Research Brief\n\n${researchData.synthesizedBrief}`
    );
  }

  // ── Brand Customization ───────────────────────────────────────────────────
  const brandLines = [
    `- **Primary Color**: \`${primaryColor}\``,
    `- **Secondary Color**: \`${brandSecondaryColor ?? "Not provided"}\``,
    `- **Logo URL**: ${logoUrl ?? "Not provided"}`,
  ];

  if (extract?.brandColors && extract.brandColors.length > 0) {
    brandLines.push(
      `- **Scraped Brand Colors**: ${extract.brandColors.join(", ")}`
    );
  }

  if (extract?.logoUrl) {
    brandLines.push(`- **Scraped Logo URL**: ${extract.logoUrl}`);
  }

  const brandInstructions = [
    "",
    "### Branding Instructions",
    "",
    "1. Update `tailwind.config.ts` — set the primary color to `" +
      primaryColor +
      "`" +
      (brandSecondaryColor
        ? " and secondary/accent color to `" + brandSecondaryColor + "`"
        : ""),
    "2. Replace the logo file in `public/` with the client's logo" +
      (logoUrl ? " (source: " + logoUrl + ")" : ""),
    "3. Update metadata in `app/layout.tsx` — site title, description, OG image",
    "4. Update `portal.config.ts` branding section with the correct hex values",
    "5. Verify contrast ratios meet WCAG AA standards (primary foreground is auto-calculated)",
  ];

  sections.push(
    `## Brand Customization\n\n${brandLines.join("\n")}${brandInstructions.join("\n")}`
  );

  // ── Enabled Features ─────────────────────────────────────────────────────
  sections.push(
    `## Enabled Features\n\nThe following features were selected during intake and should be active in this build.\n\n${enabledFeatures.join("\n\n---\n\n")}`
  );

  // ── Disabled Features ─────────────────────────────────────────────────────
  if (disabledFeatures.length > 0) {
    sections.push(
      `## Disabled Features (Remove or Hide)\n\nThese features were NOT selected. Hide them from navigation or remove the UI elements.\n\n${disabledFeatures.join("\n\n---\n\n")}`
    );
  }

  // ── Catalog Setup ─────────────────────────────────────────────────────────
  const catalogLines = [
    `- **Product Categories**: ${productCategories ?? "Not specified — configure after catalog import"}`,
    `- **Cold Chain Required**: ${coldChain ?? "Check industry defaults"}`,
    `- **Minimum Order Value**: ${minimumOrderValue ?? "No minimum"}`,
  ];

  if (
    researchData?.catalogCategories &&
    researchData.catalogCategories.length > 0
  ) {
    catalogLines.push(
      `- **Suggested Categories** (from research): ${researchData.catalogCategories.join(", ")}`
    );
  }

  if (extract?.productTypes && extract.productTypes.length > 0) {
    catalogLines.push(
      `- **Product Types** (scraped): ${extract.productTypes.join(", ")}`
    );
  }

  const catalogInstructions = [
    "",
    "### Catalog Instructions",
    "",
    "1. Seed the database with initial product categories via `prisma/seed.ts`",
    "2. Import product data from client (CSV, spreadsheet, or manual entry)",
    "3. Configure pricing tiers in `portal.config.ts` and admin pricing page",
    "4. Set up volume discounts if applicable",
    "5. Verify catalog page renders at `app/client-portal/catalog/`",
  ];

  sections.push(
    `## Catalog Setup\n\n${catalogLines.join("\n")}${catalogInstructions.join("\n")}`
  );

  // ── Marketing Copy ────────────────────────────────────────────────────────
  if (researchData) {
    const marketingLines: string[] = [];

    if (researchData.marketingAngles && researchData.marketingAngles.length > 0) {
      marketingLines.push("### Marketing Angles");
      researchData.marketingAngles.forEach((angle) => {
        marketingLines.push(`- ${angle}`);
      });
    }

    if (researchData.painPoints) {
      marketingLines.push(
        "",
        "### Industry Pain Points (address in copy)",
        "",
        researchData.painPoints
      );
    }

    if (researchData.competitorSoftware) {
      marketingLines.push(
        "",
        "### Competitor Software Landscape",
        "",
        researchData.competitorSoftware
      );
    }

    if (
      researchData.industryTerminology &&
      Object.keys(researchData.industryTerminology).length > 0
    ) {
      marketingLines.push("", "### Industry Terminology", "");
      marketingLines.push(
        "Use these terms throughout the portal to match client expectations:",
        ""
      );
      for (const [term, definition] of Object.entries(
        researchData.industryTerminology
      )) {
        marketingLines.push(`- **${term}**: ${definition}`);
      }
    }

    if (marketingLines.length > 0) {
      sections.push(`## Marketing Copy Guidance\n\n${marketingLines.join("\n")}`);
    }
  }

  // ── SEO Keywords ──────────────────────────────────────────────────────────
  if (researchData?.seoKeywords && researchData.seoKeywords.length > 0) {
    sections.push(
      `## SEO Keywords\n\nTarget these keywords in meta tags, page titles, and content:\n\n${researchData.seoKeywords.map((k) => `- ${k}`).join("\n")}`
    );
  }

  // ── Industry Context ──────────────────────────────────────────────────────
  if (researchData?.industryLandscape || researchData?.companyIntelligence) {
    const contextParts: string[] = [];
    if (researchData.industryLandscape) {
      contextParts.push(
        "### Industry Landscape\n\n" + researchData.industryLandscape
      );
    }
    if (researchData.companyIntelligence) {
      contextParts.push(
        "### Company Intelligence\n\n" + researchData.companyIntelligence
      );
    }
    sections.push(`## Industry Context\n\n${contextParts.join("\n\n")}`);
  }

  // ── Generated Config ─────────────────────────────────────────────────────
  sections.push(
    `## Generated portal.config.ts\n\nThe following config was auto-generated and committed to the repo. Review and adjust as needed.\n\n\`\`\`typescript\n${generatedConfig}\n\`\`\``
  );

  // ── Environment Variables Checklist ───────────────────────────────────────
  sections.push(
    `## Environment Variables Checklist\n\n| Variable | Status | Action |\n|----------|--------|--------|\n${envVarRows.join("\n")}`
  );

  // ── Build Phases ──────────────────────────────────────────────────────────
  const phase1Tasks = [
    `1. Open \`tailwind.config.ts\`. Find the \`colors\` section. Set \`primary\` to \`${primaryColor}\`${brandSecondaryColor ? ` and \`secondary\` to \`${brandSecondaryColor}\`` : ""}.`,
    `2. Open \`app/layout.tsx\`. Update the metadata: \`title\` to "${companyName}", \`description\` to a one-line description of ${companyName}'s distribution portal using copy from \`docs/marketing-copy.md\`.`,
    `3. Open \`portal.config.ts\` (already committed). Review all values — they were auto-generated. Fix any that look wrong.`,
    `4. Open \`components/portal-nav.tsx\`. Replace the brand text "Wholesail" with "${companyName}" (or use env var NEXT_PUBLIC_BRAND_NAME which is already set).`,
    logoUrl
      ? `5. Download the logo from ${logoUrl} and save to \`public/logo.png\`. Update any \`<img>\` refs in \`app/layout.tsx\` and \`components/portal-nav.tsx\`.`
      : `5. Client logo not provided yet — leave placeholder. Update when received.`,
    `6. Open \`app/(marketing)/page.tsx\` (homepage). Replace hero headline, subheadline, and value props with content from \`docs/marketing-copy.md\`.`,
    `7. Open \`app/(marketing)/about/page.tsx\`. Replace about copy with content from \`docs/marketing-copy.md\`.`,
    `8. Run \`npm run build\` to verify no TypeScript errors.`,
  ];

  const phase2Tasks = [
    `1. Open \`prisma/seed.ts\`. Update the product categories array to match ${companyName}'s inventory: ${productCategories ?? (researchData?.catalogCategories ? researchData.catalogCategories.join(", ") : "use the categories from docs/research.md")}.`,
    `2. ${coldChain === "yes" ? "Cold chain is REQUIRED — verify `coldChain: true` in portal.config.ts and that the cold chain badge displays on product cards." : "Cold chain is NOT required — verify `coldChain: false` in portal.config.ts."}`,
    `3. Review pricing tiers in \`portal.config.ts\` — \`repeatThreshold\` and \`vipThreshold\` should match the industry defaults for ${industry}.`,
    `4. Run \`npm run build\` to verify no TypeScript errors.`,
  ];

  const phase3Tasks: string[] = [
    `1. Run \`npx prisma db push\` to initialize the database schema.`,
    `2. Run \`npx prisma db seed\` to seed initial categories and data.`,
    `3. Verify the client portal renders at \`/client-portal\` — catalog, cart, checkout flow.`,
    `4. Verify the admin dashboard renders at \`/admin\` — orders, clients, products, analytics.`,
    `5. Verify email templates reference "${companyName}" not "Wholesail" — check \`lib/email/\`.`,
  ];

  if (hasSMS) {
    phase3Tasks.push(
      `6. Verify SMS ordering routes are active — \`app/api/webhooks/blooio/\` and \`lib/sms-ordering.ts\`.`
    );
  }

  if (isFeatureSelected(selectedFeatures, "loyalty-program")) {
    phase3Tasks.push(
      `${phase3Tasks.length + 1}. Verify loyalty config in \`portal.config.ts\` — pointsPerDollar, redemptionRate.`
    );
  }

  if (isFeatureSelected(selectedFeatures, "referral-program")) {
    phase3Tasks.push(
      `${phase3Tasks.length + 1}. Verify referral config in \`portal.config.ts\` — creditAmount.`
    );
  }

  if (isFeatureSelected(selectedFeatures, "standing-orders")) {
    phase3Tasks.push(
      `${phase3Tasks.length + 1}. Verify standing orders cron is configured in \`vercel.json\`.`
    );
  }

  phase3Tasks.push(
    `${phase3Tasks.length + 1}. Run \`npm run build\` — must compile clean with zero errors.`
  );

  const phase4Tasks = [
    `1. MANUAL: Create a Clerk application at clerk.com for ${companyName}. Configure the webhook endpoint pointing to \`/api/webhooks/clerk\`. Set the 3 env vars in Vercel.`,
    `2. MANUAL: Client completes Stripe Connect onboarding via the link emailed to ${contactEmail}.`,
    targetDomain
      ? `3. MANUAL: Connect custom domain \`${targetDomain}\` in the Vercel project settings.`
      : `3. MANUAL: Connect custom domain when client provides one.`,
    `4. MANUAL: Final QA pass on production URL.`,
    `5. MANUAL: Send client onboarding email with login instructions.`,
  ];

  sections.push(
    [
      "## Build Phases",
      "",
      "### Phase 1: Brand & Config (Day 1)",
      ...phase1Tasks,
      "",
      "### Phase 2: Catalog & Products (Day 2)",
      ...phase2Tasks,
      "",
      "### Phase 3: Testing & QA (Day 3)",
      ...phase3Tasks,
      "",
      "### Phase 4: Launch Prep (Day 4)",
      ...phase4Tasks,
    ].join("\n")
  );

  // ── Key File Reference ────────────────────────────────────────────────────
  sections.push(
    [
      "## Key File Reference",
      "",
      "| File / Directory | Purpose |",
      "|-----------------|---------|",
      "| `portal.config.ts` | Central configuration — company, branding, features, pricing |",
      "| `app/layout.tsx` | Root layout — metadata, fonts, global providers |",
      "| `tailwind.config.ts` | Tailwind CSS config — brand colors, theme |",
      "| `prisma/schema.prisma` | Database schema — all models |",
      "| `prisma/seed.ts` | Database seeding — initial categories, products |",
      "| `app/admin/` | Admin dashboard — all management pages |",
      "| `app/admin/layout.tsx` | Admin layout — sidebar navigation |",
      "| `app/admin/nav-config.ts` | Admin sidebar navigation configuration |",
      "| `app/client-portal/` | Client-facing portal — ordering, invoices, etc. |",
      "| `app/client-portal/layout.tsx` | Client portal layout — navigation |",
      "| `app/client-portal/catalog/` | Product catalog and cart |",
      "| `app/client-portal/orders/` | Order history and tracking |",
      "| `app/api/` | API routes — all backend endpoints |",
      "| `app/api/webhooks/` | Webhook handlers — Stripe, Clerk, Bloo.io |",
      "| `lib/` | Shared utilities — payments, AI, email, integrations |",
      "| `lib/email/` | Email templates and sending logic (Resend) |",
      "| `lib/stripe/` | Stripe payment integration |",
      "| `lib/ai/` | AI features — order parsing, chat, tools |",
      "| `components/` | Shared UI components (shadcn/ui based) |",
      "| `public/` | Static assets — logo, images, fonts |",
    ].join("\n")
  );

  return sections.join("\n\n---\n\n");
}

// ── generateMarketingCopy ───────────────────────────────────────────────────

export async function generateMarketingCopy(
  input: ReadmeInput
): Promise<string> {
  const {
    companyName,
    industry,
    website,
    location,
    selectedFeatures,
    productCategories,
    researchData,
    scrapeData,
  } = input;

  // If no API key, return placeholder
  if (!process.env.ANTHROPIC_API_KEY) {
    return [
      `# ${companyName} -- Marketing Copy`,
      "",
      "## Homepage Hero",
      "",
      `### Headline`,
      `TODO: Write compelling headline for ${companyName}`,
      "",
      `### Subheadline`,
      `TODO: Write subheadline highlighting ${industry} distribution expertise`,
      "",
      "## Value Propositions",
      "",
      "### 1. TODO: First Value Prop",
      "TODO: Description",
      "",
      "### 2. TODO: Second Value Prop",
      "TODO: Description",
      "",
      "### 3. TODO: Third Value Prop",
      "TODO: Description",
      "",
      "## About Section",
      "",
      `TODO: Write about section for ${companyName}${location ? " based in " + location : ""}`,
      "",
      "## CTA Copy",
      "",
      "- Primary CTA: TODO",
      "- Secondary CTA: TODO",
      "",
      "## Meta Description",
      "",
      `TODO: Write meta description for ${companyName} (150-160 characters)`,
      "",
      "## Industry Terminology",
      "",
      "TODO: List industry-specific terms to use throughout the portal",
    ].join("\n");
  }

  // Build context for the AI
  const extract = scrapeData?.website?.data?.extract;
  const contextParts: string[] = [
    `Company: ${companyName}`,
    `Industry: ${industry}`,
  ];

  if (website) contextParts.push(`Website: ${website}`);
  if (location) contextParts.push(`Location: ${location}`);
  if (productCategories)
    contextParts.push(`Product Categories: ${productCategories}`);
  if (selectedFeatures.length > 0)
    contextParts.push(`Platform Features: ${selectedFeatures.join(", ")}`);

  if (extract?.companyDescription)
    contextParts.push(
      `Company Description (from website): ${extract.companyDescription}`
    );
  if (extract?.productTypes)
    contextParts.push(
      `Product Types (from website): ${extract.productTypes.join(", ")}`
    );

  if (researchData?.synthesizedBrief)
    contextParts.push(`Research Brief: ${researchData.synthesizedBrief}`);
  if (researchData?.painPoints)
    contextParts.push(`Industry Pain Points: ${researchData.painPoints}`);
  if (researchData?.marketingAngles)
    contextParts.push(
      `Marketing Angles: ${researchData.marketingAngles.join("; ")}`
    );
  if (researchData?.seoKeywords)
    contextParts.push(
      `SEO Keywords: ${researchData.seoKeywords.join(", ")}`
    );
  if (
    researchData?.industryTerminology &&
    Object.keys(researchData.industryTerminology).length > 0
  )
    contextParts.push(
      `Industry Terminology: ${JSON.stringify(researchData.industryTerminology)}`
    );

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    temperature: 0.7,
    system: `You are an expert B2B marketing copywriter specializing in wholesale distribution and food service industries. Write professional, conversion-focused copy. No emojis. Use industry-specific terminology when available. Output clean markdown.`,
    messages: [
      {
        role: "user",
        content: `Generate marketing copy for a B2B wholesale distribution portal. Return a markdown document with the following sections:

1. **Homepage Hero** — a headline (8-12 words max) and subheadline (1-2 sentences)
2. **Value Propositions** — 3-5 blocks, each with a title and 2-3 sentence description
3. **About Section** — 2-3 paragraphs of company/portal description
4. **CTA Copy** — primary CTA text and secondary CTA text
5. **Meta Description** — exactly 150-160 characters for SEO
6. **Industry Terminology** — list of 8-12 industry-specific terms to use throughout the portal instead of generic terms (e.g., "case" instead of "unit", "FOB" instead of "shipping point")

COMPANY CONTEXT:
${contextParts.join("\n")}

Write copy that positions ${companyName} as a modern, technology-forward distributor. Emphasize ease of ordering, reliability, and the specific features their portal offers. Use the industry terminology and pain points from the research to make the copy resonate with their target B2B buyers.`,
      },
    ],
  });

  const content =
    message.content[0].type === "text"
      ? message.content[0].text
      : `# ${companyName} -- Marketing Copy\n\nFailed to generate copy. Please write manually.`;

  return `# ${companyName} -- Marketing Copy\n\n${content}`;
}
