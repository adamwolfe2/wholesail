"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  FileText,
  Users,
  BarChart3,
  MessageSquare,
  Heart,
  Search,
  Bell,
  Plus,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Star,
  Home,
  Building2,
  Settings,
  Copy,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight,
  Minus,
  Download,
  Edit,
  Award,
  Quote,
  Send,
  Shield,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────

type Brand = {
  company: string;
  logo: string;
  color: string;
  domain: string;
};

type ScrapeData = {
  companyName: string;
  companyDescription: string;
  industry: string;
  tagline: string;
  valuePropositions: string[];
  yearFounded: string;
  location: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  domain: string;
  phone: string;
  email: string;
  address: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    linkedin: string;
    twitter: string;
  };
  products: Array<{
    name: string;
    description: string;
    price: string;
    category: string;
    imageUrl: string;
    unit: string;
    featured: boolean;
  }>;
  businessType: string;
  hasWholesale: boolean;
  deliveryInfo: string;
  paymentInfo: string;
  minimumOrder: string;
  testimonials: Array<{ quote: string; author: string; company: string }>;
  clientLogos: string[];
  certifications: string[];
  heroHeadline: string;
  heroSubheadline: string;
  ctaText: string;
  aboutSnippet: string;
};

type SeedOrder = {
  number: string;
  client: string;
  items: string[];
  total: number;
  status: string;
  date: string;
  itemCount: number;
};

type SeedClient = {
  name: string;
  tier: string;
  spend: string;
  health: string;
  orders: number;
  lastOrder: string;
};

type SeedInvoice = {
  number: string;
  client: string;
  amount: number;
  status: string;
  due: string;
};

type SeedData = {
  orders: SeedOrder[];
  clients: SeedClient[];
  invoices: SeedInvoice[];
};

type View =
  | "marketing"
  | "catalog"
  | "about"
  | "client-dashboard"
  | "client-orders"
  | "client-invoices"
  | "client-analytics"
  | "client-referrals"
  | "client-settings"
  | "admin-dashboard"
  | "admin-orders"
  | "admin-clients"
  | "admin-invoices"
  | "admin-products"
  | "admin-analytics"
  | "sms-demo";

type ViewProps = { brand: Brand; data: ScrapeData; seed: SeedData };

// ── Nav Items ─────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: View; label: string; icon: typeof Home; group: string }[] = [
  { id: "marketing", label: "Marketing Site", icon: Home, group: "Public" },
  { id: "catalog", label: "Product Catalog", icon: Package, group: "Public" },
  { id: "about", label: "About", icon: Building2, group: "Public" },
  { id: "client-dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Client Portal" },
  { id: "client-orders", label: "Orders", icon: ShoppingCart, group: "Client Portal" },
  { id: "client-invoices", label: "Invoices", icon: FileText, group: "Client Portal" },
  { id: "client-analytics", label: "Analytics", icon: BarChart3, group: "Client Portal" },
  { id: "client-referrals", label: "Referrals", icon: Heart, group: "Client Portal" },
  { id: "client-settings", label: "Settings", icon: Settings, group: "Client Portal" },
  { id: "admin-dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Admin Panel" },
  { id: "admin-orders", label: "Orders", icon: ShoppingCart, group: "Admin Panel" },
  { id: "admin-clients", label: "Clients", icon: Users, group: "Admin Panel" },
  { id: "admin-invoices", label: "Invoices", icon: FileText, group: "Admin Panel" },
  { id: "admin-products", label: "Products", icon: Package, group: "Admin Panel" },
  { id: "admin-analytics", label: "Analytics", icon: BarChart3, group: "Admin Panel" },
  { id: "sms-demo", label: "SMS Ordering", icon: MessageSquare, group: "Features" },
];

// ── useDemoData Hook ──────────────────────────────────────────────────────

function useDemoData(): { brand: Brand; data: ScrapeData } {
  const params = useSearchParams();
  const [scraped, setScraped] = useState<ScrapeData | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("portal-demo-data");
      if (raw) setScraped(JSON.parse(raw));
    } catch {
      // sessionStorage unavailable or parse error
    }
  }, []);

  const color = params.get("color") || "1A1A1A";
  const brandColor = color.startsWith("#") ? color : `#${color}`;

  const brand: Brand = {
    company: scraped?.companyName || params.get("company") || "Your Company",
    logo: scraped?.logoUrl || params.get("logo") || "",
    color: scraped?.primaryColor || brandColor,
    domain: scraped?.domain || params.get("domain") || "yourcompany.com",
  };

  const fallbackProducts = [
    { name: "Premium Product A", description: "Our flagship offering", price: "$89.99", category: "Featured", imageUrl: "", unit: "each", featured: true },
    { name: "Premium Product B", description: "Best-selling item", price: "$64.99", category: "Featured", imageUrl: "", unit: "each", featured: true },
    { name: "Premium Product C", description: "Customer favorite", price: "$42.99", category: "Popular", imageUrl: "", unit: "each", featured: true },
    { name: "Premium Product D", description: "New arrival", price: "$119.99", category: "Popular", imageUrl: "", unit: "each", featured: true },
    { name: "Standard Product E", description: "Everyday essential", price: "$24.99", category: "Essentials", imageUrl: "", unit: "each", featured: false },
    { name: "Standard Product F", description: "Reliable choice", price: "$34.99", category: "Essentials", imageUrl: "", unit: "each", featured: false },
  ];

  const data: ScrapeData = scraped || {
    companyName: brand.company,
    companyDescription: `${brand.company} is a premier wholesale distributor serving businesses nationwide.`,
    industry: "Wholesale Distribution",
    tagline: "Quality products, delivered with care",
    valuePropositions: ["Premium Quality", "Fast Delivery", "Dedicated Support", "Competitive Pricing"],
    yearFounded: "2018",
    location: "United States",
    logoUrl: brand.logo,
    primaryColor: brand.color,
    secondaryColor: "#C8C0B4",
    accentColor: "#1A1614",
    domain: brand.domain,
    phone: "(555) 123-4567",
    email: `hello@${brand.domain}`,
    address: "123 Commerce St, Suite 100",
    socialLinks: { instagram: "", facebook: "", linkedin: "", twitter: "" },
    products: fallbackProducts,
    businessType: "B2B Wholesale",
    hasWholesale: true,
    deliveryInfo: "Same-day local delivery available",
    paymentInfo: "Net 30 terms available",
    minimumOrder: "$100",
    testimonials: [],
    clientLogos: [],
    certifications: [],
    heroHeadline: "",
    heroSubheadline: "",
    ctaText: "Browse Catalog",
    aboutSnippet: `${brand.company} has been a trusted partner for businesses looking for premium wholesale products. We combine quality sourcing with reliable logistics to ensure your business never misses a beat.`,
  };

  return { brand, data };
}

// ── generateSeedData ──────────────────────────────────────────────────────

function parsePrice(priceStr: string): number {
  const n = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 49.99 : n;
}

