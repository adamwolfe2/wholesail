import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Products" };
import { ProductImportForm } from "./product-import-form";
import { ProductTable } from "./product-table";
import { ProductAddForm } from "./product-add-form";
import { EmptyState } from "@/components/empty-state";
import { Boxes } from "lucide-react";

export default async function AdminProductsPage() {
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let categories: string[] = [];

  try {
    products = await getProducts();
    const uniqueCategories = [...new Set(products.map((p) => p.category))];
    categories = uniqueCategories.sort();
  } catch {
    // DB not connected
  }

  const serialized = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.slug,
    category: p.category,
    price: String(p.price),
    costPrice: p.costPrice ? String(p.costPrice) : null,
    unit: p.unit,
    available: p.available,
    marketRate: p.marketRate,
    prepayRequired: p.prepayRequired,
    coldChainRequired: p.coldChainRequired,
    minimumOrder: p.minimumOrder ?? null,
    description: p.description ?? null,
    image: p.image ?? null,
  }));

  const activeCount = products.filter((p) => p.available).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-3xl font-normal">Products</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {activeCount} active / {products.length} total across {categories.length} categories
          </span>
          <ProductAddForm />
        </div>
      </div>

      {/* CSV Import */}
      <Card>
        <CardHeader>
          <CardTitle>Import Products</CardTitle>
          <CardDescription>
            Upload a CSV or spreadsheet file to add or update products in bulk.
            Works from your phone — just pick the file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductImportForm />
          <div className="mt-4 text-xs text-muted-foreground space-y-1">
            <p><strong>Required columns:</strong> name, price</p>
            <p><strong>Optional columns:</strong> description, unit, category, sku, minimum_order, packaging, available, market_rate, prepay_required, cold_chain</p>
            <p>Products are matched by SKU or name slug. Existing products with the same slug will be updated.</p>
          </div>
        </CardContent>
      </Card>

      {/* Product Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>Click the pencil icon to edit price and minimum order. Toggle the switch to enable/disable products.</CardDescription>
        </CardHeader>
        <CardContent>
          {serialized.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title="No Products Yet"
              description="Upload a CSV above or use the Add Product button to build your catalog."
            />
          ) : (
            <ProductTable products={serialized} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getProducts() {
  return prisma.product.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
}
