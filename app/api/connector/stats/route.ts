/**
 * AM Collective connector endpoint — read-only stats for the master CRM dashboard.
 * Protected by WHOLESAIL_CONNECTOR_SECRET header.
 *
 * Poll from AM Collective: GET https://wholesailhub.com/api/connector/stats
 * Header: x-connector-secret: <WHOLESAIL_CONNECTOR_SECRET>
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-connector-secret");
  if (!secret || secret !== process.env.WHOLESAIL_CONNECTOR_SECRET?.trim()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // All counts/aggregates via DB — no in-memory loops over full tables
  const [
    intakePending,
    intakeScoping,
    intakeConverted,
    intakeArchived,
    intakeTotal,
    projectsByStatus,
    contractValueAgg,
    mrrAgg,
    costsAllTime,
    costsMtd,
    costsByService,
    recentIntakes,
    recentProjects,
    unreadMessages,
  ] = await Promise.all([
    // Intakes: pending (not reviewed, not archived, no project)
    prisma.intakeSubmission.count({
      where: { reviewedAt: null, archivedAt: null, project: { is: null } },
    }),
    // Intakes: scoping (reviewed, no project)
    prisma.intakeSubmission.count({
      where: { reviewedAt: { not: null }, archivedAt: null, project: { is: null } },
    }),
    // Intakes: converted (has project)
    prisma.intakeSubmission.count({ where: { project: { isNot: null } } }),
    // Intakes: archived
    prisma.intakeSubmission.count({ where: { archivedAt: { not: null } } }),
    // Intakes: total
    prisma.intakeSubmission.count(),
    // Projects grouped by status
    prisma.project.groupBy({ by: ["status"], where: { deletedAt: null }, _count: { id: true } }),
    // Total contract value across all projects
    prisma.project.aggregate({ where: { deletedAt: null }, _sum: { contractValue: true } }),
    // MRR: monthlyRevenue + retainer for LIVE projects
    prisma.project.aggregate({
      where: { status: "LIVE", deletedAt: null },
      _sum: { monthlyRevenue: true, retainer: true },
    }),
    // Build costs: all-time total
    prisma.projectCost.aggregate({ _sum: { amountCents: true } }),
    // Build costs: month-to-date
    prisma.projectCost.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { amountCents: true },
    }),
    // Build costs: grouped by service
    prisma.projectCost.groupBy({ by: ["service"], _sum: { amountCents: true } }),
    // Recent intake activity
    prisma.intakeSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, companyName: true, createdAt: true },
    }),
    // Recent project activity
    prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, company: true, status: true, updatedAt: true },
    }),
    // Unread client messages
    prisma.message.count({ where: { senderRole: "client", readAt: null } }).catch(() => 0),
  ]);

  // Build status map from groupBy result
  const statusMap: Record<string, number> = {};
  for (const row of projectsByStatus) {
    statusMap[row.status] = row._count.id;
  }
  const getCount = (s: string) => statusMap[s] ?? 0;

  const pipeline = {
    new: intakePending,
    scoping: intakeScoping,
    building: getCount("ONBOARDING") + getCount("BUILDING"),
    review: getCount("REVIEW"),
    live: getCount("LIVE"),
    churned: getCount("CHURNED"),
  };

  const activeCount =
    getCount("INQUIRY") + getCount("ONBOARDING") + getCount("BUILDING") + getCount("REVIEW");

  const revenue = {
    totalContractValue: contractValueAgg._sum.contractValue ?? 0,
    totalMrr:
      (mrrAgg._sum.monthlyRevenue ?? 0) + (mrrAgg._sum.retainer ?? 0),
    activeProjectCount: activeCount,
  };

  const buildCosts = {
    totalAllTimeCents: Number(costsAllTime._sum.amountCents ?? 0),
    mtdCents: Number(costsMtd._sum.amountCents ?? 0),
    byService: Object.fromEntries(
      costsByService.map((r) => [r.service, Number(r._sum.amountCents ?? 0)])
    ),
  };

  const activity = [
    ...recentIntakes.map((i) => ({
      type: "intake_submitted" as const,
      id: i.id,
      company: i.companyName,
      ts: i.createdAt.toISOString(),
    })),
    ...recentProjects.map((p) => ({
      type: "project_updated" as const,
      id: p.id,
      company: p.company,
      status: p.status,
      ts: p.updatedAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, 10);

  const totalProjects = Object.values(statusMap).reduce((s, n) => s + n, 0);

  return NextResponse.json({
    ts: new Date().toISOString(),
    pipeline,
    intakes: {
      pending: intakePending,
      reviewed: intakeScoping,
      converted: intakeConverted,
      archived: intakeArchived,
      total: intakeTotal,
    },
    projects: {
      total: totalProjects,
      active: activeCount,
      byStatus: {
        INQUIRY: getCount("INQUIRY"),
        ONBOARDING: getCount("ONBOARDING"),
        BUILDING: getCount("BUILDING"),
        REVIEW: getCount("REVIEW"),
        LIVE: getCount("LIVE"),
        CHURNED: getCount("CHURNED"),
      },
    },
    revenue,
    buildCosts,
    unreadMessages,
    recentActivity: activity,
  });
}
