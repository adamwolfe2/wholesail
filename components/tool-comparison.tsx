"use client";

import { useState, useRef, useEffect } from "react";
import {
  Package,
  Receipt,
  Users,
  Truck,
  BarChart3,
  Megaphone,
  Globe,
  Zap,
} from "lucide-react";
import {
  TOOL_REPLACEMENTS,
  TOOL_CATEGORY_META,
  getToolCost,
  getTotalMonthlyCost,
} from "@/lib/client-data";
import type { ToolCategory } from "@/lib/client-data";

const CATEGORY_ICONS: Record<ToolCategory, typeof Package> = {
  erp: Package,
  billing: Receipt,
  crm: Users,
  shipping: Truck,
  analytics: BarChart3,
  marketing: Megaphone,
  portal: Globe,
  automation: Zap,
};

function fmt(n: number) {
  return "$" + n.toLocaleString();
}

function ToolCard({
  tool,
  cost,
  isActive,
  onToggle,
}: {
  tool: (typeof TOOL_REPLACEMENTS)[number];
  cost: number;
  isActive: boolean;
  onToggle: () => void;
}) {
  const [logoFailed, setLogoFailed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      className="relative cursor-pointer group"
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      onClick={onToggle}
      onMouseEnter={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {/* Card */}
      <div
        className="flex flex-col items-center justify-center py-3 px-2 text-center transition-all duration-150"
        style={{
          backgroundColor: isActive ? "var(--blue-light)" : "var(--bg-white)",
          borderLeft: isActive ? "3px solid var(--blue)" : "3px solid transparent",
          minHeight: "88px",
        }}
      >
        {!logoFailed ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={`https://logo.clearbit.com/${tool.domain}`}
            alt={tool.tool}
            width={28}
            height={28}
            className="w-7 h-7 rounded mb-1.5 transition-transform duration-150 group-hover:scale-110"
            style={{ objectFit: "contain" }}
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <div
            className="w-7 h-7 rounded mb-1.5 flex items-center justify-center font-mono text-[11px] font-bold"
            style={{
              backgroundColor: "var(--blue-light)",
              color: "var(--blue)",
            }}
          >
            {tool.tool.charAt(0)}
          </div>
        )}
        <span
          className="font-mono text-[10px] font-semibold leading-tight mb-0.5"
          style={{ color: "var(--text-headline)" }}
        >
          {tool.tool}
        </span>
        <span
          className="font-mono text-[10px] font-bold"
          style={{ color: "var(--text-muted)" }}
        >
          {fmt(cost)}
          <span className="font-normal text-[8px]">/mo</span>
        </span>
      </div>

      {/* Pain point tooltip */}
      {isActive && (
        <div
          className="absolute left-0 right-0 z-20 p-3 border border-t-0 shadow-lg"
          style={{
            top: "100%",
            backgroundColor: "var(--bg-white)",
            borderColor: "var(--blue)",
          }}
        >
          <p
            className="font-serif text-[11px] leading-relaxed italic"
            style={{ color: "var(--text-body)" }}
          >
            &ldquo;{tool.painPoint}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}

export function ToolComparison() {
  const [teamSize, setTeamSize] = useState(10);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalMonthly = getTotalMonthlyCost(teamSize);
  const totalAnnual = totalMonthly * 12;
  const toolCount = TOOL_REPLACEMENTS.length;

  // Close tooltip when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveTool(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef}>
      {/* Team size slider */}
      <div
        className="flex items-center gap-4 sm:gap-6 p-4 border"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--bg-white)",
        }}
      >
        <span
          className="font-mono text-[9px] uppercase tracking-widest flex-shrink-0"
          style={{ color: "var(--text-muted)" }}
        >
          Team Size
        </span>
        <input
          type="range"
          min={5}
          max={50}
          step={5}
          value={teamSize}
          onChange={(e) => setTeamSize(Number(e.target.value))}
          className="flex-1"
          style={{ accentColor: "var(--blue)" }}
        />
        <span
          className="font-mono text-xs font-bold px-3 py-1 flex-shrink-0"
          style={{
            backgroundColor: "var(--blue-light)",
            color: "var(--blue)",
            borderRadius: "100px",
          }}
        >
          {teamSize}
        </span>
      </div>

      {/* Categories + tool grids */}
      <div
        className="border border-t-0"
        style={{ borderColor: "var(--border-strong)" }}
      >
        {TOOL_CATEGORY_META.map((cat) => {
          const tools = TOOL_REPLACEMENTS.filter((t) => t.category === cat.id);
          if (tools.length === 0) return null;
          const Icon = CATEGORY_ICONS[cat.id];

          return (
            <div key={cat.id}>
              {/* Category header */}
              <div
                className="flex items-center gap-2 px-4 py-2.5"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderBottom: "1px solid var(--border-strong)",
                  borderTop: "1px solid var(--border-strong)",
                }}
              >
                <Icon
                  className="w-3.5 h-3.5"
                  style={{ color: "var(--text-muted)" }}
                  strokeWidth={1.5}
                />
                <span
                  className="font-mono text-[9px] uppercase tracking-widest font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  {cat.label}
                </span>
                <span
                  className="font-mono text-[9px] ml-auto"
                  style={{ color: "var(--border-strong)" }}
                >
                  {tools.length} tool{tools.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Tool grid */}
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                style={{
                  backgroundColor: "var(--border)",
                  gap: "1px",
                }}
              >
                {tools.map((tool) => {
                  const cost = getToolCost(tool, teamSize);
                  return (
                    <ToolCard
                      key={tool.tool}
                      tool={tool}
                      cost={cost}
                      isActive={activeTool === tool.tool}
                      onToggle={() =>
                        setActiveTool(
                          activeTool === tool.tool ? null : tool.tool
                        )
                      }
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total bar */}
      <div
        className="border border-t-0 p-4 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--blue-light)",
        }}
      >
        <div className="text-center sm:text-left">
          <span
            className="font-mono text-xs font-semibold block sm:inline"
            style={{ color: "var(--blue)" }}
          >
            {toolCount} tools totaling {fmt(totalMonthly)}/mo ({fmt(totalAnnual)}
            /yr)
          </span>
          <span
            className="font-mono text-[10px] block mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            Wholesail replaces the entire stack for a fraction of the cost.
          </span>
        </div>
        <a
          href="#intake-form"
          className="inline-flex items-center justify-center font-mono text-xs font-semibold btn-blue flex-shrink-0"
          style={{ padding: "10px 20px", borderRadius: "6px" }}
        >
          Replace Them All
        </a>
      </div>
    </div>
  );
}
