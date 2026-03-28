"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Users, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { tierColors } from "@/lib/status-colors";
import { getHealthColors } from "@/lib/client-health";
import type { ClientHealthRow } from "@/app/api/admin/clients/health-scores/route";

type SortField = "name" | "tier" | "orderCount" | "health";
type SortDir = "asc" | "desc";

interface ClientRow {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  tier: string;
  paymentTerms: string;
  orderCount: number;
  isWholesaler: boolean;
}

export function ClientTable({ clients }: { clients: ClientRow[] }) {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [healthMap, setHealthMap] = useState<Map<string, ClientHealthRow>>(new Map());
  const [healthLoading, setHealthLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "name" ? "asc" : "desc");
    }
  }, [sortField]);

  // Fetch health scores on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/clients/health-scores");
        if (!res.ok) return;
        const data: { scores: ClientHealthRow[] } = await res.json();
        if (cancelled) return;
        const map = new Map<string, ClientHealthRow>();
        for (const row of data.scores) {
          map.set(row.orgId, row);
        }
        setHealthMap(map);
      } catch {
        // silently fail — health scores are non-critical
      } finally {
        if (!cancelled) setHealthLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const list = clients.filter((c) => {
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      const matchesTier = tierFilter === "all" || c.tier === tierFilter;
      return matchesSearch && matchesTier;
    });

    const tierOrder: Record<string, number> = { NEW: 0, REPEAT: 1, VIP: 2 };
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "tier":
          cmp = (tierOrder[a.tier] ?? 0) - (tierOrder[b.tier] ?? 0);
          break;
        case "orderCount":
          cmp = a.orderCount - b.orderCount;
          break;
        case "health": {
          const ha = healthMap.get(a.id)?.score ?? -1;
          const hb = healthMap.get(b.id)?.score ?? -1;
          cmp = ha - hb;
          break;
        }
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [clients, search, tierFilter, sortField, sortDir, healthMap]);

  return (
    <div>
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, contact, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search clients"
          />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All Tiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="REPEAT">Repeat</SelectItem>
            <SelectItem value="VIP">VIP</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-10" asChild>
          <a href="/api/admin/clients/export" download>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </a>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={search || tierFilter !== "all" ? Search : Users}
          title={search || tierFilter !== "all" ? "No Clients Match" : "No Clients Yet"}
          description={search || tierFilter !== "all" ? "Try a different search term or tier filter." : "Clients appear here once they sign up or are imported."}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <SortableHeader field="name" current={sortField} dir={sortDir} onClick={toggleSort}>Organization</SortableHeader>
                <th className="pb-3 font-medium hidden sm:table-cell">Contact</th>
                <th className="pb-3 font-medium hidden md:table-cell">Email</th>
                <th className="pb-3 font-medium hidden lg:table-cell">Phone</th>
                <SortableHeader field="tier" current={sortField} dir={sortDir} onClick={toggleSort}>Tier</SortableHeader>
                <th className="pb-3 font-medium hidden md:table-cell">Type</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Terms</th>
                <SortableHeader field="orderCount" current={sortField} dir={sortDir} onClick={toggleSort}>Orders</SortableHeader>
                <SortableHeader field="health" current={sortField} dir={sortDir} onClick={toggleSort} className="hidden sm:table-cell">Health</SortableHeader>
              </tr>
            </thead>
            <motion.tbody
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {filtered.map((client) => {
                const health = healthMap.get(client.id);
                return (
                  <motion.tr
                    key={client.id}
                    variants={fadeUp}
                    className="border-b hover:bg-muted/50 cursor-pointer"
                  >
                    <td className="py-3 font-medium">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="hover:underline"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="py-3 hidden sm:table-cell">{client.contactPerson}</td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">
                      {client.email}
                    </td>
                    <td className="py-3 text-muted-foreground hidden lg:table-cell">
                      {client.phone}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant="secondary"
                        className={tierColors[client.tier] || ""}
                      >
                        {client.tier}
                      </Badge>
                    </td>
                    <td className="py-3 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {client.isWholesaler ? 'Wholesaler' : 'Standard'}
                      </span>
                    </td>
                    <td className="py-3 hidden sm:table-cell">{client.paymentTerms}</td>
                    <td className="py-3">{client.orderCount}</td>
                    <td className="py-3 hidden sm:table-cell">
                      {healthLoading ? (
                        <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                      ) : health ? (
                        <HealthBadge
                          score={health.score}
                          label={health.label}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {clients.length} clients
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {(["NEW", "REPEAT", "VIP"] as const).map((t) => {
            const count = clients.filter((c) => c.tier === t).length;
            return (
              <span key={t}>
                {t}: <span className="font-medium text-foreground">{count}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SortableHeader({
  field,
  current,
  dir,
  onClick,
  children,
  className = "",
}: {
  field: SortField;
  current: SortField;
  dir: SortDir;
  onClick: (f: SortField) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const active = current === field;
  const Icon = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th
      className={`pb-3 font-medium cursor-pointer select-none hover:text-foreground ${className}`}
      onClick={() => onClick(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <Icon className={`h-3 w-3 ${active ? "text-foreground" : "text-muted-foreground/50"}`} />
      </span>
    </th>
  );
}

function HealthBadge({
  score,
  label,
}: {
  score: number;
  label: "Champion" | "Healthy" | "At Risk" | "Dormant";
}) {
  const { colorClass, bgClass, borderClass } = getHealthColors(label);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium border ${bgClass} ${colorClass} ${borderClass}`}
    >
      <span className="font-mono font-bold">{score}</span>
      <span>{label}</span>
    </span>
  );
}
