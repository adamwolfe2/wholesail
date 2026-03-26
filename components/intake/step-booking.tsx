"use client";

import { CheckCircle2 } from "lucide-react";
import type { Step1Data, Step2Data, Step3Data } from "./types";
import { FEATURES } from "./constants";
import { CalEmbed } from "./cal-embed";

export function StepBooking({
  step1,
  step2,
  step3,
}: {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
}) {
  const featureLabels = FEATURES.filter((f) =>
    step3.features.includes(f.id)
  ).map((f) => f.label);

  return (
    <div className="space-y-8">
      {/* Summary card */}
      <div className="border p-6" style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-primary)", borderRadius: "8px" }}>
        <div className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
          Your Portal Build Profile
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Company", value: step1.companyName || "\u2014" },
            { label: "Industry", value: step2.industry || "\u2014" },
            { label: "SKUs", value: step2.skuCount || "\u2014" },
            { label: "Clients", value: step2.activeClients || "\u2014" },
            { label: "Avg Order", value: step2.avgOrderValue || "\u2014" },
            {
              label: "Features",
              value: featureLabels.length
                ? `${featureLabels.length} selected`
                : "\u2014",
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="font-mono text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>
                {item.label}
              </div>
              <div className="font-mono text-xs font-medium truncate" style={{ color: "var(--text-headline)" }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
        {featureLabels.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="font-mono text-[9px] uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
              Selected Features
            </div>
            <div className="flex flex-wrap gap-1.5">
              {featureLabels.map((label) => (
                <span
                  key={label}
                  className="font-mono text-[9px] text-white px-2 py-1"
                  style={{ backgroundColor: "var(--blue)", borderRadius: "4px" }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* What happens next */}
      <div className="border p-6" style={{ borderColor: "var(--border-strong)", borderRadius: "8px" }}>
        <div className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
          What happens on your call
        </div>
        <div className="space-y-3">
          {[
            "Review your distribution workflow and identify quick wins",
            "Walk through each feature and how it maps to your operation",
            "Discuss branding, integrations, and custom requirements",
            "Get a timeline and investment estimate for your portal build",
            "Map out your product catalog import and client onboarding plan",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: "var(--blue)" }}
                strokeWidth={2}
              />
              <span className="font-mono text-xs" style={{ color: "var(--text-body)" }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cal.com embed */}
      <div>
        <div className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
          Select a time to speak with our team
        </div>
        <div className="border bg-white overflow-hidden" style={{ borderColor: "var(--border-strong)", borderRadius: "8px" }}>
          <CalEmbed name={step1.contactName} email={step1.contactEmail} />
        </div>
      </div>
    </div>
  );
}
