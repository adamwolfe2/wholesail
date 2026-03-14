import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { createOrderWithRetry } from "@/lib/order-number";
import { dispatchWebhook } from "@/lib/webhooks";
import { csvImportLimiter, checkRateLimit } from "@/lib/rate-limit";

interface ParsedLine {
  sku: string;
  quantity: number;
}

function parseCSV(text: string): { items: ParsedLine[]; errors: string[] } {
  const lines = text.trim().split("\n").filter((l) => l.trim());
  if (lines.length === 0) return { items: [], errors: ["CSV is empty"] };

  let startIdx = 0;
  const firstLine = lines[0].toLowerCase();
  if (firstLine.includes("product_sku") || firstLine.includes("quantity")) {
    startIdx = 1;
  }

  const items: ParsedLine[] = [];
  const errors: string[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
    const sku = cols[0] ?? "";
    const qtyStr = cols[1] ?? "";

    if (!sku) {
      errors.push(`Row ${i + 1}: product_sku is required`);
      continue;
    }

    const quantity = parseInt(qtyStr, 10);
    if (!Number.isFinite(quantity) || quantity < 1) {
      errors.push(`Row ${i + 1}: quantity must be a positive integer (got "${qtyStr}")`);
      continue;
    }

    items.push({ sku, quantity });
  }

  return { items, errors };
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { allowed } = await checkRateLimit(csvImportLimiter, userId);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: "No organization linked to your account" }, { status: 403 });
    }

    const organizationId = user.organizationId;

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No CSV file provided" }, { status: 400 });
    }

    const text = await file.text();
    const { items, errors: parseErrors } = parseCSV(text);

    if (parseErrors.length > 0) {
      return NextResponse.json({ error: "CSV validation failed", details: parseErrors }, { status: 400 });
    }
    if (items.length === 0) {
      return NextResponse.json({ error: "No valid items found in CSV" }, { status: 400 });
    }

    // Look up all products by slug
    const slugs = items.map((i) => i.sku);
    const products = await prisma.product.findMany({
      where: { slug: { in: slugs } },
      select: { id: true, slug: true, name: true, price: true, distributorOrgId: true },
    });

    const productMap = new Map(products.map((p) => [p.slug, p]));

    // Validate all SKUs exist
    const missingSKUs = slugs.filter((s) => !productMap.has(s));
    if (missingSKUs.length > 0) {
      return NextResponse.json(
        { error: "Unknown product SKUs", details: missingSKUs.map((s) => `SKU not found: ${s}`) },
        { status: 400 }
      );
    }

    // Build order items
    const orderItems = items.map((item) => {
      const product = productMap.get(item.sku)!;
      const unitPrice = Number(product.price);
      return {
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        unitPrice,
        total: unitPrice * item.quantity,
        distributorOrgId: product.distributorOrgId ?? null,
      };
    });

    const subtotal = orderItems.reduce((acc, i) => acc + i.total, 0);

    const order = await createOrderWithRetry(async (orderNumber) => {
      return prisma.order.create({
        data: {
          orderNumber,
          organizationId,
          userId,
          status: "PENDING",
          subtotal,
          tax: 0,
          deliveryFee: 0,
          total: subtotal,
          notes: "[CSV Import] Order created via bulk CSV import",
          items: { create: orderItems },
        },
      });
    });

    dispatchWebhook("order.created", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      organizationId,
      total: subtotal,
    }).catch(() => {});

    return NextResponse.json(
      { orderId: order.id, orderNumber: order.orderNumber, itemCount: items.length, total: subtotal },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in client/orders/import:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
