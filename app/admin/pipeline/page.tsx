import { prisma } from "@/lib/db";
import { PipelineBoard, type PipelineColumn } from "@/components/pipeline-board";
import type { PipelineItem } from "@/components/pipeline-card";
import { Kanban } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPipelinePage() {
  const [intakes, projects] = await Promise.all([
    prisma.intakeSubmission.findMany({
      where: { archivedAt: null },
      include: {
        project: { select: { id: true, status: true, vercelUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    prisma.project.findMany({
      where: { status: { not: "CHURNED" } },
      select: {
        id: true,
        company: true,
        industry: true,
        status: true,
        currentPhase: true,
        vercelUrl: true,
        customDomain: true,
        githubRepo: true,
        buildChecklist: true,
        enabledFeatures: true,
        contractValue: true,
        createdAt: true,
        updatedAt: true,
        intake: { select: { id: true } },
        costs: { select: { amountCents: true } },
      },
      orderBy: { updatedAt: "desc" },
    }).catch(() => []),
  ]);

  // ── Build PipelineItem lists per column ────────────────────────────────────

  const newItems: PipelineItem[] = intakes
    .filter((i) => !i.reviewedAt && !i.project)
    .map((i) => ({
      id: i.id,
      column: "new",
      company: i.companyName,
      industry: i.industry,
      createdAt: i.createdAt.toISOString(),
      intakeId: i.id,
      nextAction: "Review intake",
    }));

  const scopingItems: PipelineItem[] = intakes
    .filter((i) => i.reviewedAt && !i.project)
    .map((i) => ({
      id: i.id,
      column: "scoping",
      company: i.companyName,
      industry: i.industry,
      createdAt: i.createdAt.toISOString(),
      intakeId: i.id,
      reviewedAt: i.reviewedAt?.toISOString() ?? null,
      nextAction: "Convert to project",
    }));

  // Intakes that have a project but are in ONBOARDING/BUILDING
  function totalSpent(p: { costs: { amountCents: number }[] }): number {
    return p.costs.reduce((s, c) => s + c.amountCents, 0);
  }

  function getBuildingNextAction(checklist: Record<string, boolean> | null): string {
    if (!checklist?.configGenerated) return "Generate config";
    if (!checklist?.githubRepoCreated) return "Start build";
    if (!checklist?.clerkSetup) return "Set up Clerk";
    if (!checklist?.stripeConfigured) return "Configure Stripe";
    return "In progress";
  }

  const buildingItems: PipelineItem[] = projects
    .filter((p) => p.status === "ONBOARDING" || p.status === "BUILDING")
    .map((p) => {
      const checklist =
        p.buildChecklist && typeof p.buildChecklist === "object"
          ? (p.buildChecklist as Record<string, boolean>)
          : null;
      return {
        id: p.id,
        column: "building",
        company: p.company,
        industry: p.industry,
        createdAt: p.createdAt.toISOString(),
        intakeId: p.intake?.id,
        projectId: p.id,
        projectStatus: p.status,
        currentPhase: p.currentPhase,
        enabledFeatures: p.enabledFeatures,
        githubRepo: p.githubRepo,
        vercelUrl: p.vercelUrl,
        buildChecklist: checklist,
        contractValue: p.contractValue,
        totalSpentCents: totalSpent(p),
        nextAction: getBuildingNextAction(checklist),
      };
    })
    // Sort at-risk (>85% budget) to top
    .sort((a, b) => {
      const aPct = a.contractValue ? (a.totalSpentCents ?? 0) / 100 / a.contractValue : 0;
      const bPct = b.contractValue ? (b.totalSpentCents ?? 0) / 100 / b.contractValue : 0;
      return bPct - aPct;
    });

  const reviewItems: PipelineItem[] = projects
    .filter((p) => p.status === "REVIEW")
    .map((p) => ({
      id: p.id,
      column: "review",
      company: p.company,
      industry: p.industry,
      createdAt: p.createdAt.toISOString(),
      intakeId: p.intake?.id,
      projectId: p.id,
      currentPhase: p.currentPhase,
      enabledFeatures: p.enabledFeatures,
      vercelUrl: p.vercelUrl,
      contractValue: p.contractValue,
      totalSpentCents: totalSpent(p),
      nextAction: "Internal review pending",
    }));

  const stagingItems: PipelineItem[] = projects
    .filter(
      (p) =>
        p.vercelUrl &&
        p.status !== "REVIEW" &&
        p.status !== "LIVE" &&
        p.status !== "CHURNED" &&
        p.status !== "ONBOARDING" &&
        p.status !== "BUILDING"
    )
    .map((p) => ({
      id: p.id,
      column: "staging",
      company: p.company,
      industry: p.industry,
      createdAt: p.createdAt.toISOString(),
      intakeId: p.intake?.id,
      projectId: p.id,
      currentPhase: p.currentPhase,
      enabledFeatures: p.enabledFeatures,
      vercelUrl: p.vercelUrl,
      customDomain: p.customDomain,
      contractValue: p.contractValue,
      totalSpentCents: totalSpent(p),
      nextAction: "Connect domain",
    }));

  const liveItems: PipelineItem[] = projects
    .filter((p) => p.status === "LIVE")
    .map((p) => ({
      id: p.id,
      column: "live",
      company: p.company,
      industry: p.industry,
      createdAt: p.createdAt.toISOString(),
      intakeId: p.intake?.id,
      projectId: p.id,
      currentPhase: p.currentPhase,
      enabledFeatures: p.enabledFeatures,
      vercelUrl: p.vercelUrl,
      customDomain: p.customDomain,
      contractValue: p.contractValue,
      totalSpentCents: totalSpent(p),
      nextAction: "Live",
    }));

  const columns: PipelineColumn[] = [
    { id: "new", label: "New", items: newItems },
    { id: "scoping", label: "Scoping", items: scopingItems },
    { id: "building", label: "Building", items: buildingItems },
    { id: "review", label: "Internal Review", items: reviewItems },
    { id: "staging", label: "Staging", items: stagingItems },
    { id: "live", label: "Live", items: liveItems },
  ];

  const totalActive =
    buildingItems.length + reviewItems.length + stagingItems.length;

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-normal flex items-center gap-3">
            <Kanban className="h-7 w-7 text-[#C8C0B4]" />
            Build Pipeline
          </h2>
          <p className="text-sm text-[#0A0A0A]/50 mt-1 font-mono">
            {totalActive} active build{totalActive !== 1 ? "s" : ""} &middot;{" "}
            {newItems.length} new intake{newItems.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 md:-mx-6 px-4 md:px-6 pb-4">
        <div className="min-w-[900px]">
          <PipelineBoard columns={columns} />
        </div>
      </div>
    </div>
  );
}
