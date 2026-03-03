// SAMPLE DATA — replace with client product categories
export interface CatalogCategory {
  slug: string           // URL slug: "truffles"
  name: string           // Display name: "Truffles"
  dbCategory: string     // Prisma category field value: "Truffles"
  title: string          // SEO title
  description: string    // Meta description
  headline: string       // H1 on the page
  body: string           // 2-3 sentence intro paragraph
  keywords: string[]
}

export const catalogCategories: CatalogCategory[] = [
  {
    slug: "truffles",
    name: "Truffles",
    dbCategory: "Truffles",
    title: "Wholesale Truffles — Black & White Truffle Supplier | Wholesail",
    description: "Wholesale black truffles, white truffles, and summer truffles for Michelin-starred restaurants, hotels, and private chefs. Same-day SoCal delivery. Nationwide 24-48hr.",
    headline: "Wholesale Truffles",
    body: "Wholesail sources fresh black and white truffles directly from Périgord, Alba, and the Pacific Northwest — available for same-day delivery across SoCal and 24-48hr nationwide. We supply Michelin-starred kitchens, luxury hotels, and private chefs with the freshest seasonal truffles available.",
    keywords: ["wholesale truffles", "buy truffles wholesale", "black truffle supplier", "white truffle wholesale", "restaurant truffle supplier", "fresh truffles Los Angeles"],
  },
  {
    slug: "caviar",
    name: "Caviar",
    dbCategory: "Caviar",
    title: "Wholesale Caviar — Kaluga, Osetra & Sturgeon Supplier | Wholesail",
    description: "Premium wholesale caviar including Kaluga Hybrid 000, Osetra, and Sevruga for fine dining restaurants, hotels, and catering. Cold-chain delivery nationwide.",
    headline: "Wholesale Caviar",
    body: "From Kaluga Hybrid 000 to Osetra and beyond, Wholesail carries the full premium caviar spectrum. All caviar ships cold-chain — insulated packaging with ice packs — to preserve the bead integrity and flavor profile your program demands.",
    keywords: ["wholesale caviar", "buy caviar wholesale", "Kaluga caviar supplier", "Osetra caviar wholesale", "restaurant caviar supplier", "caviar distributor Los Angeles"],
  },
  {
    slug: "wagyu",
    name: "Wagyu & Protein",
    dbCategory: "Wagyu & Protein",
    title: "Wholesale A5 Wagyu & Premium Proteins | Wholesail",
    description: "Wholesale A5 Japanese Wagyu, premium beef, and specialty proteins for fine dining restaurants. BMS 8-12, sourced from Miyazaki, Kagoshima, and Hokkaido prefectures.",
    headline: "Wholesale Wagyu & Premium Proteins",
    body: "Authentic A5 Japanese Wagyu from Miyazaki, Kagoshima, and Hokkaido — verified grade with BMS 8-12 marbling. Wholesail handles cold-chain logistics so your striploin and ribeye arrive at the exact temperature needed for your program.",
    keywords: ["wholesale wagyu", "A5 wagyu supplier", "wholesale wagyu beef", "Japanese wagyu distributor", "premium beef wholesale", "wagyu Los Angeles"],
  },
  {
    slug: "foie-gras",
    name: "Foie Gras & Duck",
    dbCategory: "Foie Gras & Duck",
    title: "Wholesale Foie Gras & Duck — Grade A Supplier | Wholesail",
    description: "Grade A foie gras, duck confit, magret, and specialty duck products for restaurants and catering. Ships to all states except California.",
    headline: "Wholesale Foie Gras & Duck",
    body: "Wholesail carries Grade A whole lobe foie gras, Hudson Valley duck, magret, and duck confit — the full program for any serious kitchen. All duck and foie products ship cold-chain. We supply chefs across the country (note: foie gras ships to all states except California).",
    keywords: ["wholesale foie gras", "foie gras supplier", "Grade A foie gras", "duck wholesale", "duck confit wholesale", "restaurant foie gras"],
  },
  {
    slug: "salumi",
    name: "Salumi & Charcuterie",
    dbCategory: "Salumi & Charcuterie",
    title: "Wholesale Italian Salumi & Charcuterie | Wholesail",
    description: "Wholesale imported Italian salumi, prosciutto, salami, and artisan charcuterie for restaurants, hotels, and catering. Same-day SoCal delivery.",
    headline: "Wholesale Salumi & Charcuterie",
    body: "From bison salami to imported Italian prosciutto and artisan coppa, Wholesail's charcuterie selection covers every program need. Hand-selected from the best producers — consistent quality, reliable availability.",
    keywords: ["wholesale salumi", "Italian charcuterie wholesale", "prosciutto wholesale", "salami wholesale", "artisan charcuterie supplier"],
  },
  {
    slug: "coffee-tea",
    name: "Coffee & Tea",
    dbCategory: "Coffee & Tea",
    title: "Wholesale Specialty Coffee & Premium Tea | Wholesail",
    description: "Wholesale specialty coffee, matcha, and premium tea for hotels, restaurants, and hospitality programs. Curated for fine dining service.",
    headline: "Wholesale Coffee & Tea",
    body: "Wholesail's coffee and tea selection is curated for hospitality programs that don't compromise — specialty-grade coffee and ceremonial matcha alongside premium teas for dining room service.",
    keywords: ["wholesale specialty coffee", "matcha wholesale", "premium tea wholesale", "restaurant coffee supplier", "hospitality beverage wholesale"],
  },
]

export function getCategoryBySlug(slug: string): CatalogCategory | undefined {
  return catalogCategories.find(c => c.slug === slug)
}
