"use client";

import { useState } from "react";
import { Clock, Layers, Calculator } from "lucide-react";
import { ToolComparison } from "@/components/tool-comparison";
import { TimeComparison } from "@/components/time-comparison";
import { PricingCalculator } from "@/components/pricing-calculator";

const PAIN_POINTS = [
  {
    id: "time" as const,
    icon: Clock,
    label: "Manual Work",
    question: "My team wastes too much time on manual tasks",
    subtext: "See exactly how many hours and dollars you're burning",
  },
  {
    id: "tools" as const,
    icon: Layers,
    question: "I'm paying for too many disconnected tools",
    label: "Software Costs",
    subtext: "See what 18+ platforms actually cost your business",
  },
  {
    id: "value" as const,
    icon: Calculator,
    label: "Build Value",
    question: "I want to see what a custom portal is worth",
    subtext: "Compare agency rates to Wholesail pricing",
  },
] as const;

type PainPointId = (typeof PAIN_POINTS)[number]["id"];

export function PainPointExplorer() {
  const [active, setActive] = useState<PainPointId>("time");

  return (
    <div>
      {/* Tab buttons */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 border"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--border-strong)",
          gap: "1px",
        }}
      >
        {PAIN_POINTS.map((point) => {
          const Icon = point.icon;
          const isActive = active === point.id;
          return (
            <button
              key={point.id}
              type="button"
              onClick={() => setActive(point.id)}
              className="p-4 sm:p-5 text-left transition-colors"
              style={{
                backgroundColor: isActive
                  ? "var(--blue-light)"
                  : "var(--bg-white)",
                borderBottom: isActive
                  ? "3px solid var(--blue)"
                  : "3px solid transparent",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{
                    color: isActive ? "var(--blue)" : "var(--text-muted)",
                  }}
                  strokeWidth={1.5}
                />
                <span
                  className="font-mono text-[9px] uppercase tracking-widest"
                  style={{
                    color: isActive ? "var(--blue)" : "var(--text-muted)",
                  }}
                >
                  {point.label}
                </span>
              </div>
              <div
                className="font-serif text-sm sm:text-base leading-snug mb-0.5"
                style={{
                  color: isActive
                    ? "var(--text-headline)"
                    : "var(--text-body)",
                }}
              >
                {point.question}
              </div>
              <span
                className="font-mono text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                {point.subtext}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div className="mt-4">
        {active === "time" && <TimeComparison />}
        {active === "tools" && <ToolComparison />}
        {active === "value" && <PricingCalculator />}
      </div>
    </div>
  );
}
