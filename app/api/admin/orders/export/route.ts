import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";

/** Escape a value for CSV: wrap in quotes, double any internal quotes. */
function csvEscape(value: string | number): string {
  const str = String(value);
  // Prevent CSV injection by prefixing formula-starting characters
  const sanitized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${sanitized.replace(/"/g, '""')}"`;
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const orders = await prisma.order.findMany({
      include: {
        organization: { select: { name: true } },
        items: { select: { name: true, quantity: true, unitPrice: true, total: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Order Number",
      "Date",
      "Client",
      "Status",
      "Items",
      "Subtotal",
      "Tax",
      "Total",
    ];

    const rows = orders.map((o) => [
      csvEscape(o.orderNumber),
      csvEscape(new Date(o.createdAt).toISOString().split("T")[0]),
      csvEscape(o.organization.name),
      csvEscape(o.status),
      csvEscape(o.items.length),
      csvEscape(Number(o.subtotal).toFixed(2)),
      csvEscape(Number(o.tax).toFixed(2)),
      csvEscape(Number(o.total).toFixed(2)),
    ]);

    const csv = [headers.map(csvEscape).join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="orders-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (err) {
    console.error("Error exporting orders:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
