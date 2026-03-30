"use client";

import dynamic from "next/dynamic";

export const PriceHistoryChart = dynamic(
  () =>
    import("./price-history-chart").then((m) => ({
      default: m.PriceHistoryChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[250px] animate-pulse rounded-lg bg-muted" />
    ),
  }
);
