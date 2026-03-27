/**
 * Seed TBGC operational data: products, organizations, orders, invoices.
 * Run: pnpm tsx scripts/seed-tbgc-products.ts
 *
 * This seeds realistic demo data for the TBGC (Truffle Boys & Girls Club)
 * luxury food distribution portal. All data is idempotent via upsert.
 *
 * Prerequisites:
 *   - DATABASE_URL set in .env.local (pointing to TBGC's Neon DB)
 *   - Prisma schema migrated
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import type { HTTPQueryOptions } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL not set -- check .env.local");

const adapter = new PrismaNeonHttp(connectionString, {} as HTTPQueryOptions<boolean, boolean>);
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Products — 20 luxury food items across 5 categories
// ---------------------------------------------------------------------------

interface ProductSeed {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  unit: string;
  category: string;
  minimumOrder: string | null;
  packaging: string | null;
  coldChainRequired: boolean;
  prepayRequired: boolean;
  marketRate: boolean;
  sortOrder: number;
}

const PRODUCTS: ProductSeed[] = [
  // -- Truffles --
  {
    id: "tbgc-prod-001",
    slug: "fresh-black-winter-truffle",
    name: "Fresh Black Winter Truffle (Tuber Melanosporum)",
    description: "Premium Perigord black winter truffle, hand-selected from certified foragers. Intense aroma with notes of dark chocolate and earth. Sourced weekly during peak season (Dec-Mar).",
    price: 185.00,
    costPrice: 120.00,
    unit: "oz",
    category: "Truffles",
    minimumOrder: "1 oz",
    packaging: "Vacuum-sealed, nestled in rice",
    coldChainRequired: true,
    prepayRequired: true,
    marketRate: true,
    sortOrder: 1,
  },
  {
    id: "tbgc-prod-002",
    slug: "fresh-white-alba-truffle",
    name: "Fresh White Alba Truffle (Tuber Magnatum)",
    description: "The pinnacle of luxury fungi. Italian white Alba truffle with unmistakable garlic-honey-musk aroma. Extremely limited availability Oct-Dec. Price fluctuates with market.",
    price: 425.00,
    costPrice: 310.00,
    unit: "oz",
    category: "Truffles",
    minimumOrder: "0.5 oz",
    packaging: "Paper-wrapped, refrigerated container",
    coldChainRequired: true,
    prepayRequired: true,
    marketRate: true,
    sortOrder: 2,
  },
  {
    id: "tbgc-prod-003",
    slug: "black-truffle-butter",
    name: "Black Truffle Butter",
    description: "European-style cultured butter blended with 8% Perigord black truffle pieces. Made in small batches. Perfect for finishing steaks, pasta, and risotto.",
    price: 32.00,
    costPrice: 18.50,
    unit: "8oz jar",
    category: "Truffles",
    minimumOrder: "3 jars",
    packaging: "Glass jar, wax-sealed",
    coldChainRequired: true,
    prepayRequired: false,
    marketRate: false,
    sortOrder: 3,
  },
  {
    id: "tbgc-prod-004",
    slug: "truffle-honey",
    name: "Truffle Honey (Acacia)",
    description: "Italian acacia honey infused with black truffle shavings. Pairs beautifully with aged cheese, charcuterie, and gelato. 12-month shelf life.",
    price: 24.00,
    costPrice: 12.00,
    unit: "8oz jar",
    category: "Truffles",
    minimumOrder: "6 jars",
    packaging: "Glass jar, gift-ready label",
    coldChainRequired: false,
    prepayRequired: false,
    marketRate: false,
    sortOrder: 4,
  },

  // -- Caviar --
  {
    id: "tbgc-prod-005",
    slug: "osetra-caviar",
    name: "Osetra Caviar (Russian Sturgeon)",
    description: "Medium-grain golden-brown pearls from Acipenser gueldenstaedtii. Nutty, buttery flavor with a clean sea finish. Sustainably farmed.",
    price: 145.00,
    costPrice: 95.00,
    unit: "oz",
    category: "Caviar",
    minimumOrder: "1 oz",
    packaging: "Traditional tin, vacuum-sealed",
    coldChainRequired: true,
    prepayRequired: true,
    marketRate: false,
    sortOrder: 5,
  },
  {
    id: "tbgc-prod-006",
    slug: "kaluga-hybrid-caviar",
    name: "Kaluga Hybrid Caviar",
    description: "Large, glossy pearls rivaling Beluga. Rich, creamy, mildly briny. Farm-raised Kaluga-Amur hybrid sturgeon. Excellent for high-volume service.",
    price: 110.00,
    costPrice: 68.00,
    unit: "oz",
    category: "Caviar",
    minimumOrder: "1 oz",
    packaging: "Traditional tin, vacuum-sealed",
    coldChainRequired: true,
    prepayRequired: true,
    marketRate: false,
    sortOrder: 6,
  },
  {
    id: "tbgc-prod-007",
    slug: "paddlefish-caviar",
    name: "American Paddlefish Caviar",
    description: "Domestic wild-caught paddlefish roe. Small, dark grey pearls with a smooth, earthy flavor. An accessible entry point for caviar service.",
    price: 42.00,
    costPrice: 22.00,
    unit: "oz",
    category: "Caviar",
    minimumOrder: "2 oz",
    packaging: "Traditional tin, vacuum-sealed",
    coldChainRequired: true,
    prepayRequired: false,
    marketRate: false,
    sortOrder: 7,
  },
  {
    id: "tbgc-prod-008",
    slug: "caviar-blini-set",
    name: "Caviar Blini Set (120ct)",
    description: "Traditional buckwheat blini, flash-frozen. 120 pieces per case. Thaw-and-serve for caviar and smoked fish presentations.",
    price: 38.00,
    costPrice: 19.00,
    unit: "case",
    category: "Caviar",
    minimumOrder: "1 case",
    packaging: "Frozen, resealable case",
    coldChainRequired: true,
    prepayRequired: false,
    marketRate: false,
    sortOrder: 8,
  },

  // -- Wagyu --
  {
    id: "tbgc-prod-009",
    slug: "a5-wagyu-ribeye",
    name: "Japanese A5 Wagyu Ribeye",
    description: "Miyazaki prefecture A5 grade, BMS 10-12. The ultimate marbling. Each steak hand-cut 12-16oz. Certificate of authenticity included.",
    price: 165.00,
    costPrice: 115.00,
    unit: "lb",
    category: "Wagyu",
    minimumOrder: "2 lb",
    packaging: "Cryo-vac, branded sleeve",
    coldChainRequired: true,
    prepayRequired: true,
    marketRate: false,
    sortOrder: 9,
  },
  {
    id: "tbgc-prod-010",
    slug: "a5-wagyu-striploin",
    name: "Japanese A5 Wagyu NY Strip",
    description: "Kagoshima A5 striploin, BMS 9-11. Exceptional tenderness and buttery melt. Hand-cut portions 10-14oz.",
    price: 148.00,
    costPrice: 102.00,
    unit: "lb",
    category: "Wagyu",
    minimumOrder: "2 lb",
    packaging: "Cryo-vac, branded sleeve",
    coldChainRequired: true,
    prepayRequired: true,
    marketRate: false,
    sortOrder: 10,
  },
  {
    id: "tbgc-prod-011",
    slug: "american-wagyu-ribeye",
    name: "American Wagyu Ribeye (SRF Gold)",
    description: "Snake River Farms Gold-grade American Wagyu. BMS 9+. Rich marbling at an approachable price point for regular menu features.",
    price: 62.00,
    costPrice: 40.00,
    unit: "lb",
    category: "Wagyu",
    minimumOrder: "5 lb",
    packaging: "Cryo-vac, case pack",
    coldChainRequired: true,
    prepayRequired: false,
    marketRate: false,
    sortOrder: 11,
  },
  {
    id: "tbgc-prod-012",
    slug: "wagyu-beef-tallow",
    name: "Wagyu Beef Tallow (Rendered)",
    description: "Pure rendered wagyu tallow from A5 trim. Luxurious cooking fat for frying, searing, and pastry. Adds depth to any dish.",
    price: 28.00,
    costPrice: 14.00,
    unit: "16oz jar",
    category: "Wagyu",
    minimumOrder: "4 jars",
    packaging: "Glass jar, heat-sealed",
    coldChainRequired: false,
    prepayRequired: false,
    marketRate: false,
    sortOrder: 12,
  },

  // -- Foie Gras --
  {
    id: "tbgc-prod-013",
    slug: "whole-foie-gras-lobe",
    name: "Whole Duck Foie Gras Lobe (Grade A)",
    description: "Hudson Valley Grade A whole lobe, 1.5-1.8 lb avg. Impeccable quality for searing, torchon, or terrine preparation. Deveined upon request.",
    price: 85.00,
    costPrice: 55.00,
    unit: "lb",
    category: "Foie Gras",
    minimumOrder: "1 lobe",
    packaging: "Cryo-vac, cold-packed",
    coldChainRequired: true,
    prepayRequired: false,
    marketRate: false,
    sortOrder: 13,
  },
  {
    id: "tbgc-prod-014",
    slug: "foie-gras-slices",
    name: "Foie Gras Slices (Portioned)",
    description: "Pre-sliced Grade A foie gras, 2oz portions. Flash-frozen for consistent searing. 10 slices per pack. Ideal for high-volume tasting menus.",
    price: 92.00,
    costPrice: 60.00,
    unit: "10-pack",
    category: "Foie Gras",
    minimumOrder: "1 pack",
    packaging: "Individually separated, frozen",
    coldChainRequired: true,
    prepayRequired: false,
    marketRate: false,
    sortOrder: 14,
  },
  {
    id: "tbgc-prod-015",
    slug: "foie-gras-mousse",
    name: "Duck Foie Gras Mousse",
    description: "Silky mousse of duck foie gras with Sauternes and black pepper. Ready to plate or pipe. Shelf-stable until opened.",
    price: 36.00,
    costPrice: 20.00,
    unit: "7oz tin",
    category: "Foie Gras",
    minimumOrder: "4 tins",
    packaging: "Traditional tin, shelf-stable",
    coldChainRequired: false,
    prepayRequired: false,
    marketRate: false,
    sortOrder: 15,
  },

  // -- Specialty Items --
  {
    id: "tbgc-prod-016",
    slug: "saffron-threads-grade-1",
    name: "Saffron Threads (Grade 1, Iranian)",
    description: "ISO 3632 Grade 1 saffron from Khorasan province. Deep red stigmas, 260+ coloring strength. Packaged in light-proof container.",
    price: 18.00,
    costPrice: 10.00,
    unit: "gram",
    category: "Specialty Items",
    minimumOrder: "5 grams",
    packaging: "Light-proof vial, sealed",
    coldChainRequired: false,
    prepayRequired: false,
    marketRate: true,
    sortOrder: 16,
  },
  {
    id: "tbgc-prod-017",
    slug: "high-quality-vanilla-beans",
    name: "Tahitian Vanilla Beans (Grade A)",
    description: "Plump, oily Grade A Tahitian vanilla beans. Floral, cherry-anise aroma profile. 6-7 inches, 25 beans per pack.",
    price: 68.00,
    costPrice: 38.00,
    unit: "25-pack",
    category: "Specialty Items",
    minimumOrder: "1 pack",
    packaging: "Vacuum-sealed pouch",
    coldChainRequired: false,
    prepayRequired: false,
    marketRate: false,
    sortOrder: 17,
  },
  {
    id: "tbgc-prod-018",
    slug: "aged-balsamic-tradizionale",
    name: "Aceto Balsamico Tradizionale (25yr)",
    description: "DOP-certified traditional balsamic from Modena. 25 years of barrel aging. Dense, complex, sweet-tart. A few drops transform any plate.",
    price: 145.00,
    costPrice: 88.00,
    unit: "100ml bottle",
    category: "Specialty Items",
    minimumOrder: "1 bottle",
    packaging: "DOP-stamped glass bottle, boxed",
    coldChainRequired: false,
    prepayRequired: false,
    marketRate: false,
    sortOrder: 18,
  },
  {
    id: "tbgc-prod-019",
    slug: "smoked-salmon-scottish",
    name: "Scottish Smoked Salmon (Whole Side)",
    description: "Cold-smoked over oak chips for 24 hours. Silky texture, clean smoke finish. Pre-sliced whole side, approx 2.5 lb. Pairs with caviar blini.",
    price: 48.00,
    costPrice: 28.00,
    unit: "side",
    category: "Specialty Items",
    minimumOrder: "2 sides",
    packaging: "Vacuum-sealed, skin-on",
    coldChainRequired: true,
    prepayRequired: false,
    marketRate: false,
    sortOrder: 19,
  },
  {
    id: "tbgc-prod-020",
    slug: "iberico-jamon-hand-sliced",
    name: "Iberico de Bellota Jamon (Hand-Sliced)",
    description: "48-month cured Iberico ham from acorn-fed pigs. Hand-sliced by master cortador. Rich, nutty, melt-on-tongue texture. 4oz packs.",
    price: 52.00,
    costPrice: 32.00,
    unit: "4oz pack",
    category: "Specialty Items",
    minimumOrder: "4 packs",
    packaging: "Vacuum-sealed, interleaved",
    coldChainRequired: true,
    prepayRequired: false,
    marketRate: false,
    sortOrder: 20,
  },
];

// ---------------------------------------------------------------------------
// Organizations — 3 demo restaurant clients at different tiers
// ---------------------------------------------------------------------------

interface OrgSeed {
  id: string;
  name: string;
  tier: "NEW" | "REPEAT" | "VIP";
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  paymentTerms: string;
  creditLimit: number | null;
  notes: string;
  referralCode: string;
  onboardingStep: number;
  approvedAt: Date | null;
}

const ORGANIZATIONS: OrgSeed[] = [
  {
    id: "tbgc-org-vip",
    name: "Maison Laurent",
    tier: "VIP",
    contactPerson: "Chef Laurent Dupont",
    email: "chef@maisonlaurent.com",
    phone: "(323) 555-0101",
    website: "maisonlaurent.com",
    paymentTerms: "NET30",
    creditLimit: 25000,
    notes: "Two-Michelin-star French restaurant in Beverly Hills. Weekly truffle and foie gras orders. High-volume caviar for tasting menu. Priority delivery required.",
    referralCode: "MAISON-VIP",
    onboardingStep: 4,
    approvedAt: new Date("2025-06-15"),
  },
  {
    id: "tbgc-org-repeat",
    name: "Ember & Oak Steakhouse",
    tier: "REPEAT",
    contactPerson: "Marco Bellini",
    email: "marco@emberandoak.com",
    phone: "(310) 555-0202",
    website: "emberandoak.com",
    paymentTerms: "NET15",
    creditLimit: 15000,
    notes: "Upscale steakhouse in West Hollywood. Regular wagyu orders. Growing caviar program. Reliable weekly ordering pattern.",
    referralCode: "EMBER-REF",
    onboardingStep: 4,
    approvedAt: new Date("2025-09-01"),
  },
  {
    id: "tbgc-org-new",
    name: "Saffron & Vine",
    tier: "NEW",
    contactPerson: "Priya Sharma",
    email: "priya@saffronandvine.com",
    phone: "(213) 555-0303",
    website: "saffronandvine.com",
    paymentTerms: "COD",
    creditLimit: null,
    notes: "New Mediterranean-fusion restaurant in Silver Lake. First wholesale order placed. Interested in truffles and specialty pantry items.",
    referralCode: "SAFFRON-NEW",
    onboardingStep: 2,
    approvedAt: new Date("2026-03-10"),
  },
];

// ---------------------------------------------------------------------------
// Users — one per organization + one admin
// ---------------------------------------------------------------------------

interface UserSeed {
  id: string;
  email: string;
  name: string;
  role: "CLIENT" | "SALES_REP" | "ADMIN";
  organizationId: string | null;
}

const USERS: UserSeed[] = [
  {
    id: "tbgc-user-admin",
    email: "adam@truffleboys.com",
    name: "Adam Wolfe",
    role: "ADMIN",
    organizationId: null,
  },
  {
    id: "tbgc-user-vip",
    email: "chef@maisonlaurent.com",
    name: "Chef Laurent Dupont",
    role: "CLIENT",
    organizationId: "tbgc-org-vip",
  },
  {
    id: "tbgc-user-repeat",
    email: "marco@emberandoak.com",
    name: "Marco Bellini",
    role: "CLIENT",
    organizationId: "tbgc-org-repeat",
  },
  {
    id: "tbgc-user-new",
    email: "priya@saffronandvine.com",
    name: "Priya Sharma",
    role: "CLIENT",
    organizationId: "tbgc-org-new",
  },
];

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------

interface AddressSeed {
  id: string;
  organizationId: string;
  type: "SHIPPING" | "BILLING";
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

const ADDRESSES: AddressSeed[] = [
  {
    id: "tbgc-addr-vip",
    organizationId: "tbgc-org-vip",
    type: "SHIPPING",
    street: "9876 Wilshire Blvd",
    city: "Beverly Hills",
    state: "CA",
    zip: "90210",
    isDefault: true,
  },
  {
    id: "tbgc-addr-repeat",
    organizationId: "tbgc-org-repeat",
    type: "SHIPPING",
    street: "8421 Sunset Blvd",
    city: "West Hollywood",
    state: "CA",
    zip: "90069",
    isDefault: true,
  },
  {
    id: "tbgc-addr-new",
    organizationId: "tbgc-org-new",
    type: "SHIPPING",
    street: "3150 Sunset Blvd",
    city: "Los Angeles",
    state: "CA",
    zip: "90026",
    isDefault: true,
  },
];

// ---------------------------------------------------------------------------
// Orders — 5 orders with items, various statuses
// ---------------------------------------------------------------------------

interface OrderItemSeed {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface OrderSeed {
  id: string;
  orderNumber: string;
  organizationId: string;
  userId: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  notes: string | null;
  shippingAddressId: string;
  items: OrderItemSeed[];
  createdAt: Date;
}

const ORDERS: OrderSeed[] = [
  {
    id: "tbgc-order-001",
    orderNumber: "TBGC-2026-001",
    organizationId: "tbgc-org-vip",
    userId: "tbgc-user-vip",
    status: "DELIVERED",
    notes: "Weekly standing order -- priority AM delivery before 10am",
    shippingAddressId: "tbgc-addr-vip",
    createdAt: new Date("2026-03-10T08:00:00Z"),
    items: [
      { productId: "tbgc-prod-001", name: "Fresh Black Winter Truffle (Tuber Melanosporum)", quantity: 4, unitPrice: 185.00 },
      { productId: "tbgc-prod-005", name: "Osetra Caviar (Russian Sturgeon)", quantity: 8, unitPrice: 145.00 },
      { productId: "tbgc-prod-013", name: "Whole Duck Foie Gras Lobe (Grade A)", quantity: 3, unitPrice: 85.00 },
    ],
  },
  {
    id: "tbgc-order-002",
    orderNumber: "TBGC-2026-002",
    organizationId: "tbgc-org-repeat",
    userId: "tbgc-user-repeat",
    status: "SHIPPED",
    notes: "Wagyu for weekend tasting event -- need by Friday 3pm",
    shippingAddressId: "tbgc-addr-repeat",
    createdAt: new Date("2026-03-18T14:30:00Z"),
    items: [
      { productId: "tbgc-prod-009", name: "Japanese A5 Wagyu Ribeye", quantity: 6, unitPrice: 165.00 },
      { productId: "tbgc-prod-010", name: "Japanese A5 Wagyu NY Strip", quantity: 4, unitPrice: 148.00 },
      { productId: "tbgc-prod-011", name: "American Wagyu Ribeye (SRF Gold)", quantity: 10, unitPrice: 62.00 },
    ],
  },
  {
    id: "tbgc-order-003",
    orderNumber: "TBGC-2026-003",
    organizationId: "tbgc-org-vip",
    userId: "tbgc-user-vip",
    status: "CONFIRMED",
    notes: "Tasting menu refresh -- new caviar and specialty items",
    shippingAddressId: "tbgc-addr-vip",
    createdAt: new Date("2026-03-22T10:15:00Z"),
    items: [
      { productId: "tbgc-prod-006", name: "Kaluga Hybrid Caviar", quantity: 6, unitPrice: 110.00 },
      { productId: "tbgc-prod-014", name: "Foie Gras Slices (Portioned)", quantity: 3, unitPrice: 92.00 },
      { productId: "tbgc-prod-018", name: "Aceto Balsamico Tradizionale (25yr)", quantity: 2, unitPrice: 145.00 },
      { productId: "tbgc-prod-008", name: "Caviar Blini Set (120ct)", quantity: 2, unitPrice: 38.00 },
    ],
  },
  {
    id: "tbgc-order-004",
    orderNumber: "TBGC-2026-004",
    organizationId: "tbgc-org-new",
    userId: "tbgc-user-new",
    status: "PENDING",
    notes: "First order -- opening week supplies",
    shippingAddressId: "tbgc-addr-new",
    createdAt: new Date("2026-03-25T16:00:00Z"),
    items: [
      { productId: "tbgc-prod-003", name: "Black Truffle Butter", quantity: 6, unitPrice: 32.00 },
      { productId: "tbgc-prod-004", name: "Truffle Honey (Acacia)", quantity: 8, unitPrice: 24.00 },
      { productId: "tbgc-prod-016", name: "Saffron Threads (Grade 1, Iranian)", quantity: 10, unitPrice: 18.00 },
      { productId: "tbgc-prod-017", name: "Tahitian Vanilla Beans (Grade A)", quantity: 2, unitPrice: 68.00 },
    ],
  },
  {
    id: "tbgc-order-005",
    orderNumber: "TBGC-2026-005",
    organizationId: "tbgc-org-repeat",
    userId: "tbgc-user-repeat",
    status: "CANCELLED",
    notes: "Cancelled -- event postponed to next month",
    shippingAddressId: "tbgc-addr-repeat",
    createdAt: new Date("2026-03-20T09:45:00Z"),
    items: [
      { productId: "tbgc-prod-002", name: "Fresh White Alba Truffle (Tuber Magnatum)", quantity: 2, unitPrice: 425.00 },
      { productId: "tbgc-prod-019", name: "Scottish Smoked Salmon (Whole Side)", quantity: 4, unitPrice: 48.00 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Invoices — 3 invoices (PAID, PENDING, OVERDUE)
// ---------------------------------------------------------------------------

interface InvoiceSeed {
  id: string;
  invoiceNumber: string;
  orderId: string;
  organizationId: string;
  status: "PAID" | "PENDING" | "OVERDUE";
  dueDate: Date;
  paidAt: Date | null;
}

const INVOICES: InvoiceSeed[] = [
  {
    id: "tbgc-inv-001",
    invoiceNumber: "TBGC-INV-2026-001",
    orderId: "tbgc-order-001",
    organizationId: "tbgc-org-vip",
    status: "PAID",
    dueDate: new Date("2026-04-09"),
    paidAt: new Date("2026-03-18"),
  },
  {
    id: "tbgc-inv-002",
    invoiceNumber: "TBGC-INV-2026-002",
    orderId: "tbgc-order-002",
    organizationId: "tbgc-org-repeat",
    status: "PENDING",
    dueDate: new Date("2026-04-02"),
    paidAt: null,
  },
  {
    id: "tbgc-inv-003",
    invoiceNumber: "TBGC-INV-2026-003",
    orderId: "tbgc-order-003",
    organizationId: "tbgc-org-vip",
    status: "OVERDUE",
    dueDate: new Date("2026-03-15"),
    paidAt: null,
  },
];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

function computeOrderTotals(items: OrderItemSeed[]): {
  subtotal: number;
  tax: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = Math.round(subtotal * 0.0925 * 100) / 100; // CA sales tax
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
}

async function main() {
  console.log("Seeding TBGC product catalog and operational data...\n");

  // -- Products --
  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        costPrice: p.costPrice,
        unit: p.unit,
        category: p.category,
        minimumOrder: p.minimumOrder,
        packaging: p.packaging,
        coldChainRequired: p.coldChainRequired,
        prepayRequired: p.prepayRequired,
        marketRate: p.marketRate,
        sortOrder: p.sortOrder,
        available: true,
      },
      create: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        costPrice: p.costPrice,
        unit: p.unit,
        category: p.category,
        minimumOrder: p.minimumOrder,
        packaging: p.packaging,
        coldChainRequired: p.coldChainRequired,
        prepayRequired: p.prepayRequired,
        marketRate: p.marketRate,
        sortOrder: p.sortOrder,
        available: true,
      },
    });
  }
  console.log(`  [OK] ${PRODUCTS.length} products upserted`);

  // -- Organizations --
  for (const org of ORGANIZATIONS) {
    await prisma.organization.upsert({
      where: { id: org.id },
      update: {
        name: org.name,
        tier: org.tier,
        contactPerson: org.contactPerson,
        email: org.email,
        phone: org.phone,
        website: org.website,
        paymentTerms: org.paymentTerms,
        creditLimit: org.creditLimit,
        notes: org.notes,
        onboardingStep: org.onboardingStep,
      },
      create: {
        id: org.id,
        name: org.name,
        tier: org.tier,
        contactPerson: org.contactPerson,
        email: org.email,
        phone: org.phone,
        website: org.website,
        paymentTerms: org.paymentTerms,
        creditLimit: org.creditLimit,
        notes: org.notes,
        referralCode: org.referralCode,
        onboardingStep: org.onboardingStep,
        approvedAt: org.approvedAt,
      },
    });
  }
  console.log(`  [OK] ${ORGANIZATIONS.length} organizations upserted`);

  // -- Users --
  for (const u of USERS) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        email: u.email,
        name: u.name,
        role: u.role,
        organizationId: u.organizationId,
      },
      create: {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        organizationId: u.organizationId,
      },
    });
  }
  console.log(`  [OK] ${USERS.length} users upserted`);

  // -- Addresses --
  for (const addr of ADDRESSES) {
    await prisma.address.upsert({
      where: { id: addr.id },
      update: {},
      create: {
        id: addr.id,
        organizationId: addr.organizationId,
        type: addr.type,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        zip: addr.zip,
        isDefault: addr.isDefault,
      },
    });
  }
  console.log(`  [OK] ${ADDRESSES.length} addresses upserted`);

  // -- Orders + Order Items --
  for (const o of ORDERS) {
    const { subtotal, tax, total } = computeOrderTotals(o.items);

    await prisma.order.upsert({
      where: { id: o.id },
      update: {
        status: o.status,
        subtotal,
        tax,
        total,
        notes: o.notes,
      },
      create: {
        id: o.id,
        orderNumber: o.orderNumber,
        organizationId: o.organizationId,
        userId: o.userId,
        status: o.status,
        subtotal,
        tax,
        total,
        shippingAddressId: o.shippingAddressId,
        notes: o.notes,
        paidAt: ["DELIVERED", "SHIPPED", "CONFIRMED"].includes(o.status) ? o.createdAt : null,
        createdAt: o.createdAt,
      },
    });

    for (const item of o.items) {
      const itemId = `${o.id}-${item.productId}`;
      await prisma.orderItem.upsert({
        where: { id: itemId },
        update: {
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        },
        create: {
          id: itemId,
          orderId: o.id,
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        },
      });
    }
  }
  console.log(`  [OK] ${ORDERS.length} orders with items upserted`);

  // -- Invoices --
  for (const inv of INVOICES) {
    const order = await prisma.order.findUnique({
      where: { id: inv.orderId },
      select: { subtotal: true, tax: true, total: true },
    });
    if (!order) {
      console.log(`  [WARN] Order ${inv.orderId} not found, skipping invoice ${inv.invoiceNumber}`);
      continue;
    }

    await prisma.invoice.upsert({
      where: { id: inv.id },
      update: {
        status: inv.status,
        dueDate: inv.dueDate,
        paidAt: inv.paidAt,
      },
      create: {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        orderId: inv.orderId,
        organizationId: inv.organizationId,
        dueDate: inv.dueDate,
        status: inv.status,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        paidAt: inv.paidAt,
      },
    });
  }
  console.log(`  [OK] ${INVOICES.length} invoices upserted`);

  // -- Summary --
  console.log("\n--- TBGC Seed Summary ---");
  console.log(`  Products:      ${PRODUCTS.length} (${[...new Set(PRODUCTS.map((p) => p.category))].join(", ")})`);
  console.log(`  Organizations: ${ORGANIZATIONS.length} (NEW, REPEAT, VIP)`);
  console.log(`  Users:         ${USERS.length}`);
  console.log(`  Orders:        ${ORDERS.length} (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)`);
  console.log(`  Invoices:      ${INVOICES.length} (PAID, PENDING, OVERDUE)`);
  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
