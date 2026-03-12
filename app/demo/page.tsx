"use client";

import dynamic from "next/dynamic";

const DemoPortal = dynamic(
  () => import("@/components/demo-portal").then((m) => ({ default: m.DemoPortal })),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-mono text-sm text-muted-foreground">Loading demo...</p>
      </div>
    ),
    ssr: false,
  }
);

export default function DemoPage() {
  return <DemoPortal />;
}
