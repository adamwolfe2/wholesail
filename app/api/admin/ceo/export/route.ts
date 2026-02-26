import { NextResponse } from "next/server";
import { requireAdminOrRep } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";

// GET /api/admin/ceo/export
// Returns a CSV executive summary snapshot
export async function GET() {
  const { error } = await requireAdminOrRep();
  if (error) return error;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
  const samePointLastYear = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate(),
    23, 59, 59
  );
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const [
      totalRevenue,
      ytdRevenue,
      ytdLastYearRevenue,
      mrrRevenue,
      totalOrgs,
      activeOrgsInLast30d,
      outstandingAR,
      allOrders,
      topProductGroup,
      topClientGroup,
    ] = await Promise.all([
      // Total all-time revenue
      prisma.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
      // YTD revenue
      prisma.order.aggregate({
        where: {
          status: { not: "CANCELLED" },
          createdAt: { gte: startOfYear },
        },
        _sum: { total: true },
      }),
      // YTD last year (same period)
      prisma.order.aggregate({
        where: {
          status: { not: "CANCELLED" },
          createdAt: { gte: startOfLastYear, lte: samePointLastYear },
        },
        _sum: { total: true },
      }),
      // MRR (this month)
      prisma.order.aggregate({
        where: {
          status: { not: "CANCELLED" },
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      // Total organizations
      prisma.organization.count(),
      // Active orgs (ordered in last 30d)
      prisma.order.findMany({
        where: {
          status: { not: "CANCELLED" },
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { organizationId: true },
        distinct: ["organizationId"],
      }),
      // Outstanding AR
      prisma.invoice.aggregate({
        where: { status: { in: ["PENDING", "OVERDUE"] } },
        _sum: { total: true },
      }),
      // All non-cancelled orders for AOV calculation
      prisma.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { total: true },
        _count: { id: true },
      }),
      // Top product by revenue all-time
      prisma.orderItem.groupBy({
        by: ["name"],
        where: {
          order: { status: { not: "CANCELLED" } },
        },
        _sum: { total: true },
        orderBy: { _sum: { total: "desc" } },
        take: 1,
      }),
      // Top client by LTV
      prisma.order.groupBy({
        by: ["organizationId"],
        where: { status: { not: "CANCELLED" } },
        _sum: { total: true },
        orderBy: { _sum: { total: "desc" } },
        take: 1,
      }),
    ]);

    // Compute derived metrics
    const totalRev = Number(totalRevenue._sum.total ?? 0);
    const ytdRev = Number(ytdRevenue._sum.total ?? 0);
    const ytdLastYearRev = Number(ytdLastYearRevenue._sum.total ?? 0);
    const ytdChangeStr =
      ytdLastYearRev > 0
        ? `${(((ytdRev - ytdLastYearRev) / ytdLastYearRev) * 100).toFixed(1)}%`
        : "N/A";
    const mrr = Number(mrrRevenue._sum.total ?? 0);
    const totalOrderCount = allOrders._count.id;
    const aov =
      totalOrderCount > 0
        ? Number(allOrders._sum.total ?? 0) / totalOrderCount
        : 0;
    const activeClientCount = activeOrgsInLast30d.length;
    const outstandingARVal = Number(outstandingAR._sum.total ?? 0);

    // Resolve top product name
    const topProductName =
      topProductGroup.length > 0 ? topProductGroup[0].name : "N/A";

    // Resolve top client name
    let topClientName = "N/A";
    if (topClientGroup.length > 0) {
      const org = await prisma.organization.findUnique({
        where: { id: topClientGroup[0].organizationId },
        select: { name: true },
      });
      topClientName = org?.name ?? "N/A";
    }

    // Revenue from existing clients last month vs this month (Net Revenue Retention)
    const lastMonthOrgOrders = await prisma.order.findMany({
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: startOfLastMonth, lt: endOfLastMonth },
      },
      select: { organizationId: true, total: true },
    });

    const lastMonthOrgIds = new Set(lastMonthOrgOrders.map((o) => o.organizationId));

    const thisMonthOrgOrders = await prisma.order.findMany({
      where: {
        status: { not: "CANCELLED" },
        organizationId: { in: Array.from(lastMonthOrgIds) },
        createdAt: { gte: startOfMonth },
      },
      select: { organizationId: true, total: true },
    });

    const lastMonthRevFromExisting = lastMonthOrgOrders
      .filter((o) => lastMonthOrgIds.has(o.organizationId))
      .reduce((sum, o) => sum + Number(o.total), 0);

    const thisMonthRevFromExisting = thisMonthOrgOrders.reduce(
      (sum, o) => sum + Number(o.total),
      0
    );

    const nrrStr =
      lastMonthRevFromExisting > 0
        ? `${((thisMonthRevFromExisting / lastMonthRevFromExisting) * 100).toFixed(1)}%`
        : "N/A";

    // Build CSV
    const dateStr = now.toISOString().slice(0, 10);
    const fmt = (v: number) =>
      `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const rows: [string, string, string][] = [
      ["Metric", "Value", "Period"],
      ["Total Revenue", fmt(totalRev), "All time"],
      ["YTD Revenue", fmt(ytdRev), `Jan 1 – ${dateStr}`],
      ["YTD vs Last Year", ytdChangeStr, `Same period comparison`],
      ["MRR (Revenue This Month)", fmt(mrr), `Month to date`],
      ["Total Clients", String(totalOrgs), "All time"],
      ["Active Clients (ordered in 30d)", String(activeClientCount), "Last 30 days"],
      ["Avg Order Value", fmt(aov), "All time"],
      ["Total Outstanding AR", fmt(outstandingARVal), "Pending + overdue invoices"],
      ["Net Revenue Retention", nrrStr, "Last month cohort, this month"],
      ["Top Product by Revenue", topProductName, "All time"],
      ["Top Client by LTV", topClientName, "All time"],
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const escaped = String(cell).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      )
      .join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="tbgc-executive-summary-${dateStr}.csv"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate export" },
      { status: 500 }
    );
  }
}
