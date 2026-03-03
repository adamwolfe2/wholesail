import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Package, TrendingDown, AlertTriangle, Boxes } from "lucide-react";
import { InventoryTable } from "./inventory-table";
import { AddTrackingButtons } from "./add-tracking-buttons";

async function getInventoryData() {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  // Products WITH inventory levels
  const tracked = await prisma.product.findMany({
    where: { inventoryLevel: { isNot: null } },
    include: {
      inventoryLevel: {
        include: {
          restocks: {
            where: { arrivedAt: null },
            orderBy: { expectedDate: "asc" },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Products WITHOUT inventory levels
  const untracked = await prisma.product.findMany({
    where: { inventoryLevel: null, available: true },
    select: { id: true, name: true, category: true },
    orderBy: { name: "asc" },
  });

  // Upcoming restocks (all pending)
  const upcomingRestocks = await prisma.inventoryRestock.findMany({
    where: { arrivedAt: null },
    include: {
      inventory: {
        include: {
          product: { select: { id: true, name: true, category: true } },
        },
      },
    },
    orderBy: { expectedDate: "asc" },
  });

  // Consumption data: sum of quantities from DELIVERED orders in last 90 days
  const consumption = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      order: {
        status: "DELIVERED",
        createdAt: { gte: ninetyDaysAgo },
      },
    },
    _sum: { quantity: true },
  });

  const consumptionMap: Record<string, number> = {};
  for (const row of consumption) {
    consumptionMap[row.productId] = row._sum.quantity ?? 0;
  }

  // Distributor self-reported inventory
  const distributorStock = await prisma.distributorInventory.findMany({
    include: {
      distributor: { select: { id: true, name: true } },
      product: { select: { id: true, name: true, category: true, unit: true } },
    },
    orderBy: [{ distributor: { name: 'asc' } }, { product: { name: 'asc' } }],
  });

  return { tracked, untracked, upcomingRestocks, consumptionMap, distributorStock };
}

export default async function InventoryPage() {
  let data = {
    tracked: [] as Awaited<ReturnType<typeof getInventoryData>>["tracked"],
    untracked: [] as Awaited<ReturnType<typeof getInventoryData>>["untracked"],
    upcomingRestocks: [] as Awaited<ReturnType<typeof getInventoryData>>["upcomingRestocks"],
    consumptionMap: {} as Record<string, number>,
    distributorStock: [] as Awaited<ReturnType<typeof getInventoryData>>["distributorStock"],
  };

  try {
    data = await getInventoryData();
  } catch {
    // DB not connected
  }

  // KPI calculations
  const totalTracked = data.tracked.length;
  const inStock = data.tracked.filter(
    (p) => p.inventoryLevel && p.inventoryLevel.quantityOnHand > 0
  ).length;
  const lowStock = data.tracked.filter(
    (p) =>
      p.inventoryLevel &&
      p.inventoryLevel.quantityOnHand > 0 &&
      p.inventoryLevel.quantityOnHand <= p.inventoryLevel.lowStockThreshold
  ).length;
  const outOfStock = data.tracked.filter(
    (p) => p.inventoryLevel && p.inventoryLevel.quantityOnHand === 0
  ).length;

  const hasAlerts = lowStock > 0 || outOfStock > 0;

  // Serialize for client component
  const trackedItems = data.tracked.map((p) => {
    const onHand = p.inventoryLevel!.quantityOnHand;
    const consumed90 = data.consumptionMap[p.id] ?? 0;
    const dailyRate = consumed90 / 90;
    const daysUntilStockout = dailyRate > 0 ? Math.round(onHand / dailyRate) : null;
    return {
      productId: p.id,
      productName: p.name,
      category: p.category,
      available: p.available,
      quantityOnHand: onHand,
      quantityReserved: p.inventoryLevel!.quantityReserved,
      lowStockThreshold: p.inventoryLevel!.lowStockThreshold,
      daysUntilStockout,
    };
  });

  const upcomingRestocks = data.upcomingRestocks.map((r) => ({
    id: r.id,
    productId: r.inventory.product.id,
    productName: r.inventory.product.name,
    category: r.inventory.product.category,
    quantity: r.quantity,
    expectedDate: r.expectedDate.toISOString(),
    notes: r.notes,
    arrivedAt: r.arrivedAt ? r.arrivedAt.toISOString() : null,
  }));

  const untrackedItems = data.untracked.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
  }));

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
        Inventory
      </h2>

      {/* KPI Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
              SKUs Tracked
            </CardTitle>
            <Package className="h-4 w-4 text-[#C8C0B4]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-[#0A0A0A]">{totalTracked}</div>
            <p className="text-xs text-[#0A0A0A]/40 mt-1">With inventory levels</p>
          </CardContent>
        </Card>

        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
              In Stock
            </CardTitle>
            <Package className="h-4 w-4 text-[#C8C0B4]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-[#0A0A0A]">{inStock}</div>
            <p className="text-xs text-[#0A0A0A]/40 mt-1">Qty on hand &gt; 0</p>
          </CardContent>
        </Card>

        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
              Low Stock
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-[#C8C0B4]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-[#0A0A0A]">{lowStock}</div>
            <p className="text-xs text-[#0A0A0A]/40 mt-1">At or below threshold</p>
          </CardContent>
        </Card>

        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
              Out of Stock
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-[#C8C0B4]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-[#0A0A0A]">{outOfStock}</div>
            <p className="text-xs text-[#0A0A0A]/40 mt-1">Qty on hand = 0</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner */}
      {hasAlerts && (
        <div className="border border-[#0A0A0A]/20 bg-[#0A0A0A]/5 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#0A0A0A]/60 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#0A0A0A]">Inventory Alert</p>
            <p className="text-sm text-[#0A0A0A]/60 mt-0.5">
              {outOfStock > 0 && (
                <span>{outOfStock} product{outOfStock > 1 ? "s are" : " is"} out of stock. </span>
              )}
              {lowStock > 0 && (
                <span>{lowStock} product{lowStock > 1 ? "s are" : " is"} running low. </span>
              )}
              Review the inventory table below and create restock orders as needed.
            </p>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <InventoryTable items={trackedItems} />

      {/* Upcoming Restocks */}
      {upcomingRestocks.length > 0 && (
        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="border-b border-[#E5E1DB] pb-3">
            <CardTitle className="font-serif text-lg text-[#0A0A0A]">
              Upcoming Restocks
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E1DB]">
                    <th className="text-left pb-2 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Product</th>
                    <th className="text-left pb-2 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Category</th>
                    <th className="text-right pb-2 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Qty</th>
                    <th className="text-left pb-2 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Expected</th>
                    <th className="text-left pb-2 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider hidden md:table-cell">Notes</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingRestocks.map((restock) => (
                    <tr key={restock.id} className="border-b border-[#E5E1DB] last:border-0">
                      <td className="py-3 font-medium text-[#0A0A0A]">{restock.productName}</td>
                      <td className="py-3">
                        <Badge variant="outline" className="text-xs border-[#E5E1DB] text-[#0A0A0A]/60">
                          {restock.category}
                        </Badge>
                      </td>
                      <td className="py-3 text-right font-semibold text-[#0A0A0A]">{restock.quantity}</td>
                      <td className="py-3 text-[#0A0A0A]/70">
                        {format(new Date(restock.expectedDate), "MMM d, yyyy")}
                      </td>
                      <td className="py-3 text-[#0A0A0A]/50 hidden md:table-cell text-xs">
                        {restock.notes ?? "—"}
                      </td>
                      <td className="py-3">
                        {/* Mark arrived button is in the client component */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Inventory Tracking for untracked products */}
      {untrackedItems.length > 0 && (
        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="border-b border-[#E5E1DB] pb-3">
            <CardTitle className="font-serif text-lg text-[#0A0A0A]">
              Add Inventory Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-[#0A0A0A]/50 mb-4">
              {untrackedItems.length} product{untrackedItems.length > 1 ? "s are" : " is"} not yet tracked. Add inventory tracking to monitor stock levels.
            </p>
            <AddTrackingButtons products={untrackedItems} />
          </CardContent>
        </Card>
      )}

      {/* Distributor Self-Reported Stock */}
      <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardHeader className="border-b border-[#E5E1DB] pb-3">
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-[#0A0A0A]/40" />
            <CardTitle className="font-serif text-lg text-[#0A0A0A]">
              Distributor-Reported Stock
            </CardTitle>
          </div>
          <p className="text-sm text-[#0A0A0A]/50 mt-1">
            Stock levels self-reported by your distributor partners. Updated by them from their portal.
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          {data.distributorStock.length === 0 ? (
            <p className="text-sm text-[#0A0A0A]/40 py-4 text-center">
              No distributor stock reports yet. Distributors can report their inventory from the portal under &ldquo;My Inventory&rdquo;.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E1DB]">
                    <th className="text-left pb-2 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Distributor</th>
                    <th className="text-left pb-2 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Product</th>
                    <th className="text-right pb-2 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">On Hand</th>
                    <th className="text-right pb-2 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Back Stock</th>
                    <th className="text-left pb-2 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider hidden md:table-cell">Notes</th>
                    <th className="text-left pb-2 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider hidden lg:table-cell">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {data.distributorStock.map((row) => (
                    <tr key={row.id} className="border-b border-[#E5E1DB] last:border-0">
                      <td className="py-3 font-medium text-[#0A0A0A]">{row.distributor.name}</td>
                      <td className="py-3 text-[#0A0A0A]/70">
                        <div>{row.product.name}</div>
                        <Badge variant="outline" className="text-[10px] border-[#E5E1DB] text-[#0A0A0A]/40 mt-0.5">
                          {row.product.category}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <span className={`font-semibold tabular-nums ${row.quantityOnHand === 0 ? 'text-red-600' : row.quantityOnHand <= 5 ? 'text-amber-600' : 'text-[#0A0A0A]'}`}>
                          {row.quantityOnHand}
                        </span>
                        {row.product.unit && <span className="text-xs text-[#0A0A0A]/30 ml-1">{row.product.unit}</span>}
                      </td>
                      <td className="py-3 text-right font-semibold tabular-nums text-[#0A0A0A]">
                        {row.quantityBackstock}
                        {row.product.unit && <span className="text-xs text-[#0A0A0A]/30 ml-1">{row.product.unit}</span>}
                      </td>
                      <td className="py-3 text-[#0A0A0A]/50 hidden md:table-cell text-xs max-w-[200px] truncate">
                        {row.notes ?? "—"}
                      </td>
                      <td className="py-3 text-[#0A0A0A]/40 hidden lg:table-cell text-xs">
                        {format(new Date(row.updatedAt), "MMM d, yyyy")}
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
  );
}
