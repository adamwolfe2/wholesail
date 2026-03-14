import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getProjectCosts } from "@/lib/db/costs";
import { prisma } from "@/lib/db";
import {
  getProjectUsage,
  getProjectIntegrations,
} from "@/lib/build/vercel-api";

const SERVICE_KEYS = [
  "anthropic",
  "tavily",
  "vercel",
  "stripe",
  "resend",
  "sentry",
  "firecrawl",
] as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  // Verify project exists and grab vercelProject ID
  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, vercelProject: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Fetch cost records from DB
  const costs = await getProjectCosts(id);

  // Sum total cents
  const totalCents = costs.reduce(
    (sum, c) => sum + Number(c.amountCents),
    0
  );

  // Build per-service summary
  const summary: Record<string, number> = {};
  for (const key of SERVICE_KEYS) {
    summary[key] = costs
      .filter((c) => c.service.toLowerCase().startsWith(key))
      .reduce((sum, c) => sum + Number(c.amountCents), 0);
  }

  // Fetch live Vercel data if project is linked
  let vercelUsage = null;
  let stores: Array<{ id: string; type: string; name: string }> = [];

  if (project.vercelProject) {
    const [usage, integrations] = await Promise.all([
      getProjectUsage(project.vercelProject),
      getProjectIntegrations(project.vercelProject),
    ]);
    vercelUsage = usage;
    stores = integrations;
  }

  return NextResponse.json({
    projectId: id,
    costs,
    totalCents,
    vercelUsage,
    stores,
    summary,
  });
}
