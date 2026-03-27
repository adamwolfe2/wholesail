/**
 * Build step: Generate portal.config.ts via Claude Haiku.
 *
 * Extracts intake data into structured form, calls the Anthropic API,
 * and persists the generated config to the project record.
 */

import { auth } from "@clerk/nextjs/server";
import { aiCallLimiter, checkRateLimit } from "@/lib/rate-limit";
import { logCost } from "@/lib/db/costs";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import { INDUSTRY_DEFAULTS, CONFIG_SKELETON, primaryForeground } from "@/lib/build/config-template";
import { AI_MODEL } from "@/lib/brand";

export interface GenerateConfigParams {
  projectId: string;
  intake: {
    companyName: string;
    shortName: string | null;
    website: string | null;
    contactEmail: string;
    location: string | null;
    industry: string;
    productCategories: string[] | string | null;
    coldChain: string | null;
    primaryColor: string | null;
    paymentTerms: string[] | null;
    selectedFeatures: string[] | null;
  };
  buildChecklist: Record<string, boolean>;
  generatedConfig: string | null;
  appendLog: (msg: string) => void;
  saveProgress: (extra?: Record<string, unknown>) => Promise<void>;
}

export async function generateConfig(params: GenerateConfigParams): Promise<void> {
  const { projectId, intake, buildChecklist, appendLog, saveProgress } = params;

  // Reuse existing config if already generated (prevents duplicate API calls)
  if (!buildChecklist.configGenerated && params.generatedConfig) {
    buildChecklist.configGenerated = true;
    appendLog("Config reused from prior generation (skipped Claude call)");
    await saveProgress();
    return;
  }

  if (buildChecklist.configGenerated) return;

  const defaults =
    INDUSTRY_DEFAULTS[intake.industry] ?? INDUSTRY_DEFAULTS["General Distribution"];

  const netTermOptions = (intake.paymentTerms ?? [])
    .map((t: string) => { const m = t.match(/\d+/); return m ? parseInt(m[0], 10) : null; })
    .filter((n): n is number => n !== null);
  if (!netTermOptions.includes(0)) netTermOptions.unshift(0);

  const shortName =
    intake.shortName ||
    intake.companyName.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();

  const domain = (intake.website ?? "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  const primary = intake.primaryColor ?? "#0A0A0A";
  const foreground = primaryForeground(primary);
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
    coldChain: intake.coldChain === "yes" || defaults.coldChain,
    primaryColor: primary,
    primaryForeground: foreground,
    industryDefaults: defaults,
    derivedValues: {
      netTermOptions,
      loyaltyEnabled: hasFeature("loyalty"),
      referralsEnabled: hasFeature("referral"),
      smsOrderingEnabled: hasFeature("sms") || hasFeature("text"),
      dropsEnabled: hasFeature("drop"),
      journalEnabled: hasFeature("journal") || hasFeature("blog"),
      supplierPortalEnabled: hasFeature("supplier"),
      blooioEnabled: hasFeature("bloo") || hasFeature("sms"),
    },
  };

  let generatedConfig = CONFIG_SKELETON;
  let tokensUsed = 0;

  if (process.env.ANTHROPIC_API_KEY) {
    const { userId: adminUserId } = await auth();
    const { allowed: aiAllowed } = await checkRateLimit(aiCallLimiter, adminUserId ?? "build-start");
    if (!aiAllowed) {
      appendLog("AI rate limit hit -- using config skeleton fallback");
      await saveProgress();
    } else {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const message = await anthropic.messages.create({
        model: AI_MODEL,
        max_tokens: 2048,
        temperature: 0,
        system:
          "You are a portal configuration generator. Return ONLY valid TypeScript — a complete portal.config.ts file. No explanation, no markdown fences.",
        messages: [
          {
            role: "user",
            content: `Generate a complete portal.config.ts from this intake data.\n\nINTAKE DATA:\n${JSON.stringify(structuredData, null, 2)}\n\nCONFIG SKELETON:\n${CONFIG_SKELETON}\n\nReturn ONLY the TypeScript file content.`,
          },
        ],
      });
      generatedConfig =
        message.content[0].type === "text" ? message.content[0].text : CONFIG_SKELETON;
      tokensUsed = message.usage.input_tokens + message.usage.output_tokens;
    }
  }

  await prisma.project.update({ where: { id: projectId }, data: { generatedConfig, configGeneratedAt: new Date() } });

  if (process.env.ANTHROPIC_API_KEY && tokensUsed > 0) {
    await logCost(projectId, {
      service: "anthropic",
      amountCents: 2, // ~$0.02 per Haiku config gen call
      description: "Config generation via Claude Haiku",
      tokens: tokensUsed,
    });
  }

  buildChecklist.configGenerated = true;
  appendLog(`Config generated via Claude Haiku (${tokensUsed} tokens)`);
  await saveProgress();
}
