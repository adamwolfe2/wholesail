"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { FEATURES, TOTAL_PLATFORM_VALUE } from "@/lib/client-data";

const CATEGORIES = [
  { key: "core", label: "Core Platform" },
  { key: "automation", label: "Automation" },
  { key: "growth", label: "Growth & Retention" },
  { key: "content", label: "Content" },
] as const;

function formatValue(n: number) {
  return "$" + n.toLocaleString();
}

export function PricingCalculator() {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(FEATURES.filter((f) => f.category === "core").map((f) => f.id))
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedValue = FEATURES.filter((f) => selected.has(f.id)).reduce(
    (sum, f) => sum + f.value,
    0
  );
  const pct = Math.round((selectedValue / TOTAL_PLATFORM_VALUE) * 100);

  return (
    <div>
      {/* Category groups */}
      <div className="space-y-6 mb-8">
        {CATEGORIES.map((cat) => {
          const catFeatures = FEATURES.filter((f) => f.category === cat.key);
          return (
            <div key={cat.key}>
              <div
                className="font-mono text-[9px] uppercase tracking-widest mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                {cat.label}
              </div>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-0"
                style={{ border: "1px solid var(--border-strong)" }}
              >
                {catFeatures.map((feature, i) => {
                  const isSelected = selected.has(feature.id);
                  return (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => toggle(feature.id)}
                      className="text-left px-4 py-3 flex items-start gap-3 transition-colors"
                      style={{
                        backgroundColor: isSelected
                          ? "var(--blue-light)"
                          : "var(--bg-white)",
                        borderRight:
                          i % 2 === 0 ? "1px solid var(--border-strong)" : "none",
                        borderBottom:
                          i < catFeatures.length - (catFeatures.length % 2 === 0 ? 2 : 1)
                            ? "1px solid var(--border-strong)"
                            : "none",
                      }}
                    >
                      <div
                        className="w-4 h-4 flex-shrink-0 mt-0.5 flex items-center justify-center border"
                        style={{
                          borderColor: isSelected
                            ? "var(--blue)"
                            : "var(--border-strong)",
                          backgroundColor: isSelected
                            ? "var(--blue)"
                            : "transparent",
                        }}
                      >
                        {isSelected && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="font-mono text-xs font-semibold"
                            style={{
                              color: isSelected
                                ? "var(--blue)"
                                : "var(--text-headline)",
                            }}
                          >
                            {feature.label}
                          </span>
                          <span
                            className="font-mono text-xs font-bold flex-shrink-0"
                            style={{
                              color: isSelected
                                ? "var(--blue)"
                                : "var(--text-headline)",
                            }}
                          >
                            {formatValue(feature.value)}
                          </span>
                        </div>
                        <p
                          className="font-mono text-[10px] leading-snug mt-0.5"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {feature.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals bar */}
      <div
        className="border p-6"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--bg-white)",
        }}
      >
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span
              className="font-mono text-[9px] uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Platform Value
            </span>
            <span
              className="font-mono text-[9px]"
              style={{ color: "var(--text-muted)" }}
            >
              {pct}% of full platform
            </span>
          </div>
          <div
            className="h-1.5 w-full"
            style={{ backgroundColor: "var(--border)" }}
          >
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                backgroundColor: "var(--blue)",
                width: `${pct}%`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <div
              className="font-mono text-[9px] uppercase tracking-widest mb-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Features Selected
            </div>
            <div
              className="font-serif text-2xl"
              style={{ color: "var(--text-headline)" }}
            >
              {selected.size}
              <span
                className="font-mono text-xs ml-1"
                style={{ color: "var(--text-muted)" }}
              >
                / {FEATURES.length}
              </span>
            </div>
          </div>
          <div>
            <div
              className="font-mono text-[9px] uppercase tracking-widest mb-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Market Rate
            </div>
            <div
              className="font-serif text-2xl"
              style={{ color: "var(--text-headline)" }}
            >
              {formatValue(selectedValue)}
            </div>
          </div>
          <div>
            <div
              className="font-mono text-[9px] uppercase tracking-widest mb-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Full Platform Value
            </div>
            <div
              className="font-serif text-2xl"
              style={{ color: "var(--text-muted)" }}
            >
              {formatValue(TOTAL_PLATFORM_VALUE)}
            </div>
          </div>
        </div>
      </div>

      <p
        className="font-mono text-[10px] mt-3 text-center"
        style={{ color: "var(--text-muted)" }}
      >
        Market rates based on agency quotes for equivalent custom-built
        features. Your investment is discussed on our consultation call.
      </p>
    </div>
  );
}
