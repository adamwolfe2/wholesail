"use client";

import { Clock, DollarSign, TrendingUp, Zap } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeUp, staggerContainer, scaleUp } from "@/lib/animations";

const STATS = [
  {
    icon: Clock,
    stat: "3–4 hrs",
    label: "per day the average distribution team spends manually entering orders, confirming inventory, and chasing payments",
    source: "Conexiom, 2024",
  },
  {
    icon: DollarSign,
    stat: "34%",
    label: "increase in repeat purchase frequency when wholesale clients can place orders through a self-service portal",
    source: "Shopify B2B Research",
  },
  {
    icon: TrendingUp,
    stat: "12 days",
    label: "faster invoice collection when clients can pay online — less time chasing, better cash flow, fewer phone calls",
    source: "Industry average",
  },
  {
    icon: Zap,
    stat: "< 2 wks",
    label: "from first call to fully deployed portal — versus 9–12 months for a standard ERP implementation",
    source: "vs. ERP average",
  },
];

export function StatsSection() {
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
        className="mb-8"
      >
        <span
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          The numbers don&apos;t lie
        </span>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0"
        style={{ border: "1px solid var(--border-strong)" }}
      >
        {STATS.map((item, i) => (
          <motion.div
            key={item.stat}
            variants={scaleUp}
            className={`p-6 ${
              i < STATS.length - 1
                ? "border-b sm:border-b lg:border-b-0 sm:border-r"
                : ""
            }`}
            style={{
              borderColor: "var(--border-strong)",
              backgroundColor: "var(--bg-white)",
            }}
          >
            <item.icon
              className="w-4 h-4 mb-3"
              style={{ color: "var(--blue)" }}
              strokeWidth={1.5}
            />
            <div
              className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal mb-2"
              style={{ color: "var(--text-headline)" }}
            >
              {item.stat}
            </div>
            <p
              className="font-mono text-[11px] leading-relaxed mb-2"
              style={{ color: "var(--text-body)" }}
            >
              {item.label}
            </p>
            <div
              className="font-mono text-[9px] uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              {item.source}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
