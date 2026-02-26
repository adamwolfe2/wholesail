"use client";

import { useEffect, useState } from "react";
import { getHealthColors } from "@/lib/client-health";
import type { ClientHealthRow } from "@/app/api/admin/clients/health-scores/route";

type Label = "Champion" | "Healthy" | "At Risk" | "Dormant";

const LABELS: Label[] = ["Champion", "Healthy", "At Risk", "Dormant"];

interface Summary {
  Champion: number;
  Healthy: number;
  "At Risk": number;
  Dormant: number;
}

export function HealthSummaryCards() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/clients/health-scores");
        if (!res.ok) return;
        const data: { scores: ClientHealthRow[]; summary: Summary } =
          await res.json();
        if (!cancelled) setSummary(data.summary);
      } catch {
        // non-critical — hide cards on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (!loading && !summary) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {LABELS.map((label) => {
        const { colorClass, bgClass, borderClass } = getHealthColors(label);
        const count = summary ? summary[label] : null;
        return (
          <div
            key={label}
            className={`border p-4 ${bgClass} ${borderClass}`}
          >
            <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${colorClass}`}>
              {label}
            </p>
            {loading || count === null ? (
              <div className="h-8 w-12 bg-current opacity-10 animate-pulse" />
            ) : (
              <p className={`text-3xl font-mono font-bold ${colorClass}`}>
                {count}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">clients</p>
          </div>
        );
      })}
    </div>
  );
}
