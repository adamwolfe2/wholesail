import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getIntakeSubmissionById } from "@/lib/db/intake";
import Anthropic from "@anthropic-ai/sdk";
import { INDUSTRY_DEFAULTS, CONFIG_SKELETON, primaryForeground } from "@/lib/build/config-template";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI config generation unavailable — ANTHROPIC_API_KEY not set" },
      { status: 503 }
    );
  }

  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const force = req.nextUrl.searchParams.get("force") === "true";

  try {
    const intake = await getIntakeSubmissionById(id);
    if (!intake) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Return cached config if available (unless ?force=true)
    if (!force && intake.project?.generatedConfig) {
      return NextResponse.json({
        config: intake.project.generatedConfig,
        cached: true,
        configGeneratedAt: intake.project.configGeneratedAt,
      });
    }

    const defaults =
      INDUSTRY_DEFAULTS[intake.industry] ??
      INDUSTRY_DEFAULTS["General Distribution"];

    // Parse payment terms to net day numbers
    const netTermOptions = (intake.paymentTerms ?? [])
      .map((t: string) => {
        const m = t.match(/\d+/);
        return m ? parseInt(m[0], 10) : null;
      })
      .filter((n): n is number => n !== null);
    if (!netTermOptions.includes(0)) netTermOptions.unshift(0);

    // Derive shortName
    const shortName =
      intake.shortName ||
      intake.companyName.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();

    // Strip protocol from domain
    const domain = (intake.website ?? "")
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");

    // Derive foreground from primary color
    const primary = intake.primaryColor ?? "#0A0A0A";
    const foreground = primaryForeground(primary);

    // Feature flags
    const features = intake.selectedFeatures ?? [];
    const hasFeature = (f: string) =>
      features.some((s: string) => s.toLowerCase().includes(f.toLowerCase()));

    const structuredData = {
      companyName: intake.companyName,
      shortName,
      domain,
      contactEmail: intake.contactEmail,
      location: intake.location,
      industry: intake.industry,
      productCategories: intake.productCategories,
      skuCount: intake.skuCount,
      coldChain: intake.coldChain === "yes" || defaults.coldChain,
      avgOrderValue: intake.avgOrderValue,
      annualRevenue: intake.annualRevenue,
      paymentTerms: intake.paymentTerms,
      currentOrdering: intake.currentOrdering,
      deliveryCoverage: intake.deliveryCoverage,
      selectedFeatures: features,
      primaryColor: primary,
      primaryForeground: foreground,
      additionalNotes: intake.additionalNotes,
      industryDefaults: defaults,
      derivedValues: {
        netTermOptions,
        loyaltyEnabled: hasFeature("loyalty"),
        referralsEnabled: hasFeature("referral"),
        smsOrderingEnabled: hasFeature("sms") || hasFeature("text"),
        dropsEnabled: hasFeature("drop") || hasFeature("product drop"),
        journalEnabled: hasFeature("journal") || hasFeature("blog"),
        supplierPortalEnabled: hasFeature("supplier"),
        blooioEnabled: hasFeature("bloo") || hasFeature("sms") || hasFeature("routing"),
      },
    };

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      temperature: 0,
      system:
        "You are a portal configuration generator. Return ONLY valid TypeScript — a complete portal.config.ts file. No explanation, no markdown fences, no code block delimiters. Just the raw TypeScript content starting with the import statement.",
      messages: [
        {
          role: "user",
          content: `Generate a complete portal.config.ts file from this intake submission data.

INTAKE DATA:
${JSON.stringify(structuredData, null, 2)}

FIELD MAPPING RULES:
- company.name = companyName
- company.shortName = shortName (derived field, already computed)
- company.domain = domain (already stripped of https://)
- company.contactEmail = contactEmail
- company.ordersEmail = "orders@" + domain (if domain exists, else same as contactEmail)
- company.location = location
- branding.primary = primaryColor
- branding.primaryForeground = primaryForeground (already computed based on luminance)
- catalog.categories = parse productCategories (comma-separated string) into string array
- catalog.coldChainDefault = coldChain boolean
- pricing.taxRate = industryDefaults.taxRate
- pricing.netTermOptions = derivedValues.netTermOptions
- pricing.volumeDiscounts = derive from avgOrderValue (e.g. if "$500-$2000" add tier at 500, if "$2000+" add tier at 2000)
- tiers.repeatThreshold = industryDefaults.repeatThreshold
- tiers.vipThreshold = industryDefaults.vipThreshold
- loyalty.enabled = derivedValues.loyaltyEnabled
- referrals.enabled = derivedValues.referralsEnabled
- smsOrdering.enabled = derivedValues.smsOrderingEnabled
- marketing.dropsEnabled = derivedValues.dropsEnabled
- marketing.journalEnabled = derivedValues.journalEnabled
- marketing.supplierPortalEnabled = derivedValues.supplierPortalEnabled
- integrations.blooio = derivedValues.blooioEnabled

CONFIG SKELETON (fill in all values):
${CONFIG_SKELETON}

Return ONLY the complete TypeScript file content. Start with the import statement.`,
        },
      ],
    });

    const config =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Persist to project if one exists (prevents re-generation on next call)
    if (intake.project) {
      const { prisma } = await import("@/lib/db");
      await prisma.project.update({
        where: { id: intake.project.id },
        data: { generatedConfig: config, configGeneratedAt: new Date() },
      });
    }

    return NextResponse.json({ config, cached: false });
  } catch (err) {
    console.error("[POST /api/admin/intakes/[id]/generate-config]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
