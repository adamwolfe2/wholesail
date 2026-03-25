import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  FileText,
  TrendingDown,
  Minus,
  Download,
} from "lucide-react";
import { CeoCharts } from "./ceo-charts";
import { CohortChart } from "./cohort-chart";
import { ProductTrends } from "./product-trends";

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
      // Total revenue all time
      prisma.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
      // Revenue this month
      prisma.order.aggregate({
        where: {
          status: { not: "CANCELLED" },
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      // Active clients (all orgs)
      prisma.organization.count(),
      // Orders this month
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      // YTD revenue (current year)
      prisma.order.aggregate({
        where: {
          status: { not: "CANCELLED" },
          createdAt: { gte: startOfYear },
        },
        _sum: { total: true },
      }),
      // Same period last year
      prisma.order.aggregate({
        where: {
          status: { not: "CANCELLED" },
          createdAt: { gte: startOfLastYear, lte: samePointLastYear },
        },
        _sum: { total: true },
      }),
      // Outstanding AR: sum of PENDING + OVERDUE invoices
      prisma.invoice.aggregate({
        where: { status: { in: ["PENDING", "OVERDUE"] } },
        _sum: { total: true },
      }),
      // Top 10 clients by LTV — group by org
      prisma.order.groupBy({
        by: ["organizationId"],
        where: { status: { not: "CANCELLED" } },
        _sum: { total: true },
        _count: { id: true },
        orderBy: { _sum: { total: "desc" } },
        take: 10,
      }),
      // Product velocity: top 10 products by qty ordered in last 90 days
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
      // Last 12 months orders for revenue trend
      prisma.order.findMany({
        where: {
          status: { not: "CANCELLED" },
          createdAt: { gte: twelveMonthsAgo },
        },
        select: { total: true, createdAt: true },
      }),
      // Last 90 days orders for forecast calculation
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
    // Compute rolling windows from the 90-day order set
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

    // Trend: >5% difference is considered directional
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
    const productIds = velocityItems.map((v) => v.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, category: true },
    });
    const productCategoryMap = new Map(products.map((p) => [p.id, p.category]));

    productVelocity = velocityItems.map((v) => ({
      productId: v.productId,
      name: v.name,
      category: productCategoryMap.get(v.productId) || "—",
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

    const allProductIds = catGroups.map((g) => g.productId);
    const allProducts = await prisma.product.findMany({
      where: { id: { in: allProductIds } },
      select: { id: true, category: true },
    });
    const allProductCatMap = new Map(
      allProducts.map((p) => [p.id, p.category])
    );

    const catRevenueMap = new Map<string, number>();
    for (const g of catGroups) {
      const cat = allProductCatMap.get(g.productId) ?? "Uncategorized";
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
      {/* ── Page Header ──────────────────────────────────────────────────── */}
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

      {/* ── KPI Row ──────────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        {/* Total Revenue */}
        <div className="xl:col-span-1">
          <Card className="border-shell bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-sand" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-ink">
                $
                {kpis.totalRevenue.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
              <p className="text-xs text-ink/40 mt-1">
                Cumulative all-time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* YTD vs Last Year */}
        <div className="xl:col-span-1">
          <Card className="border-shell bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                YTD Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-sand" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-ink">
                $
                {kpis.ytdRevenue.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
              {ytdChangePercent !== null ? (
                <p
                  className={`text-xs mt-1 font-medium ${
                    ytdChangePercent >= 0 ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {ytdChangePercent >= 0 ? "+" : ""}
                  {ytdChangePercent.toFixed(1)}% vs last year
                </p>
              ) : (
                <p className="text-xs text-ink/40 mt-1">
                  $
                  {kpis.ytdRevenueLastYear.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  last year
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* MRR (Revenue This Month) */}
        <div className="xl:col-span-1">
          <Card className="border-shell bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                Revenue This Month
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-sand" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-ink">
                $
                {kpis.revenueThisMonth.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
              <p className="text-xs text-ink/40 mt-1">Month to date</p>
            </CardContent>
          </Card>
        </div>

        {/* Outstanding AR */}
        <div className="xl:col-span-1">
          <Card className="border-shell bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                Outstanding AR
              </CardTitle>
              <FileText className="h-4 w-4 text-sand" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-ink">
                $
                {kpis.outstandingAR.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
              <p className="text-xs text-ink/40 mt-1">
                Pending + overdue invoices
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Clients */}
        <div className="xl:col-span-1">
          <Card className="border-shell bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                Active Clients
              </CardTitle>
              <Users className="h-4 w-4 text-sand" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-ink">
                {kpis.activeClients}
              </div>
              <p className="text-xs text-ink/40 mt-1">
                Active organizations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Orders This Month */}
        <div className="xl:col-span-1">
          <Card className="border-shell bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                Orders This Month
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-sand" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-ink">
                {kpis.ordersThisMonth}
              </div>
              <p className="text-xs text-ink/40 mt-1">Month to date</p>
            </CardContent>
          </Card>
        </div>

        {/* Next 30 Days Forecast */}
        <div className="xl:col-span-1">
          <Card className="border-shell bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                30-Day Forecast
              </CardTitle>
              {forecast.trendDirection === "up" ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : forecast.trendDirection === "down" ? (
                <TrendingDown className="h-4 w-4 text-red-400" />
              ) : (
                <Minus className="h-4 w-4 text-sand" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-ink">
                $
                {forecast.forecastAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
              <p className={`text-xs mt-1 font-medium ${trendColor}`}>
                {trendIcon} {trendLabel}
              </p>
              <p className="text-[10px] text-ink/30 mt-0.5">
                Based on last 90 days
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Second KPI Row: Net Revenue Retention ────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-shell bg-cream">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
              Net Revenue Retention
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-sand" />
          </CardHeader>
          <CardContent>
            {nrrPct !== null ? (
              <>
                <div
                  className={`text-3xl font-bold font-serif ${
                    nrrPct >= 100
                      ? "text-emerald-600"
                      : nrrPct >= 75
                        ? "text-ink"
                        : "text-red-500"
                  }`}
                >
                  {nrrPct}%
                </div>
                <p className="text-xs text-ink/40 mt-1">
                  Existing client spend vs last month
                </p>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold font-serif text-ink/30">
                  —
                </div>
                <p className="text-xs text-ink/40 mt-1">
                  No prior month data yet
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Charts (client component) ────────────────────────────────────── */}
      <CeoCharts
        monthlyRevenue={monthlyRevenue}
        categoryRevenue={categoryRevenue}
      />

      {/* ── Top 10 Clients + Churn Risk (side-by-side on large screens) ─── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top 10 Clients by LTV */}
        <Card className="border-shell bg-cream">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-lg text-ink">
              Top 10 Clients by Lifetime Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topClients.length === 0 ? (
              <p className="text-sm text-ink/40">
                No client order data yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-shell">
                      <th className="text-left py-2 pr-3 text-xs font-medium text-ink/50 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="text-right py-2 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider hidden sm:table-cell">
                        Orders
                      </th>
                      <th className="text-right py-2 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="text-right py-2 pl-2 text-xs font-medium text-ink/50 uppercase tracking-wider hidden md:table-cell">
                        Last Order
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topClients.map((client, idx) => (
                      <tr
                        key={client.id}
                        className="border-b border-shell last:border-0 hover:bg-ink/[0.02] transition-colors"
                      >
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-sand font-mono w-4">
                              {idx + 1}
                            </span>
                            <Link
                              href={`/admin/clients/${client.id}`}
                              className="font-medium text-ink hover:underline truncate max-w-[120px]"
                            >
                              {client.name}
                            </Link>
                          </div>
                        </td>
                        <td className="text-right py-2.5 px-2 font-mono text-ink hidden sm:table-cell">
                          {client.totalOrders}
                        </td>
                        <td className="text-right py-2.5 px-2 font-mono font-bold text-ink">
                          $
                          {client.totalSpent.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="text-right py-2.5 pl-2 text-ink/50 text-xs hidden md:table-cell">
                          {client.lastOrderDate
                            ? format(client.lastOrderDate, "MMM d")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Churn Risk: clients who haven't ordered in 60+ days */}
        <Card className="border-shell bg-cream">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <CardTitle className="font-serif text-lg text-ink">
                Churn Risk
              </CardTitle>
            </div>
            <p className="text-xs text-ink/50 mt-1">
              Clients with no orders in 60+ days
            </p>
          </CardHeader>
          <CardContent>
            {churnRiskClients.length === 0 ? (
              <p className="text-sm text-ink/40 py-4 text-center">
                All clients have ordered recently.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-shell">
                      <th className="text-left py-2 pr-3 text-xs font-medium text-ink/50 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="text-right py-2 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider">
                        Days Idle
                      </th>
                      <th className="text-right py-2 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider hidden sm:table-cell">
                        Last Order
                      </th>
                      <th className="text-right py-2 pl-2 text-xs font-medium text-ink/50 uppercase tracking-wider hidden sm:table-cell">
                        LTV
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {churnRiskClients.map((client) => (
                      <tr
                        key={client.id}
                        className="border-b border-shell last:border-0 hover:bg-ink/[0.02] transition-colors"
                      >
                        <td className="py-2.5 pr-3">
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="font-medium text-ink hover:underline truncate max-w-[130px] block"
                          >
                            {client.name}
                          </Link>
                        </td>
                        <td className="text-right py-2.5 px-2">
                          <span
                            className={`font-mono text-xs font-bold ${
                              client.daysSinceOrder >= 90
                                ? "text-red-500"
                                : "text-amber-500"
                            }`}
                          >
                            {client.daysSinceOrder}d
                          </span>
                        </td>
                        <td className="text-right py-2.5 px-2 text-ink/50 text-xs hidden sm:table-cell">
                          {format(client.lastOrderDate, "MMM d, yyyy")}
                        </td>
                        <td className="text-right py-2.5 pl-2 font-mono text-xs text-ink hidden sm:table-cell">
                          $
                          {client.totalSpent.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Product Velocity ─────────────────────────────────────────────── */}
      <Card className="border-shell bg-cream">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-lg text-ink">
            Product Velocity — Top 10 (Last 90 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productVelocity.length === 0 ? (
            <p className="text-sm text-ink/40">
              No product order data yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-shell">
                    <th className="text-left py-2 pr-4 text-xs font-medium text-ink/50 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-ink/50 uppercase tracking-wider hidden sm:table-cell">
                      Category
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-ink/50 uppercase tracking-wider">
                      Qty Ordered
                    </th>
                    <th className="text-right py-2 pl-3 text-xs font-medium text-ink/50 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productVelocity.map((item, idx) => (
                    <tr
                      key={item.productId}
                      className="border-b border-shell last:border-0 hover:bg-ink/[0.02] transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-sand font-mono w-5">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-ink">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-ink/60 text-xs hidden sm:table-cell">
                        {item.category}
                      </td>
                      <td className="text-right py-3 px-3 font-mono font-bold text-ink">
                        {item.totalQty.toLocaleString()}
                      </td>
                      <td className="text-right py-3 pl-3 font-mono text-ink">
                        $
                        {item.totalRevenue.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Growth Intelligence ──────────────────────────────────────────── */}
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
