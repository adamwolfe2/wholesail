import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getIntakeSubmissionById } from "@/lib/db/intake";
import { convertIntakeToProject } from "@/lib/db/projects";
import { logCost } from "@/lib/db/costs";
import { createRepo, commitFile } from "@/lib/build/github";
import { createProject as createVercelProject, setEnvVar } from "@/lib/build/vercel-api";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import { ENV_VARS } from "@/lib/client-data";

// ── Same config generation logic as /generate-config ─────────────────────────

const INDUSTRY_DEFAULTS: Record<
  string,
  { coldChain: boolean; taxRate: number; repeatThreshold: number; vipThreshold: number }
> = {
  "Food & Beverage":      { coldChain: true,  taxRate: 0.085, repeatThreshold: 5000,  vipThreshold: 50000 },
  Seafood:                { coldChain: true,  taxRate: 0.085, repeatThreshold: 3000,  vipThreshold: 30000 },
  "Specialty Foods":      { coldChain: true,  taxRate: 0.085, repeatThreshold: 5000,  vipThreshold: 50000 },
  Produce:                { coldChain: true,  taxRate: 0.000, repeatThreshold: 3000,  vipThreshold: 25000 },
  Beverage:               { coldChain: false, taxRate: 0.085, repeatThreshold: 5000,  vipThreshold: 50000 },
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

function ts() {
  return new Date().toISOString();
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id: intakeId } = await params;

  try {
    const intake = await getIntakeSubmissionById(intakeId);
    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    // Idempotency: if project already fully built, return early
    if (intake.project) {
      const existingChecklist = (intake.project.buildChecklist as Record<string, boolean> | null) ?? {};
      if (existingChecklist.vercelProjectCreated) {
        return NextResponse.json({
          projectId: intake.project.id,
          message: "Build already completed",
        });
      }
    }

    // ── Step 4: Convert intake to project (if not already done) ────────────
    let project = intake.project;
    if (!project) {
      project = await convertIntakeToProject(intakeId);
    }
    const projectId = project.id;

    const buildLog: string[] = [...(project.buildLog ?? [])];
    const buildChecklist: Record<string, boolean> = {
      ...(typeof project.buildChecklist === "object" && project.buildChecklist !== null
        ? (project.buildChecklist as Record<string, boolean>)
        : {}),
    };

    function appendLog(msg: string) {
      buildLog.push(`[${ts()}] ${msg}`);
    }

    async function saveProgress() {
      await prisma.project.update({
        where: { id: projectId },
        data: { buildLog, buildChecklist },
      });
    }

    // ── Step 5: Generate portal.config.ts via Claude Haiku ─────────────────
    if (!buildChecklist.configGenerated) {
      const defaults =
        INDUSTRY_DEFAULTS[intake.industry] ?? INDUSTRY_DEFAULTS["General Distribution"];

      const netTermOptions = (intake.paymentTerms ?? [])
        .map((t: string) => {
          const m = t.match(/\d+/);
          return m ? parseInt(m[0], 10) : null;
        })
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

      let generatedConfig = "";
      let tokensUsed = 0;

      if (process.env.ANTHROPIC_API_KEY) {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const message = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4096,
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
          message.content[0].type === "text" ? message.content[0].text : "";
        tokensUsed = message.usage.input_tokens + message.usage.output_tokens;
      } else {
        generatedConfig = CONFIG_SKELETON;
      }

      await prisma.project.update({
        where: { id: projectId },
        data: { generatedConfig },
      });

      if (process.env.ANTHROPIC_API_KEY && tokensUsed > 0) {
        // Haiku pricing: ~$0.25/1M input, $1.25/1M output — estimate $0.02 avg per call
        await logCost(projectId, {
          service: "anthropic",
          amountCents: 2,
          description: "Config generation via Claude Haiku",
          tokens: tokensUsed,
        });
      }

      buildChecklist.configGenerated = true;
      appendLog("Config generated via Claude Haiku");
      await saveProgress();
    }

    // ── Step 6: Create GitHub repo ──────────────────────────────────────────
    let repoName = project.githubRepo;
    if (!buildChecklist.githubRepoCreated && process.env.GITHUB_TOKEN) {
      const slug = intake.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      repoName = `${slug}-portal`;

      try {
        const repo = await createRepo(
          repoName,
          `${intake.companyName} — Wholesail portal build`
        );

        await prisma.project.update({
          where: { id: projectId },
          data: { githubRepo: repo.fullName },
        });

        buildChecklist.githubRepoCreated = true;
        appendLog(`GitHub repo created: ${repo.fullName}`);
        await saveProgress();

        // ── Step 7: Commit initial files ──────────────────────────────────
        const updatedProject = await prisma.project.findUnique({ where: { id: projectId } });
        const configContent = updatedProject?.generatedConfig ?? CONFIG_SKELETON;

        await commitFile(
          repoName,
          "portal.config.ts",
          configContent,
          "chore: initial portal config (generated by Wholesail)"
        );

        const envExampleContent =
          ENV_VARS.map((v) => `${v.key}=YOUR_VALUE_HERE`).join("\n") + "\n";
        await commitFile(
          repoName,
          ".env.example",
          envExampleContent,
          "chore: add env vars example"
        );

        appendLog("Initial files committed to GitHub");
        await saveProgress();
      } catch (ghErr) {
        appendLog(`GitHub error: ${(ghErr as Error).message}`);
        await saveProgress();
      }
    }

    // ── Step 8: Create Vercel project ───────────────────────────────────────
    let vercelProjectId = project.vercelProject;
    if (!buildChecklist.vercelProjectCreated && process.env.VERCEL_TOKEN && repoName) {
      try {
        const vercelProject = await createVercelProject(
          repoName,
          `adamwolfe2/${repoName}`
        );
        vercelProjectId = vercelProject.id;

        const vercelUrl = `https://${repoName}.vercel.app`;

        await prisma.project.update({
          where: { id: projectId },
          data: { vercelProject: vercelProjectId, vercelUrl },
        });

        buildChecklist.vercelProjectCreated = true;
        appendLog(`Vercel project created: ${repoName}`);
        await saveProgress();

        // ── Step 9: Set env vars on Vercel ───────────────────────────────
        await setEnvVar(vercelProjectId, "NEXT_PUBLIC_APP_URL", vercelUrl);
        await setEnvVar(
          vercelProjectId,
          "NEXT_PUBLIC_COMPANY_NAME",
          intake.companyName
        );

        appendLog("Vercel env vars set");
        await saveProgress();
      } catch (vErr) {
        appendLog(`Vercel error: ${(vErr as Error).message}`);
        await saveProgress();
      }
    }

    // ── Step 10: Update project status ──────────────────────────────────────
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "ONBOARDING",
        currentPhase: 1,
        buildLog,
        buildChecklist,
      },
    });

    const finalProject = await prisma.project.findUnique({ where: { id: projectId } });

    return NextResponse.json({
      projectId,
      githubRepo: finalProject?.githubRepo,
      vercelProjectId: finalProject?.vercelProject,
      vercelUrl: finalProject?.vercelUrl,
      buildChecklist,
      buildLog,
    });
  } catch (err) {
    console.error("[build-start] Error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: (err as Error).message },
      { status: 500 }
    );
  }
}
