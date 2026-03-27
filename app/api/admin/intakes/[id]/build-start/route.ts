import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getIntakeSubmissionById } from "@/lib/db/intake";
import { convertIntakeToProject } from "@/lib/db/projects";
import { logCost } from "@/lib/db/costs";
import { createRepoFromTemplate } from "@/lib/build/github";
import { runResearchPipeline, estimateResearchCost } from "@/lib/build/research";
import { generateReadme, generateMarketingCopy, type ReadmeInput } from "@/lib/build/readme-generator";
import { triggerDeployment } from "@/lib/build/vercel-api";
import { CONFIG_SKELETON } from "@/lib/build/config-template";
import { portalConfig } from "@/lib/portal-config";
import { prisma } from "@/lib/db";
import { generateConfig } from "@/lib/build/generate-config";
import { commitArtifacts } from "@/lib/build/commit-artifacts";
import { provisionInfrastructure } from "@/lib/build/provision-infrastructure";
import { provisionServices } from "@/lib/build/provision-services";
import { provisionAutoEnvVars, provisionPlaceholderEnvVars } from "@/lib/build/provision-env";

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
    let project = intake.project;
    if (!project) {
      try {
        project = await convertIntakeToProject(intakeId);
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code;
        if (code === "P2002") {
          const fresh = await getIntakeSubmissionById(intakeId);
          if (!fresh?.project) throw err;
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

    // ── STEP 1: Generate portal.config.ts via Claude Haiku ────────────────
    await generateConfig({
      projectId,
      intake,
      buildChecklist,
      generatedConfig: project.generatedConfig,
      appendLog,
      saveProgress,
    });

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
        buildChecklist.researchFailed = true;
        await saveProgress();
      }
    } else {
      const keys = project.serviceKeys as Record<string, unknown> | null;
      if (keys?.research) {
        researchData = keys.research as Record<string, unknown>;
      }
    }

    // ── STEP 3: Generate CLAUDE.md (build instructions) ───────────────────
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
        buildChecklist.readmeFailed = true;
        await saveProgress();
      }
    }

    // ── STEP 4: Create GitHub repo FROM TEMPLATE ──────────────────────────
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

    // ── STEP 5: Commit build artifacts to GitHub ──────────────────────────
    await commitArtifacts({
      projectId,
      repoName: repoName!,
      intakeCompanyName: intake.companyName,
      readmeContent,
      researchData,
      marketingCopyContent,
      buildChecklist,
      appendLog,
      saveProgress,
    });

    // ── STEPS 6-8: Provision Vercel project, Postgres, KV ─────────────────
    const infra = await provisionInfrastructure({
      projectId,
      repoName,
      vercelProject: project.vercelProject,
      neonStoreId: project.neonStoreId,
      upstashStoreId: project.upstashStoreId,
      buildChecklist,
      appendLog,
      saveProgress,
    });

    // ── STEPS 9-12: Provision Sentry, Resend, Stripe Connect, Clerk ──────
    const services = await provisionServices({
      projectId,
      repoName,
      intake,
      buildChecklist,
      appendLog,
      saveProgress,
    });

    // ── STEPS 13-14: Set auto + placeholder env vars ──────────────────────
    const envParams = {
      projectId,
      repoName,
      vercelProjectId: infra.vercelProjectId,
      sentryDsn: services.sentryDsn,
      sentryProjectSlug: services.sentryProjectSlug,
      resendKeyId: services.resendKeyId,
      resendToken: services.resendToken,
      stripeConnectAccountId: services.stripeConnectAccountId,
      clerkPublishableKey: services.clerkPublishableKey,
      clerkSecretKey: services.clerkSecretKey,
      selectedFeatures: intake.selectedFeatures,
      buildChecklist,
      appendLog,
      saveProgress,
    };

    await provisionAutoEnvVars(envParams);
    await provisionPlaceholderEnvVars(envParams);

    // ── STEP 15: Trigger first Vercel deployment ──────────────────────────
    let deploymentId = project.deploymentId;
    if (
      !buildChecklist.deploymentTriggered &&
      infra.vercelProjectId &&
      repoName &&
      buildChecklist.filesCommitted &&
      process.env.WS_VERCEL_TOKEN
    ) {
      try {
        const deployment = await triggerDeployment(infra.vercelProjectId, `${portalConfig.githubOwner}/${repoName}`);
        deploymentId = deployment.deploymentId;

        await logCost(projectId, {
          service: "vercel-build",
          amountCents: 0,
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

    // ── STEP 16: Mark storage fully provisioned + update status ───────────
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
        neonStoreId: infra.neonStoreId,
        upstashStoreId: infra.upstashStoreId,
        deploymentId,
      },
    });

    const finalProject = await prisma.project.findUnique({ where: { id: projectId } });

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
