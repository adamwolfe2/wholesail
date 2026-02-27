import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getIntakeSubmissionById } from "@/lib/db/intake";
import Anthropic from "@anthropic-ai/sdk";

const INDUSTRY_DEFAULTS: Record<
  string,
  { coldChain: boolean; taxRate: number; repeatThreshold: number; vipThreshold: number }
> = {
  "Food & Beverage": { coldChain: true, taxRate: 0.085, repeatThreshold: 5000, vipThreshold: 50000 },
  "Seafood":         { coldChain: true, taxRate: 0.085, repeatThreshold: 3000, vipThreshold: 30000 },
  "Specialty Foods": { coldChain: true, taxRate: 0.085, repeatThreshold: 5000, vipThreshold: 50000 },
  "Produce":         { coldChain: true, taxRate: 0.000, repeatThreshold: 3000, vipThreshold: 25000 },
  "Beverage":        { coldChain: false, taxRate: 0.085, repeatThreshold: 5000, vipThreshold: 50000 },
  "General Distribution": { coldChain: false, taxRate: 0.085, repeatThreshold: 10000, vipThreshold: 75000 },
};

const CONFIG_SKELETON = `
import type { PortalConfig } from "@/types/portal-config";

export const portalConfig: PortalConfig = {
  company: {
    name: "COMPANY_NAME",
    shortName: "SHORT",
    domain: "example.com",
    contactEmail: "hello@example.com",
    ordersEmail: "orders@example.com",
    location: "City, ST",
    supportPhone: "",
  },
  branding: {
    primary: "#000000",
    primaryForeground: "#ffffff",
    logo: "",
  },
  catalog: {
    categories: [],
    coldChainDefault: false,
    defaultUnit: "each",
  },
  pricing: {
    currency: "USD",
    taxRate: 0.085,
    netTermOptions: [0, 30],
    volumeDiscounts: [],
  },
  tiers: {
    repeatThreshold: 5000,
    vipThreshold: 50000,
  },
  loyalty: {
    enabled: false,
    pointsPerDollar: 1,
    redemptionRate: 0.01,
  },
  referrals: {
    enabled: false,
    creditAmount: 50,
  },
  smsOrdering: {
    enabled: false,
  },
  marketing: {
    dropsEnabled: false,
    journalEnabled: false,
    supplierPortalEnabled: false,
  },
  integrations: {
    blooio: false,
  },
};
`;

function luminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function primaryForeground(hex: string): string {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return "#ffffff";
  return luminance(hex) > 0.179 ? "#000000" : "#ffffff";
}

export async function POST(
  _req: NextRequest,
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

  try {
    const intake = await getIntakeSubmissionById(id);
    if (!intake) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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

    return NextResponse.json({ config });
  } catch (err) {
    console.error("[POST /api/admin/intakes/[id]/generate-config]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
