"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { FEATURES, TOTAL_MARKET_VALUE, TOTAL_WHOLESAIL_VALUE } from "@/lib/client-data";

const CATEGORIES = [
  { key: "core", label: "Core Platform" },
  { key: "commerce", label: "Commerce & Billing" },
  { key: "automation", label: "AI & Automation" },
  { key: "growth", label: "Growth & Retention" },
  { key: "analytics", label: "Analytics & Reporting" },
  { key: "infrastructure", label: "Infrastructure" },
] as const;

function fmt(n: number) {
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

  const selectedFeatures = FEATURES.filter((f) => selected.has(f.id));
  const selectedMarket = selectedFeatures.reduce((sum, f) => sum + f.marketValue, 0);
  const selectedWholesail = selectedFeatures.reduce((sum, f) => sum + f.value, 0);
  const savingsPct = selectedMarket > 0 ? Math.round(((selectedMarket - selectedWholesail) / selectedMarket) * 100) : 0;
  const pct = Math.round((selectedMarket / TOTAL_MARKET_VALUE) * 100);

  return (
    <div>
      {/* Category groups */}
      <div className="space-y-6 mb-8">
        {CATEGORIES.map((cat) => {
          const catFeatures = FEATURES.filter((f) => f.category === cat.key);
          if (catFeatures.length === 0) return null;
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
                        <div className="flex items-center justify-between gap-1.5">
                          <span
                            className="font-mono text-[11px] sm:text-xs font-semibold truncate"
                            style={{
                              color: isSelected
                                ? "var(--blue)"
                                : "var(--text-headline)",
                            }}
                          >
                            {feature.label}
                          </span>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <span
                              className="font-mono text-[9px] sm:text-[10px] line-through"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {fmt(feature.marketValue)}
                            </span>
                            <span
                              className="font-mono text-[11px] sm:text-xs font-bold"
                              style={{
                                color: isSelected
                                  ? "var(--blue)"
                                  : "var(--text-headline)",
                              }}
                            >
                              {fmt(feature.value)}
                            </span>
                          </div>
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
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span
              className="font-mono text-[9px] uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Platform Coverage
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <div
              className="font-mono text-[9px] uppercase tracking-widest mb-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Features
            </div>
            <div
              className="font-serif text-xl sm:text-2xl"
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
              Agency Rate
            </div>
            <div
              className="font-serif text-xl sm:text-2xl line-through"
              style={{ color: "var(--text-muted)" }}
            >
              {fmt(selectedMarket)}
            </div>
          </div>
          <div>
            <div
              className="font-mono text-[9px] uppercase tracking-widest mb-0.5"
              style={{ color: "var(--blue)" }}
            >
              Wholesail Price
            </div>
            <div
              className="font-serif text-xl sm:text-2xl"
              style={{ color: "var(--blue)" }}
            >
              {fmt(selectedWholesail)}
            </div>
          </div>
          <div>
            <div
              className="font-mono text-[9px] uppercase tracking-widest mb-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              You Save
            </div>
            <div
              className="font-serif text-xl sm:text-2xl"
              style={{ color: "#059669" }}
            >
              {savingsPct}%
              <span
                className="font-mono text-[10px] sm:text-xs ml-1"
                style={{ color: "#059669" }}
              >
                ({fmt(selectedMarket - selectedWholesail)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Full platform value callout */}
      <div
        className="border border-t-0 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--blue-light)",
        }}
      >
        <div>
          <span
            className="font-mono text-xs font-semibold"
            style={{ color: "var(--blue)" }}
          >
            Full platform: {fmt(TOTAL_MARKET_VALUE)} in custom development value
          </span>
          <span
            className="font-mono text-[10px] block"
            style={{ color: "var(--text-body)" }}
          >
            Wholesail builds it for {fmt(TOTAL_WHOLESAIL_VALUE)} — that&apos;s{" "}
            {Math.round(
              ((TOTAL_MARKET_VALUE - TOTAL_WHOLESAIL_VALUE) /
                TOTAL_MARKET_VALUE) *
                100
            )}
            % less than hiring an agency.
          </span>
        </div>
        <a
          href="#intake-form"
          className="inline-flex items-center justify-center font-mono text-xs font-semibold btn-blue flex-shrink-0"
          style={{ padding: "10px 20px", borderRadius: "6px" }}
        >
          Start Your Build
        </a>
      </div>

      <p
        className="font-mono text-[10px] mt-3 text-center"
        style={{ color: "var(--text-muted)" }}
      >
        Agency rates based on market research of custom B2B portal development
        quotes. Your actual investment is finalized on our consultation call.
      </p>
    </div>
  );
}
