import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const now = new Date();
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const MONTH_LABELS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // ── Monthly revenue (last 12 months) ────────────────────────────────────
  const recentOrders = await prisma.order.findMany({
    where: {
      status: { not: "CANCELLED" },
      createdAt: { gte: twelveMonthsAgo },
    },
    select: { total: true, createdAt: true },
  });

  const monthMap = new Map<string, number>();
  for (const order of recentOrders) {
    const d = new Date(order.createdAt);
    const key = `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
    monthMap.set(key, (monthMap.get(key) ?? 0) + Number(order.total));
  }

  const monthlyRevenue: { month: string; revenue: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const key = `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
    monthlyRevenue.push({
      month: key,
      revenue: Math.round(monthMap.get(key) ?? 0),
    });
  }

  // ── Top 10 clients by total spend ────────────────────────────────────────
  const clientGroups = await prisma.order.groupBy({
    by: ["organizationId"],
    where: { status: { not: "CANCELLED" } },
    _sum: { total: true },
    orderBy: { _sum: { total: "desc" } },
    take: 10,
  });

  const orgIds = clientGroups.map((g) => g.organizationId);
  const orgs = await prisma.organization.findMany({
    where: { id: { in: orgIds } },
    select: { id: true, name: true },
  });
  const orgMap = new Map(orgs.map((o) => [o.id, o.name]));

  const topClients = clientGroups.map((g) => ({
    name: orgMap.get(g.organizationId) ?? "Unknown",
    total: Math.round(Number(g._sum.total ?? 0)),
  }));

  // ── Order status counts ──────────────────────────────────────────────────
  const statusGroups = await prisma.order.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const orderStatusCounts: Record<string, number> = {
    PENDING: 0,
    CONFIRMED: 0,
    SHIPPED: 0,
    DELIVERED: 0,
  };
  for (const g of statusGroups) {
    orderStatusCounts[g.status] = g._count.id;
  }

  // ── Top categories by revenue ────────────────────────────────────────────
  const itemGroups = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { status: { not: "CANCELLED" } } },
    _sum: { total: true },
  });

  const allProductIds = itemGroups.map((g) => g.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: allProductIds } },
    select: { id: true, category: true },
  });
  const productCatMap = new Map(products.map((p) => [p.id, p.category]));

  const catRevenueMap = new Map<string, number>();
  for (const g of itemGroups) {
    const cat = productCatMap.get(g.productId) ?? "Uncategorized";
    catRevenueMap.set(cat, (catRevenueMap.get(cat) ?? 0) + Number(g._sum.total ?? 0));
  }

  const topCategories = Array.from(catRevenueMap.entries())
    .map(([category, revenue]) => ({ category, revenue: Math.round(revenue) }))
    .sort((a, b) => b.revenue - a.revenue);

  return NextResponse.json(
    { monthlyRevenue, topClients, orderStatusCounts, topCategories },
    { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } }
  );
}
