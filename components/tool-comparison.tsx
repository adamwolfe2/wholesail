"use client";

import { useState } from "react";
import { Check } from "lucide-react";
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
      {/* ── Team Size Slider ──────────────────────────────────── */}
      <div
        className="p-6 border mb-0"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--bg-white)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className="font-mono text-[9px] uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Team Size
          </span>
          <span
            className="font-mono text-sm font-bold px-3 py-1"
            style={{
              backgroundColor: "var(--blue-light)",
              color: "var(--blue)",
              borderRadius: "100px",
            }}
          >
            {teamSize} team members
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={50}
          step={5}
          value={teamSize}
          onChange={(e) => setTeamSize(Number(e.target.value))}
          className="w-full accent-[var(--blue)]"
          style={{ accentColor: "var(--blue)" }}
        />
        <div className="flex justify-between mt-1">
          <span
            className="font-mono text-[9px]"
            style={{ color: "var(--text-muted)" }}
          >
            5
          </span>
          <span
            className="font-mono text-[9px]"
            style={{ color: "var(--text-muted)" }}
          >
            50
          </span>
        </div>
      </div>

      {/* ── Tool Table ────────────────────────────────────────── */}
      <div
        className="border border-t-0"
        style={{ borderColor: "var(--border-strong)" }}
      >
        {/* Header */}
        <div
          className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 sm:px-6 py-3 border-b"
          style={{
            borderColor: "var(--border-strong)",
            backgroundColor: "var(--bg-white)",
          }}
        >
          <span
            className="font-mono text-[9px] uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Platform
          </span>
          <span
            className="font-mono text-[9px] uppercase tracking-widest text-right w-24"
            style={{ color: "var(--text-muted)" }}
          >
            Monthly Cost
          </span>
          <span
            className="font-mono text-[9px] uppercase tracking-widest text-center w-20"
            style={{ color: "var(--blue)" }}
          >
            Wholesail
          </span>
        </div>

        {/* Rows */}
        {TOOL_REPLACEMENTS.map((tool, i) => {
          const cost = getToolCost(tool, teamSize);
          return (
            <div
              key={tool.tool}
              className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-4 sm:px-6 py-3"
              style={{
                borderBottom:
                  i < TOOL_REPLACEMENTS.length - 1
                    ? "1px solid var(--border)"
                    : undefined,
                backgroundColor:
                  i % 2 === 0 ? "var(--bg-white)" : "var(--bg-primary)",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://logo.clearbit.com/${tool.domain}`}
                  alt={tool.tool}
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded flex-shrink-0"
                  style={{ objectFit: "contain" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="min-w-0">
                  <span
                    className="font-mono text-xs font-semibold block"
                    style={{ color: "var(--text-headline)" }}
                  >
                    {tool.tool}
                  </span>
                  <span
                    className="font-mono text-[10px] block truncate"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {tool.replaces}
                  </span>
                </div>
              </div>
              <span
                className="font-mono text-xs font-semibold text-right w-24"
                style={{ color: "var(--text-headline)" }}
              >
                {fmt(cost)}
                <span
                  className="font-normal block text-[9px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  /mo
                </span>
              </span>
              <div className="flex justify-center w-20">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--blue)" }}
                >
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              </div>
            </div>
          );
        })}

        {/* ── Total Row ───────────────────────────────────────── */}
        <div
          className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-4 sm:px-6 py-4 border-t-2"
          style={{
            borderColor: "var(--border-strong)",
            backgroundColor: "var(--bg-white)",
          }}
        >
          <div>
            <span
              className="font-mono text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Total:
            </span>
          </div>
          <div className="text-right w-24">
            <span
              className="font-mono text-sm font-bold block"
              style={{ color: "#DC2626" }}
            >
              {fmt(totalMonthly)}
              <span className="font-normal text-[9px]">/mo</span>
            </span>
            <span
              className="font-mono text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              {fmt(totalAnnual)}/yr
            </span>
          </div>
          <div className="flex justify-center w-20">
            <span
              className="font-mono text-sm font-bold"
              style={{ color: "var(--blue)" }}
            >
              Included
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom callout ────────────────────────────────────── */}
      <div
        className="mt-0 border border-t-0 p-5"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--blue-light)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span
              className="font-mono text-xs font-semibold block mb-0.5"
              style={{ color: "var(--blue)" }}
            >
              You&apos;re paying {fmt(totalAnnual)}/year before writing a single
              line of custom code.
            </span>
            <span
              className="font-mono text-[10px]"
              style={{ color: "var(--text-body)" }}
            >
              Plus a dev agency retainer of $5K–10K/mo to integrate and maintain
              all of it.
            </span>
          </div>
          <a
            href="#intake-form"
            className="inline-flex items-center justify-center font-mono text-xs font-semibold btn-blue flex-shrink-0"
            style={{ padding: "10px 20px", borderRadius: "6px" }}
          >
            Replace All 18 Tools
          </a>
        </div>
      </div>
    </div>
  );
}
