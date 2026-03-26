"use client";

import dynamic from "next/dynamic";

export const LazyIntakeWizard = dynamic(
  () => import("@/components/intake").then((m) => ({ default: m.IntakeWizard })),
  {
    loading: () => (
      <div
        className="w-full h-[500px] animate-pulse"
        style={{ backgroundColor: "var(--border)", opacity: 0.5 }}
      />
    ),
  }
);
