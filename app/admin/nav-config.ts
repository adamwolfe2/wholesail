import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  MessageSquare,
  Sparkles,
  FileInput,
  Kanban,
} from "lucide-react";

// badgeKey maps to a count fetched server-side in layout.tsx and passed as navBadges
export const adminNav = [
  // ── Overview ─────────────────────────────────
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  // ── Intake & Pipeline ────────────────────────
  { href: "/admin/intakes", label: "Intakes", icon: FileInput, badgeKey: "pendingIntakes" },
  { href: "/admin/pipeline", label: "Pipeline", icon: Kanban, badgeKey: "activeBuilds" },
  // ── CRM ──────────────────────────────────────
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, badgeKey: "unreadMessages" },
  // ── System ───────────────────────────────────
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  // ── AI ───────────────────────────────────────
  { href: "/admin/chat", label: "AI Assistant", icon: Sparkles },
] as const;
