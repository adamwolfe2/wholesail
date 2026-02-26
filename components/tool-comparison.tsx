"use client";

import { useState } from "react";
import {
  TOOL_REPLACEMENTS,
  getToolCost,
  getTotalMonthlyCost,
} from "@/lib/client-data";

function fmt(n: number) {
  return "$" + n.toLocaleString();
}

export function ToolComparison() {
  const [teamSize, setTeamSize] = useState(10);
  const totalMonthly = getTotalMonthlyCost(teamSize);
  const totalAnnual = totalMonthly * 12;

  return (
    <div>
      {/* Team size slider — compact */}
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

      {/* Logo grid — compact */}
      <div
        className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 border border-t-0"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--border-strong)",
          gap: "1px",
        }}
      >
        {TOOL_REPLACEMENTS.map((tool) => {
          const cost = getToolCost(tool, teamSize);
          return (
            <div
              key={tool.tool}
              className="flex flex-col items-center justify-center py-3 px-2 text-center"
              style={{ backgroundColor: "var(--bg-white)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://logo.clearbit.com/${tool.domain}`}
                alt={tool.tool}
                width={24}
                height={24}
                className="w-6 h-6 rounded mb-1.5"
                style={{ objectFit: "contain" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
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
            className="font-mono text-xs font-semibold"
            style={{ color: "var(--blue)" }}
          >
            You&apos;re spending {fmt(totalMonthly)}/mo ({fmt(totalAnnual)}/yr) on
            tools Wholesail replaces.
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
