import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendQuoteToClientEmail } from "@/lib/email";

const createQuoteSchema = z.object({
  organizationId: z.string().min(1),
  repId: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        name: z.string().min(1),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
      })
    )
    .min(1),
  discount: z.number().min(0).default(0),
  notes: z.string().optional(),
  expiresAt: z.string().optional(),
  status: z.enum(["DRAFT", "SENT"]).default("DRAFT"),
});

async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `QT-${year}-`;
  const last = await prisma.quote.findFirst({
    where: { quoteNumber: { startsWith: prefix } },
    orderBy: { quoteNumber: "desc" },
    select: { quoteNumber: true },
  });
  const seq = last
    ? parseInt(last.quoteNumber.replace(prefix, ""), 10) + 1
    : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

export async function POST(req: NextRequest) {
  const { userId, error: authError } = await requireAdmin();
  if (authError) return authError;

  try {

    const body = await req.json();
    const parsed = createQuoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid quote data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const subtotal = data.items.reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0
    );
    const total = Math.max(0, subtotal - data.discount);
    const quoteNumber = await generateQuoteNumber();

    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        organizationId: data.organizationId,
        repId: data.repId ?? userId,
        status: data.status,
        subtotal,
        discount: data.discount,
        total,
        notes: data.notes ?? null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.unitPrice * item.quantity,
          })),
        },
      },
    });

    // Notify client when quote is sent directly (not saved as draft)
    if (data.status === "SENT") {
      const orgData = await prisma.organization.findUnique({
        where: { id: data.organizationId },
        select: { email: true, contactPerson: true, name: true },
      });
      if (orgData?.email) {
        sendQuoteToClientEmail({
          quoteNumber,
          quoteId: quote.id,
          clientName: orgData.contactPerson || orgData.name,
          clientEmail: orgData.email,
          total,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
          notes: data.notes,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    console.error("Error creating quote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
