import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export const metadata: Metadata = { title: "Project Details" };
import { prisma } from "@/lib/db";
import { getProjectById } from "@/lib/db/projects";
import { getProjectCosts } from "@/lib/db/costs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  GitBranch,
  Globe,
  CheckCircle2,
  Circle,
  AlertCircle,
  DollarSign,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { ProjectActions } from "./project-actions";
import { ProjectTasks } from "./project-tasks";
import { BuildStatusCard } from "./build-status-card";
import { LaunchCountdown } from "./launch-countdown";
import { ProjectAssignee } from "./project-assignee";
import { ProjectCommunications } from "./project-communications";
import { StripeConnectBadge } from "./stripe-connect-badge";
import { ENV_VARS } from "@/lib/client-data";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  INQUIRY: "bg-gray-100 text-gray-700 border-gray-200",
  ONBOARDING: "bg-blue-50 text-blue-700 border-blue-200",
  BUILDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  REVIEW: "bg-purple-50 text-purple-700 border-purple-200",
  LIVE: "bg-green-50 text-green-700 border-green-200",
  CHURNED: "bg-red-50 text-red-700 border-red-200",
};

function EnvVarStatusBadge({ status }: { status: string }) {
  if (status === "configured") {
    return (
      <span className="text-[9px] font-mono text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5">
        configured
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="text-[9px] font-mono text-yellow-700 bg-yellow-50 border border-yellow-200 px-1.5 py-0.5">
        pending
      </span>
    );
  }
  return (
    <span className="text-[9px] font-mono text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 flex items-center gap-0.5">
      <AlertCircle className="h-2.5 w-2.5" /> missing
    </span>
  );
}

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user
    .findUnique({ where: { id: userId }, select: { role: true } })
    .catch(() => null);

  if (!dbUser || !["ADMIN", "OPS"].includes(dbUser.role)) {
    redirect("/");
  }

  const { id } = await params;
  const [project, costs] = await Promise.all([
    getProjectById(id),
    getProjectCosts(id),
  ]);

  if (!project) notFound();

  const checklist =
    project.buildChecklist &&
    typeof project.buildChecklist === "object"
      ? (project.buildChecklist as Record<string, boolean>)
      : {};

  const envVars =
    project.envVars && typeof project.envVars === "object"
      ? (project.envVars as Record<string, string>)
      : {};

  const totalCostCents = costs.reduce((sum, c) => sum + Number(c.amountCents), 0);
  const totalCostDollars = (totalCostCents / 100).toFixed(2);
  const marginPct =
    project.contractValue > 0
      ? Math.round(((project.contractValue * 100 - totalCostCents) / (project.contractValue * 100)) * 100)
      : null;

  const buildLog = project.buildLog ?? [];

  // Serialize tasks for client component
  const serializedTasks = project.tasks.map((t) => ({
    id: t.id,
    label: t.label,
    description: t.description,
    phase: t.phase,
    completed: t.completed,
    completedAt: t.completedAt?.toISOString() ?? null,
    externalUrl: t.externalUrl,
    automationAction: t.automationAction ?? null,
    automationResult: (t.automationResult as Record<string, unknown>) ?? null,
    createdAt: t.createdAt.toISOString(),
  }));

  // QA progress for sidebar
  const qaTasks = project.tasks.filter((t) => t.phase === 4);
  const qaCompleted = qaTasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 max-w-6xl">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/pipeline">Pipeline</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.company}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header with status, assignee, launch countdown, Stripe */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-normal">{project.company}</h2>
          <p className="text-sm text-[#0A0A0A]/50 mt-1 font-mono">
            {project.shortName} &middot; {project.industry}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <ProjectAssignee
              projectId={project.id}
              initialAssignedTo={project.assignedTo}
            />
            <StripeConnectBadge
              projectId={project.id}
              stripeAccountId={project.stripeAccountId}
            />
          </div>
          <LaunchCountdown
            projectId={project.id}
            targetLaunchDate={project.targetLaunchDate?.toISOString() ?? null}
            goLiveTimeline={project.intake?.goLiveTimeline ?? null}
          />
        </div>
        <Badge
          variant="outline"
          className={`text-xs font-mono px-2 py-1 ${STATUS_COLORS[project.status] ?? ""}`}
        >
          {project.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left column — Tasks first (main operator view), then info cards ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Fulfillment Tasks — the main thing an operator sees */}
          <ProjectTasks projectId={project.id} initialTasks={serializedTasks} />

          {/* Build Status Summary */}
          <BuildStatusCard
            buildChecklist={checklist}
            buildLog={buildLog}
            status={project.status}
            intakeId={project.intakeId}
          />

          {/* Communications */}
          <ProjectCommunications
            projectId={project.id}
            contactEmail={project.contactEmail}
          />

          {/* Company & Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg font-normal flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#C8C0B4]" />
                Company &amp; Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[#0A0A0A]/50 text-xs mb-0.5">Company</p>
                  <p className="font-medium">{project.company}</p>
                </div>
                <div>
                  <p className="text-[#0A0A0A]/50 text-xs mb-0.5">Short Name</p>
                  <p className="font-mono font-medium">{project.shortName}</p>
                </div>
                <div>
                  <p className="text-[#0A0A0A]/50 text-xs mb-0.5">Industry</p>
                  <Badge variant="outline" className="text-xs">
                    {project.industry}
                  </Badge>
                </div>
                {project.website && (
                  <div>
                    <p className="text-[#0A0A0A]/50 text-xs mb-0.5 flex items-center gap-1">
                      <Globe className="h-3 w-3" /> Website
                    </p>
                    <a
                      href={
                        project.website.startsWith("http")
                          ? project.website
                          : `https://${project.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-[#0A0A0A] text-xs"
                    >
                      {project.website}
                    </a>
                  </div>
                )}
                {project.intake?.targetDomain && (
                  <div>
                    <p className="text-[#0A0A0A]/50 text-xs mb-0.5">Target Domain</p>
                    <p className="font-mono text-xs">{project.intake.targetDomain}</p>
                  </div>
                )}
              </div>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[#0A0A0A]/50 text-xs mb-0.5 flex items-center gap-1">
                    <User className="h-3 w-3" /> Contact
                  </p>
                  <p className="font-medium text-sm">{project.contactName}</p>
                  {project.contactRole && (
                    <p className="text-xs text-[#0A0A0A]/50">{project.contactRole}</p>
                  )}
                </div>
                <div>
                  <p className="text-[#0A0A0A]/50 text-xs mb-0.5 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </p>
                  <a href={`mailto:${project.contactEmail}`} className="hover:underline text-xs">
                    {project.contactEmail}
                  </a>
                </div>
                {project.contactPhone && (
                  <div>
                    <p className="text-[#0A0A0A]/50 text-xs mb-0.5 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Phone
                    </p>
                    <a href={`tel:${project.contactPhone}`} className="hover:underline text-xs">
                      {project.contactPhone}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Build Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg font-normal flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-[#C8C0B4]" />
                Build Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-[#E5E1DB]">
                  <div
                    className="h-full bg-[#0A0A0A] transition-all"
                    style={{
                      width: `${Math.round((project.currentPhase / 15) * 100)}%`,
                    }}
                  />
                </div>
                <span className="font-mono text-xs text-[#0A0A0A]/60 shrink-0">
                  Phase {project.currentPhase} / 15
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {project.githubRepo && (
                  <a
                    href={`https://github.com/${project.githubRepo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-mono text-[#0A0A0A]/70 hover:text-[#0A0A0A] border border-[#E5E1DB] px-3 py-2"
                  >
                    <GitBranch className="h-3.5 w-3.5" />
                    {project.githubRepo}
                  </a>
                )}
                {project.vercelUrl && (
                  <a
                    href={project.vercelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-mono text-[#0A0A0A]/70 hover:text-[#0A0A0A] border border-[#E5E1DB] px-3 py-2"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Staging URL
                  </a>
                )}
              </div>

              {project.enabledFeatures.length > 0 && (
                <div>
                  <p className="text-[#0A0A0A]/50 text-xs mb-2">
                    Enabled features ({project.enabledFeatures.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {project.enabledFeatures.map((f) => (
                      <Badge
                        key={f}
                        variant="outline"
                        className="text-[10px] bg-neutral-50 border-neutral-200"
                      >
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg font-normal">
                Environment Variables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {ENV_VARS.map((envVar) => {
                  const status = envVars[envVar.key] ?? "missing";
                  return (
                    <div
                      key={envVar.key}
                      className="flex items-center justify-between py-1.5 border-b border-[#E5E1DB] last:border-0"
                    >
                      <div className="min-w-0 flex-1 mr-3">
                        <p className="font-mono text-[10px] text-[#0A0A0A]">
                          {envVar.key}
                        </p>
                        <p className="text-[9px] text-[#0A0A0A]/40">{envVar.label}</p>
                      </div>
                      <EnvVarStatusBadge status={status} />
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] font-mono text-[#0A0A0A]/40 mt-3">
                Click env var rows in the actions panel to update status
              </p>
            </CardContent>
          </Card>

          {/* Build Log */}
          {buildLog.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg font-normal">Build Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {buildLog.map((entry, i) => (
                    <p key={i} className="font-mono text-[10px] text-[#0A0A0A]/70">
                      {entry}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Costs */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg font-normal flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#C8C0B4]" />
                Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {costs.length === 0 ? (
                <p className="text-sm text-[#0A0A0A]/40 font-mono">No costs logged yet.</p>
              ) : (
                <div className="space-y-1">
                  {costs.map((cost) => (
                    <div
                      key={cost.id}
                      className="flex items-center justify-between py-1.5 border-b border-[#E5E1DB] last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs text-[#0A0A0A]">
                          {cost.description}
                        </p>
                        <p className="font-mono text-[9px] text-[#0A0A0A]/40">
                          {cost.service}
                          {cost.tokens ? ` · ${cost.tokens.toLocaleString()} tokens` : ""}
                          {" · "}{new Date(cost.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-mono text-xs text-[#0A0A0A] shrink-0">
                        ${(Number(cost.amountCents) / 100).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  <div className="pt-3 space-y-1">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-[#0A0A0A]/60">Total to date</span>
                      <span className="font-bold">${totalCostDollars}</span>
                    </div>
                    {project.contractValue > 0 && (
                      <>
                        <div className="flex justify-between font-mono text-xs">
                          <span className="text-[#0A0A0A]/60">Contract Value</span>
                          <span>${project.contractValue.toLocaleString()}</span>
                        </div>
                        {marginPct !== null && (
                          <div className="flex justify-between font-mono text-xs">
                            <span className="text-[#0A0A0A]/60">Est. Margin</span>
                            <span className={marginPct >= 90 ? "text-green-700" : "text-yellow-700"}>
                              {marginPct}%
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity notes */}
          {project.notes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg font-normal">Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.notes.map((note) => (
                    <div key={note.id} className="flex gap-3 text-sm">
                      {note.type === "MILESTONE" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      ) : note.type === "UPDATE" ? (
                        <Circle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-[#0A0A0A]/20 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#0A0A0A]">{note.text}</p>
                        <p className="text-[10px] font-mono text-[#0A0A0A]/40 mt-0.5">
                          {new Date(note.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right column — actions + QA progress ───────────────────────────── */}
        <div className="space-y-4">
          <ProjectActions
            projectId={project.id}
            buildChecklist={checklist}
            githubRepo={project.githubRepo}
            vercelUrl={project.vercelUrl}
            customDomain={project.customDomain}
            currentStatus={project.status}
          />

          {/* QA Progress card — shown when in REVIEW or STAGING-adjacent states */}
          {(project.status === "REVIEW" || project.status === "BUILDING") && qaTasks.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#0A0A0A]/40 mb-2">
                  QA Progress
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-[#E5E1DB]">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${qaTasks.length > 0 ? Math.round((qaCompleted / qaTasks.length) * 100) : 0}%`,
                        backgroundColor: qaCompleted === qaTasks.length ? "#16a34a" : "#0A0A0A",
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs text-[#0A0A0A]/60 shrink-0">
                    {qaCompleted}/{qaTasks.length}
                  </span>
                </div>
                <p className="text-[10px] text-[#0A0A0A]/40 mt-1.5 font-mono">
                  {qaCompleted === qaTasks.length
                    ? "All QA checks passed"
                    : `${qaTasks.length - qaCompleted} QA check${qaTasks.length - qaCompleted !== 1 ? "s" : ""} remaining`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
