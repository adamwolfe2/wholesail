import { NextResponse } from "next/server";
import { requireAdminOrRep } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

const getCohortData = unstable_cache(
  async () => {
    const now = new Date();
    const monthLabels = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const results: {
      month: string;
      newClients: number;
      retained30d: number;
      retentionPct: number;
    }[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const newOrgs = await prisma.organization.findMany({
        where: { createdAt: { gte: monthStart, lt: monthEnd } },
        select: { id: true, createdAt: true },
        take: 1000,
      });

      const newClientCount = newOrgs.length;
      let retained30d = 0;

      if (newClientCount > 0) {
        const orgIds = newOrgs.map((o) => o.id);

        type RetainedRow = { organizationId: string }
        const retained = await prisma.$queryRaw<RetainedRow[]>`
          SELECT DISTINCT ord."organizationId"
          FROM "Order" ord
          INNER JOIN "Organization" org ON org.id = ord."organizationId"
          WHERE ord."organizationId" = ANY(${orgIds}::text[])
            AND ord.status != 'CANCELLED'
            AND ord."createdAt" >= org."createdAt"
            AND ord."createdAt" <= org."createdAt" + INTERVAL '30 days'
        `;
        retained30d = retained.length;
      }

      const label = `${monthLabels[monthStart.getMonth()]} '${String(monthStart.getFullYear()).slice(2)}`;
      results.push({
        month: label,
        newClients: newClientCount,
        retained30d,
        retentionPct:
          newClientCount > 0
            ? Math.round((retained30d / newClientCount) * 100)
            : 0,
      });
    }

    return results;
  },
  ["admin-ceo-cohorts"],
  { revalidate: 86400, tags: ["cohorts"] }
);

// GET /api/admin/ceo/cohorts
// Returns new client cohort data for last 6 months with 30-day retention rates
// Cached for 24 hours via unstable_cache.
export async function GET() {
  const { error } = await requireAdminOrRep();
  if (error) return error;

  try {
    const data = await getCohortData();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[admin/ceo/cohorts]", err);
    return NextResponse.json([]);
  }
}
