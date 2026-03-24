import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { captureWithContext } from "@/lib/sentry";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  description: z.string().optional(),
  unit: z.string().default("lb"),
  category: z.string().default("Uncategorized"),
  sku: z.string().optional(),
  minimumOrder: z.number().int().positive().default(1).transform(String),
  packaging: z.string().optional(),
  available: z.boolean().default(true),
  marketRate: z.boolean().default(false),
  prepayRequired: z.boolean().default(false),
  coldChainRequired: z.boolean().default(false),
  image: z.string().url().optional().or(z.literal("")),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid product data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const slug = slugify(data.name);

    // Check for duplicate slug
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A product with this name already exists" },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description || "",
        price: data.price,
        unit: data.unit,
        category: data.category,
        minimumOrder: data.minimumOrder,
        packaging: data.packaging || null,
        available: data.available,
        marketRate: data.marketRate,
        prepayRequired: data.prepayRequired,
        coldChainRequired: data.coldChainRequired,
        image: data.image || null,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    captureWithContext(error instanceof Error ? error : new Error("Unknown error"), {
      route: "POST /api/admin/products",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
