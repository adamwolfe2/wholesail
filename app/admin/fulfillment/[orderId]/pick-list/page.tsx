import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { PrintButton } from "./print-button";
import { PickListItems } from "./pick-list-items";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = { title: "Pick List" };

async function getOrder(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      organization: true,
      shippingAddress: true,
    },
  });
}

export default async function PickListPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  let order: Awaited<ReturnType<typeof getOrder>> = null;
  try {
    order = await getOrder(orderId);
  } catch {
    // DB not connected
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Print controls — hidden on print */}
      <div className="print:hidden border-b border-shell bg-cream px-6 py-3 flex items-center justify-between">
        <a
          href={`/admin/orders/${order.id}`}
          className="text-sm text-ink/60 hover:text-ink"
        >
          ← Back to Order
        </a>
        <PrintButton />
      </div>

      {/* Pick list content */}
      <div className="max-w-3xl mx-auto p-8 print:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 print:mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink mb-1">Pick List</h1>
            <p className="text-sm text-ink/50">
              Generated {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono font-bold text-lg text-ink">{order.orderNumber}</p>
            <p className="text-sm text-ink/50">
              {format(order.createdAt, "MMM d, yyyy")}
            </p>
          </div>
        </div>

        {/* Client + Delivery Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 print:mb-6">
          <div className="border border-shell p-4">
            <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-2">
              Client
            </p>
            <p className="font-semibold text-ink">{order.organization.name}</p>
            <p className="text-sm text-ink/60">{order.organization.contactPerson}</p>
            <p className="text-sm text-ink/60">{order.organization.phone}</p>
          </div>
          <div className="border border-shell p-4">
            <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-2">
              Delivery Address
            </p>
            {order.shippingAddress ? (
              <>
                <p className="text-sm text-ink">{order.shippingAddress.street}</p>
                <p className="text-sm text-ink">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zip}
                </p>
              </>
            ) : (
              <p className="text-sm text-ink/40">No address on file</p>
            )}
          </div>
        </div>

        {/* Items table with checkboxes */}
        <PickListItems
          items={order.items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            category: item.product?.category ?? "General",
            unit: item.product?.unit ?? "",
          }))}
        />

        {/* Signature + footer */}
        <div className="mt-12 print:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-shell pt-8">
          <div>
            <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-6">
              Packed By
            </p>
            <div className="border-b border-ink w-full h-8" />
            <p className="text-xs text-ink/40 mt-1">Signature</p>
          </div>
          <div>
            <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-6">
              Name
            </p>
            <div className="border-b border-ink w-full h-8" />
            <p className="text-xs text-ink/40 mt-1">Print name</p>
          </div>
          <div>
            <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-6">
              Date Packed
            </p>
            <div className="border-b border-ink w-full h-8" />
            <p className="text-xs text-ink/40 mt-1">MM / DD / YYYY</p>
          </div>
        </div>

        <div className="mt-6 text-xs text-ink/30 text-center print:mt-4">
          {BRAND_NAME} — Internal Use Only
        </div>
      </div>
    </div>
  );
}
