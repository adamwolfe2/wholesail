import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";

function csvEscape(value: string | number | null | undefined): string {
  const str = String(value ?? "");
  const sanitized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${sanitized.replace(/"/g, '""')}"`;
}

const HEADERS = [
  "Name",
  "Slug",
  "Category",
  "Price",
  "Cost",
  "Margin %",
  "Unit",
  "Min Order",
  "Available",
  "Market Rate",
  "Prepay",
  "Cold Chain",
  "Distributor",
];

const BATCH_SIZE = 1000;

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(HEADERS.map(csvEscape).join(",") + "\n"));

        let cursor: string | undefined;
        let hasMore = true;

        while (hasMore) {
          const products = await prisma.product.findMany({
            take: BATCH_SIZE,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
            include: {
              distributorOrg: { select: { name: true } },
            },
            orderBy: { id: "asc" },
          });

          for (const p of products) {
            const price = Number(p.price);
            const cost = p.costPrice ? Number(p.costPrice) : null;
            const margin = cost !== null && price > 0 ? (((price - cost) / price) * 100).toFixed(1) : "";

            const row = [
              csvEscape(p.name),
              csvEscape(p.slug),
              csvEscape(p.category),
              csvEscape(price.toFixed(2)),
              csvEscape(cost !== null ? cost.toFixed(2) : ""),
              csvEscape(margin),
              csvEscape(p.unit),
              csvEscape(p.minimumOrder ?? ""),
              csvEscape(p.available ? "Yes" : "No"),
              csvEscape(p.marketRate ? "Yes" : "No"),
              csvEscape(p.prepayRequired ? "Yes" : "No"),
              csvEscape(p.coldChainRequired ? "Yes" : "No"),
              csvEscape(p.distributorOrg?.name ?? ""),
            ];
            controller.enqueue(encoder.encode(row.join(",") + "\n"));
          }

          if (products.length < BATCH_SIZE) {
            hasMore = false;
          } else {
            cursor = products[products.length - 1].id;
          }
        }

        controller.close();
      } catch (err) {
        console.error("Error exporting products:", err);
        controller.error(err);
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="products-export-${new Date().toISOString().split("T")[0]}.csv"`,
      "Transfer-Encoding": "chunked",
    },
  });
}