function generateSeedData(data: ScrapeData): SeedData {
  const products = data.products.length > 0 ? data.products : [];
  const industry = (data.industry || "").toLowerCase();

  // Generate industry-appropriate client names
  let clientNames: string[];
  if (industry.includes("food") || industry.includes("truffle") || industry.includes("gourmet") || industry.includes("culinary") || industry.includes("restaurant")) {
    clientNames = ["The Grand Hotel", "Bistro Napa", "Chef's Table NYC", "Pacific Grill", "La Maison", "Harbor Kitchen", "Blue Flame Steakhouse", "Golden Fork"];
  } else if (industry.includes("beauty") || industry.includes("salon") || industry.includes("cosmetic")) {
    clientNames = ["Luxe Salon & Spa", "Bloom Beauty Studio", "The Polished Look", "Serenity Aesthetics", "Radiant Skin Clinic", "Mane Street Salon", "Glow House", "Velvet Beauty Bar"];
  } else if (industry.includes("coffee") || industry.includes("tea") || industry.includes("beverage")) {
    clientNames = ["Morning Ritual Coffee", "The Daily Grind", "Steep & Sip", "Bean Counter Cafe", "Pour Over House", "Roast & Toast", "The Kettle Room", "Artisan Brews"];
  } else if (industry.includes("wine") || industry.includes("spirit") || industry.includes("liquor")) {
    clientNames = ["The Cellar Room", "Vintner's Table", "Pour Restaurant", "The Cask & Barrel", "Sommelier's Pick", "Noble Grape Bar", "The Tasting Room", "Heritage Wines"];
  } else {
    clientNames = ["Apex Industries", "Summit Group", "Meridian Co.", "Catalyst Partners", "Horizon LLC", "Atlas Commercial", "Nova Enterprises", "Pinnacle Corp"];
  }

  const statuses = ["Delivered", "Shipped", "Processing", "Pending"];
  const orders: SeedOrder[] = [];
  for (let i = 0; i < 8; i++) {
    const itemCount = 2 + Math.floor(Math.random() * 6);
    const orderItems: string[] = [];
    let total = 0;
    for (let j = 0; j < Math.min(itemCount, products.length || 3); j++) {
      const p = products[j % (products.length || 1)];
      const qty = 1 + Math.floor(Math.random() * 5);
      const price = parsePrice(p?.price || "$49.99");
      orderItems.push(`${qty}x ${p?.name || `Product ${j + 1}`}`);
      total += qty * price;
    }
    orders.push({
      number: `ORD-2026-${(847 - i).toString().padStart(4, "0")}`,
      client: clientNames[i % clientNames.length],
      items: orderItems,
      total: Math.round(total * 100) / 100,
      status: statuses[i % statuses.length],
      date: `Feb ${24 - i}`,
      itemCount,
    });
  }

  const tiers = ["VIP", "VIP", "REPEAT", "REPEAT", "NEW", "NEW", "REPEAT", "NEW"];
  const healths = ["Champion", "Champion", "Healthy", "Healthy", "At Risk", "New", "Healthy", "New"];
  const spends = [142350, 98200, 34500, 28700, 12400, 4200, 19800, 2800];

  const clients: SeedClient[] = clientNames.slice(0, 8).map((name, i) => ({
    name,
    tier: tiers[i],
    spend: `$${spends[i].toLocaleString()}`,
    health: healths[i],
    orders: [67, 45, 23, 19, 14, 5, 16, 3][i],
    lastOrder: `Feb ${24 - i}`,
  }));

  const invStatuses = ["Paid", "Pending", "Pending", "Overdue", "Paid", "Paid", "Pending", "Overdue"];
  const invoices: SeedInvoice[] = orders.slice(0, 8).map((o, i) => ({
    number: `INV-2026-${(312 - i).toString().padStart(4, "0")}`,
    client: o.client,
    amount: o.total,
    status: invStatuses[i],
    due: i === 3 || i === 7 ? `Feb ${14 + i}` : `Mar ${20 + i}`,
  }));

  return { orders, clients, invoices };
}

// ── Status Badge Helper ───────────────────────────────────────────────────

function statusStyle(status: string, brandColor: string): React.CSSProperties {
  switch (status) {
    case "Delivered":
    case "Paid":
    case "Champion":
    case "VIP":
      return { backgroundColor: "#0A0A0A", color: "#F9F7F4", borderColor: "#0A0A0A" };
    case "Shipped":
    case "Healthy":
    case "REPEAT":
      return { backgroundColor: "#C8C0B4", color: "#0A0A0A", borderColor: "#C8C0B4" };
    case "Processing":
      return { backgroundColor: `${brandColor}20`, color: brandColor, borderColor: `${brandColor}40` };
    case "Pending":
    case "New":
    case "NEW":
      return { backgroundColor: "transparent", color: "#C8C0B4", borderColor: "#E5E1DB" };
    case "Overdue":
    case "At Risk":
      return { backgroundColor: "#FEF3C7", color: "#92400E", borderColor: "#FDE68A" };
    default:
      return { backgroundColor: "transparent", color: "#C8C0B4", borderColor: "#E5E1DB" };
  }
}

function StatusBadge({ status, brandColor }: { status: string; brandColor: string }) {
  return (
    <span
      className="border text-[10px] uppercase tracking-wider px-2 py-0.5 font-mono"
      style={statusStyle(status, brandColor)}
    >
      {status}
    </span>
  );
}

// ── Shared Product Image Placeholder ──────────────────────────────────────

