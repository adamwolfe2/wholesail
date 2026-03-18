import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { PriceListPDF } from "@/lib/pdf/price-list-pdf";
import type { OrgTier } from "@prisma/client";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        organizationId: true,
        organization: {
          select: {
            name: true,
            tier: true,
          },
        },
      },
    });

    if (!user?.organizationId || !user.organization) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name: orgName, tier } = user.organization;

    // Fetch active products
    const products = await prisma.product.findMany({
      where: { available: true },
      select: {
        name: true,
        unit: true,
        price: true,
        category: true,
        marketRate: true,
      },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    });

    // Fetch tier pricing rules
    const pricingRules = await prisma.pricingRule.findMany({
      where: { tier: tier as OrgTier, isActive: true },
      select: { category: true, discountPct: true },
    });

    const discounts = pricingRules.map((r) => ({
      category: r.category ?? "All Categories",
      discountPct: Number(r.discountPct),
    }));

    const priceListProducts = products.map((p) => ({
      name: p.name,
      unit: p.unit,
      price: p.marketRate ? null : Number(p.price),
      category: p.category,
      marketRate: p.marketRate,
    }));

    const generatedAt = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Render PDF
    const pdfElement = createElement(PriceListPDF, {
      orgName,
      tier: tier as "NEW" | "REPEAT" | "VIP",
      generatedAt,
      discounts,
      products: priceListProducts,
    });

    // PriceListPDF renders a <Document> at its root, but createElement's
    // return type doesn't satisfy @react-pdf/renderer's narrow overload.
    // @ts-expect-error — React.ReactElement vs react-pdf's internal element type
    const buffer = await renderToBuffer(pdfElement);

    const filename = `Wholesail-Price-List-${orgName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating price list PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate price list" },
      { status: 500 }
    );
  }
}
