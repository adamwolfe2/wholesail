"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Users } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { tierColors } from "@/lib/status-colors";
import { getHealthColors } from "@/lib/client-health";
import type { ClientHealthRow } from "@/app/api/admin/clients/health-scores/route";

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
    return clients.filter((c) => {
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      const matchesTier = tierFilter === "all" || c.tier === tierFilter;
      return matchesSearch && matchesTier;
    });
  }, [clients, search, tierFilter]);

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
                <th className="pb-3 font-medium">Organization</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Contact</th>
                <th className="pb-3 font-medium hidden md:table-cell">Email</th>
                <th className="pb-3 font-medium hidden lg:table-cell">Phone</th>
                <th className="pb-3 font-medium">Tier</th>
                <th className="pb-3 font-medium hidden md:table-cell">Type</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Terms</th>
                <th className="pb-3 font-medium">Orders</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Health</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => {
                const health = healthMap.get(client.id);
                return (
                  <tr
                    key={client.id}
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-3">
        Showing {filtered.length} of {clients.length} clients
      </p>
    </div>
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
