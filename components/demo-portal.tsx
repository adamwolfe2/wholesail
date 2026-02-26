"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
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
  ChevronDown,
  Plus,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Eye,
  Truck,
  Star,
  Home,
  X,
} from "lucide-react";

// ── Brand from URL params ──────────────────────────────────────────────
type Brand = {
  company: string;
  logo: string;
  color: string;
  domain: string;
};

function useBrand(): Brand {
  const params = useSearchParams();
  const color = params.get("color") || "1A1A1A";
  return {
    company: params.get("company") || "Your Company",
    logo: params.get("logo") || "",
    color: color.startsWith("#") ? color : `#${color}`,
    domain: params.get("domain") || "yourcompany.com",
  };
}

// ── Seed data ──────────────────────────────────────────────────────────
const PRODUCTS = [
  { name: "Black Winter Truffle", price: 89.99, unit: "oz", category: "Fresh Truffles", stock: 24, image: "T" },
  { name: "White Alba Truffle", price: 249.99, unit: "oz", category: "Fresh Truffles", stock: 8, image: "T" },
  { name: "Truffle Honey", price: 18.99, unit: "jar", category: "Oils & Condiments", stock: 156, image: "H" },
  { name: "Black Truffle Oil", price: 24.99, unit: "bottle", category: "Oils & Condiments", stock: 89, image: "O" },
  { name: "Truffle Sea Salt", price: 14.99, unit: "jar", category: "Seasonings", stock: 203, image: "S" },
  { name: "Porcini Mushrooms (Dried)", price: 34.99, unit: "lb", category: "Dried Goods", stock: 67, image: "P" },
  { name: "Aged Balsamic Vinegar", price: 42.99, unit: "bottle", category: "Oils & Condiments", stock: 45, image: "V" },
  { name: "Saffron Threads", price: 119.99, unit: "oz", category: "Seasonings", stock: 31, image: "S" },
];

const ORDERS = [
  { number: "ORD-2026-0847", client: "The Grand Hotel", total: 2847.50, status: "Delivered", date: "Feb 24", items: 6 },
  { number: "ORD-2026-0846", client: "Bistro Napa", total: 1234.00, status: "Shipped", date: "Feb 24", items: 3 },
  { number: "ORD-2026-0845", client: "Chef's Table NYC", total: 5612.75, status: "Processing", date: "Feb 23", items: 8 },
  { number: "ORD-2026-0844", client: "Pacific Grill", total: 876.25, status: "Pending", date: "Feb 23", items: 4 },
  { number: "ORD-2026-0843", client: "La Maison", total: 3290.00, status: "Delivered", date: "Feb 22", items: 5 },
  { number: "ORD-2026-0842", client: "Harbor Seafood", total: 1567.80, status: "Delivered", date: "Feb 21", items: 7 },
];

const CLIENTS = [
  { name: "The Grand Hotel", tier: "VIP", spend: "$142,350", health: "Champion", orders: 67, lastOrder: "Feb 24" },
  { name: "Chef's Table NYC", tier: "VIP", spend: "$98,200", health: "Champion", orders: 45, lastOrder: "Feb 23" },
  { name: "Bistro Napa", tier: "REPEAT", spend: "$34,500", health: "Healthy", orders: 23, lastOrder: "Feb 24" },
  { name: "La Maison", tier: "REPEAT", spend: "$28,700", health: "Healthy", orders: 19, lastOrder: "Feb 22" },
  { name: "Pacific Grill", tier: "NEW", spend: "$4,200", health: "At Risk", orders: 5, lastOrder: "Feb 23" },
  { name: "Harbor Seafood", tier: "NEW", spend: "$2,800", health: "New", orders: 3, lastOrder: "Feb 21" },
];

const INVOICES = [
  { number: "INV-2026-0312", client: "The Grand Hotel", amount: 2847.50, status: "Paid", due: "Mar 24" },
  { number: "INV-2026-0311", client: "Bistro Napa", amount: 1234.00, status: "Pending", due: "Mar 24" },
  { number: "INV-2026-0310", client: "Chef's Table NYC", amount: 5612.75, status: "Pending", due: "Mar 23" },
  { number: "INV-2026-0309", client: "Pacific Grill", amount: 876.25, status: "Overdue", due: "Feb 20" },
  { number: "INV-2026-0308", client: "La Maison", amount: 3290.00, status: "Paid", due: "Mar 22" },
];

