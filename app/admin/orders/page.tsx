import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { OrderTable } from "./order-table";
import { ExportButton } from "./export-button";
import { OrderFilters } from "./order-filters";
import { Prisma, type OrderStatus } from "@prisma/client";
import { EmptyState } from "@/components/empty-state";
import { ShoppingBag, Search } from "lucide-react";

interface SearchParams {
  status?: string | string[];
  dateRange?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: string;
  maxAmount?: string;
  client?: string;
  source?: string;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  let orders: Awaited<ReturnType<typeof getOrders>> = [];
  let totalCount = 0;

  try {
    orders = await getOrders(sp);
    totalCount = orders.length;
  } catch {
    // DB not connected
  }

  // Serialize dates for client component
  const serializedOrders = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    total: o.total.toString(),
    createdAt: o.createdAt.toISOString(),
    organization: o.organization,
    _count: o._count,
    notes: o.notes ?? null,
  }));

  const hasFilters = !!(
    sp.status ||
    sp.dateRange ||
    sp.dateFrom ||
    sp.dateTo ||
    sp.minAmount ||
    sp.maxAmount ||
    sp.client ||
    sp.source
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-3xl font-normal">Orders</h2>
        {orders.length > 0 && <ExportButton />}
      </div>

      {/* Advanced Filters */}
      <OrderFilters searchParams={sp} />

      <Card>
        <CardHeader>
          <CardTitle>
            {hasFilters
              ? `${totalCount} order${totalCount !== 1 ? "s" : ""} matching filters`
              : "All Orders"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <EmptyState
              icon={hasFilters ? Search : ShoppingBag}
              title={hasFilters ? 'No Orders Match' : 'No Orders Yet'}
              description={hasFilters ? 'Try adjusting or clearing your filters.' : 'Orders will appear here once clients place them.'}
            />
          ) : (
            <OrderTable orders={serializedOrders} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getOrders(sp: SearchParams) {
  const where: Prisma.OrderWhereInput = {};

  // Status filter — can be a single string or array
  if (sp.status) {
    const statuses = Array.isArray(sp.status) ? sp.status : [sp.status];
    const allowed = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
    const validStatuses = statuses.filter((s) => allowed.includes(s));
    if (validStatuses.length > 0) {
      where.status = { in: validStatuses as OrderStatus[] };
    }
  }

  // Date range filter
  if (sp.dateRange && sp.dateRange !== "custom") {
    const now = new Date();
    let from: Date | undefined;

    if (sp.dateRange === "today") {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (sp.dateRange === "week") {
      const day = now.getDay();
      from = new Date(now);
      from.setDate(now.getDate() - day);
      from.setHours(0, 0, 0, 0);
    } else if (sp.dateRange === "month") {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (sp.dateRange === "30days") {
      from = new Date(now);
      from.setDate(now.getDate() - 30);
      from.setHours(0, 0, 0, 0);
    }

    if (from) {
      where.createdAt = { gte: from };
    }
  } else if (sp.dateRange === "custom") {
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (sp.dateFrom) dateFilter.gte = new Date(sp.dateFrom);
    if (sp.dateTo) {
      const to = new Date(sp.dateTo);
      to.setHours(23, 59, 59, 999);
      dateFilter.lte = to;
    }
    if (dateFilter.gte || dateFilter.lte) {
      where.createdAt = dateFilter;
    }
  }

  // Amount range filter
  if (sp.minAmount || sp.maxAmount) {
    const amountFilter: { gte?: Prisma.Decimal; lte?: Prisma.Decimal } = {};
    if (sp.minAmount) amountFilter.gte = new Prisma.Decimal(sp.minAmount);
    if (sp.maxAmount) amountFilter.lte = new Prisma.Decimal(sp.maxAmount);
    where.total = amountFilter;
  }

  // Client search filter
  if (sp.client) {
    where.organization = {
      name: { contains: sp.client, mode: "insensitive" },
    };
  }

  // Source filter — "SMS" detected by notes containing "iMessage"
  if (sp.source === "sms") {
    where.notes = { contains: "iMessage", mode: "insensitive" };
  } else if (sp.source === "portal") {
    where.OR = [
      { notes: null },
      { notes: { not: { contains: "iMessage" } } },
    ];
  }

  return prisma.order.findMany({
    where,
    include: {
      organization: { select: { name: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
}
