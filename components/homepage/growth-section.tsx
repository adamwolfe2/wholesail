"use client";

import { Users, BarChart3, TrendingUp, Zap } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeUp, staggerContainer } from "@/lib/animations";

const GROWTH_ITEMS = [
  {
    icon: Users,
    label: "Website Visitor ID",
    title: "See who visits your site.",
    body: "Identify anonymous website visitors by company. Know exactly which prospects are looking at your catalog — even if they never fill out a form.",
  },
  {
    icon: BarChart3,
    label: "Data Enrichment",
    title: "Know everything about your leads.",
    body: "Enrich contacts with company size, revenue, industry, and decision-maker info. Build targeted outreach lists from your ideal customer profile.",
  },
  {
    icon: TrendingUp,
    label: "Lookalike Audiences",
    title: "Find more clients like your best ones.",
    body: "We analyze your top wholesale accounts and find businesses that match — same size, same industry, same buying patterns.",
  },
  {
    icon: Zap,
    label: "Lead Capture",
    title: "Turn visitors into wholesale clients.",
    body: "Capture website visitors, score them automatically, and route qualified leads directly into your portal's CRM — ready for your sales team.",
  },
];

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function GrowthSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-16"
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
          Also Available
        </span>
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal mb-3"
          style={{ color: "var(--text-headline)" }}
        >
          Want more clients?
          <br />
          <span style={{ color: "var(--text-muted)" }}>We do that too.</span>
        </h2>
        <p
          className="font-mono text-sm max-w-xl leading-relaxed"
          style={{ color: "var(--text-body)" }}
        >
          Beyond your portal, we offer growth packages to help you find
          and convert new wholesale clients — powered by our lead
          intelligence platform.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0"
        style={{ border: "1px solid var(--border-strong)" }}
      >
        {GROWTH_ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              variants={cardVariant}
              className={`p-6 ${
                i < 3 ? "border-b sm:border-b-0 sm:border-r" : ""
              }`}
              style={{
                borderColor: "var(--border-strong)",
                backgroundColor: "var(--bg-white)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-8 h-8 flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--blue-light)",
                    borderRadius: "6px",
                  }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: "var(--blue)" }}
                    strokeWidth={1.5}
                  />
                </div>
                <span
                  className="font-mono text-[9px] uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  {item.label}
                </span>
              </div>
              <h3
                className="font-serif text-lg mb-2"
                style={{ color: "var(--text-headline)" }}
              >
                {item.title}
              </h3>
              <p
                className="font-mono text-xs leading-relaxed"
                style={{ color: "var(--text-body)" }}
              >
                {item.body}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      <div
        className="border border-t-0 p-4 text-center"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--bg-white)",
        }}
      >
        <span
          className="font-mono text-[10px]"
          style={{ color: "var(--text-muted)" }}
        >
          Growth packages available as add-ons to any Wholesail retainer.
          Powered by our lead intelligence platform.
        </span>
      </div>
    </section>
  );
}
