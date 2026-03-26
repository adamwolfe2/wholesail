"use client";

import { Check } from "lucide-react";
import type { Step2Data } from "./types";
import {
  INDUSTRIES,
  SKU_COUNTS,
  ORDERING_METHODS,
  CLIENT_COUNTS,
  ORDER_VALUES,
  PAYMENT_TERMS,
  DELIVERY_OPTIONS,
  MINIMUM_ORDER_VALUES,
} from "./constants";
import { OptionButton } from "./option-button";

export function StepDistribution({
  data,
  onChange,
}: {
  data: Step2Data;
  onChange: (d: Partial<Step2Data>) => void;
}) {
  const toggleOrdering = (method: string) => {
    const current = data.currentOrdering;
    onChange({
      currentOrdering: current.includes(method)
        ? current.filter((m) => m !== method)
        : [...current, method],
    });
  };

  const togglePayment = (term: string) => {
    const current = data.paymentTerms;
    onChange({
      paymentTerms: current.includes(term)
        ? current.filter((t) => t !== term)
        : [...current, term],
    });
  };

  return (
    <div className="space-y-7">
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
          What industry / category do you distribute in? *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {INDUSTRIES.map((ind) => (
            <OptionButton
              key={ind}
              selected={data.industry === ind}
              onClick={() => onChange({ industry: ind })}
            >
              {ind}
            </OptionButton>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="intake-productCategories" className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
          Main product categories (comma-separated)
        </label>
        <input
          id="intake-productCategories"
          type="text"
          value={data.productCategories}
          onChange={(e) => onChange({ productCategories: e.target.value })}
          placeholder="e.g. Fresh Truffles, Oils & Vinegars, Specialty Cheese, Cured Meats"
          className="w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none" style={{ borderColor: "var(--border-strong)", borderRadius: "4px", color: "var(--text-headline)" }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            How many SKUs / products?
          </label>
          <div className="grid grid-cols-1 gap-2">
            {SKU_COUNTS.map((s) => (
              <OptionButton
                key={s}
                selected={data.skuCount === s}
                onClick={() => onChange({ skuCount: s })}
              >
                {s}
              </OptionButton>
            ))}
          </div>
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Do your products require cold chain / temperature control?
          </label>
          <div className="grid grid-cols-1 gap-2">
            {["Yes \u2014 refrigerated / frozen", "Partially \u2014 some items", "No \u2014 shelf stable"].map(
              (opt) => (
                <OptionButton
                  key={opt}
                  selected={data.coldChain === opt}
                  onClick={() => onChange({ coldChain: opt })}
                >
                  {opt}
                </OptionButton>
              )
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
          How do clients currently place orders? (select all)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ORDERING_METHODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => toggleOrdering(m)}
              aria-pressed={data.currentOrdering.includes(m)}
              className="text-left px-3 py-2.5 border font-mono text-xs uppercase tracking-wide transition-all flex items-center gap-2"
              style={{
                backgroundColor: data.currentOrdering.includes(m) ? "var(--blue)" : "var(--bg-white)",
                color: data.currentOrdering.includes(m) ? "white" : "var(--text-body)",
                borderColor: data.currentOrdering.includes(m) ? "var(--blue)" : "var(--border)",
                borderRadius: "4px",
              }}
            >
              {data.currentOrdering.includes(m) && (
                <Check className="w-3 h-3 flex-shrink-0" />
              )}
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Number of active wholesale clients
          </label>
          <div className="grid grid-cols-1 gap-2">
            {CLIENT_COUNTS.map((c) => (
              <OptionButton
                key={c}
                selected={data.activeClients === c}
                onClick={() => onChange({ activeClients: c })}
              >
                {c}
              </OptionButton>
            ))}
          </div>
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
            Average order value
          </label>
          <div className="grid grid-cols-1 gap-2">
            {ORDER_VALUES.map((v) => (
              <OptionButton
                key={v}
                selected={data.avgOrderValue === v}
                onClick={() => onChange({ avgOrderValue: v })}
              >
                {v}
              </OptionButton>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
          Payment terms you offer (select all)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PAYMENT_TERMS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => togglePayment(t)}
              aria-pressed={data.paymentTerms.includes(t)}
              className="text-left px-3 py-2.5 border font-mono text-xs uppercase tracking-wide transition-all flex items-center gap-2"
              style={{
                backgroundColor: data.paymentTerms.includes(t) ? "var(--blue)" : "var(--bg-white)",
                color: data.paymentTerms.includes(t) ? "white" : "var(--text-body)",
                borderColor: data.paymentTerms.includes(t) ? "var(--blue)" : "var(--border)",
                borderRadius: "4px",
              }}
            >
              {data.paymentTerms.includes(t) && (
                <Check className="w-3 h-3 flex-shrink-0" />
              )}
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
          Delivery coverage
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DELIVERY_OPTIONS.map((d) => (
            <OptionButton
              key={d}
              selected={data.deliveryCoverage === d}
              onClick={() => onChange({ deliveryCoverage: d })}
            >
              {d}
            </OptionButton>
          ))}
        </div>
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--text-muted)" }}>
          Minimum order value
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {MINIMUM_ORDER_VALUES.map((v) => (
            <OptionButton
              key={v}
              selected={data.minimumOrderValue === v}
              onClick={() => onChange({ minimumOrderValue: v })}
            >
              {v}
            </OptionButton>
          ))}
        </div>
      </div>
    </div>
  );
}
