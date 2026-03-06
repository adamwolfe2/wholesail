import { getProducts, getCategories } from '@/lib/db/products'
import { prisma } from '@/lib/db'
import { CatalogClient } from '@/components/catalog-client'
import type { Product } from '@/lib/products'

// Revalidate every 5 minutes — products change infrequently
export const revalidate = 300

export default async function CatalogPage() {
  // All three fetches run in parallel; products + categories are served from
  // unstable_cache so they rarely hit the DB
  const [dbProducts, categories, inventory] = await Promise.all([
    getProducts(),
    getCategories(),
    prisma.inventoryLevel.findMany({
      select: { productId: true, quantityOnHand: true },
      where: { quantityOnHand: { gt: 0, lte: 5 } },
    }),
  ])

  // Serialize Decimal → number before passing to client component
  const products: Product[] = dbProducts.map(p => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    unit: p.unit,
    description: p.description,
    category: p.category,
    minimumOrder: p.minimumOrder ?? undefined,
    packaging: p.packaging ?? undefined,
    available: p.available,
    coldChainRequired: p.coldChainRequired,
    marketRate: p.marketRate,
    prepayRequired: p.prepayRequired,
    image: p.image ?? null,
    slug: p.slug,
  }))

  const lowStock: Record<string, number> = {}
  for (const inv of inventory) {
    lowStock[inv.productId] = inv.quantityOnHand
  }

  return (
    <CatalogClient
      initialProducts={products}
      initialCategories={categories}
      initialLowStock={lowStock}
    />
  )
}
