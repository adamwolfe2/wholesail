import { prisma } from "./index";

export async function getProducts() {
  return prisma.product.findMany({
    where: { available: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getProductsByCategory(category: string) {
  return prisma.product.findMany({
    where: { available: true, category },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
  });
}

export async function getCategories() {
  const products = await prisma.product.findMany({
    where: { available: true },
    select: { category: true },
    distinct: ["category"],
    orderBy: { sortOrder: "asc" },
  });
  return products.map((p) => p.category);
}
