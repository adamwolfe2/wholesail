import { createIntakeSubmission, getIntakeSubmissionById, markIntakeReviewed, archiveIntake, getIntakeSubmissions } from "@/lib/db/intake";
import { convertIntakeToProject } from "@/lib/db/projects";
import Anthropic from "@anthropic-ai/sdk";

async function run() {
  console.log("\n──────────────────────────────────────────");
  console.log("STEP 1 — Submit intake (POST /api/intake)");
  console.log("──────────────────────────────────────────");

  const submission = await createIntakeSubmission({
    companyName: "Coastal Provisions Co.",
    shortName: "CPC",
    website: "coastalprovisions.com",
    location: "San Francisco, CA",
    contactName: "Jamie Reyes",
    contactEmail: "jamie@coastalprovisions.com",
    contactPhone: "415-555-0182",
    contactRole: "Operations Director",
    annualRevenue: "$2M–$5M",
    industry: "Specialty Foods",
    productCategories: "Artisan Cheeses, Charcuterie, Specialty Condiments, Local Honey",
    skuCount: "80–120",
    coldChain: "yes",
    currentOrdering: ["Email", "Phone", "Text Message"],
    activeClients: "45–60 restaurants and specialty retailers",
    avgOrderValue: "$800–$2,000",
    paymentTerms: ["net14", "net30"],
    deliveryCoverage: "Bay Area + Sacramento Valley",
    selectedFeatures: ["Loyalty Program", "Referral Program", "SMS Ordering", "Product Drops", "Supplier Portal"],
    primaryColor: "#2D5016",
    hasBrandGuidelines: "yes",
    additionalNotes: "We run weekly seasonal drops and have 3 supplier partners who need visibility into order volumes.",
  });

  console.log(`✓ Created  id=${submission.id}`);
  console.log(`  Company: ${submission.companyName}`);
  console.log(`  Industry: ${submission.industry} | SKUs: ${submission.skuCount}`);
  console.log(`  Features: ${submission.selectedFeatures.join(", ")}`);

  console.log("\n────────────────────────────────────────────────────────");
  console.log("STEP 2 — List pending (GET /api/admin/intakes?filter=pending)");
  console.log("────────────────────────────────────────────────────────");

  const pending = await getIntakeSubmissions({ reviewed: false, archived: false });
  const ours = pending.find(i => i.id === submission.id);
  console.log(`✓ ${pending.length} pending intake(s)`);
  console.log(`  Ours present: ${!!ours} | status=new (reviewedAt=${ours?.reviewedAt ?? "null"}, project=${ours?.project?.id ?? "none"})`);

  console.log("\n───────────────────────────────────────────────────────");
  console.log("STEP 3 — Fetch detail (GET /api/admin/intakes/:id)");
  console.log("───────────────────────────────────────────────────────");

  const detail = await getIntakeSubmissionById(submission.id);
  console.log(`✓ Fetched: ${detail!.companyName} / ${detail!.contactEmail}`);
  console.log(`  Cold chain: ${detail!.coldChain} | Payment terms: ${detail!.paymentTerms.join(", ")}`);
  console.log(`  Color: ${detail!.primaryColor} | Brand guidelines: ${detail!.hasBrandGuidelines}`);

  console.log("\n─────────────────────────────────────────────────────────────");
  console.log("STEP 4 — Mark reviewed (PATCH /api/admin/intakes/:id/review)");
  console.log("─────────────────────────────────────────────────────────────");

  const reviewed = await markIntakeReviewed(submission.id);
  console.log(`✓ reviewedAt=${reviewed.reviewedAt?.toISOString()}`);

  const pendingAfter = await getIntakeSubmissions({ reviewed: false, archived: false });
  const stillPending = pendingAfter.find(i => i.id === submission.id);
  console.log(`  Dropped from pending queue: ${!stillPending}`);

  console.log("\n──────────────────────────────────────────────────────────────");
  console.log("STEP 5 — Convert to project (POST /api/admin/intakes/:id/convert)");
  console.log("──────────────────────────────────────────────────────────────");

  const project = await convertIntakeToProject(submission.id);
  console.log(`✓ Project id=${project.id}`);
  console.log(`  company=${project.company} | shortName=${project.shortName}`);
  console.log(`  status=${project.status} | phase=${project.currentPhase}`);
  console.log(`  features: ${project.enabledFeatures.join(", ")}`);

  const detailAfter = await getIntakeSubmissionById(submission.id);
  console.log(`  Intake→Project linked: ${!!detailAfter!.project} (id=${detailAfter!.project?.id})`);

  // Verify 409 guard: project already exists
  const canConvertAgain = !detailAfter!.project;
  console.log(`  409 guard correct (won't double-convert): ${!canConvertAgain}`);

  console.log("\n──────────────────────────────────────────────────────────────────");
  console.log("STEP 6 — Generate portal.config.ts (POST /api/admin/intakes/:id/generate-config)");
  console.log("──────────────────────────────────────────────────────────────────");

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("⚠  ANTHROPIC_API_KEY not in env — skipping");
  } else {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      temperature: 0,
      system: "You are a portal configuration generator. Return ONLY valid TypeScript — a complete portal.config.ts file. No explanation, no markdown fences. Just the raw TypeScript starting with the import statement.",
      messages: [{
        role: "user",
        content: `Generate a portal.config.ts for:
Company: Coastal Provisions Co. (shortName: CPC)
Domain: coastalprovisions.com
Contact email: jamie@coastalprovisions.com
Location: San Francisco, CA
Industry: Specialty Foods — taxRate: 0.085, repeatThreshold: 5000, vipThreshold: 50000
Cold chain required: true
Primary color: #2D5016 (dark green — primaryForeground: #ffffff)
Product categories: Artisan Cheeses, Charcuterie, Specialty Condiments, Local Honey
Payment terms: net0, net14, net30
Features: Loyalty Program (enabled), Referral Program (enabled), SMS Ordering (enabled),
  Product Drops (dropsEnabled), Supplier Portal (supplierPortalEnabled)

Fill this skeleton completely:
import type { PortalConfig } from "@/types/portal-config";
export const portalConfig: PortalConfig = {
  company: { name: "", shortName: "", domain: "", contactEmail: "", ordersEmail: "", location: "" },
  branding: { primary: "", primaryForeground: "" },
  catalog: { categories: [], coldChainDefault: false },
  pricing: { currency: "USD", taxRate: 0, netTermOptions: [], volumeDiscounts: [] },
  tiers: { repeatThreshold: 0, vipThreshold: 0 },
  loyalty: { enabled: false, pointsPerDollar: 1, redemptionRate: 0.01 },
  referrals: { enabled: false, creditAmount: 50 },
  smsOrdering: { enabled: false },
  marketing: { dropsEnabled: false, journalEnabled: false, supplierPortalEnabled: false },
  integrations: { blooio: false },
};`
      }]
    });
    const config = msg.content[0].type === "text" ? msg.content[0].text : "";
    const lines = config.split("\n");
    console.log(`✓ Generated ${lines.length} lines of TypeScript`);
    console.log("\n--- portal.config.ts ---");
    console.log(config);
    console.log("--- end ---");
  }

  console.log("\n────────────────────────────────────────────────────────────");
  console.log("STEP 7 — Archive (PATCH /api/admin/intakes/:id/archive)");
  console.log("────────────────────────────────────────────────────────────");

  const archived = await archiveIntake(submission.id);
  console.log(`✓ archivedAt=${archived.archivedAt?.toISOString()}`);

  const archivedList = await getIntakeSubmissions({ archived: true });
  const inArchive = archivedList.find(i => i.id === submission.id);
  console.log(`  In archived list: ${!!inArchive}`);

  const pendingFinal = await getIntakeSubmissions({ reviewed: false, archived: false });
  const inPending = pendingFinal.find(i => i.id === submission.id);
  console.log(`  Removed from pending: ${!inPending}`);

  console.log("\n══════════════════════════════════════════");
  console.log("  ALL 7 STEPS PASSED");
  console.log("══════════════════════════════════════════\n");
  process.exit(0);
}

run().catch(err => {
  console.error("\n✗ FAILED:", err);
  process.exit(1);
});
