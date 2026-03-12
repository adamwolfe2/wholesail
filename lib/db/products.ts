import { unstable_cache } from "next/cache";
import { prisma } from "./index";

export const getProducts = unstable_cache(
  async () =>
    prisma.product.findMany({
      where: { available: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        unit: true,
        price: true,
        image: true,
        available: true,
        sortOrder: true,
        coldChainRequired: true,
        marketRate: true,
        prepayRequired: true,
        minimumOrder: true,
        packaging: true,
      },
    }),
  ["products-all"],
  { revalidate: 300, tags: ["products"] }
);

export const getProductsByCategory = unstable_cache(
  async (category: string) =>
    prisma.product.findMany({
      where: { available: true, category },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        unit: true,
        price: true,
        image: true,
        available: true,
        sortOrder: true,
        coldChainRequired: true,
        marketRate: true,
        prepayRequired: true,
        minimumOrder: true,
        packaging: true,
      },
    }),
  ["products-by-category"],
  { revalidate: 300, tags: ["products"] }
);

export const getProductBySlug = unstable_cache(
  async (slug: string) =>
    prisma.product.findUnique({
      where: { slug },
    }),
  ["product-by-slug"],
  { revalidate: 300, tags: ["products"] }
);

export const getCategories = unstable_cache(
  async () => {
    const products = await prisma.product.findMany({
      where: { available: true },
      select: { category: true },
      distinct: ["category"],
      orderBy: { sortOrder: "asc" },
    });
    return products.map((p) => p.category);
  },
  ["product-categories"],
  { revalidate: 300, tags: ["products"] }
);
