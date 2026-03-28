"use client";

import {
  Gift,
  Package,
  Warehouse,
  Brain,
  Newspaper,
  Shield,
  Users,
  Globe,
  BarChart3,
  Clock,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeUp, staggerContainer, scaleUp } from "@/lib/animations";

const ADDITIONAL_FEATURES = [
  { icon: Gift, label: "Referral Program" },
  { icon: Package, label: "Product Drops" },
  { icon: Warehouse, label: "Supplier Portal" },
  { icon: Brain, label: "Text Order Entry" },
  { icon: Newspaper, label: "Blog / Journal" },
  { icon: Shield, label: "Rate Limiting" },
  { icon: Users, label: "Sales Rep Tools" },
  { icon: Globe, label: "SEO Optimized" },
  { icon: BarChart3, label: "CEO Dashboard" },
  { icon: Clock, label: "Cron Automation" },
];

export function AdditionalFeaturesSection() {
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
        className="mb-10 text-center"
      >
        <span
          className="font-mono text-xs uppercase tracking-widest mb-4 block"
          style={{ color: "var(--text-muted)" }}
        >
          Also Included
        </span>
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal"
          style={{ color: "var(--text-headline)" }}
        >
          Every feature a modern distributor needs.
        </h2>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0"
        style={{ border: "1px solid var(--border-strong)" }}
      >
        {ADDITIONAL_FEATURES.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              variants={scaleUp}
              className={`p-4 flex flex-col items-center text-center ${
                i < 9 ? "border-b border-r" : "border-r"
              }`}
              style={{
                borderColor: "var(--border-strong)",
                backgroundColor: "var(--bg-white)",
              }}
            >
              <Icon
                className="w-5 h-5 mb-2"
                style={{ color: "var(--blue)" }}
                strokeWidth={1.5}
              />
              <span
                className="font-mono text-[9px] uppercase tracking-wide"
                style={{ color: "var(--text-body)" }}
              >
                {item.label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
