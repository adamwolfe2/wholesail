import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["DRAFT", "PENDING", "PAID", "OVERDUE", "CANCELLED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: { id: true, status: true, invoiceNumber: true, orderId: true, total: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {
      status: parsed.data.status,
    };

    // If marking as paid, record the payment date
    if (parsed.data.status === "PAID") {
      updates.paidAt = new Date();

      // Also create a payment record if one doesn't exist
      const existingPayment = await prisma.payment.findFirst({
        where: { orderId: invoice.orderId, status: "COMPLETED" },
      });

      if (!existingPayment) {
        await prisma.payment.create({
          data: {
            orderId: invoice.orderId,
            amount: invoice.total,
            method: "CHECK",
            status: "COMPLETED",
          },
        });
      }
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: updates,
    });

    await prisma.auditEvent.create({
      data: {
        entityType: "Invoice",
        entityId: id,
        action: "status_updated",
        userId,
        metadata: {
          invoiceNumber: invoice.invoiceNumber,
          from: invoice.status,
          to: parsed.data.status,
        },
      },
    });

    return NextResponse.json({ invoice: updated });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
