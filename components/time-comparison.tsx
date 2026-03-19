"use client";

import { useState } from "react";
import { TOTAL_HOURS_SAVED } from "@/lib/client-data";

function fmt(n: number) {
  return "$" + n.toLocaleString();
}

export function TimeComparison() {
  const [hourlyRate, setHourlyRate] = useState(30);
  const weeklyCost = TOTAL_HOURS_SAVED * hourlyRate;
  const annualCost = weeklyCost * 52;

  // Group tasks into summary buckets for compact display
  const taskSummaries = [
    { label: "Order Taking", hours: 10, desc: "Phone, email, text orders" },
    { label: "Invoicing & Payments", hours: 9, desc: "Invoices, reminders, chasing" },
    { label: "Inventory & Shipping", hours: 7, desc: "Spreadsheets, tracking, updates" },
    { label: "CRM & Client Mgmt", hours: 6, desc: "Contacts, reps, applications" },
    { label: "Marketing & Comms", hours: 7, desc: "Emails, follow-ups, reports" },
    { label: "Support & Questions", hours: 6, desc: "Same questions, over and over" },
  ];

  return (
    <div>
      {/* Hourly rate slider */}
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
          Avg Hourly Rate
        </span>
        <input
          type="range"
          min={15}
          max={75}
          step={5}
          value={hourlyRate}
          onChange={(e) => setHourlyRate(Number(e.target.value))}
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
          {fmt(hourlyRate)}/hr
        </span>
      </div>

      {/* Task buckets — compact 2x3 grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border border-t-0"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--border-strong)",
          gap: "1px",
        }}
      >
        {taskSummaries.map((task) => (
          <div
            key={task.label}
            className="p-3 text-center"
            style={{ backgroundColor: "var(--bg-white)" }}
          >
            <div
              className="font-serif text-xl sm:text-2xl mb-0.5"
              style={{ color: "var(--text-headline)" }}
            >
              {task.hours}
              <span
                className="font-mono text-[9px]"
                style={{ color: "var(--text-muted)" }}
              >
                hrs
              </span>
            </div>
            <div
              className="font-mono text-[10px] font-semibold leading-tight mb-0.5"
              style={{ color: "var(--text-headline)" }}
            >
              {task.label}
            </div>
            <div
              className="font-mono text-[9px] leading-tight"
              style={{ color: "var(--text-muted)" }}
            >
              {task.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Summary totals */}
      <div
        className="grid grid-cols-3 border border-t-0"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--border-strong)",
          gap: "1px",
        }}
      >
        <div
          className="p-4 text-center"
          style={{ backgroundColor: "var(--bg-white)" }}
        >
          <div
            className="font-serif text-2xl sm:text-3xl"
            style={{ color: "var(--text-headline)" }}
          >
            {TOTAL_HOURS_SAVED}
            <span
              className="font-mono text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              {" "}hrs/wk
            </span>
          </div>
          <span
            className="font-mono text-[10px]"
            style={{ color: "var(--text-body)" }}
          >
            Wasted on manual work
          </span>
        </div>
        <div
          className="p-4 text-center"
          style={{ backgroundColor: "var(--bg-white)" }}
        >
          <div
            className="font-serif text-2xl sm:text-3xl"
            style={{ color: "var(--text-headline)" }}
          >
            {fmt(weeklyCost)}
            <span
              className="font-mono text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              {" "}/wk
            </span>
          </div>
          <span
            className="font-mono text-[10px]"
            style={{ color: "var(--text-body)" }}
          >
            In labor costs at {fmt(hourlyRate)}/hr
          </span>
        </div>
        <div
          className="p-4 text-center"
          style={{ backgroundColor: "var(--bg-white)" }}
        >
          <div
            className="font-serif text-2xl sm:text-3xl"
            style={{ color: "var(--text-headline)" }}
          >
            {fmt(annualCost)}
            <span
              className="font-mono text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              {" "}/yr
            </span>
          </div>
          <span
            className="font-mono text-[10px]"
            style={{ color: "var(--text-body)" }}
          >
            Burned annually on tasks Wholesail automates
          </span>
        </div>
      </div>

      {/* CTA */}
      <div
        className="border border-t-0 p-4 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--blue-light)",
        }}
      >
        <span
          className="font-mono text-xs font-semibold text-center sm:text-left"
          style={{ color: "var(--blue)" }}
        >
          That&apos;s a full-time employee worth of wasted labor — every single week.
        </span>
        <a
          href="#intake-form"
          className="inline-flex items-center justify-center font-mono text-xs font-semibold btn-blue flex-shrink-0"
          style={{ padding: "10px 20px", borderRadius: "6px" }}
        >
          Automate It All
        </a>
      </div>
    </div>
  );
}
