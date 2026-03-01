import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // optional filter
  const from = searchParams.get("from");     // optional date filter YYYY-MM-DD
  const to = searchParams.get("to");         // optional date filter YYYY-MM-DD

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (from || to) {
    where.createdAt = {};
    if (from) (where.createdAt as Record<string, unknown>).gte = new Date(from);
    if (to) (where.createdAt as Record<string, unknown>).lte = new Date(to + "T23:59:59Z");
  }

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      organization: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Build CSV
  const headers = [
    "Invoice #",
    "Client",
    "Email",
    "Status",
    "Subtotal",
    "Tax",
    "Total",
    "Due Date",
    "Paid At",
    "Created",
  ];

  function csvEscape(val: string | number | null | undefined): string {
    if (val == null) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  function fmtDate(d: Date | null | undefined): string {
    if (!d) return "";
    return d.toISOString().split("T")[0];
  }

  const rows = invoices.map((inv) =>
    [
      csvEscape(inv.invoiceNumber),
      csvEscape(inv.organization?.name),
      csvEscape(inv.organization?.email),
      csvEscape(inv.status),
      csvEscape(Number(inv.subtotal).toFixed(2)),
      csvEscape(Number(inv.tax ?? 0).toFixed(2)),
      csvEscape(Number(inv.total).toFixed(2)),
      csvEscape(fmtDate(inv.dueDate)),
      csvEscape(fmtDate(inv.paidAt)),
      csvEscape(fmtDate(inv.createdAt)),
    ].join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const filename = `wholesail-invoices-${new Date().toISOString().split("T")[0]}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
