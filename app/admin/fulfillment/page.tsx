import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { format, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { FulfillmentBoard } from "./fulfillment-board";

export const metadata: Metadata = { title: "Fulfillment" };

async function getFulfillmentData() {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const [
    pendingOrders,
    confirmedOrders,
    packedOrders,
    shippedToday,
    deliveredToday,
    allShipped,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { status: "PENDING" },
      include: {
        items: { include: { product: true } },
        organization: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: { status: "CONFIRMED" },
      include: {
        items: { include: { product: true } },
        organization: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: { status: "PACKED" },
      include: {
        items: { include: { product: true } },
        organization: { select: { name: true, phone: true } },
        shipment: true,
      },
      orderBy: { packedAt: "asc" },
    }),
    prisma.order.findMany({
      where: {
        status: "SHIPPED",
        shippedAt: { gte: todayStart, lte: todayEnd },
      },
      include: {
        organization: { select: { name: true } },
        items: true,
        shipment: true,
      },
      orderBy: { shippedAt: "desc" },
    }),
    prisma.order.findMany({
      where: {
        status: "DELIVERED",
        updatedAt: { gte: todayStart, lte: todayEnd },
      },
      include: {
        organization: { select: { name: true } },
        items: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    // All currently-in-transit (not just today)
    prisma.order.count({ where: { status: "SHIPPED" } }),
  ]);

  return { pendingOrders, confirmedOrders, packedOrders, shippedToday, deliveredToday, allShipped };
}

export default async function FulfillmentPage() {
  let data = {
    pendingOrders: [] as Awaited<ReturnType<typeof getFulfillmentData>>["pendingOrders"],
    confirmedOrders: [] as Awaited<ReturnType<typeof getFulfillmentData>>["confirmedOrders"],
    packedOrders: [] as Awaited<ReturnType<typeof getFulfillmentData>>["packedOrders"],
    shippedToday: [] as Awaited<ReturnType<typeof getFulfillmentData>>["shippedToday"],
    deliveredToday: [] as Awaited<ReturnType<typeof getFulfillmentData>>["deliveredToday"],
    allShipped: 0,
  };

  try {
    data = await getFulfillmentData();
  } catch {
    // DB not connected
  }

  const kpis = [
    {
      label: "Needs Confirmation",
      value: data.pendingOrders.length,
      icon: AlertCircle,
      description: "Status: PENDING",
    },
    {
      label: "Orders to Pack",
      value: data.confirmedOrders.length,
      icon: Package,
      description: "Status: CONFIRMED",
    },
    {
      label: "Ready to Ship",
      value: data.packedOrders.length,
      icon: Clock,
      description: "Status: PACKED",
    },
    {
      label: "Delivered Today",
      value: data.deliveredToday.length,
      icon: CheckCircle,
      description: format(new Date(), "MMM d, yyyy"),
    },
  ];

  // Serialize for client component
  const serializedPending = data.pendingOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    organizationName: o.organization.name,
    itemCount: o.items.length,
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
    isSmsOrder: !!(o.notes?.toLowerCase().includes("imessage") || o.notes?.toLowerCase().includes("sms") || o.internalNotes?.toLowerCase().includes("imessage") || o.internalNotes?.toLowerCase().includes("sms")),
    hasMarketRate: o.items.some((i) => i.product?.marketRate === true),
    items: o.items.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      product: i.product ? { category: i.product.category, unit: i.product.unit } : null,
    })),
  }));

  const serializedConfirmed = data.confirmedOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    organizationName: o.organization.name,
    itemCount: o.items.length,
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
    isSmsOrder: !!(o.notes?.toLowerCase().includes("imessage") || o.notes?.toLowerCase().includes("sms") || o.internalNotes?.toLowerCase().includes("imessage") || o.internalNotes?.toLowerCase().includes("sms")),
    hasMarketRate: o.items.some((i) => i.product?.marketRate === true),
    items: o.items.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      product: i.product ? { category: i.product.category, unit: i.product.unit } : null,
    })),
  }));

  const serializedPacked = data.packedOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    organizationName: o.organization.name,
    itemCount: o.items.length,
    total: Number(o.total),
    packedAt: o.packedAt ? o.packedAt.toISOString() : null,
    hasShipment: !!o.shipment,
    isSmsOrder: !!(o.notes?.toLowerCase().includes("imessage") || o.notes?.toLowerCase().includes("sms") || o.internalNotes?.toLowerCase().includes("imessage") || o.internalNotes?.toLowerCase().includes("sms")),
    hasMarketRate: o.items.some((i) => i.product?.marketRate === true),
    items: o.items.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      product: i.product ? { category: i.product.category, unit: i.product.unit } : null,
    })),
  }));

  const serializedShipped = data.shippedToday.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    organizationName: o.organization.name,
    itemCount: o.items.length,
    shippedAt: o.shippedAt ? o.shippedAt.toISOString() : null,
    driverName: o.shipment?.driverName ?? null,
  }));

  const serializedDelivered = data.deliveredToday.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    organizationName: o.organization.name,
    itemCount: o.items.length,
  }));

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
        Fulfillment Console
      </h2>

      {/* Today's Delivery Summary Bar */}
      <div className="border border-shell bg-ink text-cream px-5 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="text-cream/50 text-xs uppercase tracking-wider font-medium">
            {format(new Date(), "MMM d")} Summary
          </span>
          <div className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-sand" />
            <span className="font-semibold">{data.allShipped}</span>
            <span className="text-cream/60">in transit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-sand" />
            <span className="font-semibold">{data.packedOrders.length}</span>
            <span className="text-cream/60">packed &amp; ready</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-sand" />
            <span className="font-semibold">{data.deliveredToday.length}</span>
            <span className="text-cream/60">delivered today</span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-shell bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                {kpi.label}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-sand" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-ink">{kpi.value}</div>
              <p className="text-xs text-ink/40 mt-1">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <FulfillmentBoard
        pendingOrders={serializedPending}
        confirmedOrders={serializedConfirmed}
        packedOrders={serializedPacked}
        shippedOrders={serializedShipped}
        deliveredOrders={serializedDelivered}
      />
    </div>
  );
}
