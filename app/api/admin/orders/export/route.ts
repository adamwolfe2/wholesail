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

const HEADERS = ["Order Number", "Date", "Client", "Status", "Items", "Subtotal", "Tax", "Total"];
const BATCH_SIZE = 1000;

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Write CSV header
        controller.enqueue(encoder.encode(HEADERS.map(csvEscape).join(",") + "\n"));

        // Stream rows in cursor-based batches to avoid OOM
        let cursor: string | undefined;
        let hasMore = true;

        while (hasMore) {
          const orders = await prisma.order.findMany({
            take: BATCH_SIZE,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
            include: {
              organization: { select: { name: true } },
              items: { select: { name: true, quantity: true, unitPrice: true, total: true } },
            },
            orderBy: { id: "asc" },
          });

          for (const o of orders) {
            const row = [
              csvEscape(o.orderNumber),
              csvEscape(new Date(o.createdAt).toISOString().split("T")[0]),
              csvEscape(o.organization.name),
              csvEscape(o.status),
              csvEscape(o.items.length),
              csvEscape(Number(o.subtotal).toFixed(2)),
              csvEscape(Number(o.tax).toFixed(2)),
              csvEscape(Number(o.total).toFixed(2)),
            ];
            controller.enqueue(encoder.encode(row.join(",") + "\n"));
          }

          if (orders.length < BATCH_SIZE) {
            hasMore = false;
          } else {
            cursor = orders[orders.length - 1].id;
          }
        }

        controller.close();
      } catch (err) {
        console.error("Error exporting orders:", err);
        controller.error(err);
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="orders-export-${new Date().toISOString().split("T")[0]}.csv"`,
      "Transfer-Encoding": "chunked",
    },
  });
}
