import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Truck, ArrowRight, MapPin } from "lucide-react";

export const metadata: Metadata = { title: "Shipments" };

const shipmentStatusColors: Record<string, string> = {
  PREPARING: "bg-neutral-100 text-neutral-600 border-neutral-200",
  PICKED_UP: "bg-neutral-200 text-neutral-700 border-neutral-300",
  IN_TRANSIT: "bg-neutral-700 text-neutral-100 border-neutral-600",
  OUT_FOR_DELIVERY: "bg-neutral-800 text-neutral-100 border-neutral-700",
  DELIVERED: "bg-neutral-900 text-white border-neutral-800",
  EXCEPTION: "bg-neutral-50 text-neutral-500 border-neutral-200",
};

async function getActiveShipments() {
  return prisma.shipment.findMany({
    where: {
      status: { not: "DELIVERED" },
    },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          organization: { select: { name: true } },
        },
      },
      events: {
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export default async function AdminShipmentsPage() {
  let shipments: Awaited<ReturnType<typeof getActiveShipments>> = [];

  try {
    shipments = await getActiveShipments();
  } catch {
    // DB not connected
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
          Active Shipments
        </h2>
      </div>

      <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardHeader className="border-b border-[#E5E1DB] pb-3">
          <CardTitle className="font-serif text-lg text-[#0A0A0A] flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#C8C0B4]" />
            In-Transit Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {shipments.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-[#C8C0B4] mx-auto mb-4" />
              <p className="text-[#0A0A0A]/50 text-sm">
                No active shipments at this time.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#E5E1DB]">
                      <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Order</TableHead>
                      <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Client</TableHead>
                      <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Driver</TableHead>
                      <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Carrier</TableHead>
                      <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Status</TableHead>
                      <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">ETA</TableHead>
                      <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Last Update</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipments.map((shipment) => (
                      <TableRow key={shipment.id} className="border-[#E5E1DB]">
                        <TableCell className="font-mono font-medium text-[#0A0A0A]">
                          {shipment.order.orderNumber}
                        </TableCell>
                        <TableCell className="text-[#0A0A0A]/70">
                          {shipment.order.organization.name}
                        </TableCell>
                        <TableCell>
                          {shipment.driverName ? (
                            <div>
                              <p className="text-sm font-medium text-[#0A0A0A]">{shipment.driverName}</p>
                              {shipment.driverPhone && (
                                <p className="text-xs text-[#0A0A0A]/40">{shipment.driverPhone}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#0A0A0A]/30">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[#0A0A0A]/70">
                          {shipment.carrier ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${shipmentStatusColors[shipment.status] ?? ""}`}
                          >
                            {shipment.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#0A0A0A]/70 text-sm">
                          {shipment.estimatedEta
                            ? format(shipment.estimatedEta, "MMM d, h:mm a")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-[#0A0A0A]/40">
                          <div className="flex items-center gap-1">
                            {shipment.currentLat !== null && (
                              <MapPin className="h-3 w-3 text-[#C8C0B4]" />
                            )}
                            {shipment.events[0]
                              ? format(shipment.events[0].timestamp, "MMM d, h:mm a")
                              : format(shipment.updatedAt, "MMM d, h:mm a")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#0A0A0A]/60 hover:text-[#0A0A0A]"
                            asChild
                          >
                            <Link href={`/admin/orders/${shipment.order.id}`}>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden space-y-3">
                {shipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="border border-[#E5E1DB] p-4"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-mono font-semibold text-sm text-[#0A0A0A]">
                          {shipment.order.orderNumber}
                        </p>
                        <p className="text-xs text-[#0A0A0A]/50 mt-0.5">
                          {shipment.order.organization.name}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${shipmentStatusColors[shipment.status] ?? ""}`}
                      >
                        {shipment.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#0A0A0A]/60 mb-3">
                      {shipment.driverName && <span>Driver: {shipment.driverName}</span>}
                      {shipment.carrier && <span>Carrier: {shipment.carrier}</span>}
                      {shipment.estimatedEta && (
                        <span>ETA: {format(shipment.estimatedEta, "MMM d, h:mm a")}</span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-[#E5E1DB] text-[#0A0A0A] hover:bg-[#E5E1DB]/50 text-xs"
                      asChild
                    >
                      <Link href={`/admin/orders/${shipment.order.id}`}>
                        View Order
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