// ── Status colors ──────────────────────────────────────────────────────
function statusColor(status: string): string {
  const colors: Record<string, string> = {
    Delivered: "bg-emerald-100 text-emerald-700",
    Shipped: "bg-blue-100 text-blue-700",
    Processing: "bg-amber-100 text-amber-700",
    Pending: "bg-neutral-100 text-neutral-600",
    Paid: "bg-emerald-100 text-emerald-700",
    Overdue: "bg-red-100 text-red-700",
    VIP: "bg-amber-100 text-amber-700",
    REPEAT: "bg-blue-100 text-blue-700",
    NEW: "bg-neutral-100 text-neutral-600",
    Champion: "bg-emerald-100 text-emerald-700",
    Healthy: "bg-blue-100 text-blue-700",
    "At Risk": "bg-amber-100 text-amber-700",
    New: "bg-neutral-100 text-neutral-600",
  };
  return colors[status] || "bg-neutral-100 text-neutral-600";
}

// ── Views ──────────────────────────────────────────────────────────────
type View =
  | "marketing"
  | "catalog"
  | "client-dashboard"
  | "admin-orders"
  | "admin-clients"
  | "admin-invoices"
  | "admin-analytics"
  | "sms-demo";

const NAV_ITEMS: { id: View; label: string; icon: typeof Home; group: string }[] = [
  { id: "marketing", label: "Marketing Site", icon: Home, group: "Public" },
  { id: "catalog", label: "Product Catalog", icon: Package, group: "Public" },
  { id: "client-dashboard", label: "Client Dashboard", icon: LayoutDashboard, group: "Client Portal" },
  { id: "admin-orders", label: "Orders", icon: ShoppingCart, group: "Admin Panel" },
  { id: "admin-clients", label: "Clients", icon: Users, group: "Admin Panel" },
  { id: "admin-invoices", label: "Invoices", icon: FileText, group: "Admin Panel" },
  { id: "admin-analytics", label: "Analytics", icon: BarChart3, group: "Admin Panel" },
  { id: "sms-demo", label: "SMS Ordering", icon: MessageSquare, group: "Features" },
];

