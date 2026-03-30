"use client";

import dynamic from "next/dynamic";

function ChartSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-[300px] animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-[250px] animate-pulse rounded-lg bg-muted" />
        <div className="h-[250px] animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

export const AdminCharts = dynamic(
  () => import("./admin-charts").then((m) => ({ default: m.AdminCharts })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const SmartReorderAlerts = dynamic(
  () =>
    import("./smart-reorder-alerts").then((m) => ({
      default: m.SmartReorderAlerts,
    })),
  { ssr: false }
);
