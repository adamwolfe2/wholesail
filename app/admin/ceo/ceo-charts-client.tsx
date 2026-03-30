"use client";

import dynamic from "next/dynamic";

const fallback = (
  <div className="h-[300px] animate-pulse rounded-lg bg-muted" />
);

export const CeoCharts = dynamic(
  () => import("./ceo-charts").then((m) => ({ default: m.CeoCharts })),
  { ssr: false, loading: () => fallback }
);

export const CohortChart = dynamic(
  () => import("./cohort-chart").then((m) => ({ default: m.CohortChart })),
  { ssr: false, loading: () => fallback }
);

export const ProductTrends = dynamic(
  () => import("./product-trends").then((m) => ({ default: m.ProductTrends })),
  { ssr: false, loading: () => fallback }
);
