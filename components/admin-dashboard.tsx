"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Activity,
  Zap,
  ExternalLink,
  Github,
  Globe,
  Mail,
  Phone,
  MessageSquare,
  Plus,
  Loader2,
  BarChart3,
  ChevronRight,
  Settings,
  ClipboardList,
} from "lucide-react";
import {
  BUILD_PHASES,
  FEATURES,
  ENV_VARS,
  STATUS_CONFIG,
  type ClientProject,
  type ClientStatus,
} from "@/lib/client-data";

function SailLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M16 2L16 28L6 28C6 28 14 16 16 2Z" fill="var(--blue)" opacity="0.9" />
      <path d="M18 8L18 28L26 28C26 28 20 18 18 8Z" fill="var(--blue)" opacity="0.55" />
      <path d="M4 29L28 29" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function formatCurrency(n: number) {
  if (n >= 1000) return "$" + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K";
  return "$" + n.toLocaleString();
}

type Tab = "overview" | "build" | "infrastructure" | "notes" | "tasks";
type NavItem = "dashboard" | "clients" | "revenue" | "settings";

const NAV_ITEMS: { key: NavItem; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "clients", label: "Clients", icon: Users },
  { key: "revenue", label: "Revenue", icon: DollarSign },
  { key: "settings", label: "Settings", icon: Settings },
];

