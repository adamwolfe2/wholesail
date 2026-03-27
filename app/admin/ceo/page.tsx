import type { Metadata } from "next";
import { Download } from "lucide-react";
import { prisma } from "@/lib/db";
import { CeoCharts } from "./ceo-charts";
import { CohortChart } from "./cohort-chart";
import { ProductTrends } from "./product-trends";
import { KpiCards } from "./kpi-cards";
import { TopClientsTable } from "./top-clients-table";
import { ChurnRiskTable } from "./churn-risk-table";
import { ProductVelocityTable } from "./product-velocity-table";

export const metadata: Metadata = { title: "CEO Dashboard" };

export default async function CeoCommandCenter() {
  // ── Date anchors ──────────────────────────────────────────────────────────
  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // YTD: Jan 1 of current year
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  // Same period last year
  const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
  const samePointLastYear = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate(),
    23, 59, 59
  );

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  let kpis = {
    totalRevenue: 0,
    revenueThisMonth: 0,
    activeClients: 0,
    ordersThisMonth: 0,
    ytdRevenue: 0,
    ytdRevenueLastYear: 0,
    outstandingAR: 0,
  };

  // ── Forecast ──────────────────────────────────────────────────────────────
  let forecast = {
    forecastAmount: 0,
    trendDirection: "flat" as "up" | "flat" | "down",
    last30DayAvg: 0,
    prev30DayAvg: 0,
  };

  // ── NRR ───────────────────────────────────────────────────────────────────
  let nrrPct: number | null = null;

  // ── Tables ─────────────────────────────────────────────────────────────────
  let topClients: {
    id: string;
    name: string;
    totalOrders: number;
    totalSpent: number;
    avgOrderValue: number;
    lastOrderDate: Date | null;
  }[] = [];

  let churnRiskClients: {
    id: string;
    name: string;
    lastOrderDate: Date;
    daysSinceOrder: number;
    totalSpent: number;
  }[] = [];

  let productVelocity: {
    productId: string;
    name: string;
    category: string;
    totalQty: number;
    totalRevenue: number;
  }[] = [];

  // ── Charts ─────────────────────────────────────────────────────────────────
  let monthlyRevenue: { month: string; revenue: number }[] = [];
  let categoryRevenue: { category: string; revenue: number }[] = [];

  try {
    const [
      allTimeRevenue,
      monthRevenue,
      orgCount,
      monthOrders,
      ytdRevenue,
      ytdLastYearRevenue,
      outstandingAR,
      clientOrderGroups,
      velocityItems,
      last12MonthOrders,
      last90DayOrders,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          status: { not: "CANCELLED" },
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      prisma.organization.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.aggregate({
        where: {
          status: { not: "CANCELLED" },
          createdAt: { gte: startOfYear },
        },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          status: { not: "CANCELLED" },
          createdAt: { gte: startOfLastYear, lte: samePointLastYear },
        },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: { status: { in: ["PENDING", "OVERDUE"] } },
        _sum: { total: true },
      }),
      prisma.order.groupBy({
        by: ["organizationId"],
        where: { status: { not: "CANCELLED" } },
        _sum: { total: true },
        _count: { id: true },
        orderBy: { _sum: { total: "desc" } },
        take: 10,
      }),
      prisma.orderItem.groupBy({
        by: ["productId", "name"],
        where: {
          order: {
            status: { not: "CANCELLED" },
            createdAt: { gte: ninetyDaysAgo },
          },
        },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10,
      }),
      prisma.order.findMany({
        where: {
          status: { not: "CANCELLED" },
          createdAt: { gte: twelveMonthsAgo },
        },
        select: { total: true, createdAt: true },
      }),
      prisma.order.findMany({
        where: {
          status: { not: "CANCELLED" },
          createdAt: { gte: ninetyDaysAgo },
        },
        select: { total: true, createdAt: true },
      }),
    ]);

    kpis = {
      totalRevenue: Number(allTimeRevenue._sum.total ?? 0),
      revenueThisMonth: Number(monthRevenue._sum.total ?? 0),
      activeClients: orgCount,
      ordersThisMonth: monthOrders,
      ytdRevenue: Number(ytdRevenue._sum.total ?? 0),
      ytdRevenueLastYear: Number(ytdLastYearRevenue._sum.total ?? 0),
      outstandingAR: Number(outstandingAR._sum.total ?? 0),
    };

    // ── Revenue Forecasting ──────────────────────────────────────────────────
    const last30Revenue = last90DayOrders
      .filter((o) => new Date(o.createdAt) >= thirtyDaysAgo)
      .reduce((sum, o) => sum + Number(o.total), 0);

    const prev30Revenue = last90DayOrders
      .filter(
        (o) =>
          new Date(o.createdAt) >= sixtyDaysAgo &&
          new Date(o.createdAt) < thirtyDaysAgo
      )
      .reduce((sum, o) => sum + Number(o.total), 0);

    const last30DailyAvg = last30Revenue / 30;
    const prev30DailyAvg = prev30Revenue / 30;
    const forecastAmount = Math.round(last30DailyAvg * 30);

    let trendDirection: "up" | "flat" | "down" = "flat";
    if (prev30DailyAvg > 0) {
      const changePct =
        ((last30DailyAvg - prev30DailyAvg) / prev30DailyAvg) * 100;
      if (changePct > 5) trendDirection = "up";
      else if (changePct < -5) trendDirection = "down";
    }

    forecast = {
      forecastAmount,
      trendDirection,
      last30DayAvg: Math.round(last30DailyAvg * 100) / 100,
      prev30DayAvg: Math.round(prev30DailyAvg * 100) / 100,
    };

    // Enrich top clients with org names and last order date
    const orgIds = clientOrderGroups.map((g) => g.organizationId);
    const [orgs, lastOrders] = await Promise.all([
      prisma.organization.findMany({
        where: { id: { in: orgIds } },
        select: { id: true, name: true },
      }),
      prisma.order.findMany({
        where: {
          organizationId: { in: orgIds },
          status: { not: "CANCELLED" },
        },
        orderBy: { createdAt: "desc" },
        select: { organizationId: true, createdAt: true },
        distinct: ["organizationId"],
      }),
    ]);

    const orgMap = new Map(orgs.map((o) => [o.id, o.name]));
    const lastOrderMap = new Map(
      lastOrders.map((o) => [o.organizationId, o.createdAt])
    );

    topClients = clientOrderGroups.map((g) => {
      const totalSpent = Number(g._sum.total ?? 0);
      const totalOrders = g._count.id;
      return {
        id: g.organizationId,
        name: orgMap.get(g.organizationId) || "Unknown",
        totalOrders,
        totalSpent,
        avgOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
        lastOrderDate: lastOrderMap.get(g.organizationId) ?? null,
      };
    });

    // ── Churn risk: clients who haven't ordered in 60+ days ───────────────
    const allActiveOrgGroups = await prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      orderBy: { createdAt: "desc" },
      select: { organizationId: true, createdAt: true },
      distinct: ["organizationId"],
    });

    const churnCandidates = allActiveOrgGroups.filter(
      (o) => new Date(o.createdAt) < sixtyDaysAgo
    );

    if (churnCandidates.length > 0) {
      const churnOrgIds = churnCandidates.map((o) => o.organizationId);

      const [churnOrgs, churnSpend] = await Promise.all([
        prisma.organization.findMany({
          where: { id: { in: churnOrgIds } },
          select: { id: true, name: true },
        }),
        prisma.order.groupBy({
          by: ["organizationId"],
          where: {
            organizationId: { in: churnOrgIds },
            status: { not: "CANCELLED" },
          },
          _sum: { total: true },
        }),
      ]);

      const churnOrgNameMap = new Map(churnOrgs.map((o) => [o.id, o.name]));
      const churnSpendMap = new Map(
        churnSpend.map((s) => [s.organizationId, Number(s._sum.total ?? 0)])
      );

      churnRiskClients = churnCandidates
        .map((o) => {
          const lastDate = new Date(o.createdAt);
          const diffMs = now.getTime() - lastDate.getTime();
          const daysSinceOrder = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          return {
            id: o.organizationId,
            name: churnOrgNameMap.get(o.organizationId) ?? "Unknown",
            lastOrderDate: lastDate,
            daysSinceOrder,
            totalSpent: churnSpendMap.get(o.organizationId) ?? 0,
          };
        })
        .sort((a, b) => b.daysSinceOrder - a.daysSinceOrder)
        .slice(0, 10);
    }

    // ── Net Revenue Retention ─────────────────────────────────────────────
    const lastMonthOrgOrders = await prisma.order.findMany({
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: startOfLastMonth, lt: endOfLastMonth },
      },
      select: { organizationId: true, total: true },
    });

    const lastMonthOrgIds = new Set(
      lastMonthOrgOrders.map((o) => o.organizationId)
    );

    if (lastMonthOrgIds.size > 0) {
      const thisMonthOrgOrders = await prisma.order.findMany({
        where: {
          status: { not: "CANCELLED" },
          organizationId: { in: Array.from(lastMonthOrgIds) },
          createdAt: { gte: startOfMonth },
        },
        select: { total: true },
      });

      const lastMonthRevFromExisting = lastMonthOrgOrders.reduce(
        (sum, o) => sum + Number(o.total),
        0
      );
      const thisMonthRevFromExisting = thisMonthOrgOrders.reduce(
        (sum, o) => sum + Number(o.total),
        0
      );

      if (lastMonthRevFromExisting > 0) {
        nrrPct = Math.round(
          (thisMonthRevFromExisting / lastMonthRevFromExisting) * 100
        );
      }
    }

    // Product velocity: enrich with category
    const productIds = velocityItems.map((v) => v.productId).filter((id): id is string => id !== null);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, category: true },
    });
    const productCategoryMap = new Map(products.map((p) => [p.id, p.category]));

    productVelocity = velocityItems.filter((v) => v.productId !== null).map((v) => ({
      productId: v.productId!,
      name: v.name,
      category: productCategoryMap.get(v.productId!) || "--",
      totalQty: v._sum.quantity ?? 0,
      totalRevenue: Number(v._sum.total ?? 0),
    }));

    // Build monthly revenue (last 12 months)
    const monthLabels = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const monthMap = new Map<string, number>();

    for (const order of last12MonthOrders) {
      const d = new Date(order.createdAt);
      const key = `${monthLabels[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
      monthMap.set(key, (monthMap.get(key) ?? 0) + Number(order.total));
    }

    monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const key = `${monthLabels[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
      monthlyRevenue.push({
        month: monthLabels[d.getMonth()],
        revenue: Math.round(monthMap.get(key) ?? 0),
      });
    }

    // Category revenue breakdown
    const catGroups = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: { status: { not: "CANCELLED" } },
      },
      _sum: { total: true },
    });

    const allProductIds = catGroups.map((g) => g.productId).filter((id): id is string => id !== null);
    const allProducts = await prisma.product.findMany({
      where: { id: { in: allProductIds } },
      select: { id: true, category: true },
    });
    const allProductCatMap = new Map(
      allProducts.map((p) => [p.id, p.category])
    );

    const catRevenueMap = new Map<string, number>();
    for (const g of catGroups) {
      const cat = (g.productId ? allProductCatMap.get(g.productId) : undefined) ?? "Uncategorized";
      catRevenueMap.set(
        cat,
        (catRevenueMap.get(cat) ?? 0) + Number(g._sum.total ?? 0)
      );
    }

    categoryRevenue = Array.from(catRevenueMap.entries())
      .map(([category, revenue]) => ({
        category,
        revenue: Math.round(revenue),
      }))
      .sort((a, b) => b.revenue - a.revenue);
  } catch {
    // DB may be empty — fallback to zero-state
  }

  // Compute YTD change %
  const ytdChangePercent =
    kpis.ytdRevenueLastYear > 0
      ? ((kpis.ytdRevenue - kpis.ytdRevenueLastYear) /
          kpis.ytdRevenueLastYear) *
        100
      : null;

  // Forecast trend display helpers
  const trendIcon =
    forecast.trendDirection === "up"
      ? "▲"
      : forecast.trendDirection === "down"
        ? "▼"
        : "→";
  const trendColor =
    forecast.trendDirection === "up"
      ? "text-emerald-600"
      : forecast.trendDirection === "down"
        ? "text-red-500"
        : "text-ink/50";
  const trendLabel =
    forecast.trendDirection === "up"
      ? "Trending up"
      : forecast.trendDirection === "down"
        ? "Trending down"
        : "Flat trend";

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
          CEO Command Center
        </h2>
        <a
          href="/api/admin/ceo/export"
          download
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-shell bg-cream text-ink hover:bg-ink hover:text-cream transition-colors"
        >
          <Download className="h-4 w-4" />
          Export Summary
        </a>
      </div>

      <KpiCards
        kpis={kpis}
        forecast={forecast}
        ytdChangePercent={ytdChangePercent}
        nrrPct={nrrPct}
        trendIcon={trendIcon}
        trendColor={trendColor}
        trendLabel={trendLabel}
      />

      <CeoCharts
        monthlyRevenue={monthlyRevenue}
        categoryRevenue={categoryRevenue}
      />

      {/* Top 10 Clients + Churn Risk (side-by-side on large screens) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopClientsTable clients={topClients} />
        <ChurnRiskTable clients={churnRiskClients} />
      </div>

      <ProductVelocityTable items={productVelocity} />

      {/* Growth Intelligence */}
      <div>
        <h3 className="font-serif text-xl font-bold text-ink mb-4">
          Growth Intelligence
        </h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <CohortChart />
          <ProductTrends />
        </div>
      </div>
    </div>
  );
}
