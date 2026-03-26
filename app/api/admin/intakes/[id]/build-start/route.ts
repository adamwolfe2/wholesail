import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { aiCallLimiter, checkRateLimit } from "@/lib/rate-limit";
import { getIntakeSubmissionById } from "@/lib/db/intake";
import { convertIntakeToProject } from "@/lib/db/projects";
import { logCost } from "@/lib/db/costs";
import { createRepoFromTemplate, commitFile } from "@/lib/build/github";
import { runResearchPipeline, estimateResearchCost } from "@/lib/build/research";
import { generateReadme, generateMarketingCopy, type ReadmeInput } from "@/lib/build/readme-generator";
import {
  createProject as createVercelProject,
  setEnvVar,
  triggerDeployment,
} from "@/lib/build/vercel-api";
import { createPostgresStore, createKVStore, connectStoreToProject } from "@/lib/build/storage";
import { createResendApiKey } from "@/lib/build/resend-admin";
import { createSentryProject } from "@/lib/build/sentry-admin";
import { createConnectedAccount } from "@/lib/build/stripe-connect";
import { provisionClerkApp, isPlatformApiAvailable } from "@/lib/build/clerk-admin";
import { sendStripeOnboardingEmail } from "@/lib/email/notifications";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import crypto from "crypto";
import { INDUSTRY_DEFAULTS, CONFIG_SKELETON, primaryForeground } from "@/lib/build/config-template";
import { AI_MODEL, BRAND_EMAIL } from "@/lib/brand";
import { portalConfig } from "@/lib/portal-config";

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

    // ── Convert intake → Project (idempotent + race-safe) ─────────────────
    // If two requests arrive simultaneously, both pass the intake.project === null
    // check above. The second create will fail with a P2002 unique constraint
    // violation (intakeId @unique on Project). We catch that and fetch the
    // project that was just created by the winning request.
    let project = intake.project;
    if (!project) {
      try {
        project = await convertIntakeToProject(intakeId);
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code;
        if (code === "P2002") {
          // Another request won the race — re-fetch and continue
          const fresh = await getIntakeSubmissionById(intakeId);
          if (!fresh?.project) throw err; // unexpected — rethrow
          project = fresh.project;
        } else {
          throw err;
        }
      }
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
        const { userId: adminUserId } = await auth();
        const { allowed: aiAllowed } = await checkRateLimit(aiCallLimiter, adminUserId ?? "build-start");
        if (!aiAllowed) {
          appendLog("AI rate limit hit — using config skeleton fallback");
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

    // ── STEP 2: Research Pipeline (Tavily + Claude Synthesis) ──────────────
    let researchData: Record<string, unknown> | null = null;
    if (!buildChecklist.researchCompleted && !buildChecklist.researchFailed) {
      try {
        appendLog("Running research pipeline (Tavily searches + Claude synthesis)...");
        await saveProgress();

        const researchResult = await runResearchPipeline({
          companyName: intake.companyName,
          industry: intake.industry,
          website: intake.website,
          location: intake.location,
          productCategories: intake.productCategories,
          selectedFeatures: intake.selectedFeatures ?? [],
          additionalNotes: intake.additionalNotes,
          scrapeData: (intake.scrapeData as Record<string, unknown>) ?? null,
        });

        researchData = researchResult as unknown as Record<string, unknown>;

        // Store research data in serviceKeys JSON (already a flexible JSON field)
        await prisma.project.update({
          where: { id: projectId },
          data: {
            serviceKeys: {
              ...((typeof project.serviceKeys === "object" && project.serviceKeys !== null
                ? project.serviceKeys
                : {}) as Record<string, unknown>),
              research: researchData,
            } as object,
          },
        });

        const costs = estimateResearchCost();
        await logCost(projectId, {
          service: "tavily",
          amountCents: costs.tavily,
          description: "Research pipeline — 4 Tavily advanced searches",
        });
        if (process.env.ANTHROPIC_API_KEY) {
          await logCost(projectId, {
            service: "anthropic",
            amountCents: costs.anthropic,
            description: "Research pipeline — Claude Sonnet synthesis",
          });
        }

        buildChecklist.researchCompleted = true;
        appendLog(`Research pipeline complete: ${researchResult.researchedAt}`);
        await saveProgress();
      } catch (researchErr) {
        appendLog(`Research pipeline error (non-fatal): ${(researchErr as Error).message}`);
        buildChecklist.researchFailed = true; // Mark as failed — do NOT set researchCompleted
        await saveProgress();
      }
    } else {
      // Recover cached research data from serviceKeys
      const keys = project.serviceKeys as Record<string, unknown> | null;
      if (keys?.research) {
        researchData = keys.research as Record<string, unknown>;
      }
    }

    // ── STEP 3: Generate CLAUDE.md (build instructions) ─────────────────────
    let readmeContent: string | null = null;
    let marketingCopyContent: string | null = null;

    if (!buildChecklist.readmeGenerated && !buildChecklist.readmeFailed) {
      try {
        appendLog("Generating CLAUDE.md build instructions...");
        const updatedProject = await prisma.project.findUnique({ where: { id: projectId } });
        const configContent = updatedProject?.generatedConfig ?? CONFIG_SKELETON;

        const readmeInput = {
          companyName: intake.companyName,
          shortName: intake.shortName || intake.companyName.slice(0, 3).toUpperCase(),
          industry: intake.industry,
          website: intake.website,
          location: intake.location,
          contactEmail: intake.contactEmail,
          primaryColor: intake.primaryColor ?? "#0A0A0A",
          brandSecondaryColor: intake.brandSecondaryColor ?? null,
          logoUrl: intake.logoUrl ?? null,
          selectedFeatures: intake.selectedFeatures ?? [],
          productCategories: intake.productCategories,
          coldChain: intake.coldChain,
          paymentTerms: intake.paymentTerms ?? [],
          deliveryCoverage: intake.deliveryCoverage,
          additionalNotes: intake.additionalNotes,
          targetDomain: intake.targetDomain ?? null,
          minimumOrderValue: intake.minimumOrderValue ?? null,
          researchData: researchData as ReadmeInput["researchData"],
          scrapeData: (intake.scrapeData as ReadmeInput["scrapeData"]) ?? null,
          generatedConfig: configContent,
        };

        // Generate CLAUDE.md and marketing copy in parallel
        const [readme, marketing] = await Promise.allSettled([
          generateReadme(readmeInput),
          generateMarketingCopy(readmeInput),
        ]);

        readmeContent = readme.status === "fulfilled" ? readme.value : null;
        marketingCopyContent = marketing.status === "fulfilled" ? marketing.value : null;

        if (marketingCopyContent && process.env.ANTHROPIC_API_KEY) {
          await logCost(projectId, {
            service: "anthropic",
            amountCents: 5,
            description: "Marketing copy generation via Claude Sonnet",
          });
        }

        buildChecklist.readmeGenerated = true;
        appendLog(`CLAUDE.md generated (${readmeContent?.length ?? 0} chars), marketing copy generated (${marketingCopyContent?.length ?? 0} chars)`);
        await saveProgress();
      } catch (readmeErr) {
        appendLog(`README generation error (non-fatal): ${(readmeErr as Error).message}`);
        buildChecklist.readmeFailed = true; // Mark as failed — do NOT set readmeGenerated
        await saveProgress();
      }
    }

    // ── STEP 4: Create GitHub repo FROM TEMPLATE ────────────────────────────
    let repoName = project.githubRepo?.split("/")[1] ?? null;
    if (!buildChecklist.githubRepoCreated && process.env.GITHUB_PAT) {
      const slug = intake.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      repoName = `${slug}-portal`;

      try {
        const repo = await createRepoFromTemplate(
          repoName,
          `${intake.companyName} — Distribution portal powered by Wholesail`
        );
        await prisma.project.update({
          where: { id: projectId },
          data: { githubRepo: repo.fullName },
        });
        buildChecklist.githubRepoCreated = true;
        appendLog(`GitHub repo created: ${repo.fullName} (from template: ${repo.fromTemplate})`);
        await saveProgress();
      } catch (ghErr) {
        appendLog(`GitHub repo error: ${(ghErr as Error).message}`);
        await saveProgress();
      }
    }

    // ── STEP 5: Commit build artifacts to GitHub ─────────────────────────────
    if (
      buildChecklist.githubRepoCreated &&
      !buildChecklist.filesCommitted &&
      repoName
    ) {
      try {
        const updatedProject = await prisma.project.findUnique({ where: { id: projectId } });
        const configContent = updatedProject?.generatedConfig ?? CONFIG_SKELETON;

        // 1. portal.config.ts — generated client config
        await commitFile(repoName, "portal.config.ts", configContent,
          "chore: initial portal config (auto-generated by Wholesail)"
        );

        // 2. CLAUDE.md — build instructions for Claude Code
        if (readmeContent) {
          await commitFile(repoName, "CLAUDE.md", readmeContent,
            "chore: add CLAUDE.md build instructions"
          );
        }

        // 3. docs/research.md — industry research
        if (researchData) {
          const rd = researchData as Record<string, unknown>;
          const researchDoc = [
            `# ${intake.companyName} — Industry Research`,
            ``,
            `> Auto-generated by Wholesail research pipeline on ${rd.researchedAt ?? new Date().toISOString()}`,
            ``,
            `## Executive Brief`,
            rd.synthesizedBrief ?? "_Research not available._",
            ``,
            `## Industry Landscape`,
            rd.industryLandscape ?? "_Not available._",
            ``,
            `## Company Intelligence`,
            rd.companyIntelligence ?? "_Not available._",
            ``,
            `## Pain Points`,
            rd.painPoints ?? "_Not available._",
            ``,
            `## Competitor Software`,
            rd.competitorSoftware ?? "_Not available._",
            ``,
            `## SEO Keywords`,
            ...(Array.isArray(rd.seoKeywords) ? (rd.seoKeywords as string[]).map(k => `- ${k}`) : ["_None generated._"]),
            ``,
            `## Marketing Angles`,
            ...(Array.isArray(rd.marketingAngles) ? (rd.marketingAngles as string[]).map(a => `- ${a}`) : ["_None generated._"]),
            ``,
            `## Suggested Catalog Categories`,
            ...(Array.isArray(rd.catalogCategories) ? (rd.catalogCategories as string[]).map(c => `- ${c}`) : ["_None generated._"]),
            ``,
            `## Industry Terminology`,
            ...(rd.industryTerminology && typeof rd.industryTerminology === "object"
              ? Object.entries(rd.industryTerminology as Record<string, string>).map(([k, v]) => `- **${k}**: ${v}`)
              : ["_None generated._"]),
          ].join("\n");

          await commitFile(repoName, "docs/research.md", researchDoc,
            "chore: add industry research document"
          );
        }

        // 4. docs/marketing-copy.md — generated marketing copy
        if (marketingCopyContent) {
          await commitFile(repoName, "docs/marketing-copy.md", marketingCopyContent,
            "chore: add generated marketing copy"
          );
        }

        // 5. .env.example — env var reference for this client
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
          "# Stripe Connect (auto-provisioned by Wholesail when available)",
          "STRIPE_CONNECT_ACCOUNT_ID=",
          "PLATFORM_FEE_PERCENT=2.5",
          "",
          "# Stripe fallback (only if Connect not provisioned — provided by client)",
          "STRIPE_SECRET_KEY=",
          "STRIPE_WEBHOOK_SECRET=",
          "",
          "# Bloo.io SMS (if enabled)",
          "BLOOIO_API_KEY=",
          "BLOOIO_PHONE_NUMBER=",
          "BLOOIO_WEBHOOK_SECRET=",
        ].join("\n");

        await commitFile(repoName, ".env.example", envExample,
          "chore: env var reference"
        );

        buildChecklist.filesCommitted = true;
        const fileCount = [configContent, readmeContent, researchData, marketingCopyContent, envExample].filter(Boolean).length;
        appendLog(`${fileCount} files committed to GitHub (config, CLAUDE.md, research, marketing copy, .env.example)`);
        await saveProgress();
      } catch (commitErr) {
        appendLog(`File commit error: ${(commitErr as Error).message}`);
        await saveProgress();
      }
    }

    // ── STEP 6: Create Vercel project ──────────────────────────────────────
    let vercelProjectId = project.vercelProject;

    if (!buildChecklist.vercelProjectCreated && process.env.WS_VERCEL_TOKEN && repoName) {
      try {
        const vercelProject = await createVercelProject(
          repoName,
          `${portalConfig.githubOwner}/${repoName}`
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

    // ── STEP 7: Provision Vercel Postgres (Neon) ───────────────────────────
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

    // ── STEP 8: Provision Vercel KV (Upstash) ─────────────────────────────
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

    // ── STEP 9: Provision per-client Sentry project ────────────────────────
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

    // ── STEP 10: Provision per-client Resend API key ──────────────────────
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

    // ── STEP 11: Create Stripe Connect account ───────────────────────────
    let stripeConnectAccountId: string | null = null;
    if (!buildChecklist.stripeConnectCreated && process.env.STRIPE_SECRET_KEY) {
      try {
        appendLog("Creating Stripe Express Connected Account...");
        await saveProgress();

        const connectResult = await createConnectedAccount({
          companyName: intake.companyName,
          contactEmail: intake.contactEmail,
          industry: intake.industry,
          website: intake.website,
        });

        stripeConnectAccountId = connectResult.accountId;

        await prisma.project.update({
          where: { id: projectId },
          data: { stripeAccountId: connectResult.accountId },
        });

        await logCost(projectId, {
          service: "stripe",
          amountCents: 0, // Stripe Connect account creation is free
          description: "Stripe Express Connected Account created",
          metadata: { accountId: connectResult.accountId },
        });

        buildChecklist.stripeConnectCreated = true;
        appendLog(
          `Stripe Connect account created: ${connectResult.accountId} — onboarding link generated`
        );
        await saveProgress();

        // Send onboarding email to client (fire-and-forget)
        Promise.resolve(
          sendStripeOnboardingEmail({
            contactName: intake.contactName,
            contactEmail: intake.contactEmail,
            companyName: intake.companyName,
            onboardingUrl: connectResult.onboardingUrl,
          })
        ).catch((emailErr) => {
          appendLog(
            `Stripe onboarding email error (non-fatal): ${(emailErr as Error).message}`
          );
        });
      } catch (stripeErr) {
        appendLog(
          `Stripe Connect error (non-fatal): ${(stripeErr as Error).message} — client will need manual Stripe setup`
        );
        await saveProgress();
      }
    } else if (buildChecklist.stripeConnectCreated) {
      // Recover existing Stripe account ID from project
      const existingProject = await prisma.project.findUnique({
        where: { id: projectId },
        select: { stripeAccountId: true },
      });
      stripeConnectAccountId = existingProject?.stripeAccountId ?? null;
    }

    // ── STEP 12: Provision Clerk app (Platform API) ────────────────────────
    let clerkPublishableKey: string | null = null;
    let clerkSecretKey: string | null = null;
    if (!buildChecklist.clerkAppCreated && isPlatformApiAvailable()) {
      try {
        appendLog("Creating Clerk application via Platform API...");
        await saveProgress();

        const clerkResult = await provisionClerkApp(
          repoName ?? intake.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          intake.targetDomain ?? undefined
        );

        if (clerkResult) {
          clerkPublishableKey = clerkResult.publishableKey;
          clerkSecretKey = clerkResult.secretKey;

          await logCost(projectId, {
            service: "clerk",
            amountCents: 0, // Clerk app creation is free
            description: "Clerk application created via Platform API",
            metadata: {
              applicationId: clerkResult.applicationId,
              instanceCount: clerkResult.allInstances.length,
            },
          });

          buildChecklist.clerkAppCreated = true;
          appendLog(
            `Clerk app created: ${clerkResult.applicationId} — ${clerkResult.allInstances.length} instances (dev + prod)`
          );
          await saveProgress();
        }
      } catch (clerkErr) {
        appendLog(
          `Clerk Platform API error (non-fatal): ${(clerkErr as Error).message} — will fall back to manual setup`
        );
        await saveProgress();
      }
    }

    // ── STEP 13: Set auto env vars (per-client + generated secrets) ────────
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

          // Clerk — auto-provisioned keys if Platform API available
          ...(clerkPublishableKey && clerkSecretKey ? {
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: clerkPublishableKey,
            CLERK_SECRET_KEY: clerkSecretKey,
          } : {}),

          // Clerk redirect URLs (standard)
          NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
          NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
          NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: "/client-portal",
          NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: "/client-portal",

          // Cron auth — unique per client
          CRON_SECRET: cronSecret,

          // AI keys — Anthropic is shared (no programmatic key creation API).
          ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
          GEMINI_API_KEY: process.env.GEMINI_API_KEY,

          // Email — dedicated per-client key when available
          RESEND_API_KEY: resendApiKey,
          RESEND_FROM_EMAIL: BRAND_EMAIL,

          // Error monitoring — dedicated per-client Sentry project when available
          ...(sentryDsn ? {
            SENTRY_DSN: sentryDsn,
            NEXT_PUBLIC_SENTRY_DSN: sentryDsn,
          } : {}),

          // Stripe Connect — set connected account ID + platform fee if provisioned
          ...(stripeConnectAccountId ? {
            STRIPE_CONNECT_ACCOUNT_ID: stripeConnectAccountId,
            PLATFORM_FEE_PERCENT: "2.5",
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

    // ── STEP 14: Set placeholder env vars (admin fills after Clerk setup; Stripe only if Connect failed)
    if (!buildChecklist.envVarsPlaceholderSet && vercelProjectId && process.env.WS_VERCEL_TOKEN) {
      try {
        const placeholders: Record<string, string> = {};

        // Only add Clerk placeholders if NOT auto-provisioned via Platform API
        if (!clerkPublishableKey) {
          placeholders.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "PENDING_CLERK_SETUP";
          placeholders.CLERK_SECRET_KEY = "PENDING_CLERK_SETUP";
        }
        // Webhook secret always needs manual setup (even with Platform API)
        placeholders.CLERK_WEBHOOK_SECRET = "PENDING_CLERK_WEBHOOK";

        // Only add Stripe placeholders if Connect was NOT successfully provisioned
        if (!stripeConnectAccountId) {
          placeholders.STRIPE_SECRET_KEY = "PENDING_CLIENT_STRIPE";
          placeholders.STRIPE_WEBHOOK_SECRET = "PENDING_CLIENT_STRIPE";
        }

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
        const envVarStatus: Record<string, string> = {
          DATABASE_URL: "configured",
          DATABASE_URL_UNPOOLED: "configured",
          UPSTASH_REDIS_REST_URL: "configured",
          UPSTASH_REDIS_REST_TOKEN: "configured",
          CRON_SECRET: "configured",
          ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? "configured-shared" : "missing",
          GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "configured-shared" : "missing",
          RESEND_API_KEY: resendKeyId ? "configured-dedicated" : (process.env.RESEND_API_KEY ? "configured-shared" : "missing"),
          SENTRY_DSN: sentryDsn ? "configured-dedicated" : "not-configured",
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: clerkPublishableKey ? "configured" : "pending",
          CLERK_SECRET_KEY: clerkSecretKey ? "configured" : "pending",
          CLERK_WEBHOOK_SECRET: "pending",
          ...(stripeConnectAccountId ? {
            STRIPE_CONNECT_ACCOUNT_ID: "configured",
            PLATFORM_FEE_PERCENT: "configured",
          } : {
            STRIPE_SECRET_KEY: "pending",
            STRIPE_WEBHOOK_SECRET: "pending",
          }),
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

    // ── STEP 15: Trigger first Vercel deployment ──────────────────────────
    let deploymentId = project.deploymentId;
    if (
      !buildChecklist.deploymentTriggered &&
      vercelProjectId &&
      repoName &&
      buildChecklist.filesCommitted &&
      process.env.WS_VERCEL_TOKEN
    ) {
      try {
        const deployment = await triggerDeployment(vercelProjectId, `${portalConfig.githubOwner}/${repoName}`);
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

    // ── STEP 16: Mark storage fully provisioned + update status ────────────
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
      !buildChecklist.clerkAppCreated && "Create Clerk app → set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY",
      "Configure Clerk webhook → set CLERK_WEBHOOK_SECRET",
      !buildChecklist.stripeConnectCreated && "Get client Stripe keys → set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET",
      buildChecklist.stripeConnectCreated && "Client needs to complete Stripe Connect onboarding (link emailed)",
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
      { error: "Internal server error", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
