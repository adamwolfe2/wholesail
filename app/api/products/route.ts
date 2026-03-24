import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCategories } from "@/lib/db/products";
import { prisma } from "@/lib/db";
import { captureWithContext } from "@/lib/sentry";
import { Prisma } from "@prisma/client";
import { publicApiLimiter, checkRateLimit, getIp } from "@/lib/rate-limit";

type SortParam = "price_asc" | "price_desc" | "name_asc" | "featured";

export async function GET(req: NextRequest) {
  // Rate limit: 60 requests per IP per minute
  const { allowed } = await checkRateLimit(publicApiLimiter, getIp(req));
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

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

    // Always strip costPrice — only admin routes expose it
    const sanitizedProducts = products.map(
      ({ costPrice, ...product }: Record<string, unknown>) => {
        if (!userId) {
          const { price, ...rest } = product;
          return rest;
        }
        return product;
      }
    );

    return NextResponse.json({ products: sanitizedProducts, total, page, limit, categories });
  } catch (err) {
    captureWithContext(err instanceof Error ? err : new Error("Unknown error"), {
      route: "GET /api/products",
    });
    // DB not connected — return empty so frontend falls back to static data
    return NextResponse.json({ products: [], categories: [] });
  }
}
