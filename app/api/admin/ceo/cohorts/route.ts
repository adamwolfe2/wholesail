import { NextResponse } from "next/server";
import { requireAdminOrRep } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";

// GET /api/admin/ceo/cohorts
// Returns new client cohort data for last 6 months with 30-day retention rates
export async function GET() {
  const { error } = await requireAdminOrRep();
  if (error) return error;

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

  try {
    // Build 6 months of cohort data, oldest first
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const thirtyDaysAfterMonthStart = new Date(monthStart);
      thirtyDaysAfterMonthStart.setDate(thirtyDaysAfterMonthStart.getDate() + 30);

      // Count orgs created in this month
      const newOrgs = await prisma.organization.findMany({
        where: {
          createdAt: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
        select: { id: true, createdAt: true },
      });

      const newClientCount = newOrgs.length;
      let retained30d = 0;

      if (newClientCount > 0) {
        const orgIds = newOrgs.map((o) => o.id);

        // Count how many placed at least 1 order in the 30 days after they joined
        const retainedOrgs = await Promise.all(
          newOrgs.map(async (org) => {
            const windowEnd = new Date(org.createdAt);
            windowEnd.setDate(windowEnd.getDate() + 30);
            const count = await prisma.order.count({
              where: {
                organizationId: org.id,
                status: { not: "CANCELLED" },
                createdAt: {
                  gte: org.createdAt,
                  lte: windowEnd,
                },
              },
            });
            return count > 0;
          })
        );

        retained30d = retainedOrgs.filter(Boolean).length;

        // Suppress the unused variable warning
        void orgIds;
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
  } catch {
    // Return empty data on error
    return NextResponse.json([]);
  }

  return NextResponse.json(results);
}