// ═══════════════════════════════════════════════════════════════════════════
// Stats Bar
// ═══════════════════════════════════════════════════════════════════════════
function StatsBar({ clients }: { clients: ClientProject[] }) {
  const live = clients.filter((c) => c.status === "live").length;
  const building = clients.filter((c) => c.status === "building" || c.status === "onboarding").length;
  const mrr = clients.reduce((sum, c) => sum + c.monthlyRevenue, 0);
  const totalContract = clients.reduce((sum, c) => sum + c.contractValue, 0);
  const retainer = clients.reduce((sum, c) => sum + c.retainer, 0);

  const stats = [
    { label: "Portals Live", value: String(live), sub: `${building} building`, icon: Zap },
    { label: "MRR", value: formatCurrency(mrr), sub: `${formatCurrency(retainer)}/mo retainers`, icon: DollarSign },
    { label: "Total Clients", value: String(clients.length), sub: `${clients.filter((c) => c.status === "inquiry").length} in pipeline`, icon: Users },
    { label: "Total Contract Value", value: formatCurrency(totalContract), sub: "lifetime revenue", icon: Activity },
  ];

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-0"
      style={{ border: "1px solid var(--border-strong)" }}
    >
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className={`p-5 ${i < stats.length - 1 ? "border-r" : ""}`}
            style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}
          >
            <Icon className="w-3.5 h-3.5 mb-2" style={{ color: "var(--blue)" }} strokeWidth={1.5} />
            <div className="font-serif text-2xl mb-0.5" style={{ color: "var(--text-headline)" }}>
              {s.value}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {s.label}
            </div>
            <div className="font-mono text-[10px] mt-1" style={{ color: "var(--text-body)" }}>
              {s.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Client Card
// ═══════════════════════════════════════════════════════════════════════════
function ClientCard({
  client,
  onClick,
}: {
  client: ClientProject;
  onClick: () => void;
}) {
  const statusCfg = STATUS_CONFIG[client.status];
  const progressPct = client.currentPhase >= 15 ? 100 : Math.round(((client.currentPhase - 1) / 15) * 100);
  const featureCount = client.enabledFeatures.length;

  return (
    <button
      onClick={onClick}
      className="text-left w-full border transition-colors hover:border-[var(--blue-border)]"
      style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-serif text-base mb-0.5" style={{ color: "var(--text-headline)" }}>
              {client.company}
            </div>
            <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
              {client.industry} · {client.contact.name}
            </div>
          </div>
          <span
            className="font-mono text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 flex-shrink-0"
            style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
          >
            {statusCfg.label}
          </span>
        </div>

        {/* Progress */}
        {client.status !== "inquiry" && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>
                Phase {client.currentPhase}/15
              </span>
              <span className="font-mono text-[9px] font-bold" style={{ color: "var(--text-headline)" }}>
                {progressPct}%
              </span>
            </div>
            <div className="h-1 w-full" style={{ backgroundColor: "var(--border)" }}>
              <div
                className="h-full"
                style={{
                  backgroundColor: client.status === "live" ? "#059669" : "var(--blue)",
                  width: `${progressPct}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px]" style={{ color: "var(--text-body)" }}>
              {featureCount} features
            </span>
            {client.monthlyRevenue > 0 && (
              <span className="font-mono text-[10px] font-semibold" style={{ color: 'var(--color-success)' }}>
                {formatCurrency(client.monthlyRevenue)}/mo
              </span>
            )}
          </div>
          <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Client Detail
// ═══════════════════════════════════════════════════════════════════════════
function ClientDetail({
  client,
  onBack,
}: {
  client: ClientProject;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const statusCfg = STATUS_CONFIG[client.status];
  const enabledFeatures = FEATURES.filter((f) => client.enabledFeatures.includes(f.id));
  const featureValue = enabledFeatures.reduce((sum, f) => sum + f.value, 0);

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "build", label: "Build Progress" },
    { key: "infrastructure", label: "Infrastructure" },
    { key: "notes", label: "Notes" },
    { key: "tasks", label: "Tasks" },
  ];

  const configuredVars = Object.values(client.envVars).filter((v) => v === "configured").length;
  const totalVars = Object.keys(client.envVars).length;
  const pendingTasks = client.tasks.filter((t) => !t.completed).length;

  return (
    <div>
      {/* Back + header */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 font-mono text-xs mb-4 transition-colors"
        style={{ color: "var(--text-body)" }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> All Clients
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-serif text-2xl" style={{ color: "var(--text-headline)" }}>
              {client.company}
            </h2>
            <span
              className="font-mono text-[9px] font-bold uppercase tracking-wide px-2 py-0.5"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
            >
              {statusCfg.label}
            </span>
          </div>
          <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            {client.industry} · {client.shortName} · Started {client.startDate || "Pending"}
          </div>
        </div>
        {client.customDomain && (
          <a
            href={`https://${client.customDomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 border"
            style={{ borderColor: "var(--border-strong)", color: "var(--blue)" }}
          >
            <ExternalLink className="w-3 h-3" /> Live Portal
          </a>
        )}
      </div>

      {/* Tabs */}
      <div
        className="flex gap-0 mb-6"
        style={{ border: "1px solid var(--border-strong)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 px-3 py-2.5 font-mono text-[10px] uppercase tracking-wide transition-colors"
            style={{
              backgroundColor: tab === t.key ? "var(--blue)" : "var(--bg-white)",
              color: tab === t.key ? "white" : "var(--text-muted)",
              borderRight: "1px solid var(--border-strong)",
            }}
          >
            {t.label}
            {t.key === "tasks" && pendingTasks > 0 && (
              <span className="ml-1 text-[8px]">({pendingTasks})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="space-y-4">
          {/* Contact + Financial */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border p-5" style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}>
              <div className="font-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                Contact
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                  <span className="font-mono text-xs" style={{ color: "var(--text-headline)" }}>
                    {client.contact.name} · {client.contact.role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                  <span className="font-mono text-xs" style={{ color: "var(--text-body)" }}>
                    {client.contact.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                  <span className="font-mono text-xs" style={{ color: "var(--text-body)" }}>
                    {client.contact.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                  <span className="font-mono text-xs" style={{ color: "var(--text-body)" }}>
                    {client.website}
                  </span>
                </div>
              </div>
            </div>
            <div className="border p-5" style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}>
              <div className="font-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                Financials
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Contract</div>
                  <div className="font-serif text-xl" style={{ color: "var(--text-headline)" }}>{formatCurrency(client.contractValue)}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Retainer</div>
                  <div className="font-serif text-xl" style={{ color: "var(--text-headline)" }}>{formatCurrency(client.retainer)}/mo</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Platform Value</div>
                  <div className="font-serif text-xl" style={{ color: "var(--blue)" }}>{formatCurrency(featureValue)}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Env Vars</div>
                  <div className="font-serif text-xl" style={{ color: "var(--text-headline)" }}>{configuredVars}/{totalVars}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="border p-5" style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}>
            <div className="font-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Enabled Features ({enabledFeatures.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FEATURES.map((f) => {
                const enabled = client.enabledFeatures.includes(f.id);
                return (
                  <span
                    key={f.id}
                    className="font-mono text-[10px] px-2.5 py-1"
                    style={{
                      backgroundColor: enabled ? "var(--blue)" : "transparent",
                      color: enabled ? "white" : "var(--text-muted)",
                      border: enabled ? "none" : "1px solid var(--border)",
                    }}
                  >
                    {f.label}
                    {enabled && (
                      <span className="ml-1 opacity-60">{formatCurrency(f.value)}</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "build" && (
        <div className="border" style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}>
          {BUILD_PHASES.map((phase) => {
            const isComplete = phase.phase < client.currentPhase;
            const isCurrent = phase.phase === client.currentPhase;
            return (
              <div
                key={phase.phase}
                className="flex items-center gap-3 px-5 py-3 border-b last:border-b-0"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: isCurrent ? "var(--blue-light)" : "transparent",
                  opacity: !isComplete && !isCurrent ? 0.4 : 1,
                }}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-success)' }} />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" style={{ color: "var(--blue)" }} />
                ) : (
                  <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "var(--border-strong)" }} />
                )}
                <div className="flex-1">
                  <span className="font-mono text-xs font-semibold" style={{ color: isCurrent ? "var(--blue)" : "var(--text-headline)" }}>
                    Phase {phase.phase}:
                  </span>{" "}
                  <span className="font-mono text-xs" style={{ color: "var(--text-body)" }}>
                    {phase.label}
                  </span>
                </div>
                <span className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>
                  {phase.description}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {tab === "infrastructure" && (
        <div className="space-y-4">
          {/* Repos + URLs */}
          <div className="border p-5" style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}>
            <div className="font-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Deployment
            </div>
            <div className="space-y-2.5">
              {[
                { icon: Github, label: "GitHub", value: client.githubRepo || "Not created" },
                { icon: Zap, label: "Vercel", value: client.vercelUrl || "Not deployed" },
                { icon: Globe, label: "Domain", value: client.customDomain || "Not configured" },
                { icon: ExternalLink, label: "Website", value: client.website },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <item.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                  <span className="font-mono text-[10px] uppercase tracking-wide w-16" style={{ color: "var(--text-muted)" }}>
                    {item.label}
                  </span>
                  <span className="font-mono text-xs" style={{ color: item.value.includes("Not") ? "var(--text-muted)" : "var(--text-headline)" }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Env vars */}
          <div className="border" style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}>
            <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border-strong)" }}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  Environment Variables
                </span>
                <span className="font-mono text-[10px] font-semibold" style={{ color: "var(--text-headline)" }}>
                  {configuredVars}/{totalVars} configured
                </span>
              </div>
            </div>
            {ENV_VARS.map((envVar) => {
              const status = client.envVars[envVar.key] || "missing";
              const statusColor = status === "configured" ? "#059669" : status === "pending" ? "#B45309" : "#DC2626";
              const statusBg = status === "configured" ? "#D1FAE5" : status === "pending" ? "#FEF3C7" : "#FEE2E2";
              return (
                <div
                  key={envVar.key}
                  className="flex items-center gap-3 px-5 py-2.5 border-b last:border-b-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span className="font-mono text-[10px] flex-1" style={{ color: "var(--text-body)" }}>
                    {envVar.key}
                  </span>
                  <span className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>
                    {envVar.label}
                  </span>
                  {!envVar.required && (
                    <span className="font-mono text-[8px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                      Optional
                    </span>
                  )}
                  <span
                    className="font-mono text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5"
                    style={{ backgroundColor: statusBg, color: statusColor }}
                  >
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "notes" && (
        <div className="border" style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border-strong)" }}>
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Activity Log
            </span>
            <button
              className="flex items-center gap-1 font-mono text-[10px] px-2 py-1 text-white"
              style={{ backgroundColor: "var(--blue)" }}
            >
              <Plus className="w-3 h-3" /> Add Note
            </button>
          </div>
          {client.notes.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <MessageSquare className="w-5 h-5 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
              <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                No notes yet
              </p>
            </div>
          ) : (
            client.notes.map((note, i) => {
              const typeColor = note.type === "milestone" ? "var(--blue)" : note.type === "update" ? "#059669" : "var(--text-muted)";
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 px-5 py-3 border-b last:border-b-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div
                    className="w-1.5 h-1.5 mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: typeColor }}
                  />
                  <div className="flex-1">
                    <div className="font-mono text-xs" style={{ color: "var(--text-body)" }}>
                      {note.text}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>
                        {note.date}
                      </span>
                      <span
                        className="font-mono text-[8px] uppercase tracking-wider"
                        style={{ color: typeColor }}
                      >
                        {note.type}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "tasks" && (
        <div className="border" style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border-strong)" }}>
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Build Tasks / SOP
            </span>
            <span className="font-mono text-[10px]" style={{ color: "var(--text-body)" }}>
              {client.tasks.filter((t) => t.completed).length}/{client.tasks.length} complete
            </span>
          </div>
          {client.tasks.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <ClipboardList className="w-5 h-5 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
              <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                No tasks assigned yet
              </p>
            </div>
          ) : (
            client.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 px-5 py-3 border-b last:border-b-0"
                style={{ borderColor: "var(--border)" }}
              >
                <div
                  className="w-4 h-4 flex-shrink-0 border flex items-center justify-center"
                  style={{
                    borderColor: task.completed ? "#059669" : "var(--border-strong)",
                    backgroundColor: task.completed ? "#059669" : "transparent",
                  }}
                >
                  {task.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <span
                  className="font-mono text-xs flex-1"
                  style={{
                    color: task.completed ? "var(--text-muted)" : "var(--text-headline)",
                    textDecoration: task.completed ? "line-through" : "none",
                  }}
                >
                  {task.label}
                </span>
                <span className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>
                  Phase {task.phase}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Dashboard
// ═══════════════════════════════════════════════════════════════════════════
export function AdminDashboard({
  initialProjects,
  intakeCount = 0,
}: {
  initialProjects: ClientProject[];
  intakeCount?: number;
}) {
  const [clients] = useState<ClientProject[]>(initialProjects);
  const [selectedClient, setSelectedClient] = useState<ClientProject | null>(null);
  const [filter, setFilter] = useState<ClientStatus | "all">("all");
  const [navItem, setNavItem] = useState<NavItem>("dashboard");

  const filteredClients = filter === "all" ? clients : clients.filter((c) => c.status === filter);
  const statusFilters: (ClientStatus | "all")[] = ["all", "live", "building", "onboarding", "inquiry"];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <aside
        className="w-56 flex-shrink-0 border-r flex flex-col"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--bg-white)",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <SailLogo className="w-5 h-5" />
            <span className="font-serif text-sm tracking-[0.05em] font-bold" style={{ color: "var(--text-headline)" }}>
              WHOLESAIL
            </span>
          </div>
          <div className="font-mono text-[9px] uppercase tracking-widest mt-1" style={{ color: "var(--text-muted)" }}>
            Admin Console
          </div>
        </div>

        <nav className="flex-1 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = navItem === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setNavItem(item.key);
                  setSelectedClient(null);
                }}
                className="w-full flex items-center gap-2.5 px-5 py-2.5 font-mono text-xs transition-colors"
                style={{
                  backgroundColor: isActive ? "var(--blue-light)" : "transparent",
                  color: isActive ? "var(--blue)" : "var(--text-body)",
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
            Clients
          </div>
          <div className="font-serif text-lg" style={{ color: "var(--text-headline)" }}>
            {clients.length}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {selectedClient ? (
          <ClientDetail
            client={selectedClient}
            onBack={() => setSelectedClient(null)}
          />
        ) : (
          <>
            {/* Page header */}
            <div className="mb-6">
              <h1 className="font-serif text-2xl mb-1" style={{ color: "var(--text-headline)" }}>
                {navItem === "dashboard" && "Dashboard"}
                {navItem === "clients" && "Client Management"}
                {navItem === "revenue" && "Revenue"}
                {navItem === "settings" && "Settings"}
              </h1>
              <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                {navItem === "dashboard" && "Overview of all portal builds and client activity."}
                {navItem === "clients" && "Manage client projects, track builds, and monitor portal health."}
                {navItem === "revenue" && "Monthly recurring revenue, contract values, and billing."}
                {navItem === "settings" && "Platform configuration and integration settings."}
              </p>
            </div>

            {/* Stats */}
            <div className="mb-6">
              <StatsBar clients={clients} />
            </div>

            {/* Status filters */}
            <div className="flex items-center gap-2 mb-4">
              {statusFilters.map((s) => {
                const label = s === "all" ? "All" : STATUS_CONFIG[s].label;
                const count = s === "all" ? clients.length : clients.filter((c) => c.status === s).length;
                return (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className="font-mono text-[10px] uppercase tracking-wide px-3 py-1.5 border transition-colors"
                    style={{
                      backgroundColor: filter === s ? "var(--blue)" : "var(--bg-white)",
                      color: filter === s ? "white" : "var(--text-body)",
                      borderColor: filter === s ? "var(--blue)" : "var(--border-strong)",
                    }}
                  >
                    {label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Client grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onClick={() => setSelectedClient(client)}
                />
              ))}
            </div>

            {filteredClients.length === 0 && (
              <div className="text-center py-16">
                <Users className="w-6 h-6 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  No clients match this filter.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
