"use client";

import { CheckCircle2, X } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeUp, staggerContainer } from "@/lib/animations";

const BUILD_ITEMS = [
  "Branded portal on your own domain",
  "Catalog, pricing tiers, and client migration",
  "Payments and invoicing configured",
  "Team training and client onboarding",
];

const RETAINER_ITEMS = [
  "Hosting, monitoring, and platform updates",
  "Change requests handled by our team",
  "New features as your business grows",
  "Direct access to the people who built it",
];

const REPLACES = [
  "Phone & voicemail orders",
  "Spreadsheet order tracking",
  "Manual invoice follow-up",
  "Separate CRM subscriptions",
  "Multi-tool duct tape",
  "Heavy ERP implementations",
];

const cardVariant = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] },
  },
};

export function PricingSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-16"
      id="pricing"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="mb-10"
      >
        <span
          className="font-mono text-xs uppercase tracking-widest mb-4 block"
          style={{ color: "var(--text-muted)" }}
        >
          Pricing
        </span>
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal mb-3"
          style={{ color: "var(--text-headline)" }}
        >
          One build. One retainer.
          <br />
          <span style={{ color: "var(--blue)" }}>Everything handled.</span>
        </h2>
        <p
          className="font-mono text-sm max-w-xl leading-relaxed"
          style={{ color: "var(--text-body)" }}
        >
          We build your platform, migrate your data, train your team, and
          keep it running. Final pricing is scoped on your consultation call.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-1 md:grid-cols-2 gap-0"
        style={{ border: "1px solid var(--border-strong)" }}
      >
        {/* Build */}
        <motion.div
          variants={cardVariant}
          className="p-4 sm:p-6 lg:p-8 border-b md:border-b-0 md:border-r"
          style={{
            borderColor: "var(--border-strong)",
            backgroundColor: "var(--bg-blue)",
            color: "var(--text-on-blue)",
          }}
        >
          <div
            className="font-mono text-[9px] uppercase tracking-widest mb-2"
            style={{ opacity: 0.5 }}
          >
            One-Time Build
          </div>
          <div className="font-serif text-2xl sm:text-3xl lg:text-4xl mb-1">Starting at $25K</div>
          <p
            className="font-mono text-[11px] leading-relaxed mb-6"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            A custom portal built to your business, branded to your company,
            deployed in about two weeks.
          </p>
          <div className="space-y-2.5">
            {BUILD_ITEMS.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2
                  className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                />
                <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Retainer */}
        <motion.div
          variants={cardVariant}
          className="p-4 sm:p-6 lg:p-8"
          style={{ backgroundColor: "var(--bg-white)" }}
        >
          <div
            className="font-mono text-[9px] uppercase tracking-widest mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Monthly Retainer
          </div>
          <div
            className="font-serif text-2xl sm:text-3xl lg:text-4xl mb-1"
            style={{ color: "var(--text-headline)" }}
          >
            Starting at $5K
            <span
              className="font-mono text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              /mo
            </span>
          </div>
          <p
            className="font-mono text-[11px] leading-relaxed mb-6"
            style={{ color: "var(--text-body)" }}
          >
            Ongoing management. We maintain your portal, make changes when
            you need them, and keep everything running smoothly.
          </p>
          <div className="space-y-2.5">
            {RETAINER_ITEMS.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2
                  className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                  style={{ color: "var(--blue)" }}
                />
                <span
                  className="font-mono text-xs"
                  style={{ color: "var(--text-body)" }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* What it replaces */}
      <div
        className="border border-t-0 p-6"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--bg-white)",
        }}
      >
        <div
          className="font-mono text-[9px] uppercase tracking-widest mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          What it replaces
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {REPLACES.map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 px-3 py-2"
              style={{
                border: "1px solid var(--border-strong)",
                borderRadius: "4px",
              }}
            >
              <X className="w-3 h-3 flex-shrink-0" style={{ color: "var(--color-error)" }} strokeWidth={2.5} />
              <span className="font-mono text-[10px] leading-tight" style={{ color: "var(--text-body)" }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
