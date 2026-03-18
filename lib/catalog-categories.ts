// Override these categories in portal.config.ts or replace this file for client-specific catalogs

export interface CatalogCategory {
  slug: string           // URL slug: "beverages"
  name: string           // Display name: "Beverages"
  dbCategory: string     // Prisma category field value: "Beverages"
  title: string          // SEO title
  description: string    // Meta description
  headline: string       // H1 on the page
  body: string           // 2-3 sentence intro paragraph
  keywords: string[]
  icon?: string          // Optional icon identifier
  seoTitle?: string      // Override for SEO <title> if different from title
  seoDescription?: string // Override for SEO meta description
}

const defaultCategories: CatalogCategory[] = [
  {
    slug: "beverages",
    name: "Beverages",
    dbCategory: "Beverages",
    title: "Wholesale Beverages",
    description: "Drinks and liquid products for your business. Order wholesale beverages with reliable delivery and competitive pricing.",
    headline: "Wholesale Beverages",
    body: "A full selection of wholesale beverages for your business — from craft sodas and juices to specialty drinks. Competitive pricing with flexible delivery schedules.",
    keywords: ["wholesale beverages", "bulk drinks", "beverage distributor", "wholesale drinks supplier"],
  },
  {
    slug: "dry-goods",
    name: "Dry Goods",
    dbCategory: "Dry Goods",
    title: "Wholesale Dry Goods",
    description: "Shelf-stable dry goods and pantry staples in bulk. Wholesale pricing for restaurants, hotels, and food service operations.",
    headline: "Wholesale Dry Goods",
    body: "Pantry staples, grains, flours, and shelf-stable ingredients — all available at wholesale pricing. Reliable inventory with consistent quality for your operation.",
    keywords: ["wholesale dry goods", "bulk pantry staples", "dry goods distributor", "wholesale grains"],
  },
  {
    slug: "frozen",
    name: "Frozen",
    dbCategory: "Frozen",
    title: "Wholesale Frozen Products",
    description: "Frozen products with cold-chain delivery. Wholesale pricing for restaurants, catering, and food service businesses.",
    headline: "Wholesale Frozen Products",
    body: "Premium frozen products delivered with full cold-chain integrity. From proteins to prepared items, every order ships temperature-controlled to preserve quality.",
    keywords: ["wholesale frozen food", "frozen products distributor", "bulk frozen goods", "cold chain delivery"],
  },
  {
    slug: "refrigerated",
    name: "Refrigerated",
    dbCategory: "Refrigerated",
    title: "Wholesale Refrigerated Products",
    description: "Fresh refrigerated products with temperature-controlled delivery. Wholesale pricing for food service and hospitality.",
    headline: "Wholesale Refrigerated Products",
    body: "Fresh dairy, meats, produce, and perishables — all delivered with temperature-controlled logistics. Quality you can count on, delivered on your schedule.",
    keywords: ["wholesale refrigerated", "fresh wholesale products", "refrigerated distributor", "cold storage wholesale"],
  },
  {
    slug: "supplies",
    name: "Supplies",
    dbCategory: "Supplies",
    title: "Wholesale Supplies",
    description: "Business supplies and consumables at wholesale prices. Everything your operation needs to run smoothly.",
    headline: "Wholesale Supplies",
    body: "Packaging, disposables, cleaning products, and operational supplies — all at wholesale pricing. Keep your business stocked without breaking the budget.",
    keywords: ["wholesale supplies", "business supplies bulk", "restaurant supplies wholesale", "operational supplies"],
  },
  {
    slug: "equipment",
    name: "Equipment",
    dbCategory: "Equipment",
    title: "Wholesale Equipment",
    description: "Commercial equipment and tools for your business. Wholesale pricing on professional-grade gear.",
    headline: "Wholesale Equipment",
    body: "Professional-grade equipment for your operation. From small wares to larger tools, find what you need at competitive wholesale prices.",
    keywords: ["wholesale equipment", "commercial equipment", "business equipment wholesale", "professional equipment"],
  },
  {
    slug: "seasonal",
    name: "Seasonal",
    dbCategory: "Seasonal",
    title: "Seasonal Products",
    description: "Limited-availability seasonal products at wholesale prices. Fresh seasonal items with timely delivery.",
    headline: "Seasonal Products",
    body: "Seasonal specialties available for a limited time. We source the best seasonal products and make them available at wholesale pricing while supplies last.",
    keywords: ["seasonal wholesale", "seasonal products", "limited availability wholesale", "seasonal specialties"],
  },
  {
    slug: "specialty",
    name: "Specialty",
    dbCategory: "Specialty",
    title: "Specialty Products",
    description: "Premium specialty products at wholesale prices. Curated selection for discerning businesses.",
    headline: "Specialty Products",
    body: "A curated selection of specialty and premium products for businesses that demand the best. Unique items sourced from trusted producers.",
    keywords: ["wholesale specialty products", "premium wholesale", "specialty distributor", "curated wholesale"],
  },
]

export const catalogCategories: CatalogCategory[] = defaultCategories

export function getCategories(): CatalogCategory[] {
  return catalogCategories
}

export function getCategoryBySlug(slug: string): CatalogCategory | undefined {
  return catalogCategories.find(c => c.slug === slug)
}
