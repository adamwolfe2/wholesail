import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { XCircle } from "lucide-react";
import { OrderStatusControl } from "./status-control";
import { SendNotification } from "../../send-notification";
import { CreateShipmentForm } from "./create-shipment-form";
import { InternalNotesEditor } from "./internal-notes-editor";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { orderStatusColors } from "@/lib/status-colors";
import { OrderDeliveryChecklist } from "@/components/order-delivery-checklist";
import { AssignDistributor } from "./assign-distributor";

export const metadata: Metadata = { title: "Order Details" };

const statusColors = orderStatusColors;

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"] as const;
function OrderStatusTimeline({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return (
      <div className="border border-[#E5E1DB] bg-white p-4 mb-6 flex items-center gap-3">
        <XCircle className="h-5 w-5 text-red-500 shrink-0" />
        <span className="text-sm font-semibold uppercase tracking-wider text-red-600">Order Cancelled</span>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(status as typeof STATUS_STEPS[number]);

  return (
    <div className="border border-[#E5E1DB] bg-white p-4 mb-6">
      <div className="flex items-center">
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === STATUS_STEPS.length - 1;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                    isCompleted
                      ? "bg-[#0A0A0A] border-[#0A0A0A]"
                      : "bg-white border-[#E5E1DB]"
                  }`}
                />
                <span
                  className={`mt-1.5 text-[10px] uppercase tracking-wider whitespace-nowrap ${
                    isCurrent
                      ? "font-semibold text-[#0A0A0A]"
                      : isCompleted
                      ? "font-medium text-[#0A0A0A]/30"
                      : "text-[#0A0A0A]/20"
                  }`}
                >
                  {step}
                </span>
              </div>
              {!isLast && (
                <div className="flex-1 border-t border-[#E5E1DB] mx-2 mb-5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      organization: true,
      user: true,
      payments: true,
      invoice: true,
      shippingAddress: true,
      shipment: true,
    },
  });
}

async function getDistributors() {
  return prisma.organization.findMany({
    where: { isDistributor: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}

async function getOrderTimeline(orderId: string) {
  return prisma.auditEvent.findMany({
    where: {
      entityType: "Order",
      entityId: orderId,
    },
    include: {
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let order: Awaited<ReturnType<typeof getOrder>> = null;
  let timeline: Awaited<ReturnType<typeof getOrderTimeline>> = [];
  let distributors: Awaited<ReturnType<typeof getDistributors>> = [];
  try {
    [order, distributors] = await Promise.all([getOrder(id), getDistributors()]);
    if (order) {
      timeline = await getOrderTimeline(id);
    }
  } catch {
    // DB not connected
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/orders">Orders</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{order.orderNumber}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h2 className="font-serif text-2xl font-normal">{order.orderNumber}</h2>
          <p className="text-sm text-muted-foreground">
            Placed {format(order.createdAt, "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`text-sm px-3 py-1 ${statusColors[order.status] || ""}`}
        >
          {order.status}
        </Badge>
      </div>

      {/* Status Timeline */}
      <OrderStatusTimeline status={order.status} />

      {/* Status Control + Notification */}
      <div className="flex flex-wrap items-center gap-3">
        <OrderStatusControl orderId={order.id} organizationId={order.organizationId} currentStatus={order.status} />
        <SendNotification
          organizationId={order.organizationId}
          organizationName={order.organization.name}
          orderId={order.id}
          invoiceId={order.invoice?.id}
        />
      </div>

      {/* Shipment */}
      <CreateShipmentForm
        orderId={order.id}
        orderStatus={order.status}
        existingShipment={order.shipment ? {
          id: order.shipment.id,
          trackingNumber: order.shipment.trackingNumber,
          carrier: order.shipment.carrier,
          status: order.shipment.status,
          driverName: order.shipment.driverName,
          driverPhone: order.shipment.driverPhone,
          driverNotes: order.shipment.driverNotes ?? null,
          currentLat: order.shipment.currentLat,
          currentLng: order.shipment.currentLng,
          estimatedEta: order.shipment.estimatedEta?.toISOString() ?? null,
          etaWindowEnd: order.shipment.etaWindowEnd?.toISOString() ?? null,
          deliveryPhotoUrl: order.shipment.deliveryPhotoUrl ?? null,
          deliverySignature: order.shipment.deliverySignature ?? null,
          createdAt: order.shipment.createdAt.toISOString(),
        } : null}
      />

      {/* Delivery Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delivery Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Distributor assignment */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Assigned Distributor</p>
            <AssignDistributor
              orderId={order.id}
              currentDistributorOrgId={(order as { distributorOrgId?: string | null }).distributorOrgId ?? null}
              distributors={distributors}
            />
            {distributors.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                No distributor organizations found. Approve a wholesale application first.
              </p>
            )}
          </div>
          <div className="border-t pt-4">
            <OrderDeliveryChecklist
              data={{
                orderId: order.id,
                adminConfirmedAt: (order as { adminConfirmedAt?: Date | null }).adminConfirmedAt?.toISOString() ?? null,
                distributorConfirmedAt: (order as { distributorConfirmedAt?: Date | null }).distributorConfirmedAt?.toISOString() ?? null,
                clientConfirmedAt: (order as { clientConfirmedAt?: Date | null }).clientConfirmedAt?.toISOString() ?? null,
              }}
              viewerRole="admin"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Organization: </span>
              <span className="font-medium">{order.organization.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Contact: </span>
              <span className="font-medium">{order.organization.contactPerson}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Email: </span>
              {order.organization.email}
            </div>
            <div>
              <span className="text-muted-foreground">Phone: </span>
              {order.organization.phone}
            </div>
            <div>
              <span className="text-muted-foreground">Placed by: </span>
              {order.user.name} ({order.user.email})
            </div>
          </CardContent>
        </Card>

        {/* Shipping */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shipping Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {order.shippingAddress ? (
              <>
                <div>{order.shippingAddress.street}</div>
                <div>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zip}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No shipping address on file</p>
            )}
            {order.notes && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground">Notes: </span>
                  <span className="whitespace-pre-line">{order.notes}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.product && (
                        <p className="text-xs text-muted-foreground">
                          {item.product.unit}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${Number(item.unitPrice).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${Number(item.total).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>

          <Separator className="my-4" />

          <div className="flex flex-col items-end gap-2 text-sm">
            <div className="flex justify-between w-48">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            {Number(order.tax) > 0 && (
              <div className="flex justify-between w-48">
                <span className="text-muted-foreground">Tax</span>
                <span>${Number(order.tax).toFixed(2)}</span>
              </div>
            )}
            {Number(order.deliveryFee) > 0 && (
              <div className="flex justify-between w-48">
                <span className="text-muted-foreground">Delivery</span>
                <span>${Number(order.deliveryFee).toFixed(2)}</span>
              </div>
            )}
            <Separator className="w-48" />
            <div className="flex justify-between w-48 text-base font-bold">
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {order.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No payments recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="hidden sm:table-cell">Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {format(payment.createdAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="capitalize">
                      {payment.method.toLowerCase()}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">
                      {payment.reference || "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${Number(payment.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {payment.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stripe Info */}
      {(order.stripeSessionId || order.stripePaymentIntentId) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stripe Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {order.stripeSessionId && (
              <div>
                <span className="text-muted-foreground">Session ID: </span>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded break-all">
                  {order.stripeSessionId}
                </code>
              </div>
            )}
            {order.stripePaymentIntentId && (
              <div>
                <span className="text-muted-foreground">Payment Intent: </span>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded break-all">
                  {order.stripePaymentIntentId}
                </code>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Internal Notes (staff-only) */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="text-lg">Internal Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <InternalNotesEditor
            orderId={order.id}
            initialNotes={order.internalNotes ?? null}
          />
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {timeline.map((event) => {
                  // Determine dot color by action / status
                  const meta = event.metadata as Record<string, unknown> | null;
                  const newStatus = meta?.newStatus as string | undefined;
                  let dotClass = "bg-foreground/40";
                  if (newStatus === "DELIVERED") dotClass = "bg-green-500";
                  else if (newStatus === "SHIPPED") dotClass = "bg-blue-500";
                  else if (newStatus === "PENDING" || newStatus === "CONFIRMED") dotClass = "bg-amber-500";
                  else if (newStatus === "CANCELLED") dotClass = "bg-red-400";
                  else if (event.action === "internal_notes_updated") dotClass = "bg-amber-400";

                  const label = event.action === "status_changed" && newStatus
                    ? `Status changed to ${newStatus}`
                    : event.action === "bulk_status_changed" && newStatus
                    ? `Bulk status changed to ${newStatus}`
                    : event.action === "internal_notes_updated"
                    ? "Internal notes updated"
                    : String(event.action).replace(/_/g, " ");

                  return (
                    <div key={event.id} className="flex gap-4 relative">
                      <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center shrink-0 z-10">
                        <div className={`w-2 h-2 rounded-full ${dotClass}`} />
                      </div>
                      <div className="flex-1 pb-2">
                        <p className="text-sm font-medium capitalize">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {event.user?.name
                            ? `${event.user.name} · `
                            : ""}
                          {format(event.createdAt, "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Link */}
      {order.invoice && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Invoice</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <span className="text-muted-foreground">Invoice #: </span>
              <span className="font-mono font-medium">{order.invoice.invoiceNumber}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Status: </span>
              <Badge variant="outline">{order.invoice.status}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Due: </span>
              <span>{format(order.invoice.dueDate, "MMM d, yyyy")}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
