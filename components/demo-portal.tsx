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
  ChevronDown,
  Minus,
  Download,
  Edit,
  Award,
  Quote,
  Send,
  Shield,
  Snowflake,
  CreditCard,
  Truck,
  ClipboardList,
  X,
  Trash2,
  Zap,
  Target,
  Calendar,
  Receipt,
  Loader2,
  Menu,
  PanelLeftClose,
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

type CartItem = {
  product: ScrapeData["products"][0];
  quantity: number;
};

type View =
  | "marketing"
  | "catalog"
  | "about"
  | "checkout"
  | "client-dashboard"
  | "client-orders"
  | "client-invoices"
  | "client-analytics"
  | "client-referrals"
  | "client-settings"
  | "admin-dashboard"
  | "admin-orders"
  | "admin-fulfillment"
  | "admin-clients"
  | "admin-invoices"
  | "admin-products"
  | "admin-leads"
  | "admin-analytics"
  | "sms-demo";

type ViewProps = {
  brand: Brand;
  data: ScrapeData;
  seed: SeedData;
  cart?: CartItem[];
  onAddToCart?: (product: ScrapeData["products"][0]) => void;
  onRemoveFromCart?: (productName: string) => void;
  onUpdateQuantity?: (productName: string, qty: number) => void;
  onOpenCart?: () => void;
  onNavigate?: (view: View) => void;
};

// ── Nav Items ─────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: View; label: string; icon: typeof Home; group: string; badge?: number }[] = [
  // Admin panel first — this is the selling point
  { id: "admin-dashboard", label: "CEO Dashboard", icon: LayoutDashboard, group: "Admin Panel" },
  { id: "admin-orders", label: "Orders", icon: ShoppingCart, group: "Admin Panel", badge: 4 },
  { id: "admin-fulfillment", label: "Fulfillment", icon: Truck, group: "Admin Panel", badge: 3 },
  { id: "admin-clients", label: "Clients", icon: Users, group: "Admin Panel" },
  { id: "admin-invoices", label: "Invoices", icon: FileText, group: "Admin Panel", badge: 2 },
  { id: "admin-products", label: "Products", icon: Package, group: "Admin Panel" },
  { id: "admin-leads", label: "Leads", icon: Zap, group: "Admin Panel", badge: 5 },
  { id: "admin-analytics", label: "Analytics", icon: BarChart3, group: "Admin Panel" },
  // Client portal — what their customers see
  { id: "client-dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Client Portal" },
  { id: "client-orders", label: "Orders", icon: ShoppingCart, group: "Client Portal" },
  { id: "client-invoices", label: "Invoices", icon: FileText, group: "Client Portal" },
  { id: "catalog", label: "Product Catalog", icon: Package, group: "Client Portal" },
  { id: "client-analytics", label: "Analytics", icon: BarChart3, group: "Client Portal" },
  { id: "client-referrals", label: "Refer & Earn", icon: Heart, group: "Client Portal" },
  { id: "client-settings", label: "Settings", icon: Settings, group: "Client Portal" },
  // Features
  { id: "sms-demo", label: "SMS Ordering", icon: MessageSquare, group: "Features" },
  { id: "marketing", label: "Marketing Site", icon: Home, group: "Features" },
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

// ── Industry-Aware Content Helper ────────────────────────────────────────

