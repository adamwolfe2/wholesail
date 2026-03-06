import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getIntakeSubmissionById } from "@/lib/db/intake";
import { convertIntakeToProject } from "@/lib/db/projects";
import { logCost } from "@/lib/db/costs";
import { createRepo, commitFile } from "@/lib/build/github";
import {
  createProject as createVercelProject,
  setEnvVar,
  triggerDeployment,
} from "@/lib/build/vercel-api";
import { createPostgresStore, createKVStore, connectStoreToProject } from "@/lib/build/storage";
import { createResendApiKey } from "@/lib/build/resend-admin";
import { createSentryProject } from "@/lib/build/sentry-admin";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import crypto from "crypto";

// ── Industry defaults ─────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Route ─────────────────────────────────────────────────────────────────────

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

    // Idempotency — if already fully built, return early
    if (intake.project) {
      const checklist = (intake.project.buildChecklist as Record<string, boolean> | null) ?? {};
      if (checklist.vercelProjectCreated && checklist.storageProvisioned) {
        return NextResponse.json({
          projectId: intake.project.id,
          message: "Build already completed",
        });
      }
    }

    // ── Convert intake → Project (idempotent) ──────────────────────────────
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

    async function saveProgress(extra?: Record<string, unknown>) {
      await prisma.project.update({
        where: { id: projectId },
        data: { buildLog, buildChecklist, ...extra },
      });
    }

    // ── STEP 1: Generate portal.config.ts via Claude Haiku ─────────────────
    // Reuse existing config if already generated (prevents duplicate API calls)
    if (!buildChecklist.configGenerated && project.generatedConfig) {
      buildChecklist.configGenerated = true;
      appendLog("Config reused from prior generation (skipped Claude call)");
      await saveProgress();
    }

    if (!buildChecklist.configGenerated) {
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
          message.content[0].type === "text" ? message.content[0].text : CONFIG_SKELETON;
        tokensUsed = message.usage.input_tokens + message.usage.output_tokens;
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

    // ── STEP 2: Create GitHub repo ─────────────────────────────────────────
    let repoName = project.githubRepo?.split("/")[1] ?? null;
    if (!buildChecklist.githubRepoCreated && process.env.GITHUB_PAT) {
      const slug = intake.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      repoName = `${slug}-portal`;

      try {
        const repo = await createRepo(
          repoName,
          `${intake.companyName} — Wholesail distribution portal`
        );
        await prisma.project.update({
          where: { id: projectId },
          data: { githubRepo: repo.fullName },
        });
        buildChecklist.githubRepoCreated = true;
        appendLog(`GitHub repo created: ${repo.fullName}`);
        await saveProgress();
      } catch (ghErr) {
        appendLog(`GitHub repo error: ${(ghErr as Error).message}`);
        await saveProgress();
      }
    }

    // ── STEP 3: Commit initial files to GitHub ─────────────────────────────
    if (
      buildChecklist.githubRepoCreated &&
      !buildChecklist.filesCommitted &&
      repoName
    ) {
      try {
        const updatedProject = await prisma.project.findUnique({ where: { id: projectId } });
        const configContent = updatedProject?.generatedConfig ?? CONFIG_SKELETON;

        // portal.config.ts — generated client config
        await commitFile(repoName, "portal.config.ts", configContent,
          "chore: initial portal config (auto-generated by Wholesail)"
        );

        // .env.example — env var reference for this client
        const envExample = [
          "# Auto-provisioned by Wholesail — DO NOT edit these manually",
          "DATABASE_URL=",
          "DATABASE_URL_UNPOOLED=",
          "UPSTASH_REDIS_REST_URL=",
          "UPSTASH_REDIS_REST_TOKEN=",
          "CRON_SECRET=",
          "NEXT_PUBLIC_APP_URL=",
          "ANTHROPIC_API_KEY=",
          "GEMINI_API_KEY=",
          "RESEND_API_KEY=",
          "RESEND_FROM_EMAIL=",
          "SENTRY_DSN=",
          "NEXT_PUBLIC_SENTRY_DSN=",
          "",
          "# Set by Wholesail after Clerk app creation",
          "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=",
          "CLERK_SECRET_KEY=",
          "CLERK_WEBHOOK_SECRET=",
          "",
          "# Provided by client",
          "STRIPE_SECRET_KEY=",
          "STRIPE_WEBHOOK_SECRET=",
          "BLOOIO_API_KEY=",
          "BLOOIO_PHONE_NUMBER=",
          "BLOOIO_WEBHOOK_SECRET=",
        ].join("\n");

        await commitFile(repoName, ".env.example", envExample,
          "chore: env var reference"
        );

        buildChecklist.filesCommitted = true;
        appendLog("Initial files committed to GitHub");
        await saveProgress();
      } catch (commitErr) {
        appendLog(`File commit error: ${(commitErr as Error).message}`);
        await saveProgress();
      }
    }

    // ── STEP 4: Create Vercel project ──────────────────────────────────────
    let vercelProjectId = project.vercelProject;
    const vercelUrl = vercelProjectId
      ? `https://${repoName}.vercel.app`
      : null;

    if (!buildChecklist.vercelProjectCreated && process.env.WS_VERCEL_TOKEN && repoName) {
      try {
        const vercelProject = await createVercelProject(
          repoName,
          `adamwolfe2/${repoName}`
        );
        vercelProjectId = vercelProject.id;

        await prisma.project.update({
          where: { id: projectId },
          data: {
            vercelProject: vercelProjectId,
            vercelUrl: `https://${repoName}.vercel.app`,
          },
        });

        buildChecklist.vercelProjectCreated = true;
        appendLog(`Vercel project created: ${repoName} (${vercelProjectId})`);
        await saveProgress();
      } catch (vErr) {
        appendLog(`Vercel project error: ${(vErr as Error).message}`);
        await saveProgress();
      }
    }

    // ── STEP 5: Provision Vercel Postgres (Neon) ───────────────────────────
    let neonStoreId = project.neonStoreId;
    if (!buildChecklist.storagePostgresCreated && vercelProjectId && process.env.WS_VERCEL_TOKEN) {
      try {
        appendLog("Provisioning Vercel Postgres (Neon)...");
        const pgStore = await createPostgresStore(`${repoName}-db`);
        neonStoreId = pgStore.storeId;

        // Connect store → Vercel auto-injects POSTGRES_* env vars
        await connectStoreToProject(pgStore.storeId, vercelProjectId);

        // Also set our template's expected env var names directly
        await setEnvVar(vercelProjectId, "DATABASE_URL", pgStore.databaseUrl);
        await setEnvVar(vercelProjectId, "DATABASE_URL_UNPOOLED", pgStore.databaseUrlDirect);

        await logCost(projectId, {
          service: "vercel-postgres",
          amountCents: 0, // free tier initially
          description: "Vercel Postgres (Neon) — free tier provisioned",
          metadata: { storeId: pgStore.storeId, plan: "hobby" },
        });

        buildChecklist.storagePostgresCreated = true;
        appendLog(`Postgres provisioned — store: ${pgStore.storeId}`);
        await saveProgress({ neonStoreId: pgStore.storeId });
      } catch (pgErr) {
        appendLog(`Postgres provisioning error: ${(pgErr as Error).message}`);
        await saveProgress();
      }
    }

    // ── STEP 6: Provision Vercel KV (Upstash) ─────────────────────────────
    let upstashStoreId = project.upstashStoreId;
    if (!buildChecklist.storageKVCreated && vercelProjectId && process.env.WS_VERCEL_TOKEN) {
      try {
        appendLog("Provisioning Vercel KV (Upstash)...");
        const kvStore = await createKVStore(`${repoName}-kv`);
        upstashStoreId = kvStore.storeId;

        // Connect store → Vercel auto-injects KV_* env vars
        await connectStoreToProject(kvStore.storeId, vercelProjectId);

        // Also set our template's expected env var names
        await setEnvVar(vercelProjectId, "UPSTASH_REDIS_REST_URL", kvStore.restApiUrl);
        await setEnvVar(vercelProjectId, "UPSTASH_REDIS_REST_TOKEN", kvStore.restApiToken);

        await logCost(projectId, {
          service: "vercel-kv",
          amountCents: 0, // free tier initially
          description: "Vercel KV (Upstash) — free tier provisioned",
          metadata: { storeId: kvStore.storeId, plan: "hobby" },
        });

        buildChecklist.storageKVCreated = true;
        appendLog(`KV provisioned — store: ${kvStore.storeId}`);
        await saveProgress({ upstashStoreId: kvStore.storeId });
      } catch (kvErr) {
        appendLog(`KV provisioning error: ${(kvErr as Error).message}`);
        await saveProgress();
      }
    }

    // ── STEP 7: Provision per-client Sentry project ────────────────────────
    let sentryDsn: string | null = null;
    let sentryProjectSlug: string | null = null;
    if (
      !buildChecklist.sentryProjectCreated &&
      process.env.SENTRY_AUTH_TOKEN &&
      process.env.SENTRY_ORG &&
      process.env.SENTRY_TEAM_SLUG &&
      repoName
    ) {
      try {
        const projectName = `${intake.companyName.slice(0, 50)} Portal`;
        const projectSlug = repoName; // already kebab-case, e.g. "tbgc-portal"
        const sentryProject = await createSentryProject(projectName, projectSlug);
        sentryDsn = sentryProject.dsn;
        sentryProjectSlug = sentryProject.projectSlug;

        await logCost(projectId, {
          service: "sentry",
          amountCents: 0, // free tier
          description: `Per-client Sentry project created: ${projectName}`,
          metadata: {
            projectId: sentryProject.projectId,
            projectSlug: sentryProject.projectSlug,
          },
        });

        buildChecklist.sentryProjectCreated = true;
        appendLog(`Sentry project created — slug: ${sentryProject.projectSlug}`);
        await saveProgress();
      } catch (sentryErr) {
        appendLog(`Sentry project error: ${(sentryErr as Error).message} — error monitoring will be disabled until manually configured`);
        await saveProgress();
      }
    }

    // ── STEP 8: Provision per-client Resend API key ───────────────────────
    let resendKeyId: string | null = null;
    let resendToken: string | null = null;
    if (!buildChecklist.resendKeyCreated && process.env.RESEND_API_KEY) {
      try {
        const keyName = `${intake.companyName.slice(0, 40)} Portal`;
        const resendKey = await createResendApiKey(keyName);
        resendKeyId = resendKey.keyId;
        resendToken = resendKey.token;

        await logCost(projectId, {
          service: "resend",
          amountCents: 0, // free tier initially
          description: `Per-client Resend API key provisioned: ${keyName}`,
          metadata: { keyId: resendKey.keyId },
        });

        buildChecklist.resendKeyCreated = true;
        appendLog(`Resend API key created — keyId: ${resendKey.keyId}`);
        await saveProgress();
      } catch (resendErr) {
        appendLog(`Resend key error: ${(resendErr as Error).message} — will fall back to shared key`);
        await saveProgress();
      }
    }

    // ── STEP 8: Set auto env vars (per-client + generated secrets) ─────────
    if (!buildChecklist.envVarsAutoSet && vercelProjectId && process.env.WS_VERCEL_TOKEN) {
      try {
        const clientUrl = `https://${repoName}.vercel.app`;
        const cronSecret = crypto.randomBytes(32).toString("hex");

        // Use dedicated per-client Resend key if provisioned, else fall back to shared
        const resendApiKey = resendToken ?? process.env.RESEND_API_KEY;
        const usingDedicatedResend = !!resendToken;

        const autoVars: Record<string, string | undefined> = {
          // App URL
          NEXT_PUBLIC_APP_URL: clientUrl,

          // Clerk redirect URLs (standard — admin sets the publishable/secret keys)
          NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
          NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
          NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: "/client-portal",
          NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: "/client-portal",

          // Cron auth — unique per client
          CRON_SECRET: cronSecret,

          // AI keys — Anthropic is shared (no programmatic key creation API).
          // Tag usage by injecting CLIENT_ID so we can filter Anthropic dashboard by project.
          ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
          GEMINI_API_KEY: process.env.GEMINI_API_KEY,

          // Email — dedicated per-client key when available
          RESEND_API_KEY: resendApiKey,
          RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL ?? "orders@wholesailhub.com",

          // Error monitoring — dedicated per-client Sentry project when available
          // Both server and client-side SDKs need the same DSN value under different names
          ...(sentryDsn ? {
            SENTRY_DSN: sentryDsn,
            NEXT_PUBLIC_SENTRY_DSN: sentryDsn,
          } : {}),
        };

        const setPromises = Object.entries(autoVars)
          .filter(([, v]) => Boolean(v))
          .map(([k, v]) => setEnvVar(vercelProjectId!, k, v!));

        await Promise.all(setPromises);

        // Persist service key references for cost-tracking queries
        const serviceKeys = {
          resend: resendKeyId
            ? { keyId: resendKeyId, dedicated: true }
            : { keyId: null, dedicated: false, note: "using shared Wholesail key" },
          sentry: sentryProjectSlug
            ? { projectSlug: sentryProjectSlug, dedicated: true }
            : { projectSlug: null, dedicated: false, note: "project creation failed or skipped" },
          anthropic: {
            keyId: null,
            dedicated: false,
            note: "shared key — no programmatic creation API; attribute via metadata",
          },
        };

        await prisma.project.update({
          where: { id: projectId },
          data: { serviceKeys },
        });

        buildChecklist.envVarsAutoSet = true;
        const varCount = Object.keys(autoVars).filter(k => autoVars[k]).length;
        appendLog(
          `Env vars set (${varCount} vars) — Resend: ${usingDedicatedResend ? "dedicated key" : "shared key (fallback)"}`
        );
        await saveProgress();
      } catch (envErr) {
        appendLog(`Auto env var error: ${(envErr as Error).message}`);
        await saveProgress();
      }
    }

    // ── STEP 9: Set placeholder env vars (admin fills after Clerk/Stripe setup)
    if (!buildChecklist.envVarsPlaceholderSet && vercelProjectId && process.env.WS_VERCEL_TOKEN) { // Step 9
      try {
        const placeholders: Record<string, string> = {
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "PENDING_CLERK_SETUP",
          CLERK_SECRET_KEY: "PENDING_CLERK_SETUP",
          CLERK_WEBHOOK_SECRET: "PENDING_CLERK_SETUP",
          STRIPE_SECRET_KEY: "PENDING_CLIENT_STRIPE",
          STRIPE_WEBHOOK_SECRET: "PENDING_CLIENT_STRIPE",
        };

        // Only set Bloo.io placeholders if SMS ordering was requested
        const features = intake.selectedFeatures ?? [];
        const hasSMS = features.some((f: string) =>
          f.toLowerCase().includes("sms") || f.toLowerCase().includes("bloo")
        );
        if (hasSMS) {
          placeholders.BLOOIO_API_KEY = "PENDING_BLOOIO_SETUP";
          placeholders.BLOOIO_PHONE_NUMBER = "PENDING_BLOOIO_SETUP";
          placeholders.BLOOIO_WEBHOOK_SECRET = "PENDING_BLOOIO_SETUP";
        }

        await Promise.all(
          Object.entries(placeholders).map(([k, v]) => setEnvVar(vercelProjectId!, k, v))
        );

        // Track env var status on project for the dashboard
        const envVarStatus = {
          DATABASE_URL: "configured",
          DATABASE_URL_UNPOOLED: "configured",
          UPSTASH_REDIS_REST_URL: "configured",
          UPSTASH_REDIS_REST_TOKEN: "configured",
          CRON_SECRET: "configured",
          ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? "configured-shared" : "missing",
          GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "configured-shared" : "missing",
          RESEND_API_KEY: resendKeyId ? "configured-dedicated" : (process.env.RESEND_API_KEY ? "configured-shared" : "missing"),
          SENTRY_DSN: sentryDsn ? "configured-dedicated" : "not-configured",
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pending",
          CLERK_SECRET_KEY: "pending",
          CLERK_WEBHOOK_SECRET: "pending",
          STRIPE_SECRET_KEY: "pending",
          STRIPE_WEBHOOK_SECRET: "pending",
          ...(hasSMS ? {
            BLOOIO_API_KEY: "pending",
            BLOOIO_PHONE_NUMBER: "pending",
            BLOOIO_WEBHOOK_SECRET: "pending",
          } : {}),
        };

        await prisma.project.update({
          where: { id: projectId },
          data: { envVars: envVarStatus },
        });

        buildChecklist.envVarsPlaceholderSet = true;
        appendLog("Placeholder env vars set (Clerk + Stripe pending admin/client)");
        await saveProgress();
      } catch (phErr) {
        appendLog(`Placeholder env var error: ${(phErr as Error).message}`);
        await saveProgress();
      }
    }

    // ── STEP 10: Trigger first Vercel deployment ───────────────────────────
    let deploymentId = project.deploymentId;
    if (
      !buildChecklist.deploymentTriggered &&
      vercelProjectId &&
      repoName &&
      buildChecklist.filesCommitted &&
      process.env.WS_VERCEL_TOKEN
    ) {
      try {
        const deployment = await triggerDeployment(vercelProjectId, `adamwolfe2/${repoName}`);
        deploymentId = deployment.deploymentId;

        await logCost(projectId, {
          service: "vercel-build",
          amountCents: 0, // hobby builds are free
          description: "First Vercel deployment triggered",
          metadata: { deploymentId: deployment.deploymentId },
        });

        buildChecklist.deploymentTriggered = true;
        appendLog(`Deployment triggered: ${deployment.deploymentId}`);
        await saveProgress({ deploymentId: deployment.deploymentId });
      } catch (dErr) {
        appendLog(`Deployment trigger error: ${(dErr as Error).message} — admin can trigger manually from Vercel dashboard`);
        await saveProgress();
      }
    }

    // ── STEP 11: Mark storage fully provisioned + update status ───────────
    buildChecklist.storageProvisioned =
      !!buildChecklist.storagePostgresCreated &&
      !!buildChecklist.storageKVCreated &&
      !!buildChecklist.resendKeyCreated &&
      !!buildChecklist.sentryProjectCreated;

    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "BUILDING",
        currentPhase: 2,
        buildLog,
        buildChecklist,
        neonStoreId,
        upstashStoreId,
        deploymentId,
      },
    });

    const finalProject = await prisma.project.findUnique({ where: { id: projectId } });

    // Summarize what still needs manual action
    const pendingActions = [
      !buildChecklist.storagePostgresCreated && "Provision Postgres DB manually",
      !buildChecklist.storageKVCreated && "Provision KV store manually",
      "Create Clerk app → set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET",
      "Get client Stripe keys → set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET",
      "Connect custom domain in Vercel",
    ].filter(Boolean);

    return NextResponse.json({
      projectId,
      githubRepo: finalProject?.githubRepo,
      vercelProjectId: finalProject?.vercelProject,
      vercelUrl: finalProject?.vercelUrl,
      neonStoreId: finalProject?.neonStoreId,
      upstashStoreId: finalProject?.upstashStoreId,
      deploymentId: finalProject?.deploymentId,
      serviceKeys: finalProject?.serviceKeys,
      buildChecklist,
      buildLog,
      pendingManualActions: pendingActions,
    });
  } catch (err) {
    console.error("[build-start] Error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: (err as Error).message },
      { status: 500 }
    );
  }
}
