import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrganizationByUserId } from "@/lib/db/organizations";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const org = await getOrganizationByUserId(userId);
    if (!org) {
      return NextResponse.json({ data: null });
    }

    const now = new Date();

    // Get orders for the last 12 months (extended from 7 for richer analytics)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Keep backward-compat alias
    const sevenMonthsAgo = twelveMonthsAgo;

    const orders = await prisma.order.findMany({
      where: {
        organizationId: org.id,
        status: { not: "CANCELLED" },
        createdAt: { gte: sevenMonthsAgo },
      },
      include: {
        items: {
          include: {
            product: { select: { category: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Monthly revenue
    const monthlyMap = new Map<string, number>();
    orders.forEach((order) => {
      const month = order.createdAt.toLocaleDateString("en-US", {
        month: "short",
      });
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + Number(order.total));
    });
    const monthlyRevenue = Array.from(monthlyMap.entries()).map(
      ([month, revenue]) => ({
        month,
        revenue: Math.round(revenue),
      })
    );

    // Top products by revenue
    const productMap = new Map<
      string,
      { name: string; revenue: number; orders: number }
    >();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productMap.get(item.name) || {
          name: item.name,
          revenue: 0,
          orders: 0,
        };
        existing.revenue += Number(item.total);
        existing.orders += 1;
        productMap.set(item.name, existing);
      });
    });
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((p) => ({
        name: p.name,
        revenue: Math.round(p.revenue),
        orders: p.orders,
      }));

    // Category breakdown
    const categoryMap = new Map<string, number>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const cat = item.product?.category || "Other";
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + Number(item.total));
      });
    });
    const categoryBreakdown = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, value]) => ({
        category,
        value: Math.round(value),
      }));

    // Weekly order frequency (last 12 weeks)
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);
    const weeklyOrders = await prisma.order.findMany({
      where: {
        organizationId: org.id,
        createdAt: { gte: twelveWeeksAgo },
      },
      select: { createdAt: true },
    });

    const weekMap = new Map<string, number>();
    weeklyOrders.forEach((order) => {
      const weekStart = new Date(order.createdAt);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const key = weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      weekMap.set(key, (weekMap.get(key) || 0) + 1);
    });
    const orderFrequency = Array.from(weekMap.entries()).map(
      ([week, orderCount]) => ({
        week,
        orders: orderCount,
      })
    );

    // KPIs
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const topCategory = categoryBreakdown[0];

    // --- NEW: Category breakdown (enhanced — same as existing but also exposed separately) ---
    const categoryBreakdownEnhanced = categoryBreakdown.map((c) => ({
      category: c.category,
      total: c.value,
      count: orders.reduce(
        (n, o) =>
          n +
          o.items.filter(
            (i) => (i.product?.category || "Other") === c.category
          ).length,
        0
      ),
    }));

    // --- NEW: Year-over-year comparison ---
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

    const allTimeOrders = await prisma.order.findMany({
      where: {
        organizationId: org.id,
        status: { not: "CANCELLED" },
        createdAt: { gte: lastYearStart },
      },
      select: { total: true, createdAt: true },
    });

    const thisYearTotal = allTimeOrders
      .filter((o) => o.createdAt >= thisYearStart)
      .reduce((sum, o) => sum + Number(o.total), 0);

    const lastYearTotal = allTimeOrders
      .filter((o) => o.createdAt >= lastYearStart && o.createdAt <= lastYearEnd)
      .reduce((sum, o) => sum + Number(o.total), 0);

    const yoyChange =
      lastYearTotal > 0
        ? Math.round(((thisYearTotal - lastYearTotal) / lastYearTotal) * 100)
        : null;

    const yearOverYear = {
      thisYear: Math.round(thisYearTotal),
      lastYear: Math.round(lastYearTotal),
      change: yoyChange,
    };

    // --- NEW: Average order cycle (days between consecutive orders) ---
    const orderDates = orders
      .map((o) => o.createdAt.getTime())
      .sort((a, b) => a - b);

    let avgOrderCycleDays: number | null = null;
    if (orderDates.length >= 2) {
      const gaps: number[] = [];
      for (let i = 1; i < orderDates.length; i++) {
        gaps.push(
          Math.round((orderDates[i] - orderDates[i - 1]) / (1000 * 60 * 60 * 24))
        );
      }
      avgOrderCycleDays = Math.round(
        gaps.reduce((s, g) => s + g, 0) / gaps.length
      );
    }

    // --- NEW: Order calendar — daily order count for last 12 months ---
    const calendarMap = new Map<string, number>();
    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().slice(0, 10); // "YYYY-MM-DD"
      calendarMap.set(dateKey, (calendarMap.get(dateKey) || 0) + 1);
    }
    const orderCalendar = Array.from(calendarMap.entries()).map(
      ([date, count]) => ({ date, count })
    );

    // --- NEW: Top products all-time (top 10 by spend) ---
    const allTimeItems = await prisma.orderItem.findMany({
      where: {
        order: {
          organizationId: org.id,
          status: { not: "CANCELLED" },
        },
      },
      select: { name: true, total: true, quantity: true },
    });

    const allTimeProductMap = new Map<
      string,
      { name: string; revenue: number; orders: number }
    >();
    for (const item of allTimeItems) {
      const existing = allTimeProductMap.get(item.name) || {
        name: item.name,
        revenue: 0,
        orders: 0,
      };
      existing.revenue += Number(item.total);
      existing.orders += 1;
      allTimeProductMap.set(item.name, existing);
    }
    const topProductsAllTime = Array.from(allTimeProductMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((p) => ({
        name: p.name,
        revenue: Math.round(p.revenue),
        orders: p.orders,
      }));

    return NextResponse.json({
      data: {
        monthlyRevenue,
        topProducts,
        topProductsAllTime,
        categoryBreakdown,
        categoryBreakdownEnhanced,
        orderFrequency,
        yearOverYear,
        avgOrderCycleDays,
        orderCalendar,
        kpis: {
          totalSpent,
          avgMonthly:
            monthlyRevenue.length > 0
              ? totalSpent / monthlyRevenue.length
              : 0,
          topCategory: topCategory?.category || "N/A",
          topCategoryPct:
            topCategory && totalSpent > 0
              ? Math.round((topCategory.value / totalSpent) * 100)
              : 0,
          avgWeeklyOrders:
            orderFrequency.length > 0
              ? (
                  orderFrequency.reduce((s, w) => s + w.orders, 0) /
                  orderFrequency.length
                ).toFixed(1)
              : "0",
        },
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ data: null });
  }
}
