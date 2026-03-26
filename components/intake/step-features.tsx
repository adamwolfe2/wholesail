"use client";

import { Check } from "lucide-react";
import type { Step3Data } from "./types";
import { FEATURES, FEATURE_VALUES, formatValue } from "./constants";
import { OptionButton } from "./option-button";

export function StepFeatures({
  data,
  onChange,
}: {
  data: Step3Data;
  onChange: (d: Partial<Step3Data>) => void;
}) {
  const toggleFeature = (id: string) => {
    const current = data.features;
    onChange({
      features: current.includes(id)
        ? current.filter((f) => f !== id)
        : [...current, id],
    });
  };

  return (
    <div className="space-y-7">
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest block mb-3" style={{ color: "var(--text-muted)" }}>
          Which features do you need? (select all that apply)
          <span className="ml-2">
            ({data.features.length} selected
            {data.features.length > 0 && (
              <> · {formatValue(data.features.reduce((sum, id) => sum + (FEATURE_VALUES[id] || 0), 0))} market value</>
            )})
          </span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FEATURES.map((f) => {
            const selected = data.features.includes(f.id);
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggleFeature(f.id)}
                aria-pressed={selected}
                className="text-left px-4 py-3 border font-mono transition-all flex items-start gap-3"
                style={{
                  backgroundColor: selected ? "var(--blue)" : "var(--bg-white)",
                  color: selected ? "white" : "var(--text-body)",
                  borderColor: selected ? "var(--blue)" : "var(--border)",
                  borderRadius: "4px",
                }}
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: selected ? "white" : "var(--text-muted)" }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs uppercase tracking-wide font-semibold">
                      {f.label}
                    </span>
                    <span
                      className="text-[10px] font-bold flex-shrink-0"
                      style={{ color: selected ? "rgba(255,255,255,0.8)" : "var(--text-body)" }}
                    >
                      {formatValue(FEATURE_VALUES[f.id] || 0)}
                    </span>
                  </div>
                  <div
                    className="text-[10px] mt-0.5 leading-snug"
                    style={{ color: selected ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }}
                  >
                    {f.desc}
                  </div>
                </div>
                {selected && (
                  <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 ml-auto" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="intake-primaryColor" className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Primary Brand Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={data.primaryColor || "#000000"}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              className="w-12 h-12 border cursor-pointer p-0"
              style={{ borderColor: "var(--border-strong)", borderRadius: "4px" }}
              aria-label="Primary brand color picker"
            />
            <input
              id="intake-primaryColor"
              type="text"
              value={data.primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              placeholder="#1A1A1A"
              className="flex-1 border px-4 py-3 font-mono text-sm bg-white focus:outline-none"
              style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
            />
          </div>
          <span className="font-mono text-[9px] mt-1 block" style={{ color: "var(--text-muted)" }}>
            Used for buttons, headers, and accents throughout your portal
          </span>
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Do you have brand guidelines / logo files?
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              "Yes \u2014 I have full brand guidelines",
              "I have a logo but no guidelines",
              "No \u2014 I need help with branding",
            ].map((opt) => (
              <OptionButton
                key={opt}
                selected={data.hasBrandGuidelines === opt}
                onClick={() => onChange({ hasBrandGuidelines: opt })}
              >
                {opt}
              </OptionButton>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="intake-logoUrl" className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Logo File URL
          </label>
          <input
            id="intake-logoUrl"
            type="text"
            value={data.logoUrl}
            onChange={(e) => onChange({ logoUrl: e.target.value })}
            placeholder="Link to your logo file (website, Google Drive, Dropbox)"
            className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none"
            style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
          />
        </div>
        <div>
          <label htmlFor="intake-secondaryColor" className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Secondary / Accent Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={data.brandSecondaryColor || "#666666"}
              onChange={(e) => onChange({ brandSecondaryColor: e.target.value })}
              className="w-12 h-12 border cursor-pointer p-0"
              style={{ borderColor: "var(--border-strong)", borderRadius: "4px" }}
              aria-label="Secondary brand color picker"
            />
            <input
              id="intake-secondaryColor"
              type="text"
              value={data.brandSecondaryColor}
              onChange={(e) => onChange({ brandSecondaryColor: e.target.value })}
              placeholder="#666666"
              className="flex-1 border px-4 py-3 font-mono text-sm bg-white focus:outline-none"
              style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest block mb-1" style={{ color: "var(--text-muted)" }}>
          Websites you like the look or format of
        </label>
        <p className="font-mono text-[9px] mb-3" style={{ color: "var(--text-muted)" }}>
          Competitors, design references, or any site you&apos;d like us to draw inspiration from
        </p>
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <input
              key={i}
              type="text"
              value={data.inspirationUrls[i] || ""}
              onChange={(e) => {
                const updated = [...data.inspirationUrls];
                updated[i] = e.target.value;
                // Trim trailing empty entries
                while (updated.length > 0 && !updated[updated.length - 1]) updated.pop();
                onChange({ inspirationUrls: updated });
              }}
              placeholder={`Inspiration site ${i + 1}`}
              aria-label={`Inspiration site ${i + 1}`}
              className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none"
              style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
            />
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="intake-additionalNotes" className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
          Anything else we should know?
        </label>
        <textarea
          id="intake-additionalNotes"
          value={data.additionalNotes}
          onChange={(e) => onChange({ additionalNotes: e.target.value })}
          placeholder="e.g. We need to migrate from an existing system. We have specific compliance requirements. We want to integrate with our ERP..."
          rows={4}
          className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none resize-none"
          style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
        />
      </div>
    </div>
  );
}
