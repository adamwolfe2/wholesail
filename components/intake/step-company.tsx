"use client";

import type { Step1Data } from "./types";
import { ROLES, REVENUES, GO_LIVE_TIMELINES } from "./constants";
import { OptionButton } from "./option-button";

export function StepCompany({
  data,
  onChange,
  attempted,
}: {
  data: Step1Data;
  onChange: (d: Partial<Step1Data>) => void;
  attempted: boolean;
}) {
  const err = (val: string) => attempted && val.trim().length === 0;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="intake-companyName" className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Company Name *
          </label>
          <input
            id="intake-companyName"
            type="text"
            value={data.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
            placeholder="Pacific Seafood Co."
            className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none" style={{ borderColor: err(data.companyName) ? "var(--destructive)" : "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
          />
          {err(data.companyName) && <span className="font-mono text-[10px] mt-1 block" style={{ color: "var(--destructive)" }}>Required</span>}
        </div>
        <div>
          <label htmlFor="intake-shortName" className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Short Name / Abbreviation
          </label>
          <input
            id="intake-shortName"
            type="text"
            value={data.shortName}
            onChange={(e) => onChange({ shortName: e.target.value })}
            placeholder="PSC"
            className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none" style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
          />
          <span className="font-mono text-[9px] mt-1 block" style={{ color: "var(--text-muted)" }}>
            Used in SMS messages and notifications
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="intake-website" className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Website
          </label>
          <input
            id="intake-website"
            type="text"
            value={data.website}
            onChange={(e) => onChange({ website: e.target.value })}
            placeholder="pacificseafood.com"
            className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none" style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
          />
        </div>
        <div>
          <label htmlFor="intake-location" className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Location
          </label>
          <input
            id="intake-location"
            type="text"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="Portland, OR"
            className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none" style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="intake-targetDomain" className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Target Domain
          </label>
          <input
            id="intake-targetDomain"
            type="text"
            value={data.targetDomain}
            onChange={(e) => onChange({ targetDomain: e.target.value })}
            placeholder="acmewholesale.com or your preferred domain"
            className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none" style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
          />
        </div>
        <div>
          <label id="goLiveTimeline-label" className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            When do you want to go live?
          </label>
          <div className="grid grid-cols-1 gap-2" role="group" aria-labelledby="goLiveTimeline-label">
            {GO_LIVE_TIMELINES.map((t) => (
              <OptionButton
                key={t}
                selected={data.goLiveTimeline === t}
                onClick={() => onChange({ goLiveTimeline: t })}
              >
                {t}
              </OptionButton>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="intake-contactName" className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Your Name *
          </label>
          <input
            id="intake-contactName"
            type="text"
            value={data.contactName}
            onChange={(e) => onChange({ contactName: e.target.value })}
            placeholder="John Smith"
            className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none" style={{ borderColor: err(data.contactName) ? "var(--destructive)" : "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
          />
          {err(data.contactName) && <span className="font-mono text-[10px] mt-1 block" style={{ color: "var(--destructive)" }}>Required</span>}
        </div>
        <div>
          <label htmlFor="intake-contactEmail" className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Email *
          </label>
          <input
            id="intake-contactEmail"
            type="email"
            value={data.contactEmail}
            onChange={(e) => onChange({ contactEmail: e.target.value })}
            placeholder="john@pacificseafood.com"
            className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none" style={{ borderColor: err(data.contactEmail) ? "var(--destructive)" : "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
          />
          {err(data.contactEmail) && <span className="font-mono text-[10px] mt-1 block" style={{ color: "var(--destructive)" }}>Required</span>}
        </div>
        <div>
          <label htmlFor="intake-contactPhone" className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Phone
          </label>
          <input
            id="intake-contactPhone"
            type="tel"
            value={data.contactPhone}
            onChange={(e) => onChange({ contactPhone: e.target.value })}
            placeholder="(503) 555-0123"
            className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none" style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label id="role-label" className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Your Role
          </label>
          <div className="grid grid-cols-1 gap-2" role="group" aria-labelledby="role-label">
            {ROLES.map((r) => (
              <OptionButton
                key={r}
                selected={data.role === r}
                onClick={() => onChange({ role: r })}
              >
                {r}
              </OptionButton>
            ))}
          </div>
        </div>
        <div>
          <label id="revenue-label" className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Annual Revenue
          </label>
          <div className="grid grid-cols-1 gap-2" role="group" aria-labelledby="revenue-label">
            {REVENUES.map((r) => (
              <OptionButton
                key={r}
                selected={data.revenue === r}
                onClick={() => onChange({ revenue: r })}
              >
                {r}
              </OptionButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
