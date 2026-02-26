import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";

// CSV row schema — flexible to handle various spreadsheet formats
const productRowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(""),
  price: z.coerce.number().nonnegative(),
  unit: z.string().optional().default("each"),
  category: z.string().optional().default("Uncategorized"),
  sku: z.string().optional(),
  minimum_order: z.string().optional(),
  packaging: z.string().optional(),
  available: z
    .string()
    .optional()
    .transform((v) => v?.toLowerCase() !== "false" && v?.toLowerCase() !== "no"),
  market_rate: z
    .string()
    .optional()
    .transform((v) => v?.toLowerCase() === "true" || v?.toLowerCase() === "yes"),
  prepay_required: z
    .string()
    .optional()
    .transform((v) => v?.toLowerCase() === "true" || v?.toLowerCase() === "yes"),
  cold_chain: z
    .string()
    .optional()
    .transform((v) => v?.toLowerCase() === "true" || v?.toLowerCase() === "yes"),
});

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  // Parse header — normalize to snake_case
  const headers = lines[0].split(",").map((h) =>
    h
      .trim()
      .replace(/^["']|["']$/g, "")
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
  );

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx]?.trim().replace(/^["']|["']$/g, "") || "";
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No data rows found in CSV" },
        { status: 400 }
      );
    }

    const results = {
      created: 0,
      updated: 0,
      errors: [] as { row: number; name: string; error: string }[],
    };

    // Pre-fetch all existing slugs in one query to avoid N+1 lookups
    const allSlugs = new Set(
      (await prisma.product.findMany({ select: { slug: true } })).map((p) => p.slug)
    );

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const parsed = productRowSchema.safeParse(row);

      if (!parsed.success) {
        results.errors.push({
          row: i + 2, // +2 for 1-indexed + header row
          name: row.name || `Row ${i + 2}`,
          error: parsed.error.errors.map((e) => e.message).join(", "),
        });
        continue;
      }

      const data = parsed.data;
      const slug = data.sku
        ? slugify(data.sku)
        : slugify(data.name);

      try {
        const isExisting = allSlugs.has(slug);

        await prisma.product.upsert({
          where: { slug },
          create: {
            slug,
            name: data.name,
            description: data.description,
            price: data.price,
            unit: data.unit,
            category: data.category,
            minimumOrder: data.minimum_order || null,
            packaging: data.packaging || null,
            available: data.available,
            marketRate: data.market_rate,
            prepayRequired: data.prepay_required,
            coldChainRequired: data.cold_chain,
            sortOrder: i,
          },
          update: {
            name: data.name,
            description: data.description,
            price: data.price,
            unit: data.unit,
            category: data.category,
            minimumOrder: data.minimum_order || null,
            packaging: data.packaging || null,
            available: data.available,
            marketRate: data.market_rate,
            prepayRequired: data.prepay_required,
            coldChainRequired: data.cold_chain,
          },
        });

        if (isExisting) {
          results.updated++;
        } else {
          results.created++;
          allSlugs.add(slug); // prevent duplicate new slugs in the same import
        }
      } catch (err) {
        results.errors.push({
          row: i + 2,
          name: data.name,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    // Audit event
    await prisma.auditEvent.create({
      data: {
        entityType: "Product",
        entityId: "bulk-import",
        action: "csv_import",
        userId,
        metadata: {
          totalRows: rows.length,
          created: results.created,
          errors: results.errors.length,
        },
      },
    });

    return NextResponse.json({
      message: `Imported ${results.created + results.updated} products (${results.created} created, ${results.updated} updated)`,
      ...results,
    });
  } catch (error) {
    console.error("Product import error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
