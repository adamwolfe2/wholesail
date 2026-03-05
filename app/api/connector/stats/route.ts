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
  if (!secret || secret !== process.env.WHOLESAIL_CONNECTOR_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    intakes,
    projects,
    costs,
    recentIntakes,
    recentProjects,
    messages,
  ] = await Promise.all([
    prisma.intakeSubmission.findMany({
      select: {
        id: true,
        companyName: true,
        reviewedAt: true,
        archivedAt: true,
        createdAt: true,
        project: { select: { id: true } },
      },
    }),
    prisma.project.findMany({
      select: {
        id: true,
        company: true,
        status: true,
        contractValue: true,
        retainer: true,
        monthlyRevenue: true,
        startDate: true,
        launchDate: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.projectCost.findMany({
      select: {
        service: true,
        amountCents: true,
        date: true,
      },
    }),
    prisma.intakeSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, companyName: true, createdAt: true },
    }),
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, company: true, status: true, updatedAt: true },
    }),
    prisma.message.count({ where: { senderRole: "client", readAt: null } }).catch(() => 0),
  ]);

  // Pipeline counts
  const pipeline = {
    new: intakes.filter((i) => !i.reviewedAt && !i.archivedAt && !i.project).length,
    scoping: intakes.filter((i) => i.reviewedAt && !i.archivedAt && !i.project).length,
    building: projects.filter((p) => p.status === "ONBOARDING" || p.status === "BUILDING").length,
    review: projects.filter((p) => p.status === "REVIEW").length,
    live: projects.filter((p) => p.status === "LIVE").length,
    churned: projects.filter((p) => p.status === "CHURNED").length,
  };

  // Intake funnel
  const intakeFunnel = {
    pending: intakes.filter((i) => !i.reviewedAt && !i.archivedAt && !i.project).length,
    reviewed: intakes.filter((i) => i.reviewedAt && !i.project).length,
    converted: intakes.filter((i) => !!i.project).length,
    archived: intakes.filter((i) => !!i.archivedAt).length,
    total: intakes.length,
  };

  // Revenue
  const activeProjects = projects.filter((p) => p.status === "LIVE" || p.status === "BUILDING" || p.status === "REVIEW" || p.status === "ONBOARDING");
  const revenue = {
    totalContractValue: projects.reduce((s, p) => s + (p.contractValue ?? 0), 0),
    totalMrr: projects.filter((p) => p.status === "LIVE").reduce((s, p) => s + (p.monthlyRevenue ?? 0) + (p.retainer ?? 0), 0),
    activeProjectCount: activeProjects.length,
  };

  // Build costs
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const buildCosts = {
    totalAllTimeCents: costs.reduce((s, c) => s + c.amountCents, 0),
    mtdCents: costs.filter((c) => new Date(c.date) >= startOfMonth).reduce((s, c) => s + c.amountCents, 0),
    byService: costs.reduce<Record<string, number>>((acc, c) => {
      acc[c.service] = (acc[c.service] ?? 0) + c.amountCents;
      return acc;
    }, {}),
  };

  // Recent activity feed
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

  return NextResponse.json({
    ts: new Date().toISOString(),
    pipeline,
    intakes: intakeFunnel,
    projects: {
      total: projects.length,
      active: activeProjects.length,
      byStatus: {
        INQUIRY: projects.filter((p) => p.status === "INQUIRY").length,
        ONBOARDING: projects.filter((p) => p.status === "ONBOARDING").length,
        BUILDING: projects.filter((p) => p.status === "BUILDING").length,
        REVIEW: projects.filter((p) => p.status === "REVIEW").length,
        LIVE: projects.filter((p) => p.status === "LIVE").length,
        CHURNED: projects.filter((p) => p.status === "CHURNED").length,
      },
    },
    revenue,
    buildCosts,
    unreadMessages: messages,
    recentActivity: activity,
  });
}