function ProductImage({
  product,
  brandColor,
  size = "md",
}: {
  product: { name: string; imageUrl?: string; category?: string };
  brandColor: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = size === "sm" ? "w-12 h-12" : size === "lg" ? "w-full h-40" : "w-16 h-16";
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-4xl" : "text-xl";
  const hasImage = product.imageUrl && product.imageUrl.trim() !== "";

  return (
    <div
      className={`${sizeClass} flex items-center justify-center font-serif ${textSize} flex-shrink-0 relative overflow-hidden`}
      style={{ backgroundColor: `${brandColor}12` }}
    >
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : null}
      <span className="absolute inset-0 flex items-center justify-center" style={{ color: `${brandColor}40` }}>
        {product.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 1: Marketing Homepage
// ═══════════════════════════════════════════════════════════════════════════

function MarketingView({ brand, data }: ViewProps) {
  const headline = data.heroHeadline || data.tagline || `Premium ${data.industry || "wholesale"} products, delivered to your door`;
  const featuredProducts = data.products.filter((p) => p.featured).slice(0, 4);
  const displayProducts = featuredProducts.length >= 4 ? featuredProducts : data.products.slice(0, 4);
  const vps = data.valuePropositions.length > 0 ? data.valuePropositions : ["Premium Quality", "Fast Delivery", "500+ Partners", "Dedicated Support"];
  return (
    <div className="space-y-0">
      {/* Hero */}
      <div className="p-8 sm:p-12" style={{ backgroundColor: brand.color }}>
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-white mb-4 leading-tight">
            {headline}
          </h1>
          <p className="font-sans text-sm text-white/70 mb-6 max-w-lg leading-relaxed">
            {data.companyDescription || `${brand.company} — your trusted wholesale partner. Browse our catalog, place orders online, and track deliveries in real time.`}
          </p>
          <div className="flex gap-3">
            <button className="bg-white px-6 py-3 font-mono text-xs uppercase tracking-wide border border-white" style={{ color: brand.color }}>
              {data.ctaText || "Browse Catalog"} <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
            </button>
            <button className="px-6 py-3 font-mono text-xs uppercase tracking-wide border border-white/40 text-white hover:bg-white/10">
              Apply for Wholesale
            </button>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="bg-[#1A1614] py-3 overflow-hidden">
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[...vps, ...vps, ...vps].map((vp, i) => (
            <span key={i} className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#C8C0B4] flex items-center gap-2">
              <span className="w-1 h-1 bg-[#C8C0B4]" />
              {vp}
            </span>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="p-6 sm:p-8 bg-[#F9F7F4]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Curated Selection</p>
            <h2 className="font-serif text-2xl font-bold text-[#0A0A0A]">Featured Products</h2>
          </div>
          <button className="font-mono text-[10px] uppercase tracking-wide text-[#0A0A0A]/60 hover:text-[#0A0A0A] flex items-center gap-1">
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {displayProducts.map((p, i) => (
            <div key={`${p.name}-${i}`} className="border border-[#E5E1DB] bg-[#F9F7F4] hover:border-[#C8C0B4] transition-colors cursor-pointer">
              <ProductImage product={p} brandColor={brand.color} size="lg" />
              <div className="p-4">
                <div className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono">{p.category}</div>
                <div className="font-serif text-sm mt-1 text-[#0A0A0A]">{p.name}</div>
                <div className="font-mono text-xs font-semibold mt-1 text-[#0A0A0A]">{p.price}{p.unit ? `/${p.unit}` : ""}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      {data.testimonials.length > 0 && (
        <div className="p-6 sm:p-8 bg-white border-t border-[#E5E1DB]">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Testimonials</p>
          <h2 className="font-serif text-2xl font-bold text-[#0A0A0A] mb-6">What Our Clients Say</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.testimonials.slice(0, 4).map((t, i) => (
              <div key={i} className="border border-[#E5E1DB] bg-[#F9F7F4] p-5">
                <Quote className="w-4 h-4 text-[#C8C0B4] mb-3" />
                <p className="font-sans text-sm text-[#0A0A0A]/80 mb-4 leading-relaxed">{t.quote}</p>
                <div>
                  <div className="font-mono text-xs font-semibold text-[#0A0A0A]">{t.author}</div>
                  {t.company && <div className="font-mono text-[10px] text-[#C8C0B4]">{t.company}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* About Snippet */}
      {data.aboutSnippet && (
        <div className="p-6 sm:p-8 bg-[#F9F7F4] border-t border-[#E5E1DB]">
          <div className="max-w-2xl">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">About</p>
            <h2 className="font-serif text-xl font-bold text-[#0A0A0A] mb-3">{data.companyName}</h2>
            <p className="font-sans text-sm text-[#0A0A0A]/70 leading-relaxed">{data.aboutSnippet}</p>
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <div className="px-6 sm:px-8 py-4 border-t border-[#E5E1DB] bg-[#F9F7F4]">
          <div className="flex flex-wrap gap-2">
            {data.certifications.map((cert, i) => (
              <span key={i} className="border border-[#E5E1DB] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#C8C0B4] flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 border-t border-[#E5E1DB] bg-[#F9F7F4]">
        {[
          { stat: `${data.products.length}+`, label: "Products" },
          { stat: "500+", label: "Partners" },
          { stat: data.deliveryInfo || "Same Day", label: "Delivery" },
        ].map((s) => (
          <div key={s.label} className="p-6 text-center border-r border-[#E5E1DB] last:border-r-0">
            <div className="text-2xl font-serif font-bold text-[#0A0A0A] mb-1">{s.stat}</div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 2: Product Catalog
// ═══════════════════════════════════════════════════════════════════════════

function CatalogView({ brand, data }: ViewProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(data.products.map((p) => p.category).filter(Boolean)))];

  const filtered = data.products.filter((p) => {
    const matchesSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 bg-[#F9F7F4]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Browse</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Product Catalog</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C8C0B4]" />
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-[#E5E1DB] bg-[#F9F7F4] pl-9 pr-4 py-2 font-mono text-xs w-48 focus:outline-none focus:border-[#C8C0B4]"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide border transition-colors"
            style={
              activeCategory === cat
                ? { backgroundColor: brand.color, borderColor: brand.color, color: "#F9F7F4" }
                : { backgroundColor: "transparent", borderColor: "#E5E1DB", color: "#C8C0B4" }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((p, i) => (
          <div key={`${p.name}-${i}`} className="border border-[#E5E1DB] bg-[#F9F7F4] p-4 flex gap-4 hover:border-[#C8C0B4] transition-colors">
            <ProductImage product={p} brandColor={brand.color} size="md" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono">{p.category}</div>
              <div className="font-serif text-sm text-[#0A0A0A] mt-0.5">{p.name}</div>
              <div className="font-sans text-xs text-[#0A0A0A]/50 line-clamp-2 mt-1">{p.description}</div>
              <div className="flex items-center gap-3 mt-2">
                <span className="font-mono text-xs font-semibold text-[#0A0A0A]">{p.price}{p.unit ? `/${p.unit}` : ""}</span>
                <span className="font-mono text-[10px] text-[#C8C0B4] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500" /> In Stock
                </span>
              </div>
            </div>
            <button
              className="self-center px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-[#F9F7F4] border flex-shrink-0 hover:opacity-80"
              style={{ backgroundColor: brand.color, borderColor: brand.color }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="font-mono text-sm text-[#C8C0B4]">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 3: About Page
// ═══════════════════════════════════════════════════════════════════════════

function AboutView({ brand, data }: ViewProps) {
  const socials = Object.entries(data.socialLinks || {}).filter(([, url]) => url && url.trim() !== "");

  return (
    <div className="p-6 sm:p-8 bg-[#F9F7F4]">
      <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">About Us</p>
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A] mb-6">{data.companyName}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="sm:col-span-2 space-y-6">
          <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-6">
            <p className="font-sans text-sm text-[#0A0A0A]/80 leading-relaxed">{data.aboutSnippet || data.companyDescription}</p>
          </div>

          {/* Value Propositions */}
          {data.valuePropositions.length > 0 && (
            <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-6">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-4">Why Choose Us</p>
              <div className="space-y-3">
                {data.valuePropositions.map((vp, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${brand.color}15` }}>
                      <CheckCircle2 className="w-3 h-3" style={{ color: brand.color }} />
                    </div>
                    <span className="font-sans text-sm text-[#0A0A0A]/80">{vp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-6">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-4">Certifications</p>
              <div className="flex flex-wrap gap-2">
                {data.certifications.map((cert, i) => (
                  <span key={i} className="border border-[#E5E1DB] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#0A0A0A]/60 flex items-center gap-1.5">
                    <Award className="w-3 h-3" /> {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* Company Info */}
          <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-5">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-4">Company Info</p>
            <div className="space-y-3">
              {data.yearFounded && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#C8C0B4]" />
                  <span className="font-mono text-xs text-[#0A0A0A]/70">Founded {data.yearFounded}</span>
                </div>
              )}
              {data.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#C8C0B4]" />
                  <span className="font-mono text-xs text-[#0A0A0A]/70">{data.location}</span>
                </div>
              )}
              {data.industry && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-[#C8C0B4]" />
                  <span className="font-mono text-xs text-[#0A0A0A]/70">{data.industry}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-5">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-4">Contact</p>
            <div className="space-y-3">
              {data.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#C8C0B4]" />
                  <span className="font-mono text-xs text-[#0A0A0A]/70">{data.phone}</span>
                </div>
              )}
              {data.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#C8C0B4]" />
                  <span className="font-mono text-xs text-[#0A0A0A]/70">{data.email}</span>
                </div>
              )}
              {data.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#C8C0B4]" />
                  <span className="font-mono text-xs text-[#0A0A0A]/70">{data.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          {socials.length > 0 && (
            <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-5">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-4">Social</p>
              <div className="space-y-2">
                {socials.map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-mono text-xs text-[#0A0A0A]/70 hover:text-[#0A0A0A]">
                    <ExternalLink className="w-3 h-3 text-[#C8C0B4]" />
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 4: Client Dashboard
// ═══════════════════════════════════════════════════════════════════════════

function ClientDashboardView({ brand, data, seed }: ViewProps) {
  const top3Products = data.products.slice(0, 3);
  const recentOrders = seed.orders.slice(0, 3);
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const spending = [2800, 4100, 3200, 5600, 4800, 6200];
  const maxSpend = Math.max(...spending);

  return (
    <div className="p-6 bg-[#F9F7F4]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Welcome back, Chef Thomas</h2>
          <div className="font-mono text-xs text-[#C8C0B4]">{data.companyName} · VIP Partner</div>
        </div>
        <div className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-[#F9F7F4] flex items-center gap-1" style={{ backgroundColor: brand.color }}>
          <Star className="w-3 h-3" /> 4,280 Points
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Active Orders", value: "3", icon: ShoppingCart },
          { label: "Pending Invoices", value: `$${seed.invoices.filter((i) => i.status === "Pending").reduce((s, i) => s + i.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: FileText },
          { label: "This Month", value: "$6,200", icon: DollarSign },
          { label: "Loyalty Points", value: "4,280", icon: Heart },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-[#E5E1DB] bg-[#F9F7F4] p-4">
            <kpi.icon className="w-4 h-4 text-[#C8C0B4] mb-2" strokeWidth={1.5} />
            <div className="font-mono text-lg font-bold text-[#0A0A0A]">{kpi.value}</div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Reorder */}
      {top3Products.length > 0 && (
        <div className="border border-[#E5E1DB] bg-[#F9F7F4] mb-6">
          <div className="px-4 py-3 border-b border-[#E5E1DB] flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#0A0A0A]">Quick Reorder</span>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono">Your Favorites</span>
          </div>
          <div className="p-4 flex gap-3 overflow-x-auto">
            {top3Products.map((p, i) => (
              <div key={`${p.name}-${i}`} className="border border-[#E5E1DB] bg-white p-3 min-w-[180px] flex-shrink-0">
                <ProductImage product={p} brandColor={brand.color} size="sm" />
                <div className="font-serif text-xs text-[#0A0A0A] mt-2">{p.name}</div>
                <div className="font-mono text-[10px] text-[#C8C0B4] mt-0.5">{p.price}{p.unit ? `/${p.unit}` : ""}</div>
                <div className="flex items-center gap-1 mt-2">
                  <button className="w-6 h-6 border border-[#E5E1DB] flex items-center justify-center text-[#C8C0B4] hover:border-[#0A0A0A]">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-mono text-xs text-[#0A0A0A]">2</span>
                  <button className="w-6 h-6 border border-[#E5E1DB] flex items-center justify-center text-[#C8C0B4] hover:border-[#0A0A0A]">
                    <Plus className="w-3 h-3" />
                  </button>
                  <button className="ml-auto px-2 py-1 font-mono text-[9px] uppercase text-[#F9F7F4]" style={{ backgroundColor: brand.color }}>
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4]">
          <div className="px-4 py-3 border-b border-[#E5E1DB] flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#0A0A0A]">Recent Orders</span>
            <button className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono hover:text-[#0A0A0A]">View All</button>
          </div>
          {recentOrders.map((order) => (
            <div key={order.number} className="px-4 py-3 border-b border-[#E5E1DB]/50 flex items-center justify-between">
              <div>
                <div className="font-mono text-xs font-semibold text-[#0A0A0A]">{order.number}</div>
                <div className="font-mono text-[10px] text-[#C8C0B4]">{order.date} · {order.itemCount} items</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-[#0A0A0A]">${order.total.toLocaleString()}</span>
                <StatusBadge status={order.status} brandColor={brand.color} />
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Spending */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-4">
          <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#0A0A0A] block mb-4">Monthly Spending</span>
          <div className="flex items-end gap-2 h-32">
            {months.map((m, i) => (
              <div key={m} className="flex-1 flex flex-col items-center gap-1">
                <div className="font-mono text-[9px] text-[#0A0A0A] font-semibold">${(spending[i] / 1000).toFixed(1)}K</div>
                <div
                  className="w-full transition-all"
                  style={{
                    height: `${(spending[i] / maxSpend) * 90}px`,
                    backgroundColor: i === months.length - 1 ? brand.color : `${brand.color}30`,
                  }}
                />
                <div className="font-mono text-[9px] text-[#C8C0B4]">{m}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 5: Client Orders
// ═══════════════════════════════════════════════════════════════════════════

function ClientOrdersView({ brand, seed }: ViewProps) {
  return (
    <div className="p-6 bg-[#F9F7F4]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Order History</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Your Orders</h2>
        </div>
        <button className="px-4 py-2 font-mono text-[10px] uppercase tracking-wide text-[#F9F7F4] border" style={{ backgroundColor: brand.color, borderColor: brand.color }}>
          <Plus className="w-3 h-3 inline mr-1" /> New Order
        </button>
      </div>

      <div className="border border-[#E5E1DB] bg-[#F9F7F4]">
        <div className="grid grid-cols-6 gap-4 px-4 py-2 border-b border-[#E5E1DB]">
          {["Order", "Date", "Items", "Total", "Status", ""].map((h) => (
            <div key={h || "action"} className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs font-mono">{h}</div>
          ))}
        </div>
        {seed.orders.slice(0, 6).map((order) => (
          <div key={order.number} className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-[#E5E1DB]/50 hover:bg-white/50 cursor-pointer">
            <div className="font-mono text-xs font-semibold" style={{ color: brand.color }}>{order.number}</div>
            <div className="font-mono text-xs text-[#0A0A0A]/70">{order.date}</div>
            <div className="font-mono text-xs text-[#C8C0B4]">{order.itemCount} items</div>
            <div className="font-mono text-xs font-semibold text-[#0A0A0A]">${order.total.toLocaleString()}</div>
            <div><StatusBadge status={order.status} brandColor={brand.color} /></div>
            <div>
              <button className="font-mono text-[10px] text-[#0A0A0A]/40 hover:text-[#0A0A0A] uppercase">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 6: Client Invoices
// ═══════════════════════════════════════════════════════════════════════════

function ClientInvoicesView({ brand, seed }: ViewProps) {
  const outstanding = seed.invoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);
  const current = seed.invoices.filter((i) => i.status === "Pending").reduce((s, i) => s + i.amount, 0);
  const overdue = seed.invoices.filter((i) => i.status === "Overdue").reduce((s, i) => s + i.amount, 0);
  const paid = seed.invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="p-6 bg-[#F9F7F4]">
      <div className="mb-6">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Billing</p>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Your Invoices</h2>
      </div>

      {/* Aging summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Outstanding", value: `$${outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "#0A0A0A" },
          { label: "Current", value: `$${current.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: brand.color },
          { label: "Overdue", value: `$${overdue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "#92400E" },
          { label: "Paid (Feb)", value: `$${paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "#0A0A0A" },
        ].map((s) => (
          <div key={s.label} className="border border-[#E5E1DB] bg-[#F9F7F4] p-4">
            <div className="font-mono text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="border border-[#E5E1DB] bg-[#F9F7F4]">
        <div className="grid grid-cols-5 gap-4 px-4 py-2 border-b border-[#E5E1DB]">
          {["Invoice", "Description", "Amount", "Status", "Due Date"].map((h) => (
            <div key={h} className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs font-mono">{h}</div>
          ))}
        </div>
        {seed.invoices.map((inv) => (
          <div key={inv.number} className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-[#E5E1DB]/50 hover:bg-white/50 cursor-pointer">
            <div className="font-mono text-xs font-semibold" style={{ color: brand.color }}>{inv.number}</div>
            <div className="font-mono text-xs text-[#0A0A0A]/70">{inv.client}</div>
            <div className="font-mono text-xs font-semibold text-[#0A0A0A]">${inv.amount.toLocaleString()}</div>
            <div><StatusBadge status={inv.status} brandColor={brand.color} /></div>
            <div className="font-mono text-xs text-[#C8C0B4]">{inv.due}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 7: Client Analytics
// ═══════════════════════════════════════════════════════════════════════════

function ClientAnalyticsView({ brand, data }: ViewProps) {
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const spending = [3200, 4800, 3900, 6100, 5400, 7200];
  const maxSpend = Math.max(...spending);
  const topProducts = data.products.slice(0, 5);
  const orderFreqs = [12, 10, 8, 6, 4];

  return (
    <div className="p-6 bg-[#F9F7F4]">
      <div className="mb-6">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Insights</p>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Your Analytics</h2>
      </div>

      {/* Monthly Spending */}
      <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-6 mb-6">
        <div className="font-mono text-xs uppercase tracking-wider font-semibold text-[#0A0A0A] mb-4">Monthly Spending</div>
        <div className="flex items-end gap-3 h-40">
          {months.map((m, i) => (
            <div key={m} className="flex-1 flex flex-col items-center gap-1">
              <div className="font-mono text-[9px] font-semibold text-[#0A0A0A]">${(spending[i] / 1000).toFixed(1)}K</div>
              <div
                className="w-full transition-all"
                style={{
                  height: `${(spending[i] / maxSpend) * 120}px`,
                  backgroundColor: i === months.length - 1 ? brand.color : `${brand.color}30`,
                }}
              />
              <div className="font-mono text-[9px] text-[#C8C0B4]">{m}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4]">
          <div className="px-4 py-3 border-b border-[#E5E1DB]">
            <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#0A0A0A]">Top Products by Frequency</span>
          </div>
          {topProducts.map((p, i) => (
            <div key={`${p.name}-${i}`} className="px-4 py-3 border-b border-[#E5E1DB]/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-[#C8C0B4] w-4">{i + 1}.</span>
                <span className="font-serif text-xs text-[#0A0A0A]">{p.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-[#E5E1DB]">
                  <div className="h-full" style={{ width: `${(orderFreqs[i] / orderFreqs[0]) * 100}%`, backgroundColor: brand.color }} />
                </div>
                <span className="font-mono text-[10px] text-[#C8C0B4]">{orderFreqs[i]} orders</span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Frequency */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-4">
          <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#0A0A0A] block mb-4">Order Frequency Trend</span>
          <div className="space-y-3">
            {months.map((m, i) => {
              const count = [4, 6, 5, 8, 7, 9][i];
              return (
                <div key={m} className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-[#C8C0B4] w-8">{m}</span>
                  <div className="flex-1 h-2 bg-[#E5E1DB]">
                    <div className="h-full" style={{ width: `${(count / 9) * 100}%`, backgroundColor: i === months.length - 1 ? brand.color : `${brand.color}50` }} />
                  </div>
                  <span className="font-mono text-[10px] text-[#0A0A0A] w-4 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 8: Client Referrals
// ═══════════════════════════════════════════════════════════════════════════

function ClientReferralsView({ brand, data }: ViewProps) {
  const [copied, setCopied] = useState(false);
  const refCode = `${data.companyName.replace(/\s/g, "").toUpperCase().slice(0, 6)}-REF2026`;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 bg-[#F9F7F4]">
      <div className="mb-6">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Earn Rewards</p>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Referral Program</h2>
      </div>

      {/* Referral Code */}
      <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-6 mb-6">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-3">Your Referral Code</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 border border-[#E5E1DB] bg-white px-4 py-3">
            <span className="font-mono text-sm font-semibold tracking-wider text-[#0A0A0A]">{refCode}</span>
          </div>
          <button
            onClick={handleCopy}
            className="px-4 py-3 font-mono text-[10px] uppercase tracking-wide text-[#F9F7F4] border flex items-center gap-2"
            style={{ backgroundColor: brand.color, borderColor: brand.color }}
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-6 mb-6">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-4">How It Works</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: "01", title: "Share Your Code", desc: "Send your unique referral code to other businesses in your network" },
            { step: "02", title: "They Sign Up", desc: "When they create an account and place their first order, both accounts are credited" },
            { step: "03", title: "Earn Rewards", desc: "Get $50 credit for each successful referral — no limit on earnings" },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center border border-[#E5E1DB]">
                <span className="font-mono text-sm font-bold" style={{ color: brand.color }}>{s.step}</span>
              </div>
              <div className="font-serif text-sm font-semibold text-[#0A0A0A] mb-1">{s.title}</div>
              <div className="font-sans text-xs text-[#C8C0B4]">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Referrals", value: "7" },
          { label: "Successful", value: "5" },
          { label: "Credits Earned", value: "$250" },
        ].map((s) => (
          <div key={s.label} className="border border-[#E5E1DB] bg-[#F9F7F4] p-4 text-center">
            <div className="font-mono text-xl font-bold text-[#0A0A0A]">{s.value}</div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 9: Client Settings
// ═══════════════════════════════════════════════════════════════════════════

function ClientSettingsView({ brand, data, seed }: ViewProps) {
  return (
    <div className="p-6 bg-[#F9F7F4]">
      <div className="mb-6">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Account</p>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Settings</h2>
      </div>

      <div className="space-y-4 max-w-2xl">
        {/* Profile */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono">Profile Information</p>
            <button className="font-mono text-[10px] uppercase tracking-wide text-[#0A0A0A]/60 hover:text-[#0A0A0A] flex items-center gap-1">
              <Edit className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Name", value: "Thomas Anderson" },
              { label: "Company", value: seed.clients[0]?.name || "Restaurant" },
              { label: "Email", value: `thomas@${data.domain}` },
              { label: "Phone", value: "(555) 234-5678" },
              { label: "Account Tier", value: "VIP Partner" },
              { label: "Net Terms", value: "Net 30" },
            ].map((f) => (
              <div key={f.label}>
                <div className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">{f.label}</div>
                <div className="font-mono text-xs text-[#0A0A0A]">{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-6">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-4">Notification Preferences</p>
          <div className="space-y-3">
            {[
              { label: "Order confirmations", enabled: true },
              { label: "Shipping updates", enabled: true },
              { label: "Invoice reminders", enabled: true },
              { label: "New products & promotions", enabled: false },
              { label: "Price change alerts", enabled: true },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between py-1">
                <span className="font-sans text-xs text-[#0A0A0A]/80">{n.label}</span>
                <div
                  className="w-8 h-4 border relative cursor-pointer"
                  style={{ borderColor: n.enabled ? brand.color : "#E5E1DB", backgroundColor: n.enabled ? brand.color : "transparent" }}
                >
                  <div
                    className="w-3 h-3 border absolute top-0"
                    style={{
                      left: n.enabled ? "calc(100% - 12px)" : "0px",
                      backgroundColor: n.enabled ? "#F9F7F4" : "#C8C0B4",
                      borderColor: n.enabled ? brand.color : "#E5E1DB",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Addresses */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono">Delivery Addresses</p>
            <button className="font-mono text-[10px] uppercase tracking-wide text-[#F9F7F4] px-3 py-1 flex items-center gap-1" style={{ backgroundColor: brand.color }}>
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          <div className="space-y-2">
            {[
              { label: "Primary Kitchen", address: "123 Main St, New York, NY 10001" },
              { label: "Prep Facility", address: "456 Industrial Blvd, Brooklyn, NY 11201" },
            ].map((a) => (
              <div key={a.label} className="flex items-center justify-between py-2 border-b border-[#E5E1DB]/50 last:border-0">
                <div>
                  <div className="font-mono text-xs font-semibold text-[#0A0A0A]">{a.label}</div>
                  <div className="font-mono text-[10px] text-[#C8C0B4]">{a.address}</div>
                </div>
                <button className="font-mono text-[10px] text-[#0A0A0A]/40 hover:text-[#0A0A0A] uppercase">Edit</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 10: Admin Dashboard
// ═══════════════════════════════════════════════════════════════════════════

function AdminDashboardView({ brand, data, seed }: ViewProps) {
  const pendingOrders = seed.orders.filter((o) => o.status === "Processing" || o.status === "Pending").length;
  const overdueInvoices = seed.invoices.filter((i) => i.status === "Overdue").length;
  const newClients = seed.clients.filter((c) => c.health === "New").length;

  return (
    <div className="p-6 bg-[#F9F7F4]">
      <div className="mb-6">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Admin Overview</p>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Dashboard</h2>
      </div>

      {/* Action Items */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Pending Orders", value: pendingOrders.toString(), bg: brand.color, fg: "#F9F7F4" },
          { label: "Overdue Invoices", value: overdueInvoices.toString(), bg: "#92400E", fg: "#F9F7F4" },
          { label: "New Clients", value: newClients.toString(), bg: "#0A0A0A", fg: "#F9F7F4" },
          { label: "Low Stock Items", value: "3", bg: "#C8C0B4", fg: "#0A0A0A" },
        ].map((item) => (
          <div key={item.label} className="border p-4 cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: item.bg, borderColor: item.bg }}>
            <div className="font-mono text-2xl font-bold" style={{ color: item.fg }}>{item.value}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: `${item.fg}99` }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Revenue (Feb)", value: "$84,230", change: "+23%", icon: DollarSign },
          { label: "Orders (Feb)", value: "127", change: "+15%", icon: ShoppingCart },
          { label: "Active Clients", value: "89", change: "+8", icon: Users },
          { label: "Products", value: data.products.length.toString(), change: "Live", icon: Package },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-[#E5E1DB] bg-[#F9F7F4] p-4">
            <div className="flex items-center justify-between mb-2">
              <kpi.icon className="w-4 h-4 text-[#C8C0B4]" strokeWidth={1.5} />
              <span className="font-mono text-[10px] font-semibold" style={{ color: brand.color }}>{kpi.change}</span>
            </div>
            <div className="font-mono text-lg font-bold text-[#0A0A0A]">{kpi.value}</div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4]">
          <div className="px-4 py-3 border-b border-[#E5E1DB] flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#0A0A0A]">Recent Orders</span>
            <button className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono hover:text-[#0A0A0A]">View All</button>
          </div>
          {seed.orders.slice(0, 4).map((order) => (
            <div key={order.number} className="px-4 py-3 border-b border-[#E5E1DB]/50 flex items-center justify-between">
              <div>
                <div className="font-mono text-xs font-semibold text-[#0A0A0A]">{order.number}</div>
                <div className="font-mono text-[10px] text-[#C8C0B4]">{order.client}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-[#0A0A0A]">${order.total.toLocaleString()}</span>
                <StatusBadge status={order.status} brandColor={brand.color} />
              </div>
            </div>
          ))}
        </div>

        {/* New Clients */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4]">
          <div className="px-4 py-3 border-b border-[#E5E1DB] flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#0A0A0A]">New Clients</span>
            <button className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono hover:text-[#0A0A0A]">View All</button>
          </div>
          {seed.clients.filter((c) => c.tier === "NEW").map((client) => (
            <div key={client.name} className="px-4 py-3 border-b border-[#E5E1DB]/50 flex items-center justify-between">
              <div>
                <div className="font-mono text-xs font-semibold text-[#0A0A0A]">{client.name}</div>
                <div className="font-mono text-[10px] text-[#C8C0B4]">Joined {client.lastOrder}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#0A0A0A]">{client.spend}</span>
                <StatusBadge status={client.health} brandColor={brand.color} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 11: Admin Orders
// ═══════════════════════════════════════════════════════════════════════════

function AdminOrdersView({ brand, seed }: ViewProps) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Processing", "Shipped", "Delivered", "Pending"];
  const filtered = filter === "All" ? seed.orders : seed.orders.filter((o) => o.status === filter);

  return (
    <div className="p-6 bg-[#F9F7F4]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Management</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Order Management</h2>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 font-mono text-[10px] uppercase tracking-wide border border-[#E5E1DB] text-[#C8C0B4] hover:border-[#0A0A0A] hover:text-[#0A0A0A] flex items-center gap-1">
            <Download className="w-3 h-3" /> Export CSV
          </button>
          <button className="px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-[#F9F7F4] border" style={{ backgroundColor: brand.color, borderColor: brand.color }}>
            <Plus className="w-3 h-3 inline mr-1" /> New Order
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide border transition-colors"
            style={
              filter === f
                ? { backgroundColor: "#0A0A0A", color: "#F9F7F4", borderColor: "#0A0A0A" }
                : { backgroundColor: "transparent", borderColor: "#E5E1DB", color: "#C8C0B4" }
            }
          >
            {f} {f === "All" ? `(${seed.orders.length})` : `(${seed.orders.filter((o) => o.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="border border-[#E5E1DB] bg-[#F9F7F4]">
        <div className="grid grid-cols-6 gap-4 px-4 py-2 border-b border-[#E5E1DB]">
          {["Order", "Client", "Items", "Total", "Status", "Date"].map((h) => (
            <div key={h} className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs font-mono">{h}</div>
          ))}
        </div>
        {filtered.map((order) => (
          <div key={order.number} className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-[#E5E1DB]/50 hover:bg-white/50 cursor-pointer">
            <div className="font-mono text-xs font-semibold" style={{ color: brand.color }}>{order.number}</div>
            <div className="font-mono text-xs text-[#0A0A0A]">{order.client}</div>
            <div className="font-mono text-xs text-[#C8C0B4]">{order.itemCount} items</div>
            <div className="font-mono text-xs font-semibold text-[#0A0A0A]">${order.total.toLocaleString()}</div>
            <div><StatusBadge status={order.status} brandColor={brand.color} /></div>
            <div className="font-mono text-xs text-[#C8C0B4]">{order.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 12: Admin Clients
// ═══════════════════════════════════════════════════════════════════════════

function AdminClientsView({ brand, seed }: ViewProps) {
  return (
    <div className="p-6 bg-[#F9F7F4]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">CRM</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Client Directory</h2>
        </div>
        <button className="px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-[#F9F7F4] border" style={{ backgroundColor: brand.color, borderColor: brand.color }}>
          <Plus className="w-3 h-3 inline mr-1" /> Invite Client
        </button>
      </div>

      <div className="border border-[#E5E1DB] bg-[#F9F7F4]">
        <div className="grid grid-cols-6 gap-4 px-4 py-2 border-b border-[#E5E1DB]">
          {["Client", "Tier", "Lifetime Spend", "Health", "Orders", "Last Order"].map((h) => (
            <div key={h} className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs font-mono">{h}</div>
          ))}
        </div>
        {seed.clients.map((client) => (
          <div key={client.name} className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-[#E5E1DB]/50 hover:bg-white/50 cursor-pointer">
            <div className="font-mono text-xs font-semibold text-[#0A0A0A]">{client.name}</div>
            <div><StatusBadge status={client.tier} brandColor={brand.color} /></div>
            <div className="font-mono text-xs font-semibold text-[#0A0A0A]">{client.spend}</div>
            <div><StatusBadge status={client.health} brandColor={brand.color} /></div>
            <div className="font-mono text-xs text-[#C8C0B4]">{client.orders}</div>
            <div className="font-mono text-xs text-[#C8C0B4]">{client.lastOrder}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 13: Admin Invoices
// ═══════════════════════════════════════════════════════════════════════════

function AdminInvoicesView({ brand, seed }: ViewProps) {
  const outstanding = seed.invoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);
  const current = seed.invoices.filter((i) => i.status === "Pending").reduce((s, i) => s + i.amount, 0);
  const overdue = seed.invoices.filter((i) => i.status === "Overdue").reduce((s, i) => s + i.amount, 0);
  const paid = seed.invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="p-6 bg-[#F9F7F4]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Billing</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Invoice Management</h2>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 font-mono text-[10px] uppercase tracking-wide border border-[#E5E1DB] text-[#C8C0B4] hover:border-[#0A0A0A] hover:text-[#0A0A0A] flex items-center gap-1">
            <Send className="w-3 h-3" /> Send Reminders
          </button>
          <button className="px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-[#F9F7F4] border" style={{ backgroundColor: brand.color, borderColor: brand.color }}>
            <Plus className="w-3 h-3 inline mr-1" /> New Invoice
          </button>
        </div>
      </div>

      {/* Aging summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Outstanding", value: `$${outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "#0A0A0A" },
          { label: "Current", value: `$${current.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: brand.color },
          { label: "Overdue", value: `$${overdue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "#92400E" },
          { label: "Paid (Feb)", value: `$${paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "#0A0A0A" },
        ].map((s) => (
          <div key={s.label} className="border border-[#E5E1DB] bg-[#F9F7F4] p-4">
            <div className="font-mono text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="border border-[#E5E1DB] bg-[#F9F7F4]">
        <div className="grid grid-cols-5 gap-4 px-4 py-2 border-b border-[#E5E1DB]">
          {["Invoice", "Client", "Amount", "Status", "Due Date"].map((h) => (
            <div key={h} className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs font-mono">{h}</div>
          ))}
        </div>
        {seed.invoices.map((inv) => (
          <div key={inv.number} className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-[#E5E1DB]/50 hover:bg-white/50 cursor-pointer">
            <div className="font-mono text-xs font-semibold" style={{ color: brand.color }}>{inv.number}</div>
            <div className="font-mono text-xs text-[#0A0A0A]">{inv.client}</div>
            <div className="font-mono text-xs font-semibold text-[#0A0A0A]">${inv.amount.toLocaleString()}</div>
            <div><StatusBadge status={inv.status} brandColor={brand.color} /></div>
            <div className="font-mono text-xs text-[#C8C0B4]">{inv.due}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 14: Admin Products
// ═══════════════════════════════════════════════════════════════════════════

function AdminProductsView({ brand, data }: ViewProps) {
  return (
    <div className="p-6 bg-[#F9F7F4]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Catalog</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Product Management</h2>
        </div>
        <button className="px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-[#F9F7F4] border" style={{ backgroundColor: brand.color, borderColor: brand.color }}>
          <Plus className="w-3 h-3 inline mr-1" /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.products.map((p, i) => {
          const stockLevel = [24, 8, 156, 89, 203, 67, 45, 31, 120, 15, 78, 92][i % 12];
          return (
            <div key={`${p.name}-${i}`} className="border border-[#E5E1DB] bg-[#F9F7F4] hover:border-[#C8C0B4] transition-colors">
              <ProductImage product={p} brandColor={brand.color} size="lg" />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono">{p.category}</div>
                    <div className="font-serif text-sm text-[#0A0A0A] mt-0.5">{p.name}</div>
                  </div>
                  <button className="p-1.5 border border-[#E5E1DB] text-[#C8C0B4] hover:text-[#0A0A0A] hover:border-[#0A0A0A]">
                    <Edit className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-mono text-xs font-semibold text-[#0A0A0A]">{p.price}{p.unit ? `/${p.unit}` : ""}</span>
                  <span className="font-mono text-[10px] text-[#C8C0B4] flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 ${stockLevel > 20 ? "bg-green-500" : stockLevel > 5 ? "bg-amber-400" : "bg-red-400"}`} />
                    {stockLevel} in stock
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Product CTA card */}
        <div className="border border-dashed border-[#E5E1DB] bg-[#F9F7F4] flex items-center justify-center min-h-[200px] cursor-pointer hover:border-[#C8C0B4] transition-colors">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center border border-[#E5E1DB]">
              <Plus className="w-5 h-5 text-[#C8C0B4]" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#C8C0B4]">Add Product</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 15: Admin Analytics
// ═══════════════════════════════════════════════════════════════════════════

function AdminAnalyticsView({ brand, data, seed }: ViewProps) {
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const revenues = [42, 58, 51, 73, 68, 84];
  const maxRev = Math.max(...revenues);
  const categories = Array.from(new Set(data.products.map((p) => p.category).filter(Boolean)));

  return (
    <div className="p-6 bg-[#F9F7F4]">
      <div className="mb-6">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Intelligence</p>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Business Analytics</h2>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Revenue (Feb)", value: "$84,230", change: "+23%", icon: DollarSign },
          { label: "Orders (Feb)", value: "127", change: "+15%", icon: ShoppingCart },
          { label: "Active Clients", value: "89", change: "+8", icon: Users },
          { label: "Avg Order Value", value: "$663", change: "+12%", icon: TrendingUp },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-[#E5E1DB] bg-[#F9F7F4] p-4">
            <div className="flex items-center justify-between mb-2">
              <kpi.icon className="w-4 h-4 text-[#C8C0B4]" strokeWidth={1.5} />
              <span className="font-mono text-[10px] font-semibold" style={{ color: brand.color }}>{kpi.change}</span>
            </div>
            <div className="font-mono text-lg font-bold text-[#0A0A0A]">{kpi.value}</div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-6 mb-6">
        <div className="font-mono text-xs uppercase tracking-wider font-semibold text-[#0A0A0A] mb-4">Monthly Revenue</div>
        <div className="flex items-end gap-3 h-40">
          {months.map((m, i) => (
            <div key={m} className="flex-1 flex flex-col items-center gap-1">
              <div className="font-mono text-[9px] font-semibold text-[#0A0A0A]">${revenues[i]}K</div>
              <div
                className="w-full transition-all"
                style={{
                  height: `${(revenues[i] / maxRev) * 120}px`,
                  backgroundColor: i === months.length - 1 ? brand.color : `${brand.color}30`,
                }}
              />
              <div className="font-mono text-[9px] text-[#C8C0B4]">{m}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top clients */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4]">
          <div className="px-4 py-3 border-b border-[#E5E1DB]">
            <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#0A0A0A]">Top Clients by Revenue</span>
          </div>
          {seed.clients.slice(0, 5).map((client, i) => (
            <div key={client.name} className="px-4 py-3 border-b border-[#E5E1DB]/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-[#C8C0B4] w-4">{i + 1}.</span>
                <span className="font-mono text-xs font-semibold text-[#0A0A0A]">{client.name}</span>
                <StatusBadge status={client.tier} brandColor={brand.color} />
              </div>
              <span className="font-mono text-xs font-semibold text-[#0A0A0A]">{client.spend}</span>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-4">
          <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#0A0A0A] block mb-4">Category Breakdown</span>
          <div className="space-y-3">
            {categories.slice(0, 6).map((cat, i) => {
              const count = data.products.filter((p) => p.category === cat).length;
              const pct = Math.round((count / data.products.length) * 100);
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-[#0A0A0A] w-28 truncate">{cat}</span>
                  <div className="flex-1 h-2 bg-[#E5E1DB]">
                    <div className="h-full" style={{ width: `${pct}%`, backgroundColor: i === 0 ? brand.color : `${brand.color}${60 - i * 10}` }} />
                  </div>
                  <span className="font-mono text-[10px] text-[#C8C0B4] w-10 text-right">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 16: SMS Ordering Demo
// ═══════════════════════════════════════════════════════════════════════════

function SmsDemoView({ brand, data }: ViewProps) {
  const p1 = data.products[0];
  const p2 = data.products.length > 1 ? data.products[1] : data.products[0];
  const p1Price = parsePrice(p1?.price || "$49.99");
  const p2Price = parsePrice(p2?.price || "$79.99");
  const p1Qty = 2;
  const p2Qty = 5;
  const p1Total = p1Price * p1Qty;
  const p2Total = p2Price * p2Qty;
  const subtotal = p1Total + p2Total;
  const tax = Math.round(subtotal * 0.0875 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const initialMessage = `Hey, I need ${p1Qty} ${p1?.unit || "units"} of the ${p1?.name || "Product A"} and ${p2Qty} ${p2?.unit || "units"} of ${p2?.name || "Product B"}`;
  const systemResponse = `Got it! Here's what I parsed from your order:\n\n${p1Qty}x ${p1?.name || "Product A"} (${p1?.price || "$49.99"}/${p1?.unit || "unit"}) — $${p1Total.toFixed(2)}\n${p2Qty}x ${p2?.name || "Product B"} (${p2?.price || "$79.99"}/${p2?.unit || "unit"}) — $${p2Total.toFixed(2)}\n\nSubtotal: $${subtotal.toFixed(2)}\nTax (8.75%): $${tax.toFixed(2)}\nTotal: $${total.toFixed(2)}\n\nReply YES to confirm or EDIT to change.`;
  const confirmResponse = `Order confirmed! ORD-2026-0848 has been placed.\n\nEstimated delivery: Tomorrow by 2 PM.\nTrack your order at ${brand.domain}/track/0848\n\n— ${data.companyName}`;

  const [messages, setMessages] = useState([
    { from: "client", text: initialMessage, time: "10:32 AM" },
  ]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step > 0) return;
    const t1 = setTimeout(() => {
      setMessages((prev) => [...prev, { from: "system", text: systemResponse, time: "10:32 AM" }]);
      setStep(1);
    }, 1500);
    return () => clearTimeout(t1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (step !== 1) return;
    const t2 = setTimeout(() => {
      setMessages((prev) => [...prev, { from: "client", text: "YES", time: "10:33 AM" }]);
      setStep(2);
    }, 2500);
    return () => clearTimeout(t2);
  }, [step]);

  useEffect(() => {
    if (step !== 2) return;
    const t3 = setTimeout(() => {
      setMessages((prev) => [...prev, { from: "system", text: confirmResponse, time: "10:33 AM" }]);
      setStep(3);
    }, 1500);
    return () => clearTimeout(t3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="p-6 bg-[#F9F7F4]">
      <div className="mb-6">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">AI-Powered</p>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">SMS / iMessage Ordering</h2>
        <p className="font-sans text-xs text-[#C8C0B4] mt-1">Clients text their orders in natural language. AI parses, confirms, and fulfills.</p>
      </div>

      <div className="border border-[#E5E1DB] bg-[#F9F7F4] max-w-lg mx-auto">
        {/* Phone header */}
        <div className="px-4 py-3 border-b border-[#E5E1DB] flex items-center gap-3" style={{ backgroundColor: brand.color }}>
          <MessageSquare className="w-4 h-4 text-white" />
          <span className="font-mono text-xs text-white font-semibold">{data.companyName} SMS</span>
          <span className="ml-auto font-mono text-[9px] text-white/50">AI-Powered</span>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-3 min-h-[400px] bg-white/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-3 py-2 ${msg.from === "client" ? "text-white" : "bg-white border border-[#E5E1DB]"}`}
                style={msg.from === "client" ? { backgroundColor: brand.color } : {}}
              >
                <div className="font-mono text-[11px] whitespace-pre-line leading-relaxed">{msg.text}</div>
                <div className={`font-mono text-[8px] mt-1 ${msg.from === "client" ? "text-white/50" : "text-[#C8C0B4]"}`}>{msg.time}</div>
              </div>
            </div>
          ))}
          {(step === 0 || step === 1) && (
            <div className="flex justify-start">
              <div className="flex gap-1 px-3 py-2">
                {[0, 1, 2].map((d) => (
                  <div key={d} className="w-1.5 h-1.5 bg-[#C8C0B4] animate-pulse" style={{ animationDelay: `${d * 200}ms` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {step >= 3 && (
          <div className="px-4 py-3 border-t border-[#E5E1DB]" style={{ backgroundColor: `${brand.color}10` }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: brand.color }} />
              <span className="font-mono text-xs font-semibold" style={{ color: brand.color }}>Order ORD-2026-0848 created in admin panel</span>
            </div>
          </div>
        )}
      </div>

      {/* Feature callouts */}
      <div className="max-w-lg mx-auto mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Natural Language", desc: "No menus needed" },
          { label: "AI Parsing", desc: "Products + quantities" },
          { label: "Instant Confirm", desc: "Auto-creates order" },
        ].map((f) => (
          <div key={f.label} className="border border-[#E5E1DB] bg-[#F9F7F4] p-3 text-center">
            <div className="font-mono text-[10px] font-semibold text-[#0A0A0A] uppercase">{f.label}</div>
            <div className="font-mono text-[9px] text-[#C8C0B4]">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Demo Portal Component
// ═══════════════════════════════════════════════════════════════════════════

function DemoPortalInner() {
  const { brand, data } = useDemoData();
  const seed = generateSeedData(data);
  const [view, setView] = useState<View>("marketing");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const groups = [...new Set(NAV_ITEMS.map((n) => n.group))];
  const viewProps: ViewProps = { brand, data, seed };

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col">
      {/* Demo banner */}
      <div className="border-b border-[#0A0A0A] px-4 py-2.5 flex items-center justify-between" style={{ backgroundColor: brand.color }}>
        <div className="flex items-center gap-3">
          {brand.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logo}
              alt=""
              className="w-5 h-5 object-contain bg-white/20 p-0.5"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span className="font-mono text-xs text-white">
            You&apos;re exploring a demo of <strong>{brand.company}</strong>&apos;s wholesale portal
          </span>
        </div>
        <a
          href="/#intake-form"
          className="font-mono text-[10px] uppercase tracking-wide text-white/80 hover:text-white border border-white/30 px-3 py-1 hover:border-white transition-colors flex items-center gap-1"
        >
          Start Your Build <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "w-56" : "w-0"} flex-shrink-0 border-r border-[#E5E1DB] bg-white overflow-y-auto overflow-x-hidden transition-all`}>
          <div className="p-4 border-b border-[#E5E1DB] flex items-center gap-2 min-w-[224px]">
            {brand.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brand.logo}
                alt=""
                className="w-6 h-6 object-contain flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <span className="font-serif text-sm truncate text-[#0A0A0A]">{brand.company}</span>
          </div>
          <nav className="p-2 min-w-[224px]">
            {groups.map((group) => (
              <div key={group} className="mb-3">
                <div className="text-[8px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono px-3 mb-1">{group}</div>
                {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
                  const Icon = item.icon;
                  const active = view === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setView(item.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 font-mono text-[11px] transition-colors ${active ? "text-white" : "text-[#0A0A0A]/60 hover:bg-[#0A0A0A]/[0.06]"}`}
                      style={active ? { backgroundColor: brand.color } : {}}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {/* Top bar */}
          <div className="px-4 py-2.5 border-b border-[#E5E1DB] bg-white flex items-center justify-between sticky top-0 z-10">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="font-mono text-xs text-[#C8C0B4] hover:text-[#0A0A0A] transition-colors"
            >
              {sidebarOpen ? "← Hide" : "→ Menu"}
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-4 h-4 text-[#C8C0B4] cursor-pointer hover:text-[#0A0A0A]" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2" style={{ backgroundColor: brand.color }} />
              </div>
              <div
                className="w-7 h-7 flex items-center justify-center font-mono text-[10px] text-white"
                style={{ backgroundColor: brand.color }}
              >
                A
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-[#F9F7F4]">
            {view === "marketing" && <MarketingView {...viewProps} />}
            {view === "catalog" && <CatalogView {...viewProps} />}
            {view === "about" && <AboutView {...viewProps} />}
            {view === "client-dashboard" && <ClientDashboardView {...viewProps} />}
            {view === "client-orders" && <ClientOrdersView {...viewProps} />}
            {view === "client-invoices" && <ClientInvoicesView {...viewProps} />}
            {view === "client-analytics" && <ClientAnalyticsView {...viewProps} />}
            {view === "client-referrals" && <ClientReferralsView {...viewProps} />}
            {view === "client-settings" && <ClientSettingsView {...viewProps} />}
            {view === "admin-dashboard" && <AdminDashboardView {...viewProps} />}
            {view === "admin-orders" && <AdminOrdersView {...viewProps} />}
            {view === "admin-clients" && <AdminClientsView {...viewProps} />}
            {view === "admin-invoices" && <AdminInvoicesView {...viewProps} />}
            {view === "admin-products" && <AdminProductsView {...viewProps} />}
            {view === "admin-analytics" && <AdminAnalyticsView {...viewProps} />}
            {view === "sms-demo" && <SmsDemoView {...viewProps} />}
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Export with Suspense wrapper ───────────────────────────────────────────

export function DemoPortal() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F9F7F4] flex items-center justify-center">
          <div className="text-center">
            <div className="w-6 h-6 border border-[#E5E1DB] border-t-[#0A0A0A] animate-spin mx-auto mb-3" />
            <div className="font-mono text-sm text-[#C8C0B4]">Loading your demo...</div>
          </div>
        </div>
      }
    >
      <DemoPortalInner />
    </Suspense>
  );
}
