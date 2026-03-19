import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCategories } from "@/lib/db/products";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

type SortParam = "price_asc" | "price_desc" | "name_asc" | "featured";

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const sort = (searchParams.get("sort") as SortParam) || "featured";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "100")));

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

    const [products, total, categories] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
      prisma.product.count({ where }),
      getCategories(),
    ]);

    const sanitizedProducts = userId
      ? products
      : products.map(({ price, costPrice, ...rest }: Record<string, unknown>) => rest);

    return NextResponse.json({ products: sanitizedProducts, total, page, limit, categories });
  } catch (err) {
    console.error("[api/products]", err);
    // DB not connected — return empty so frontend falls back to static data
    return NextResponse.json({ products: [], categories: [] });
  }
}
