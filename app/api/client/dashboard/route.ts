import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ orders: [], topProducts: [], monthlyRevenue: [] });
    }

    const orgId = user.organizationId;
    const now = new Date();

    // Build timezone-safe month boundaries for last 7 months.
    // Using new Date(year, month, 1) avoids the setMonth day-of-month overflow bug
    // (e.g. Jan 31 - 1 month would land on Dec 31, not Dec 1).
    const sevenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const [recentOrders, topProductsRaw, orders] = await Promise.all([
      // Recent orders (last 10)
      prisma.order.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          items: { select: { id: true } },
        },
      }),

      // Top products by revenue — aggregate at the DB level, no in-memory loop
      prisma.orderItem.groupBy({
        by: ["name"],
        where: { order: { organizationId: orgId, status: { not: "CANCELLED" } } },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { total: "desc" } },
        take: 5,
      }),

      // Orders for monthly revenue chart (last 7 months)
      prisma.order.findMany({
        where: {
          organizationId: orgId,
          status: { not: "CANCELLED" },
          createdAt: { gte: sevenMonthsAgo },
        },
        select: { total: true, createdAt: true },
      }),
    ]);

    // Build top products — batch query for last order info instead of N+1 individual queries
    const topProductNames = topProductsRaw.map((p) => p.name);
    const lastOrderItems = topProductNames.length > 0
      ? await prisma.orderItem.findMany({
          where: {
            name: { in: topProductNames },
            order: { organizationId: orgId, status: { not: "CANCELLED" } },
          },
          orderBy: { order: { createdAt: "desc" } },
          distinct: ["name"] as const,
          select: { name: true, quantity: true, order: { select: { createdAt: true } } },
        })
      : [];

    // O(1) lookup map from product name to last order info
    const lastOrderMap = new Map(
      lastOrderItems.map((item) => [item.name, item])
    );

    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const topProducts = topProductsRaw.map((p) => {
      const lastItem = lastOrderMap.get(p.name);
      return {
        name: p.name,
        orders: p._sum.quantity ?? 0,
        revenue: Math.round(Number(p._sum.total ?? 0)),
        daysSinceLastOrder: lastItem
          ? Math.floor((now.getTime() - lastItem.order.createdAt.getTime()) / MS_PER_DAY)
          : null,
        lastQuantity: lastItem?.quantity ?? null,
      };
    });

    // Aggregate monthly revenue using explicit year/month keys to avoid TZ issues
    const monthMap = new Map<string, number>();
    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (const order of orders) {
      const d = order.createdAt;
      // Key by "YYYY-MM" so the sort is unambiguous across year boundaries
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      monthMap.set(key, (monthMap.get(key) ?? 0) + Number(order.total));
    }

    // Build ordered list of last 7 months using safe Date(year, month, 1) construction
    const monthlyRevenue: { month: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      monthlyRevenue.push({
        month: MONTH_NAMES[d.getMonth()],
        revenue: Math.round(monthMap.get(key) ?? 0),
      });
    }

    return NextResponse.json({
      orders: recentOrders.map((o) => ({
        id: o.orderNumber,
        date: o.createdAt,
        items: o.items.length,
        total: Number(o.total),
        status: o.status.toLowerCase(),
      })),
      topProducts,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Error fetching client dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