function getIndustryContext(industry: string) {
  const ind = (industry || "").toLowerCase();
  if (ind.includes("food") || ind.includes("truffle") || ind.includes("gourmet") || ind.includes("culinary") || ind.includes("restaurant") || ind.includes("catering")) {
    return { greeting: "Chef", personName: "Thomas Keller", roleName: "Executive Chef", locationLabel: "Primary Kitchen", locationAddr: "123 Main St, New York, NY 10001", secondaryLabel: "Prep Facility", secondaryAddr: "456 Industrial Blvd, Brooklyn, NY 11201", businessPlaceholder: "Restaurant name" };
  }
  if (ind.includes("beauty") || ind.includes("salon") || ind.includes("cosmetic") || ind.includes("skincare")) {
    return { greeting: "", personName: "Sarah Mitchell", roleName: "Salon Director", locationLabel: "Main Salon", locationAddr: "789 Beauty Blvd, Los Angeles, CA 90028", secondaryLabel: "Warehouse", secondaryAddr: "321 Commerce Way, Burbank, CA 91505", businessPlaceholder: "Salon or spa name" };
  }
  if (ind.includes("coffee") || ind.includes("tea") || ind.includes("beverage")) {
    return { greeting: "", personName: "James Park", roleName: "Operations Lead", locationLabel: "Roastery", locationAddr: "456 Roast Ave, Portland, OR 97201", secondaryLabel: "Distribution Hub", secondaryAddr: "789 Warehouse Ln, Portland, OR 97203", businessPlaceholder: "Cafe or roastery name" };
  }
  if (ind.includes("wine") || ind.includes("spirit") || ind.includes("liquor") || ind.includes("brewery")) {
    return { greeting: "", personName: "Marcus Chen", roleName: "Beverage Director", locationLabel: "Main Location", locationAddr: "321 Vine St, Napa, CA 94559", secondaryLabel: "Storage Facility", secondaryAddr: "654 Barrel Rd, Napa, CA 94558", businessPlaceholder: "Bar or restaurant name" };
  }
  // Generic B2B default
  return { greeting: "", personName: "Alex Morgan", roleName: "Operations Manager", locationLabel: "Main Office", locationAddr: "100 Commerce Dr, Suite 200, Austin, TX 78701", secondaryLabel: "Warehouse", secondaryAddr: "450 Distribution Way, Austin, TX 78745", businessPlaceholder: "Business name" };
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
      return { backgroundColor: brandColor, color: "#F9F7F4", borderColor: brandColor };
    case "Shipped":
    case "Healthy":
    case "REPEAT":
      return { backgroundColor: `${brandColor}18`, color: brandColor, borderColor: `${brandColor}30` };
    case "Processing":
      return { backgroundColor: `${brandColor}12`, color: brandColor, borderColor: `${brandColor}25` };
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
  const textSize = size === "sm" ? "text-lg" : size === "lg" ? "text-5xl" : "text-2xl";
  const hasImage = product.imageUrl && product.imageUrl.trim() !== "";

  return (
    <div
      className={`${sizeClass} flex items-center justify-center font-serif ${textSize} flex-shrink-0 relative overflow-hidden`}
      style={{
        background: `linear-gradient(135deg, ${brandColor}08 0%, ${brandColor}15 100%)`,
        borderBottom: size === "lg" ? `1px solid ${brandColor}12` : undefined,
      }}
    >
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover relative z-10"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : null}
      {/* Clean monogram fallback — always rendered behind image */}
      <span
        className="absolute inset-0 flex items-center justify-center font-bold select-none"
        style={{ color: `${brandColor}25`, letterSpacing: "0.05em" }}
      >
        {product.name.charAt(0).toUpperCase()}
      </span>
      {/* Subtle category label for larger sizes */}
      {size === "lg" && product.category && (
        <span
          className="absolute bottom-2 right-2 font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5"
          style={{ color: `${brandColor}50`, backgroundColor: `${brandColor}06` }}
        >
          {product.category}
        </span>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 1: Marketing Homepage
// ═══════════════════════════════════════════════════════════════════════════

function MarketingView({ brand, data, onNavigate }: ViewProps) {
  const headline = data.heroHeadline || data.tagline || `Premium ${data.industry || "Wholesale"} Products, Always Fresh.`;
  const featuredProducts = data.products.filter((p) => p.featured).slice(0, 4);
  const displayProducts = featuredProducts.length >= 4 ? featuredProducts : data.products.slice(0, 4);
  const trustItems = data.valuePropositions.length > 0
    ? data.valuePropositions
    : ["Same-Week Delivery", "Premium Quality", "Net-30 Terms", "Cold Chain Certified", "Dedicated Support"];

  return (
    <div className="space-y-0">
      {/* ── Hero ── */}
      <section className="px-6 sm:px-10 py-12 sm:py-20 bg-[#F9F7F4] border-b border-[#E5E1DB]">
        <div className="max-w-3xl">
          <p className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-[#C8C0B4] mb-5">
            Wholesale · Est. {data.location || "United States"}
          </p>
          <h1
            className="font-serif font-bold leading-[1.02] tracking-tight text-[#0A0A0A] mb-6"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}
          >
            {headline}
          </h1>
          <p className="text-sm sm:text-base text-[#0A0A0A]/50 max-w-lg leading-relaxed mb-8">
            {data.companyDescription || `${brand.company} — your trusted wholesale partner. Browse our catalog, place orders online, and track deliveries in real time.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate?.("catalog")}
              className="h-12 px-8 text-sm font-medium tracking-wide text-[#F9F7F4] transition-opacity hover:opacity-85"
              style={{ backgroundColor: brand.color }}
            >
              Browse the Catalog
            </button>
            <button
              className="h-12 px-8 text-sm font-medium tracking-wide border transition-colors"
              style={{ borderColor: brand.color, color: brand.color }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = brand.color; e.currentTarget.style.color = "#F9F7F4"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = brand.color; }}
            >
              Apply for Wholesale
            </button>
          </div>
          <div className="mt-10 opacity-40">
            <ChevronDown className="h-5 w-5 text-[#0A0A0A] animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Trust Bar / Scrolling Marquee ── */}
      <div className="text-[#F9F7F4] py-3 overflow-hidden select-none" style={{ backgroundColor: brand.color }}>
        <div className="flex whitespace-nowrap" style={{ animation: "ticker 22s linear infinite" }}>
          {[...trustItems, ...trustItems, ...trustItems].map((item, i) => (
            <span key={i} className="mx-6 sm:mx-10 text-[10px] sm:text-xs tracking-[0.18em] uppercase font-medium">
              {item}
              <span className="mx-5 sm:mx-8 opacity-25">&middot;</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── This Week's Highlights (gap-px grid) ── */}
      <section className="py-10 sm:py-16 border-b border-[#E5E1DB] bg-[#F9F7F4]/50">
        <div className="px-6 sm:px-10 mb-8">
          <p className="text-xs tracking-[0.2em] uppercase text-[#C8C0B4] mb-3">Curated Selection</p>
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0A0A0A]">This Week&apos;s Highlights</h2>
            <button
              onClick={() => onNavigate?.("catalog")}
              className="hidden sm:flex items-center gap-1 text-xs tracking-wide text-[#0A0A0A]/40 hover:text-[#0A0A0A] transition-colors"
            >
              View Full Catalog <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="mx-6 sm:mx-10 grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E5E1DB]">
          {displayProducts.map((p, i) => (
            <div key={`${p.name}-${i}`} className="bg-[#F9F7F4] flex flex-col group hover:bg-[#F0EDE8] transition-colors">
              <ProductImage product={p} brandColor={brand.color} size="lg" />
              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <p className="text-[9px] tracking-[0.18em] uppercase text-[#C8C0B4] mb-1.5">{p.category}</p>
                <h3 className="font-serif font-bold leading-tight text-sm sm:text-base text-[#0A0A0A] mb-2">{p.name}</h3>
                <p className="text-xs text-[#0A0A0A]/50 leading-relaxed line-clamp-2 mb-3">{p.description}</p>
                <p className="text-base font-bold text-[#0A0A0A] mt-auto">
                  {p.price}<span className="text-xs font-normal text-[#C8C0B4]">{p.unit ? `/${p.unit}` : ""}</span>
                </p>
                {data.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-[9px] tracking-wide uppercase border border-[#E5E1DB] px-1.5 py-0.5 text-[#C8C0B4] inline-flex items-center gap-0.5">
                      <Snowflake className="h-2 w-2" /> Cold Chain
                    </span>
                  </div>
                )}
              </div>
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 mt-auto">
                <button
                  onClick={() => onNavigate?.("catalog")}
                  className="w-full h-9 text-xs font-medium border flex items-center justify-center gap-1.5 transition-all"
                  style={{ borderColor: brand.color, color: brand.color }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = brand.color; e.currentTarget.style.color = "#F9F7F4"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = brand.color; }}
                >
                  <ShoppingCart className="h-3 w-3" /> Add to Order
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="border-b border-[#E5E1DB]">
        <div className="px-6 sm:px-10 pt-10 sm:pt-16 mb-8">
          <p className="text-xs tracking-[0.2em] uppercase text-[#C8C0B4] mb-3">Simple Process</p>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0A0A0A]">How It Works</h2>
        </div>
        <div className="mx-6 sm:mx-10 mb-10 sm:mb-16 grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#E5E1DB]">
          {[
            { step: "01", title: "Apply", desc: `Submit a quick wholesale application. We review and approve qualified ${data.industry?.toLowerCase() || "business"} partners within 24 hours.` },
            { step: "02", title: "Order", desc: "Browse the full catalog, build your order online or text it via SMS. We handle the rest — same-week fulfillment." },
            { step: "03", title: "Grow", desc: "Track orders, manage invoices, earn loyalty rewards, and unlock volume pricing as your account grows." },
          ].map((s) => (
            <div key={s.step} className="bg-[#F9F7F4] p-8 sm:p-10">
              <p className="font-mono text-4xl sm:text-5xl font-bold text-[#E5E1DB] mb-6 leading-none">{s.step}</p>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0A0A0A] mb-3">{s.title}</h3>
              <p className="text-sm text-[#0A0A0A]/50 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      {data.testimonials.length > 0 && (
        <section className="py-10 sm:py-16 border-b border-[#E5E1DB]">
          <div className="px-6 sm:px-10 mb-8">
            <p className="text-xs tracking-[0.2em] uppercase text-[#C8C0B4] mb-3">Trusted By</p>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0A0A0A]">What Our Partners Say</h2>
          </div>
          <div className="mx-6 sm:mx-10 grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#E5E1DB]">
            {data.testimonials.slice(0, 3).map((t, i) => (
              <div key={i} className="bg-[#F9F7F4] p-8 sm:p-10 flex flex-col justify-between min-h-[200px]">
                <div>
                  <p className="font-serif text-5xl text-[#E5E1DB] leading-none mb-4 select-none">&ldquo;</p>
                  <p className="text-[15px] leading-relaxed text-[#0A0A0A]/80 italic font-serif">{t.quote}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E5E1DB]">
                  <p className="font-medium text-sm text-[#0A0A0A]">{t.author}</p>
                  {t.company && <p className="text-[#C8C0B4] text-xs mt-0.5">{t.company}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Newsletter / CTA Section ── */}
      <section className="border-b border-[#E5E1DB] bg-[#F9F7F4] overflow-hidden">
        <div className="px-6 sm:px-10 py-16 sm:py-24 max-w-lg">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-5">Stay Connected</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold italic text-[#0A0A0A] leading-none mb-4">
            Get the Latest.
          </h2>
          <p className="text-sm text-[#0A0A0A]/50 leading-relaxed mb-6">
            New products, seasonal drops, and exclusive wholesale pricing — delivered to your inbox weekly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 h-12 px-4 bg-white border border-[#E5E1DB] text-[#0A0A0A] placeholder:text-[#C8C0B4] text-sm focus:outline-none focus:border-[#0A0A0A]"
            />
            <button className="h-12 px-6 text-[#F9F7F4] text-sm font-medium transition-opacity hover:opacity-85" style={{ backgroundColor: brand.color }}>
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#E5E1DB] bg-[#F9F7F4]">
        {[
          { stat: `${Math.max(data.products.length, 20)}+`, label: "Products" },
          { stat: "500+", label: "Partners Served" },
          { stat: data.deliveryInfo || "Same Week", label: "Delivery" },
          { stat: data.paymentInfo || "Net 30", label: "Payment Terms" },
        ].map((s) => (
          <div key={s.label} className="p-6 sm:p-8 text-center border-r border-[#E5E1DB] last:border-r-0">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#0A0A0A] mb-1">{s.stat}</div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Certifications ── */}
      {data.certifications.length > 0 && (
        <div className="px-6 sm:px-10 py-6 border-b border-[#E5E1DB] bg-[#F9F7F4]">
          <div className="flex flex-wrap gap-2">
            {data.certifications.map((cert, i) => (
              <span key={i} className="border border-[#E5E1DB] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#C8C0B4] flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="bg-[#1A1614] text-[#F9F7F4] px-6 sm:px-10 py-10 sm:py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2">
            <p className="font-serif text-xl font-bold mb-2">{brand.company}</p>
            <p className="text-[#F9F7F4]/40 text-sm leading-relaxed max-w-xs">
              {data.tagline || `Premium ${data.industry?.toLowerCase() || "wholesale"} products, delivered with care.`}
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#F9F7F4]/30 mb-3 font-medium">Catalog</p>
            <ul className="space-y-2 text-sm text-[#F9F7F4]/50">
              {Array.from(new Set(data.products.map((p) => p.category).filter(Boolean))).slice(0, 4).map((cat) => (
                <li key={cat} className="hover:text-[#F9F7F4] cursor-pointer transition-colors">{cat}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#F9F7F4]/30 mb-3 font-medium">Company</p>
            <ul className="space-y-2 text-sm text-[#F9F7F4]/50">
              <li className="hover:text-[#F9F7F4] cursor-pointer transition-colors">About</li>
              <li className="hover:text-[#F9F7F4] cursor-pointer transition-colors">Wholesale</li>
              <li className="hover:text-[#F9F7F4] cursor-pointer transition-colors">Contact</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#F9F7F4]/10 pt-6 flex justify-between items-center">
          <p className="text-[#F9F7F4]/30 text-xs">&copy; {new Date().getFullYear()} {brand.company}. All rights reserved.</p>
          <p className="text-[#F9F7F4]/20 text-[10px] font-mono">Powered by Wholesail</p>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 2: Product Catalog
// ═══════════════════════════════════════════════════════════════════════════

function CatalogView({ brand, data, cart, onAddToCart, onOpenCart }: ViewProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const categories = ["All", ...Array.from(new Set(data.products.map((p) => p.category).filter(Boolean)))];

  const filtered = data.products.filter((p) => {
    const matchesSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const handleAdd = (p: ScrapeData["products"][0]) => {
    onAddToCart?.(p);
    setAddedItems((prev) => new Set(prev).add(p.name));
    setTimeout(() => setAddedItems((prev) => { const n = new Set(prev); n.delete(p.name); return n; }), 1500);
  };

  const cartCount = cart?.reduce((s, c) => s + c.quantity, 0) || 0;
  const stockLevels = [24, 8, 156, 89, 203, 67, 45, 3, 120, 15, 78, 92];

  return (
    <div className="bg-[#F9F7F4]">
      {/* Catalog Hero */}
      <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-[#E5E1DB]">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] mb-3">Wholesale Catalog</p>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.05] text-[#0A0A0A]">
          The Full Catalog.
        </h1>
      </div>

      {/* Filter bar */}
      <div className="px-6 sm:px-10 py-4 border-b border-[#E5E1DB] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-nowrap overflow-x-auto gap-1.5 pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="text-[11px] tracking-wide border px-4 py-2 transition-all whitespace-nowrap"
              style={
                activeCategory === cat
                  ? { backgroundColor: "#0A0A0A", color: "#F9F7F4", borderColor: "#0A0A0A" }
                  : { backgroundColor: "transparent", borderColor: "#E5E1DB", color: "#0A0A0A" }
              }
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#0A0A0A]/40">
            <span className="font-medium text-[#0A0A0A]/70">{filtered.length}</span> products
          </span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C8C0B4]" />
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-[#E5E1DB] bg-white pl-9 pr-4 py-2 text-xs w-40 focus:outline-none focus:border-[#0A0A0A]"
            />
          </div>
          {cartCount > 0 && (
            <button
              onClick={() => onOpenCart?.()}
              className="relative h-9 px-4 text-xs font-medium text-[#F9F7F4] flex items-center gap-2"
              style={{ backgroundColor: brand.color }}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Cart ({cartCount})
            </button>
          )}
        </div>
      </div>

      {/* Product Grid — gap-px technique */}
      <div className="mx-6 sm:mx-10 my-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[#E5E1DB]">
        {filtered.map((p, i) => {
          const stock = stockLevels[i % stockLevels.length];
          const isAdded = addedItems.has(p.name);
          return (
            <article key={`${p.name}-${i}`} className="bg-[#F9F7F4] flex flex-col group hover:bg-[#F0EDE8] transition-colors">
              <div className="flex flex-col flex-1 p-4 sm:p-5">
                <p className="text-[9px] tracking-[0.18em] uppercase text-[#C8C0B4] mb-1.5">{p.category}</p>
                <h3 className="font-serif font-bold leading-tight text-sm sm:text-base text-[#0A0A0A] mb-2">{p.name}</h3>
                <p className="text-base font-bold text-[#0A0A0A] leading-none">
                  {p.price}<span className="text-xs font-normal text-[#C8C0B4]">{p.unit ? `/${p.unit}` : ""}</span>
                </p>
                <p className="text-xs text-[#0A0A0A]/50 leading-relaxed line-clamp-2 mt-2 mb-auto">{p.description}</p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {i % 3 === 0 && (
                    <span className="text-[9px] tracking-wide uppercase border border-[#E5E1DB] px-1.5 py-0.5 text-[#C8C0B4] inline-flex items-center gap-0.5">
                      <Snowflake className="h-2 w-2" /> Cold Chain
                    </span>
                  )}
                  {i % 4 === 0 && (
                    <span className="text-[9px] tracking-wide uppercase border border-[#E5E1DB] px-1.5 py-0.5 text-[#C8C0B4] inline-flex items-center gap-0.5">
                      <CreditCard className="h-2 w-2" /> Prepay
                    </span>
                  )}
                  {stock <= 8 && (
                    <span className="text-[9px] tracking-wide uppercase border border-amber-300 bg-amber-50 text-amber-700 px-1.5 py-0.5 inline-flex items-center gap-0.5">
                      <span className="h-1.5 w-1.5 bg-amber-500 inline-block" /> Only {stock} left
                    </span>
                  )}
                </div>
                {data.minimumOrder && (
                  <p className="text-[10px] text-[#C8C0B4] mt-2 pt-2 border-t border-[#E5E1DB]">Min. order: {data.minimumOrder}</p>
                )}
              </div>
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 mt-auto">
                <button
                  onClick={() => handleAdd(p)}
                  className="w-full h-9 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                  style={
                    isAdded
                      ? { backgroundColor: brand.color, color: "#F9F7F4" }
                      : { border: `1px solid ${brand.color}`, color: brand.color }
                  }
                  onMouseEnter={(e) => { if (!isAdded) { e.currentTarget.style.backgroundColor = brand.color; e.currentTarget.style.color = "#F9F7F4"; } }}
                  onMouseLeave={(e) => { if (!isAdded) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = brand.color; } }}
                >
                  {isAdded ? (
                    <><CheckCircle2 className="h-3 w-3" /> Added</>
                  ) : (
                    <><ShoppingCart className="h-3 w-3" /> Add to Order</>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-8 h-8 text-[#E5E1DB] mx-auto mb-3" />
          <p className="text-sm text-[#C8C0B4]">No products found matching your criteria.</p>
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

function ClientDashboardView({ brand, data, seed, onNavigate }: ViewProps) {
  const ctx = getIndustryContext(data.industry);
  const top4Products = data.products.slice(0, 4);
  const recentOrders = seed.orders.slice(0, 4);
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const spending = [2800, 4100, 3200, 5600, 4800, 6200];
  const maxSpend = Math.max(...spending);
  const creditUsed = 4200;
  const creditLimit = 10000;
  const creditPct = Math.round((creditUsed / creditLimit) * 100);

  return (
    <div className="p-6 bg-[#F9F7F4]">
      {/* Welcome header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Welcome back{ctx.greeting ? `, ${ctx.greeting} ${ctx.personName.split(" ")[0]}` : `, ${ctx.personName.split(" ")[0]}`}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-[#0A0A0A]/50">{seed.clients[0]?.name || "Restaurant"}</span>
            <span className="border border-amber-300 bg-amber-100 text-amber-800 px-2 py-0.5 text-[9px] uppercase tracking-wider font-medium">Bronze</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-[#F9F7F4] flex items-center gap-1" style={{ backgroundColor: brand.color }}>
            <Star className="w-3 h-3" /> 4,280 Points
          </div>
        </div>
      </div>

      {/* KPI Cards — font-serif values */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Spend", value: "$26.8K", icon: DollarSign },
          { label: "Total Orders", value: "42", icon: ShoppingCart },
          { label: "Avg Order Value", value: "$638", icon: TrendingUp },
          { label: "Loyalty Points", value: "4,280", icon: Heart },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-[#E5E1DB] bg-[#F9F7F4] p-4">
            <div className="flex items-center justify-between pb-2">
              <kpi.icon className="w-4 h-4" style={{ color: `${brand.color}60` }} strokeWidth={1.5} />
            </div>
            <div className="text-2xl font-bold font-serif" style={{ color: brand.color }}>{kpi.value}</div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Credit Utilization */}
      <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Credit Utilization</span>
          <span className="font-mono text-xs text-[#0A0A0A]">${creditUsed.toLocaleString()} / ${creditLimit.toLocaleString()}</span>
        </div>
        <div className="h-1.5 bg-[#E5E1DB] overflow-hidden">
          <div className="h-full transition-all" style={{ width: `${creditPct}%`, backgroundColor: creditPct > 80 ? "#EF4444" : creditPct > 60 ? "#F59E0B" : brand.color }} />
        </div>
        <p className="text-[10px] text-[#C8C0B4] mt-1">{creditPct}% utilized · Net 30 terms</p>
      </div>

      {/* Quick Reorder — Wholesail style */}
      {top4Products.length > 0 && (
        <div className="border border-[#E5E1DB] bg-[#F9F7F4] mb-6">
          <div className="px-4 py-3 border-b border-[#E5E1DB] flex items-center justify-between">
            <span className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Quick Reorder</span>
            <span className="text-[10px] text-[#C8C0B4]">Your Favorites</span>
          </div>
          <div className="p-4 flex gap-3 overflow-x-auto pb-1">
            {top4Products.map((p, i) => (
              <div key={`${p.name}-${i}`} className="border border-[#E5E1DB] bg-[#F9F7F4] p-4 min-w-[180px] flex-shrink-0 flex flex-col gap-3">
                <div>
                  <p className="font-medium text-sm text-[#0A0A0A] leading-snug">{p.name}</p>
                  <p className="text-xs text-[#0A0A0A]/40 mt-0.5">Last ordered {3 + i}d ago</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-7 w-7 border border-[#C8C0B4] text-[#0A0A0A] flex items-center justify-center hover:bg-[#C8C0B4]/20 transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-semibold text-[#0A0A0A] w-6 text-center">{2 + i}</span>
                  <button className="h-7 w-7 border border-[#C8C0B4] text-[#0A0A0A] flex items-center justify-center hover:bg-[#C8C0B4]/20 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button className="text-[#F9F7F4] text-xs min-h-[36px] font-medium transition-opacity hover:opacity-85" style={{ backgroundColor: brand.color }}>
                  Add to Order
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4]">
          <div className="px-4 py-3 border-b border-[#E5E1DB] flex items-center justify-between">
            <span className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Recent Orders</span>
            <button className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono hover:text-[#0A0A0A]">View All</button>
          </div>
          {recentOrders.map((order) => (
            <div key={order.number} className="px-4 py-3 border-b border-[#E5E1DB] last:border-0 hover:bg-[#0A0A0A]/[0.02] transition-colors flex items-center justify-between">
              <div>
                <div className="font-mono text-xs font-semibold text-[#0A0A0A]">{order.number}</div>
                <div className="text-[10px] text-[#C8C0B4]">{order.date} · {order.itemCount} items</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#0A0A0A]">${order.total.toLocaleString()}</span>
                <StatusBadge status={order.status} brandColor={brand.color} />
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Spending — horizontal bars (Wholesail style) */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-4">
          <span className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider block mb-4">Monthly Spending</span>
          <div className="space-y-2">
            {months.map((m, i) => (
              <div key={m} className="flex items-center gap-3">
                <div className="w-8 text-xs font-medium text-[#0A0A0A]/50">{m}</div>
                <div className="flex-1 h-7 bg-[#C8C0B4]/20 overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${(spending[i] / maxSpend) * 100}%`, backgroundColor: brand.color }}
                  />
                </div>
                <div className="w-14 text-xs font-semibold text-right text-[#0A0A0A]">
                  ${(spending[i] / 1000).toFixed(1)}k
                </div>
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
  const ctx = getIndustryContext(data.industry);
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
              { label: "Name", value: ctx.personName },
              { label: "Company", value: seed.clients[0]?.name || "Business" },
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
              { label: ctx.locationLabel, address: ctx.locationAddr },
              { label: ctx.secondaryLabel, address: ctx.secondaryAddr },
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
  const totalRevenue = seed.clients.reduce((s, c) => s + parseInt(c.spend.replace(/[^0-9]/g, ""), 10), 0);
  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const monthlyRev = [28, 34, 41, 38, 52, 47, 42, 58, 51, 73, 68, 84];
  const maxRev = Math.max(...monthlyRev);
  const categories = Array.from(new Set(data.products.map((p) => p.category).filter(Boolean)));
  const catRevenues = categories.slice(0, 6).map((_, i) => [42, 28, 18, 12, 8, 5][i] || 5);
  const maxCatRev = Math.max(...catRevenues);

  return (
    <div className="p-3 sm:p-6 bg-[#F9F7F4]">
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Executive Overview</p>
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#0A0A0A]">CEO Command Center</h2>
        </div>
        <button className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[#E5E1DB] bg-[#F9F7F4] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#F9F7F4] transition-colors flex-shrink-0">
          <Download className="w-3.5 h-3.5" /> Export Summary
        </button>
      </div>

      {/* 7 KPI Cards */}
      <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 mb-4 sm:mb-6">
        {[
          { label: "Total Revenue", value: `$${(totalRevenue / 1000).toFixed(0)}K`, sub: "Cumulative all-time", icon: DollarSign },
          { label: "YTD Revenue", value: "$61.2K", sub: "+18% vs last year", icon: TrendingUp, change: "+18%" },
          { label: "Revenue (Feb)", value: "$17.4K", sub: "+23% vs Jan", icon: DollarSign, change: "+23%" },
          { label: "Outstanding AR", value: `$${seed.invoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.amount, 0).toLocaleString()}`, sub: `${seed.invoices.filter((i) => i.status === "Overdue").length} overdue`, icon: FileText },
          { label: "Active Clients", value: seed.clients.length.toString(), sub: "+3 this month", icon: Users, change: "+3" },
          { label: "Orders (Feb)", value: "37", sub: "+15% vs Jan", icon: ShoppingCart, change: "+15%" },
          { label: "30-Day Forecast", value: "$19.8K", sub: "Based on pipeline", icon: Target },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-[#E5E1DB] bg-[#F9F7F4] p-2.5 sm:p-4">
            <div className="flex items-center justify-between pb-1.5 sm:pb-2">
              <span className="text-[8px] sm:text-[9px] font-medium text-[#0A0A0A]/50 uppercase tracking-wider leading-tight">{kpi.label}</span>
              <kpi.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" style={{ color: `${brand.color}60` }} />
            </div>
            <div className="text-lg sm:text-2xl md:text-3xl font-bold font-serif leading-tight" style={{ color: brand.color }}>{kpi.value}</div>
            <p className="text-[9px] sm:text-[10px] text-[#0A0A0A]/40 mt-1 leading-tight">
              {kpi.change && <span className="text-emerald-600 font-medium">{kpi.change} </span>}
              {kpi.sub}
            </p>
          </div>
        ))}
      </div>

      {/* NRR Card */}
      <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Net Revenue Retention</span>
            <div className="text-3xl font-bold font-serif text-emerald-600 mt-1">108%</div>
            <p className="text-[10px] text-[#0A0A0A]/40 mt-0.5">Expansion outpacing churn — healthy growth</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#0A0A0A]/50">Expansion: <span className="font-semibold text-emerald-600">+$8.2K</span></div>
            <div className="text-xs text-[#0A0A0A]/50">Contraction: <span className="font-semibold text-red-500">-$1.4K</span></div>
            <div className="text-xs text-[#0A0A0A]/50">Churned: <span className="font-semibold text-red-500">-$0.6K</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Revenue Trend */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-5">
          <span className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Revenue Trend (12 Months)</span>
          <div className="flex items-end gap-1.5 h-36 mt-4">
            {months.map((m, i) => (
              <div key={m} className="flex-1 flex flex-col items-center gap-1">
                <div className="font-mono text-[8px] font-semibold text-[#0A0A0A]">${monthlyRev[i]}K</div>
                <div
                  className="w-full transition-all"
                  style={{
                    height: `${(monthlyRev[i] / maxRev) * 110}px`,
                    backgroundColor: i >= months.length - 3 ? brand.color : "#C8C0B4",
                    opacity: i === months.length - 1 ? 1 : i >= months.length - 3 ? 0.6 : 0.3,
                  }}
                />
                <div className="font-mono text-[8px] text-[#C8C0B4]">{m}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-5">
          <span className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Revenue by Category</span>
          <div className="space-y-3 mt-4">
            {categories.slice(0, 6).map((cat, i) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs text-[#0A0A0A] w-28 truncate font-medium">{cat}</span>
                <div className="flex-1 h-6 bg-[#E5E1DB]/40 overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(catRevenues[i] / maxCatRev) * 100}%`,
                      backgroundColor: brand.color,
                      opacity: [1, 0.8, 0.65, 0.5, 0.4, 0.3][i],
                    }}
                  />
                </div>
                <span className="font-mono text-xs font-bold text-[#0A0A0A] w-12 text-right">${catRevenues[i]}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Clients */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4]">
          <div className="px-4 py-3 border-b border-[#E5E1DB] flex items-center justify-between">
            <span className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Top Clients by Revenue</span>
            <button className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono hover:text-[#0A0A0A]">View All</button>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {seed.clients.slice(0, 5).map((client, i) => (
                <tr key={client.name} className="border-b border-[#E5E1DB] last:border-0 hover:bg-[#0A0A0A]/[0.02] transition-colors">
                  <td className="px-4 py-3 font-mono text-[#C8C0B4] w-6">{i + 1}</td>
                  <td className="py-3 font-medium text-[#0A0A0A]">{client.name}</td>
                  <td className="py-3"><StatusBadge status={client.tier} brandColor={brand.color} /></td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-[#0A0A0A]">{client.spend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Orders */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4]">
          <div className="px-4 py-3 border-b border-[#E5E1DB] flex items-center justify-between">
            <span className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Recent Orders</span>
            <button className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono hover:text-[#0A0A0A]">View All</button>
          </div>
          {seed.orders.slice(0, 5).map((order) => (
            <div key={order.number} className="px-4 py-3 border-b border-[#E5E1DB] last:border-0 hover:bg-[#0A0A0A]/[0.02] transition-colors flex items-center justify-between">
              <div>
                <div className="font-mono text-xs font-semibold text-[#0A0A0A]">{order.number}</div>
                <div className="font-mono text-[10px] text-[#C8C0B4]">{order.client} · {order.date}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#0A0A0A]">${order.total.toLocaleString()}</span>
                <StatusBadge status={order.status} brandColor={brand.color} />
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
            <div className="flex items-center justify-between pb-2">
              <span className="text-[9px] font-medium text-[#0A0A0A]/50 uppercase tracking-wider">{kpi.label}</span>
              <kpi.icon className="h-3.5 w-3.5" style={{ color: `${brand.color}60` }} strokeWidth={1.5} />
            </div>
            <div className="text-2xl font-bold font-serif" style={{ color: brand.color }}>{kpi.value}</div>
            <p className="text-[10px] text-emerald-600 font-medium mt-1">{kpi.change} vs last month</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-6 mb-6">
        <span className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Monthly Revenue</span>
        <div className="flex items-end gap-1.5 h-40 mt-4">
          {months.map((m, i) => (
            <div key={m} className="flex-1 flex flex-col items-center gap-1">
              <div className="font-mono text-[8px] font-semibold text-[#0A0A0A]">${revenues[i]}K</div>
              <div
                className="w-full transition-all"
                style={{
                  height: `${(revenues[i] / maxRev) * 120}px`,
                  backgroundColor: i >= months.length - 3 ? brand.color : "#C8C0B4",
                  opacity: i === months.length - 1 ? 1 : i >= months.length - 3 ? 0.6 : 0.3,
                }}
              />
              <div className="font-mono text-[8px] text-[#C8C0B4]">{m}</div>
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

function CartSidebar({ cart, brand, onRemove, onUpdateQty, onClose, onCheckout }: {
  cart: CartItem[];
  brand: Brand;
  onRemove: (name: string) => void;
  onUpdateQty: (name: string, qty: number) => void;
  onClose: () => void;
  onCheckout: () => void;
}) {
  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const totalPrice = cart.reduce((s, c) => s + c.quantity * parsePrice(c.product.price), 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-[#F9F7F4] border-l border-[#E5E1DB] flex flex-col h-full">
        <div className="px-5 pt-5 pb-4 border-b border-[#E5E1DB] flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#0A0A0A]">Your Order ({totalItems} items)</h3>
          <button onClick={onClose} className="p-1 text-[#C8C0B4] hover:text-[#0A0A0A]"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-6 px-5">
            {cart.map((item) => {
              const lineTotal = item.quantity * parsePrice(item.product.price);
              return (
                <div key={item.product.name} className="space-y-3 pb-6 border-b border-[#E5E1DB] last:border-0">
                  <div className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base leading-tight mb-1 text-[#0A0A0A]">{item.product.name}</h4>
                      <p className="text-sm text-[#C8C0B4]">{item.product.category}</p>
                      <p className="text-sm font-medium mt-1 text-[#0A0A0A]">{item.product.price}{item.product.unit ? `/${item.product.unit}` : ""}</p>
                    </div>
                    <button onClick={() => onRemove(item.product.name)} className="h-8 w-8 flex items-center justify-center text-[#C8C0B4] hover:text-[#0A0A0A]">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onUpdateQty(item.product.name, Math.max(1, item.quantity - 1))} className="h-10 w-10 border border-[#E5E1DB] flex items-center justify-center hover:border-[#0A0A0A] transition-colors">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-base font-semibold w-10 text-center text-[#0A0A0A]">{item.quantity}</span>
                      <button onClick={() => onUpdateQty(item.product.name, item.quantity + 1)} className="h-10 w-10 border border-[#E5E1DB] flex items-center justify-center hover:border-[#0A0A0A] transition-colors">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-lg font-bold text-[#0A0A0A]">${lineTotal.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
            {cart.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="w-8 h-8 text-[#E5E1DB] mx-auto mb-3" />
                <p className="text-sm text-[#C8C0B4]">Your cart is empty</p>
              </div>
            )}
          </div>
        </div>
        {cart.length > 0 && (
          <div className="border-t border-[#E5E1DB] px-5 py-5 space-y-4 mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[#0A0A0A]">Total</span>
              <span className="text-2xl font-bold text-[#0A0A0A]">${totalPrice.toFixed(2)}</span>
            </div>
            <button onClick={onCheckout} className="w-full h-12 text-base font-medium text-[#F9F7F4] transition-opacity hover:opacity-85" style={{ backgroundColor: brand.color }}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutView({ brand, data, cart, onNavigate }: ViewProps) {
  const ctx = getIndustryContext(data.industry);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [processing, setProcessing] = useState(false);
  const items = (cart && cart.length > 0) ? cart : data.products.slice(0, 3).map((p) => ({ product: p, quantity: 2 }));
  const subtotal = items.reduce((s, c) => s + c.quantity * parsePrice(c.product.price), 0);
  const tax = Math.round(subtotal * 0.0875 * 100) / 100;
  const total = subtotal + tax;
  const orderNum = `ORD-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const invoiceNum = `INV-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  const handlePlaceOrder = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setOrderPlaced(true);
    }, 1500);
  };

  if (orderPlaced) {
    return (
      <div className="p-6 bg-[#F9F7F4]">
        <div className="max-w-lg mx-auto py-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: `${brand.color}12` }}>
            <CheckCircle2 className="w-8 h-8" style={{ color: brand.color }} />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#0A0A0A] mb-2">Order Confirmed!</h2>
          <p className="text-sm text-[#0A0A0A]/50 mb-8">
            Your order has been placed successfully. A confirmation email has been sent.
          </p>

          {/* Order & Invoice details */}
          <div className="border border-[#E5E1DB] bg-white text-left mb-6">
            <div className="grid grid-cols-2 border-b border-[#E5E1DB]">
              <div className="p-5 border-r border-[#E5E1DB]">
                <p className="text-[9px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Order Number</p>
                <p className="font-mono text-sm font-bold text-[#0A0A0A]">{orderNum}</p>
              </div>
              <div className="p-5">
                <p className="text-[9px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Invoice Created</p>
                <p className="font-mono text-sm font-bold text-[#0A0A0A]">{invoiceNum}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 border-b border-[#E5E1DB]">
              <div className="p-5 border-r border-[#E5E1DB]">
                <p className="text-[9px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Payment</p>
                <p className="text-xs font-medium text-[#0A0A0A]">Net 30 Invoice</p>
              </div>
              <div className="p-5 border-r border-[#E5E1DB]">
                <p className="text-[9px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Items</p>
                <p className="text-xs font-medium text-[#0A0A0A]">{items.length} products</p>
              </div>
              <div className="p-5">
                <p className="text-[9px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Total</p>
                <p className="font-serif text-lg font-bold text-[#0A0A0A]">${total.toFixed(2)}</p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-[9px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-2">Items Ordered</p>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.product.name} className="flex justify-between text-xs">
                    <span className="text-[#0A0A0A]">{item.quantity}x {item.product.name}</span>
                    <span className="font-mono text-[#0A0A0A]/70">${(item.quantity * parsePrice(item.product.price)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status timeline */}
          <div className="border border-[#E5E1DB] bg-white text-left p-5 mb-6">
            <p className="text-[9px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-3">Order Status</p>
            <div className="space-y-3">
              {[
                { label: "Order Placed", time: "Just now", done: true },
                { label: "Invoice Created", time: "Just now", done: true },
                { label: "Confirmation Sent", time: "Just now", done: true },
                { label: "Processing & Fulfillment", time: "Next", done: false },
                { label: "Shipped", time: "Upcoming", done: false },
              ].map((step) => (
                <div key={step.label} className="flex items-center gap-3">
                  {step.done ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: brand.color }} />
                  ) : (
                    <Clock className="w-4 h-4 flex-shrink-0 text-[#E5E1DB]" />
                  )}
                  <span className={`text-xs flex-1 ${step.done ? "text-[#0A0A0A] font-medium" : "text-[#C8C0B4]"}`}>{step.label}</span>
                  <span className="text-[9px] font-mono text-[#C8C0B4]">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onNavigate?.("client-orders")}
              className="flex-1 h-12 text-sm font-medium text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: brand.color }}
            >
              View My Orders
            </button>
            <button
              onClick={() => onNavigate?.("catalog")}
              className="flex-1 h-12 text-sm font-medium border border-[#E5E1DB] text-[#0A0A0A] hover:border-[#C8C0B4] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F9F7F4]">
      <div className="mb-6">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Checkout</p>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Complete Your Order</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Order Form */}
        <div className="lg:col-span-3 space-y-4">
          <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-6">
            <p className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider mb-4">Order Information</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Business Name", placeholder: ctx.businessPlaceholder },
                { label: "Contact Name", placeholder: "Full name" },
                { label: "Email", placeholder: "email@company.com" },
                { label: "Phone", placeholder: "(555) 000-0000" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-[10px] tracking-[0.2em] uppercase text-[#C8C0B4] mb-1.5 block">{f.label}</label>
                  <input placeholder={f.placeholder} className="w-full h-10 px-3 border border-[#E5E1DB] bg-white text-sm text-[#0A0A0A] placeholder:text-[#C8C0B4] focus:outline-none" style={{ borderColor: undefined }} onFocus={(e) => e.currentTarget.style.borderColor = brand.color} onBlur={(e) => e.currentTarget.style.borderColor = "#E5E1DB"} />
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-[10px] tracking-[0.2em] uppercase text-[#C8C0B4] mb-1.5 block">Delivery Address</label>
                <input placeholder="Street address, city, state, zip" className="w-full h-10 px-3 border border-[#E5E1DB] bg-white text-sm text-[#0A0A0A] placeholder:text-[#C8C0B4] focus:outline-none" onFocus={(e) => e.currentTarget.style.borderColor = brand.color} onBlur={(e) => e.currentTarget.style.borderColor = "#E5E1DB"} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] tracking-[0.2em] uppercase text-[#C8C0B4] mb-1.5 block">Order Notes</label>
                <textarea rows={3} placeholder="Special instructions, delivery preferences..." className="w-full px-3 py-2 border border-[#E5E1DB] bg-white text-sm text-[#0A0A0A] placeholder:text-[#C8C0B4] focus:outline-none resize-none" onFocus={(e) => e.currentTarget.style.borderColor = brand.color} onBlur={(e) => e.currentTarget.style.borderColor = "#E5E1DB"} />
              </div>
            </div>
          </div>
          <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-6">
            <p className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider mb-4">Payment Method</p>
            <div className="space-y-3">
              {["Net 30 Invoice", "Credit Card (Stripe)", "ACH Bank Transfer"].map((method, i) => (
                <label key={method} className="flex items-center gap-3 p-3 border border-[#E5E1DB] cursor-pointer hover:border-[#C8C0B4] transition-colors">
                  <div className="w-4 h-4 border-2 flex items-center justify-center" style={{ borderColor: i === 0 ? brand.color : "#E5E1DB" }}>
                    {i === 0 && <div className="w-2 h-2" style={{ backgroundColor: brand.color }} />}
                  </div>
                  <span className="text-sm text-[#0A0A0A]">{method}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="border border-[#E5E1DB] bg-[#F9F7F4] sticky top-16">
            <div className="px-5 py-4 border-b border-[#E5E1DB]">
              <p className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Order Summary</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {items.map((item) => (
                <div key={item.product.name} className="flex items-center justify-between py-2 border-b border-[#E5E1DB]/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#0A0A0A]">{item.product.name}</p>
                    <p className="text-xs text-[#C8C0B4]">{item.quantity} x {item.product.price}</p>
                  </div>
                  <p className="font-mono text-sm font-bold text-[#0A0A0A]">${(item.quantity * parsePrice(item.product.price)).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-[#E5E1DB] space-y-2">
              <div className="flex justify-between text-sm"><span className="text-[#C8C0B4]">Subtotal</span><span className="font-mono text-[#0A0A0A]">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#C8C0B4]">Tax (8.75%)</span><span className="font-mono text-[#0A0A0A]">${tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-[#E5E1DB]"><span className="text-[#0A0A0A]">Total</span><span className="font-serif text-xl text-[#0A0A0A]">${total.toFixed(2)}</span></div>
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={handlePlaceOrder}
                disabled={processing}
                className="w-full h-12 text-[#F9F7F4] text-sm font-medium transition-opacity hover:opacity-85 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: brand.color }}
              >
                {processing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  <>Place Order</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceholderView({ brand, title, description }: { brand: Brand; title: string; description: string }) {
  return (
    <div className="p-6 bg-[#F9F7F4]">
      <div className="mb-6">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono mb-1">Included Module</p>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">{title}</h2>
      </div>
      <div className="border border-dashed border-[#E5E1DB] bg-[#F9F7F4] p-10 text-center">
        <Package className="w-10 h-10 text-[#E5E1DB] mx-auto mb-4" />
        <p className="text-sm text-[#0A0A0A]/60 mb-2">{description}</p>
        <p className="text-xs text-[#C8C0B4]">This module is fully built during your portal deployment.</p>
      </div>
    </div>
  );
}

// ── Guided Tour ────────────────────────────────────────────────────────────
const TOUR_STEPS: { view: View; title: string; description: string }[] = [
  { view: "admin-dashboard", title: "CEO Command Center", description: "Real-time KPIs, revenue trends, client analytics — everything you need to run your operation from one screen." },
  { view: "catalog", title: "Product Catalog", description: "Your full product catalog with search, filters, and one-click add to cart. Clients can browse and order 24/7." },
  { view: "client-dashboard", title: "Client Dashboard", description: "Each client gets a personalized dashboard showing orders, spending, loyalty tier, and quick reorder." },
  { view: "sms-demo", title: "SMS Ordering", description: "Clients text their orders in natural language. AI parses them into structured orders automatically." },
  { view: "admin-analytics", title: "Business Analytics", description: "Revenue by category, client spending trends, and growth metrics — all updated in real-time." },
];

function TourOverlay({
  step,
  total,
  title,
  description,
  onNext,
  onSkip,
  brandColor,
}: {
  step: number;
  total: number;
  title: string;
  description: string;
  onNext: () => void;
  onSkip: () => void;
  brandColor: string;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[420px] max-w-[calc(100vw-2rem)]">
      <div className="text-[#F9F7F4] p-5 shadow-2xl" style={{ backgroundColor: brandColor, border: "1px solid rgba(255,255,255,0.15)" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#F9F7F4]/40">
            Tour · {step + 1} of {total}
          </span>
          <button onClick={onSkip} className="font-mono text-[10px] text-[#F9F7F4]/40 hover:text-[#F9F7F4] transition-colors">
            Skip Tour
          </button>
        </div>
        <div className="font-serif text-lg mb-1">{title}</div>
        <p className="font-mono text-xs text-[#F9F7F4]/60 leading-relaxed mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className="h-1 w-6"
                style={{ backgroundColor: i <= step ? "#F9F7F4" : "rgba(249,247,244,0.15)" }}
              />
            ))}
          </div>
          <button
            onClick={onNext}
            className="font-mono text-xs font-semibold bg-[#F9F7F4] text-[#0A0A0A] px-4 py-2 flex items-center gap-1.5 hover:bg-white transition-colors"
          >
            {step < total - 1 ? "Next" : "Start Exploring"} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DemoPortalInner() {
  const { brand, data } = useDemoData();
  const seed = generateSeedData(data);
  const [view, setView] = useState<View>("admin-dashboard");
  // Sidebar: "expanded" = full 240px, "collapsed" = icons only ~52px, "hidden" = 0px
  const [sidebarMode, setSidebarMode] = useState<"expanded" | "collapsed" | "hidden">("expanded");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [tourDismissed, setTourDismissed] = useState(false);

  // Collapse sidebar on mobile by default
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    if (mq.matches) setSidebarMode("collapsed");
    const handler = (e: MediaQueryListEvent) => setSidebarMode(e.matches ? "collapsed" : "expanded");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const sidebarOpen = sidebarMode !== "hidden";
  const sidebarCollapsed = sidebarMode === "collapsed";

  const toggleSidebar = () => {
    setSidebarMode((prev) => {
      if (prev === "expanded") return "collapsed";
      if (prev === "collapsed") return "expanded";
      return "expanded";
    });
  };

  // Show tour prompt after a short delay
  useEffect(() => {
    if (tourDismissed) return;
    const timer = setTimeout(() => setTourStep(0), 1500);
    return () => clearTimeout(timer);
  }, [tourDismissed]);

  // Navigate to tour view when step changes
  useEffect(() => {
    if (tourStep !== null && tourStep < TOUR_STEPS.length) {
      setView(TOUR_STEPS[tourStep].view);
    }
  }, [tourStep]);

  const addToCart = (product: ScrapeData["products"][0]) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.name === product.name);
      if (existing) return prev.map((c) => c.product.name === product.name ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { product, quantity: 1 }];
    });
  };
  const removeFromCart = (name: string) => setCart((prev) => prev.filter((c) => c.product.name !== name));
  const updateQuantity = (name: string, qty: number) => setCart((prev) => prev.map((c) => c.product.name === name ? { ...c, quantity: qty } : c));
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const groups = [...new Set(NAV_ITEMS.map((n) => n.group))];
  const viewProps: ViewProps = {
    brand, data, seed, cart,
    onAddToCart: addToCart,
    onRemoveFromCart: removeFromCart,
    onUpdateQuantity: updateQuantity,
    onOpenCart: () => setCartOpen(true),
    onNavigate: setView,
  };

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col">
      {/* Demo banner */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2" style={{ backgroundColor: brand.color, borderBottom: `1px solid ${brand.color}` }}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {brand.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logo}
              alt={`${brand.company} logo`}
              className="w-4 h-4 sm:w-5 sm:h-5 object-contain bg-white/20 p-0.5 flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <span className="text-[10px] sm:text-xs text-white/70 truncate">
            Demo preview of <strong className="text-white">{brand.company}</strong>
            <span className="hidden sm:inline">&apos;s wholesale portal</span>
          </span>
        </div>
        <a
          href="/#intake-form"
          className="text-[9px] sm:text-[10px] uppercase tracking-wide text-white/60 hover:text-white border border-white/20 px-2 sm:px-3 py-1 hover:border-white/60 transition-colors flex items-center gap-1 flex-shrink-0"
        >
          <span className="hidden sm:inline">Start Your Build</span>
          <span className="sm:hidden">Build</span>
          <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — collapsible: expanded (240px), collapsed (52px icons only), hidden (0px) */}
        <aside
          className="flex-shrink-0 border-r border-[#E5E1DB] bg-[#F9F7F4] overflow-y-auto overflow-x-hidden transition-all duration-200"
          style={{ width: sidebarMode === "expanded" ? 240 : sidebarMode === "collapsed" ? 52 : 0 }}
        >
          {/* Header */}
          <div
            className="border-b border-[#E5E1DB] flex items-center flex-shrink-0"
            style={{ height: 56, minWidth: sidebarCollapsed ? 52 : 240, padding: sidebarCollapsed ? "0 10px" : "0 16px", gap: sidebarCollapsed ? 0 : 12 }}
          >
            {sidebarCollapsed ? (
              <button onClick={toggleSidebar} className="w-8 h-8 flex items-center justify-center mx-auto" aria-label="Toggle sidebar">
                <Menu className="w-4 h-4 text-[#0A0A0A]/60" />
              </button>
            ) : (
              <>
                {brand.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logo}
                    alt={`${brand.company} logo`}
                    className="w-7 h-7 object-contain flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <span className="font-serif font-bold text-[15px] text-[#0A0A0A] leading-tight block truncate">{brand.company}</span>
                  <span className="font-serif italic text-xs text-[#C8C0B4] leading-tight">Wholesale</span>
                </div>
                <button onClick={toggleSidebar} className="flex-shrink-0 p-1 text-[#C8C0B4] hover:text-[#0A0A0A]">
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
          {/* Nav */}
          <nav className="py-3" style={{ minWidth: sidebarCollapsed ? 52 : 240, padding: sidebarCollapsed ? "12px 6px" : "12px 8px" }}>
            {groups.map((group) => (
              <div key={group} className="mb-3">
                {!sidebarCollapsed && (
                  <div className="text-[8px] tracking-[0.25em] uppercase text-[#C8C0B4] font-mono px-3 mb-1.5">{group}</div>
                )}
                <div className="space-y-0.5">
                  {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
                    const Icon = item.icon;
                    const active = view === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        title={sidebarCollapsed ? item.label : undefined}
                        className={`w-full flex items-center text-sm font-medium transition-colors relative ${sidebarCollapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-2"}`}
                        style={
                          active
                            ? { backgroundColor: brand.color, color: "#F9F7F4" }
                            : { color: "rgba(10,10,10,0.6)" }
                        }
                        onMouseEnter={(e) => { if (!active) { e.currentTarget.style.backgroundColor = `${brand.color}0A`; e.currentTarget.style.color = "#0A0A0A"; } }}
                        onMouseLeave={(e) => { if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgba(10,10,10,0.6)"; } }}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                        {item.badge && !sidebarCollapsed && (
                          <span
                            className="ml-auto text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] text-center leading-tight"
                            style={active ? { backgroundColor: "#F9F7F4", color: brand.color } : { backgroundColor: brand.color, color: "#F9F7F4" }}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.badge && sidebarCollapsed && (
                          <span
                            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-[7px] font-bold flex items-center justify-center text-[#F9F7F4]"
                            style={{ backgroundColor: brand.color, borderRadius: "50%" }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {/* Top bar */}
          <div className="px-3 py-2 border-b border-[#E5E1DB] bg-[#F9F7F4]/95 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
            <button
              onClick={toggleSidebar}
              className="text-xs text-[#C8C0B4] hover:text-[#0A0A0A] transition-colors flex items-center gap-1.5"
            >
              {sidebarCollapsed ? <><Menu className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Expand</span></> : <><PanelLeftClose className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Collapse</span></>}
            </button>
            <div className="flex items-center gap-3">
              {cartCount > 0 && (
                <button onClick={() => setCartOpen(true)} className="relative p-1">
                  <ShoppingCart className="w-4 h-4 text-[#0A0A0A]/60 hover:text-[#0A0A0A]" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 text-[#F9F7F4] text-[9px] font-bold flex items-center justify-center" style={{ backgroundColor: brand.color }}>
                    {cartCount}
                  </span>
                </button>
              )}
              <div className="relative">
                <Bell className="w-4 h-4 text-[#C8C0B4] cursor-pointer hover:text-[#0A0A0A]" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2" style={{ backgroundColor: brand.color }} />
              </div>
              <div className="w-7 h-7 flex items-center justify-center font-mono text-[10px] text-[#F9F7F4]" style={{ backgroundColor: brand.color }}>
                A
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-[#F9F7F4]">
            {view === "marketing" && <MarketingView {...viewProps} />}
            {view === "catalog" && <CatalogView {...viewProps} />}
            {view === "about" && <AboutView {...viewProps} />}
            {view === "checkout" && <CheckoutView {...viewProps} />}
            {view === "client-dashboard" && <ClientDashboardView {...viewProps} />}
            {view === "client-orders" && <ClientOrdersView {...viewProps} />}
            {view === "client-invoices" && <ClientInvoicesView {...viewProps} />}
            {view === "client-analytics" && <ClientAnalyticsView {...viewProps} />}
            {view === "client-referrals" && <ClientReferralsView {...viewProps} />}
            {view === "client-settings" && <ClientSettingsView {...viewProps} />}
            {view === "admin-dashboard" && <AdminDashboardView {...viewProps} />}
            {view === "admin-orders" && <AdminOrdersView {...viewProps} />}
            {view === "admin-fulfillment" && <PlaceholderView brand={brand} title="Fulfillment Board" description="Kanban-style board for picking, packing, and shipping orders. Includes pick lists, batch processing, and carrier label generation." />}
            {view === "admin-clients" && <AdminClientsView {...viewProps} />}
            {view === "admin-invoices" && <AdminInvoicesView {...viewProps} />}
            {view === "admin-products" && <AdminProductsView {...viewProps} />}
            {view === "admin-leads" && <PlaceholderView brand={brand} title="Lead Management" description="Full CRM for wholesale leads — from giveaway signup to qualification to conversion. Includes health scoring, follow-up automation, and rep assignment." />}
            {view === "admin-analytics" && <AdminAnalyticsView {...viewProps} />}
            {view === "sms-demo" && <SmsDemoView {...viewProps} />}
          </div>
        </main>
      </div>

      {/* Cart Sidebar Overlay */}
      {cartOpen && (
        <CartSidebar
          cart={cart}
          brand={brand}
          onRemove={removeFromCart}
          onUpdateQty={updateQuantity}
          onClose={() => setCartOpen(false)}
          onCheckout={() => { setCartOpen(false); setView("checkout"); }}
        />
      )}

      {/* Guided Tour Overlay */}
      {tourStep !== null && tourStep < TOUR_STEPS.length && !tourDismissed && (
        <TourOverlay
          step={tourStep}
          total={TOUR_STEPS.length}
          title={TOUR_STEPS[tourStep].title}
          description={TOUR_STEPS[tourStep].description}
          brandColor={brand.color}
          onNext={() => {
            if (tourStep < TOUR_STEPS.length - 1) {
              setTourStep(tourStep + 1);
            } else {
              setTourStep(null);
              setTourDismissed(true);
            }
          }}
          onSkip={() => {
            setTourStep(null);
            setTourDismissed(true);
          }}
        />
      )}
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
            <div className="w-6 h-6 border border-[#E5E1DB] border-t-[#2A52BE] animate-spin mx-auto mb-3" />
            <div className="font-mono text-sm text-[#C8C0B4]">Loading your demo...</div>
          </div>
        </div>
      }
    >
      <DemoPortalInner />
    </Suspense>
  );
}
