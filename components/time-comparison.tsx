"use client";

import { Clock, ArrowRight } from "lucide-react";
import {
  MANUAL_PROCESSES,
  TOTAL_HOURS_SAVED,
  DEFAULT_HOURLY_RATE,
  ANNUAL_TIME_COST,
} from "@/lib/client-data";

function fmt(n: number) {
  return "$" + n.toLocaleString();
}

export function TimeComparison() {
  const weeklyCost = TOTAL_HOURS_SAVED * DEFAULT_HOURLY_RATE;

  return (
    <div>
      {/* ── Process Grid ─────────────────────────────────────── */}
      <div
        className="border"
        style={{ borderColor: "var(--border-strong)" }}
      >
        {/* Header */}
        <div
          className="grid grid-cols-[1fr_auto_1fr] gap-0 px-4 sm:px-6 py-3 border-b"
          style={{
            borderColor: "var(--border-strong)",
            backgroundColor: "var(--bg-white)",
          }}
        >
          <span
            className="font-mono text-[9px] uppercase tracking-widest"
            style={{ color: "#DC2626" }}
          >
            What your team does now
          </span>
          <span
            className="font-mono text-[9px] uppercase tracking-widest text-center w-16"
            style={{ color: "var(--text-muted)" }}
          >
            hrs/wk
          </span>
          <span
            className="font-mono text-[9px] uppercase tracking-widest text-right"
            style={{ color: "var(--blue)" }}
          >
            What Wholesail does instead
          </span>
        </div>

        {/* Rows */}
        {MANUAL_PROCESSES.map((process, i) => (
          <div
            key={process.task}
            className="grid grid-cols-[1fr_auto_1fr] gap-0 items-center px-4 sm:px-6 py-3"
            style={{
              borderBottom:
                i < MANUAL_PROCESSES.length - 1
                  ? "1px solid var(--border)"
                  : undefined,
              backgroundColor:
                i % 2 === 0 ? "var(--bg-white)" : "var(--bg-primary)",
            }}
          >
            {/* Manual task */}
            <div className="pr-3">
              <span
                className="font-mono text-xs"
                style={{ color: "var(--text-headline)" }}
              >
                {process.task}
              </span>
            </div>

            {/* Hours */}
            <div className="flex items-center justify-center w-16">
              <span
                className="font-mono text-sm font-bold"
                style={{ color: "#DC2626" }}
              >
                {process.hoursPerWeek}
              </span>
            </div>

            {/* Automated */}
            <div className="pl-3 text-right">
              <span
                className="font-mono text-xs"
                style={{ color: "var(--blue)" }}
              >
                {process.plainEnglish}
              </span>
            </div>
          </div>
        ))}

        {/* ── Total Row ──────────────────────────────────────── */}
        <div
          className="grid grid-cols-[1fr_auto_1fr] gap-0 items-center px-4 sm:px-6 py-4 border-t-2"
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
              Total per week:
            </span>
          </div>
          <div className="flex items-center justify-center w-16">
            <span
              className="font-mono text-lg font-bold"
              style={{ color: "#DC2626" }}
            >
              {TOTAL_HOURS_SAVED}
            </span>
          </div>
          <div className="text-right">
            <span
              className="font-mono text-xs font-semibold"
              style={{ color: "var(--blue)" }}
            >
              0 hrs — fully automated
            </span>
          </div>
        </div>
      </div>

      {/* ── Impact Callout ────────────────────────────────────── */}
      <div
        className="border border-t-0 p-5"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--blue-light)",
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <div
              className="font-serif text-3xl mb-1"
              style={{ color: "var(--text-headline)" }}
            >
              {TOTAL_HOURS_SAVED} hrs
              <span
                className="font-mono text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                /week
              </span>
            </div>
            <span
              className="font-mono text-[10px]"
              style={{ color: "var(--text-body)" }}
            >
              Given back to your team. That&apos;s a full-time employee.
            </span>
          </div>
          <div>
            <div
              className="font-serif text-3xl mb-1"
              style={{ color: "#DC2626" }}
            >
              {fmt(weeklyCost)}
              <span
                className="font-mono text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                /week
              </span>
            </div>
            <span
              className="font-mono text-[10px]"
              style={{ color: "var(--text-body)" }}
            >
              In labor costs at {fmt(DEFAULT_HOURLY_RATE)}/hr — doing work a
              machine should do.
            </span>
          </div>
          <div>
            <div
              className="font-serif text-3xl mb-1"
              style={{ color: "#DC2626" }}
            >
              {fmt(ANNUAL_TIME_COST)}
              <span
                className="font-mono text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                /year
              </span>
            </div>
            <span
              className="font-mono text-[10px]"
              style={{ color: "var(--text-body)" }}
            >
              Burned annually on manual tasks that Wholesail automates
              completely.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
