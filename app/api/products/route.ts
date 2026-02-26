import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/lib/db/products";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

type SortParam = "price_asc" | "price_desc" | "name_asc" | "featured";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const sort = (searchParams.get("sort") as SortParam) || "featured";

    // Build where clause
    const where: Prisma.ProductWhereInput = { available: true };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      default:
        orderBy = { sortOrder: "asc" };
    }

    const [products, categories] = await Promise.all([
      prisma.product.findMany({ where, orderBy }),
      getCategories(),
    ]);

    return NextResponse.json({ products, categories });
  } catch {
    // DB not connected — return empty so frontend falls back to static data
    return NextResponse.json({ products: [], categories: [] });
  }
}
