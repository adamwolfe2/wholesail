import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
} from "lucide-react";
import { AdminCharts } from "./admin-charts";
import { SmartReorderAlerts } from "./smart-reorder-alerts";

export default async function AdminAnalyticsPage() {
  let stats = {
    totalRevenue: 0,
    totalOrders: 0,
    totalClients: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    pendingOrders: 0,
    topCategories: [] as { category: string; count: number }[],
    topCategoryRevenue: [] as { category: string; revenue: number }[],
    monthlyRevenue: [] as { month: string; revenue: number; orders: number }[],
    topClients: [] as { name: string; revenue: number; orders: number }[],
    statusBreakdown: [] as { status: string; count: number }[],
  };

  try {
    const [revenue, orderCount, clientCount, productCount, pendingCount] =
      await Promise.all([
        prisma.order.aggregate({
          where: { status: { not: "CANCELLED" } },
          _sum: { total: true },
        }),
        prisma.order.count(),
        prisma.organization.count(),
        prisma.product.count({ where: { available: true } }),
        prisma.order.count({ where: { status: "PENDING" } }),
      ]);

    const totalRevenue = Number(revenue._sum.total ?? 0);

    // Product counts by category
    const categoryGroups = await prisma.product.groupBy({
      by: ["category"],
      where: { available: true },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    // Order status breakdown
    const statusGroups = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    // Monthly revenue for last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const recentOrders = await prisma.order.findMany({
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: twelveMonthsAgo },
      },
      select: { total: true, createdAt: true },
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthMap = new Map<string, { revenue: number; orders: number }>();

    for (const order of recentOrders) {
      const d = new Date(order.createdAt);
      const key = `${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      const existing = monthMap.get(key) || { revenue: 0, orders: 0 };
      existing.revenue += Number(order.total);
      existing.orders += 1;
      monthMap.set(key, existing);
    }

    // Build ordered list of last 12 months
    const monthlyRevenue: typeof stats.monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      const data = monthMap.get(key) || { revenue: 0, orders: 0 };
      monthlyRevenue.push({
        month: months[d.getMonth()],
        revenue: Math.round(data.revenue),
        orders: data.orders,
      });
    }

    // Top clients by revenue (top 10)
    const clientOrders = await prisma.order.groupBy({
      by: ["organizationId"],
      where: { status: { not: "CANCELLED" } },
      _sum: { total: true },
      _count: { id: true },
      orderBy: { _sum: { total: "desc" } },
      take: 10,
    });

    const orgIds = clientOrders.map((c) => c.organizationId);
    const orgs = await prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, name: true },
    });
    const orgMap = new Map(orgs.map((o) => [o.id, o.name]));

    const topClients = clientOrders.map((c) => ({
      name: orgMap.get(c.organizationId) || "Unknown",
      revenue: Math.round(Number(c._sum.total ?? 0)),
      orders: c._count.id,
    }));

    // Category revenue — group order items by product category
    const itemGroups = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: { status: { not: "CANCELLED" } } },
      _sum: { total: true },
    });

    const allProductIds = itemGroups.map((g) => g.productId);
    const allProducts = await prisma.product.findMany({
      where: { id: { in: allProductIds } },
      select: { id: true, category: true },
    });
    const productCatMap = new Map(allProducts.map((p) => [p.id, p.category]));

    const catRevenueMap = new Map<string, number>();
    for (const g of itemGroups) {
      const cat = productCatMap.get(g.productId) ?? "Uncategorized";
      catRevenueMap.set(cat, (catRevenueMap.get(cat) ?? 0) + Number(g._sum.total ?? 0));
    }

    const topCategoryRevenue = Array.from(catRevenueMap.entries())
      .map(([category, revenue]) => ({ category, revenue: Math.round(revenue) }))
      .sort((a, b) => b.revenue - a.revenue);

    stats = {
      totalRevenue,
      totalOrders: orderCount,
      totalClients: clientCount,
      totalProducts: productCount,
      avgOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0,
      pendingOrders: pendingCount,
      topCategories: categoryGroups.map((g) => ({
        category: g.category,
        count: g._count.id,
      })),
      topCategoryRevenue,
      monthlyRevenue,
      topClients,
      statusBreakdown: statusGroups.map((g) => ({
        status: g.status,
        count: g._count.id,
      })),
    };
  } catch {
    // DB not connected
  }

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-3xl font-normal">Analytics</h2>

      {/* KPI Cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.avgOrderValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts (client component) */}
      <AdminCharts
        monthlyRevenue={stats.monthlyRevenue}
        topClients={stats.topClients}
        statusBreakdown={stats.statusBreakdown}
        topCategories={stats.topCategories}
        topCategoryRevenue={stats.topCategoryRevenue}
      />

      {/* Smart Reorder Alerts (client component — fetches its own data) */}
      <SmartReorderAlerts />
    </div>
  );
}