// ── Marketing Home View ────────────────────────────────────────────────
function MarketingView({ brand }: { brand: Brand }) {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <div className="p-8 sm:p-12" style={{ backgroundColor: brand.color }}>
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-white mb-4 leading-tight">
            Premium wholesale products, delivered to your door.
          </h1>
          <p className="font-mono text-sm text-white/70 mb-6 max-w-lg">
            {brand.company} — your trusted wholesale partner. Browse our catalog, place orders online, and track deliveries in real time.
          </p>
          <div className="flex gap-3">
            <button className="bg-white px-6 py-3 font-mono text-xs uppercase tracking-wide border border-white" style={{ color: brand.color }}>
              Browse Catalog <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
            </button>
            <button className="px-6 py-3 font-mono text-xs uppercase tracking-wide border border-white/40 text-white">
              Apply for Wholesale
            </button>
          </div>
        </div>
      </div>

      {/* Featured products */}
      <div className="p-6 sm:p-8">
        <h2 className="font-serif text-xl mb-4">Featured Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRODUCTS.slice(0, 4).map((p) => (
            <div key={p.name} className="border border-black/10 bg-white p-4">
              <div className="w-full h-20 flex items-center justify-center text-2xl font-serif mb-3" style={{ backgroundColor: `${brand.color}15` }}>
                {p.image}
              </div>
              <div className="font-mono text-[10px] text-neutral-400 uppercase">{p.category}</div>
              <div className="font-serif text-sm mb-1">{p.name}</div>
              <div className="font-mono text-xs font-semibold">${p.price}/{p.unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 border-t border-black/10">
        {[
          { stat: "200+", label: "Products" },
          { stat: "500+", label: "Wholesale Partners" },
          { stat: "Same Day", label: "Local Delivery" },
        ].map((s) => (
          <div key={s.label} className="p-6 text-center border-r border-black/10 last:border-r-0">
            <div className="text-2xl font-serif mb-1">{s.stat}</div>
            <div className="font-mono text-[10px] text-neutral-400 uppercase">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Catalog View ───────────────────────────────────────────────────────
function CatalogView({ brand }: { brand: Brand }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl">Product Catalog</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input placeholder="Search products..." className="border border-black/20 pl-9 pr-4 py-2 font-mono text-xs w-48 focus:outline-none" />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        {["All", "Fresh Truffles", "Oils & Condiments", "Seasonings", "Dried Goods"].map((cat, i) => (
          <button key={cat} className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide border ${i === 0 ? "text-white border-black" : "border-black/20 text-neutral-500 hover:border-black"}`} style={i === 0 ? { backgroundColor: brand.color, borderColor: brand.color } : {}}>
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRODUCTS.map((p) => (
          <div key={p.name} className="border border-black/10 bg-white p-4 flex gap-4">
            <div className="w-16 h-16 flex items-center justify-center text-xl font-serif flex-shrink-0" style={{ backgroundColor: `${brand.color}15` }}>
              {p.image}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[9px] text-neutral-400 uppercase">{p.category}</div>
              <div className="font-serif text-sm">{p.name}</div>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-xs font-semibold">${p.price}/{p.unit}</span>
                <span className="font-mono text-[9px] text-neutral-400">{p.stock} in stock</span>
              </div>
            </div>
            <button className="self-center px-3 py-2 font-mono text-[9px] uppercase tracking-wide border text-white flex-shrink-0" style={{ backgroundColor: brand.color, borderColor: brand.color }}>
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Client Dashboard View ──────────────────────────────────────────────
function ClientDashboardView({ brand }: { brand: Brand }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl">Welcome back, Chef Thomas</h2>
          <div className="font-mono text-xs text-neutral-400">The Grand Hotel · VIP Partner</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 font-mono text-[9px] uppercase tracking-wide text-white" style={{ backgroundColor: brand.color }}>
            <Star className="w-3 h-3 inline mr-1" /> 4,280 Points
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Active Orders", value: "3", icon: ShoppingCart },
          { label: "Pending Invoices", value: "$4,081", icon: FileText },
          { label: "This Month", value: "$8,694", icon: DollarSign },
          { label: "Loyalty Tier", value: "VIP", icon: Heart },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-black/10 bg-white p-4">
            <kpi.icon className="w-4 h-4 text-neutral-400 mb-2" strokeWidth={1.5} />
            <div className="font-mono text-lg font-bold">{kpi.value}</div>
            <div className="font-mono text-[9px] text-neutral-400 uppercase">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="border border-black/10 bg-white">
        <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wide font-semibold">Recent Orders</span>
          <button className="font-mono text-[10px] uppercase text-neutral-400 hover:text-black">View All</button>
        </div>
        {ORDERS.slice(0, 3).map((order) => (
          <div key={order.number} className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
            <div>
              <div className="font-mono text-xs font-semibold">{order.number}</div>
              <div className="font-mono text-[9px] text-neutral-400">{order.date} · {order.items} items</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold">${order.total.toLocaleString()}</span>
              <span className={`px-2 py-0.5 font-mono text-[9px] uppercase ${statusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Admin Orders View ──────────────────────────────────────────────────
function AdminOrdersView({ brand }: { brand: Brand }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl">Order Management</h2>
        <div className="flex gap-2">
          <button className="px-3 py-2 font-mono text-[10px] uppercase tracking-wide border border-black/20 text-neutral-500">Export CSV</button>
          <button className="px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-white border" style={{ backgroundColor: brand.color, borderColor: brand.color }}>
            <Plus className="w-3 h-3 inline mr-1" /> New Order
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {["All Orders", "Processing", "Shipped", "Delivered", "Pending"].map((f, i) => (
          <button key={f} className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide border ${i === 0 ? "bg-black text-white border-black" : "border-black/20 text-neutral-500"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="border border-black/10 bg-white">
        <div className="grid grid-cols-6 gap-4 px-4 py-2 border-b border-black/10 bg-neutral-50">
          {["Order", "Client", "Items", "Total", "Status", "Date"].map((h) => (
            <div key={h} className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">{h}</div>
          ))}
        </div>
        {ORDERS.map((order) => (
          <div key={order.number} className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-black/5 hover:bg-neutral-50 cursor-pointer">
            <div className="font-mono text-xs font-semibold" style={{ color: brand.color }}>{order.number}</div>
            <div className="font-mono text-xs">{order.client}</div>
            <div className="font-mono text-xs text-neutral-500">{order.items} items</div>
            <div className="font-mono text-xs font-semibold">${order.total.toLocaleString()}</div>
            <div><span className={`px-2 py-0.5 font-mono text-[9px] uppercase ${statusColor(order.status)}`}>{order.status}</span></div>
            <div className="font-mono text-xs text-neutral-400">{order.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Admin Clients View ─────────────────────────────────────────────────
function AdminClientsView({ brand }: { brand: Brand }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl">Client Directory</h2>
        <button className="px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-white border" style={{ backgroundColor: brand.color, borderColor: brand.color }}>
          <Plus className="w-3 h-3 inline mr-1" /> Invite Client
        </button>
      </div>

      <div className="border border-black/10 bg-white">
        <div className="grid grid-cols-6 gap-4 px-4 py-2 border-b border-black/10 bg-neutral-50">
          {["Client", "Tier", "Lifetime Spend", "Health", "Orders", "Last Order"].map((h) => (
            <div key={h} className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">{h}</div>
          ))}
        </div>
        {CLIENTS.map((client) => (
          <div key={client.name} className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-black/5 hover:bg-neutral-50 cursor-pointer">
            <div className="font-mono text-xs font-semibold">{client.name}</div>
            <div><span className={`px-2 py-0.5 font-mono text-[9px] uppercase ${statusColor(client.tier)}`}>{client.tier}</span></div>
            <div className="font-mono text-xs font-semibold">{client.spend}</div>
            <div><span className={`px-2 py-0.5 font-mono text-[9px] uppercase ${statusColor(client.health)}`}>{client.health}</span></div>
            <div className="font-mono text-xs text-neutral-500">{client.orders}</div>
            <div className="font-mono text-xs text-neutral-400">{client.lastOrder}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Admin Invoices View ────────────────────────────────────────────────
function AdminInvoicesView({ brand }: { brand: Brand }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl">Invoice Management</h2>
        <div className="flex gap-2">
          <button className="px-3 py-2 font-mono text-[10px] uppercase tracking-wide border border-black/20 text-neutral-500">Send Reminders</button>
          <button className="px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-white border" style={{ backgroundColor: brand.color, borderColor: brand.color }}>
            <Plus className="w-3 h-3 inline mr-1" /> New Invoice
          </button>
        </div>
      </div>

      {/* Aging summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Outstanding", value: "$7,722.75", color: "text-black" },
          { label: "Current", value: "$6,846.75", color: "text-blue-600" },
          { label: "Overdue", value: "$876.25", color: "text-red-600" },
          { label: "Paid (Feb)", value: "$6,137.50", color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="border border-black/10 bg-white p-4">
            <div className={`font-mono text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="font-mono text-[9px] text-neutral-400 uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="border border-black/10 bg-white">
        <div className="grid grid-cols-5 gap-4 px-4 py-2 border-b border-black/10 bg-neutral-50">
          {["Invoice", "Client", "Amount", "Status", "Due Date"].map((h) => (
            <div key={h} className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">{h}</div>
          ))}
        </div>
        {INVOICES.map((inv) => (
          <div key={inv.number} className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-black/5 hover:bg-neutral-50 cursor-pointer">
            <div className="font-mono text-xs font-semibold" style={{ color: brand.color }}>{inv.number}</div>
            <div className="font-mono text-xs">{inv.client}</div>
            <div className="font-mono text-xs font-semibold">${inv.amount.toLocaleString()}</div>
            <div><span className={`px-2 py-0.5 font-mono text-[9px] uppercase ${statusColor(inv.status)}`}>{inv.status}</span></div>
            <div className="font-mono text-xs text-neutral-400">{inv.due}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Admin Analytics View ───────────────────────────────────────────────
function AdminAnalyticsView({ brand }: { brand: Brand }) {
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const revenues = [42, 58, 51, 73, 68, 84];
  const maxRev = Math.max(...revenues);
  return (
    <div className="p-6">
      <h2 className="font-serif text-xl mb-6">Business Analytics</h2>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Revenue (Feb)", value: "$84,230", change: "+23%", icon: DollarSign },
          { label: "Orders (Feb)", value: "127", change: "+15%", icon: ShoppingCart },
          { label: "Active Clients", value: "89", change: "+8", icon: Users },
          { label: "Avg Order Value", value: "$663", change: "+12%", icon: TrendingUp },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <kpi.icon className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
              <span className="font-mono text-[9px] text-emerald-600 font-semibold">{kpi.change}</span>
            </div>
            <div className="font-mono text-lg font-bold">{kpi.value}</div>
            <div className="font-mono text-[9px] text-neutral-400 uppercase">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="border border-black/10 bg-white p-6 mb-6">
        <div className="font-mono text-xs uppercase tracking-wide font-semibold mb-4">Monthly Revenue</div>
        <div className="flex items-end gap-3 h-40">
          {months.map((m, i) => (
            <div key={m} className="flex-1 flex flex-col items-center gap-1">
              <div className="font-mono text-[9px] font-semibold">${revenues[i]}K</div>
              <div
                className="w-full transition-all"
                style={{
                  height: `${(revenues[i] / maxRev) * 120}px`,
                  backgroundColor: i === months.length - 1 ? brand.color : `${brand.color}30`,
                }}
              />
              <div className="font-mono text-[9px] text-neutral-400">{m}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top clients */}
      <div className="border border-black/10 bg-white">
        <div className="px-4 py-3 border-b border-black/10">
          <span className="font-mono text-xs uppercase tracking-wide font-semibold">Top Clients by Revenue</span>
        </div>
        {CLIENTS.slice(0, 4).map((client, i) => (
          <div key={client.name} className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] text-neutral-400 w-4">{i + 1}.</span>
              <span className="font-mono text-xs font-semibold">{client.name}</span>
              <span className={`px-2 py-0.5 font-mono text-[9px] uppercase ${statusColor(client.tier)}`}>{client.tier}</span>
            </div>
            <span className="font-mono text-xs font-semibold">{client.spend}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SMS Demo View ──────────────────────────────────────────────────────
function SmsDemoView({ brand }: { brand: Brand }) {
  const [messages, setMessages] = useState([
    { from: "client", text: "Hey, I need 2 cases of the black truffle oil and 5 oz of alba truffles", time: "10:32 AM" },
  ]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step > 0) return;
    const t1 = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: "system",
          text: `Got it! Here's what I parsed from your order:\n\n• 2x Black Truffle Oil ($24.99/bottle) — $49.98\n• 5x White Alba Truffle ($249.99/oz) — $1,249.95\n\nSubtotal: $1,299.93\nTax (8.75%): $113.74\nTotal: $1,413.67\n\nReply YES to confirm or EDIT to change.`,
          time: "10:32 AM",
        },
      ]);
      setStep(1);
    }, 1500);
    return () => clearTimeout(t1);
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
      setMessages((prev) => [
        ...prev,
        {
          from: "system",
          text: `Order confirmed! ORD-2026-0848 has been placed.\n\nEstimated delivery: Tomorrow by 2 PM.\nTrack your order at ${brand.domain}/track/0848\n\n— ${brand.company}`,
          time: "10:33 AM",
        },
      ]);
      setStep(3);
    }, 1500);
    return () => clearTimeout(t3);
  }, [step, brand]);

  return (
    <div className="p-6">
      <h2 className="font-serif text-xl mb-2">SMS / iMessage Ordering</h2>
      <p className="font-mono text-xs text-neutral-500 mb-6">Clients text their orders in natural language. AI parses, confirms, and fulfills.</p>

      <div className="border border-black/10 bg-white max-w-lg mx-auto">
        {/* Phone header */}
        <div className="px-4 py-3 border-b border-black/10 flex items-center gap-3" style={{ backgroundColor: brand.color }}>
          <MessageSquare className="w-4 h-4 text-white" />
          <span className="font-mono text-xs text-white font-semibold">{brand.company} SMS</span>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-3 min-h-[400px] bg-neutral-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-3 py-2 ${msg.from === "client" ? "text-white" : "bg-white border border-black/10"}`} style={msg.from === "client" ? { backgroundColor: brand.color } : {}}>
                <div className="font-mono text-[11px] whitespace-pre-line leading-relaxed">{msg.text}</div>
                <div className={`font-mono text-[8px] mt-1 ${msg.from === "client" ? "text-white/50" : "text-neutral-400"}`}>{msg.time}</div>
              </div>
            </div>
          ))}
          {(step === 0 || step === 1) && (
            <div className="flex justify-start">
              <div className="flex gap-1 px-3 py-2">
                {[0, 1, 2].map((d) => (
                  <div key={d} className="w-1.5 h-1.5 bg-neutral-300 animate-pulse" style={{ animationDelay: `${d * 200}ms` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {step >= 3 && (
          <div className="px-4 py-3 border-t border-black/10 bg-emerald-50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-mono text-xs text-emerald-700 font-semibold">Order ORD-2026-0848 created in admin panel</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Demo Portal Component ─────────────────────────────────────────
function DemoPortalInner() {
  const brand = useBrand();
  const [view, setView] = useState<View>("marketing");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const groups = [...new Set(NAV_ITEMS.map((n) => n.group))];

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Demo banner */}
      <div className="border-b border-black px-4 py-2.5 flex items-center justify-between" style={{ backgroundColor: brand.color }}>
        <div className="flex items-center gap-3">
          {brand.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logo} alt="" className="w-5 h-5 object-contain bg-white/20 p-0.5" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
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

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "w-56" : "w-0"} flex-shrink-0 border-r border-black/10 bg-white overflow-hidden transition-all`}>
          <div className="p-4 border-b border-black/10 flex items-center gap-2">
            {brand.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logo} alt="" className="w-6 h-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            )}
            <span className="font-serif text-sm truncate">{brand.company}</span>
          </div>
          <nav className="p-2">
            {groups.map((group) => (
              <div key={group} className="mb-3">
                <div className="font-mono text-[8px] uppercase tracking-widest text-neutral-400 px-3 mb-1">{group}</div>
                {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
                  const Icon = item.icon;
                  const active = view === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setView(item.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 font-mono text-[11px] transition-colors ${active ? "text-white" : "text-neutral-600 hover:bg-neutral-50"}`}
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
          <div className="px-4 py-2.5 border-b border-black/10 bg-white flex items-center justify-between">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="font-mono text-xs text-neutral-400 hover:text-black">
              {sidebarOpen ? "← Hide" : "→ Menu"}
            </button>
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-neutral-400 cursor-pointer hover:text-black" />
              <div className="w-7 h-7 flex items-center justify-center font-mono text-[10px] text-white" style={{ backgroundColor: brand.color }}>
                A
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-cream">
            {view === "marketing" && <MarketingView brand={brand} />}
            {view === "catalog" && <CatalogView brand={brand} />}
            {view === "client-dashboard" && <ClientDashboardView brand={brand} />}
            {view === "admin-orders" && <AdminOrdersView brand={brand} />}
            {view === "admin-clients" && <AdminClientsView brand={brand} />}
            {view === "admin-invoices" && <AdminInvoicesView brand={brand} />}
            {view === "admin-analytics" && <AdminAnalyticsView brand={brand} />}
            {view === "sms-demo" && <SmsDemoView brand={brand} />}
          </div>
        </main>
      </div>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export function DemoPortal() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><div className="font-mono text-sm text-neutral-400">Loading your demo...</div></div>}>
      <DemoPortalInner />
    </Suspense>
  );
}
