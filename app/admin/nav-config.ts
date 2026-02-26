import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  FileText,
  Settings,
  UserCheck,
  FileCheck,
  TrendingUp,
  Tag,
  PackageCheck,
  Truck,
  Layers,
  UserPlus,
  Boxes,
  CalendarDays,
  MessageSquare,
  Store,
  CheckSquare,
  Sparkles,
} from "lucide-react";

// badgeKey maps to a count fetched server-side in layout.tsx and passed as navBadges
export const adminNav = [
  // ── Overview ─────────────────────────────────
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/ceo", label: "CEO View", icon: TrendingUp },
  // ── Operations ───────────────────────────────
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, badgeKey: "pendingOrders" },
  { href: "/admin/fulfillment", label: "Fulfillment", icon: PackageCheck },
  { href: "/admin/shipments", label: "Shipments", icon: Truck },
  { href: "/admin/inventory", label: "Inventory", icon: Layers },
  // ── Finance ──────────────────────────────────
  { href: "/admin/invoices", label: "Invoices", icon: FileText, badgeKey: "overdueInvoices" },
  { href: "/admin/quotes", label: "Quotes", icon: FileCheck },
  { href: "/admin/pricing", label: "Pricing", icon: Tag },
  // ── CRM ──────────────────────────────────────
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/wholesale", label: "Wholesale", icon: Store, badgeKey: "pendingApplications" },
  { href: "/admin/reps", label: "Sales Reps", icon: UserCheck },
  { href: "/admin/tasks", label: "Tasks", icon: CheckSquare, badgeKey: "openTasks" },
  { href: "/admin/leads", label: "Leads", icon: UserPlus },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, badgeKey: "unreadMessages" },
  // ── Catalog ──────────────────────────────────
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/drops", label: "Drops", icon: CalendarDays },
  { href: "/admin/suppliers", label: "Suppliers", icon: Boxes },
  // ── System ───────────────────────────────────
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  // ── AI ───────────────────────────────────────
  { href: "/admin/chat", label: "AI Assistant", icon: Sparkles },
] as const;
