import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { adminReadLimiter, checkRateLimit } from "@/lib/rate-limit";

function csvEscape(value: string | number | null | undefined): string {
  const str = String(value ?? "");
  const sanitized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${sanitized.replace(/"/g, '""')}"`;
}

const HEADERS = [
  "Name",
  "Contact Person",
  "Email",
  "Phone",
  "Tier",
  "Total Orders",
  "Lifetime Revenue",
  "Last Order Date",
  "Created At",
];

const BATCH_SIZE = 500;

export async function GET() {
  const { userId, error } = await requireAdmin();
  if (error) return error;

  const rl = await checkRateLimit(adminReadLimiter, userId);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(HEADERS.map(csvEscape).join(",") + "\n"));

        let cursor: string | undefined;
        let hasMore = true;

        while (hasMore) {
          const orgs = await prisma.organization.findMany({
            take: BATCH_SIZE,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
            include: {
              orders: {
                select: { total: true, createdAt: true },
                orderBy: { createdAt: "desc" },
              },
            },
            orderBy: { id: "asc" },
          });

          for (const o of orgs) {
            const totalOrders = o.orders.length;
            const lifetimeRevenue = o.orders.reduce(
              (sum, order) => sum + Number(order.total),
              0,
            );
            const lastOrderDate =
              o.orders.length > 0
                ? o.orders[0].createdAt.toISOString().split("T")[0]
                : "";

            const row = [
              csvEscape(o.name),
              csvEscape(o.contactPerson),
              csvEscape(o.email),
              csvEscape(o.phone),
              csvEscape(o.tier),
              csvEscape(totalOrders),
              csvEscape(lifetimeRevenue.toFixed(2)),
              csvEscape(lastOrderDate),
              csvEscape(o.createdAt.toISOString().split("T")[0]),
            ];
            controller.enqueue(encoder.encode(row.join(",") + "\n"));
          }

          if (orgs.length < BATCH_SIZE) {
            hasMore = false;
          } else {
            cursor = orgs[orgs.length - 1].id;
          }
        }

        controller.close();
      } catch (err) {
        console.error("Error exporting clients:", err);
        controller.error(err);
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="clients-export-${new Date().toISOString().split("T")[0]}.csv"`,
      "Transfer-Encoding": "chunked",
    },
  });
}
