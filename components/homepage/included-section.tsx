"use client";

import { CheckCircle2 } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeUp, staggerContainer } from "@/lib/animations";

const INCLUDED = [
  {
    category: "Client Portal",
    items: [
      "Product catalog with search & filters",
      "Shopping cart with saved carts",
      "Order history & shipment tracking",
      "Invoice payments via Stripe",
      "Standing / recurring orders",
      "Loyalty points & referrals",
      "Live chat & support messaging",
      "Quote requests & approval",
      "Personal spending analytics",
      "Product drop notifications",
    ],
  },
  {
    category: "Admin Panel",
    items: [
      "Order management & fulfillment board",
      "Client CRM with health scoring",
      "Product & inventory management",
      "Pricing rules by tier & category",
      "Quote creation & management",
      "Lead CRM & wholesale applications",
      "Sales rep tools & task management",
      "Revenue analytics & CEO dashboard",
      "Supplier portal & submissions",
      "Distributor routing & multi-org",
    ],
  },
  {
    category: "Built-in Workflows",
    items: [
      "Text message ordering (clients text, orders flow in)",
      "Live chat with suggested replies",
      "Billing reminders at Day 25, 30 & 35",
      "Abandoned cart recovery emails",
      "Lapsed client re-engagement emails",
      "Partner nurture sequences (Day 3, Day 7)",
      "Weekly digest & report emails",
      "Standing order processing",
      "Low stock alerts & reorder triggers",
      "Product drop blasts & alerts",
    ],
  },
];

const colVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function IncludedSection() {
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
          Full Feature Breakdown
        </span>
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal"
          style={{ color: "var(--text-headline)" }}
        >
          Three parts. One platform. Everything your distribution business runs on.
        </h2>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-1 lg:grid-cols-3 gap-0"
        style={{ border: "1px solid var(--border-strong)" }}
      >
        {INCLUDED.map((col, ci) => (
          <motion.div
            key={col.category}
            variants={colVariant}
            className={
              ci < INCLUDED.length - 1
                ? "border-b lg:border-b-0 lg:border-r"
                : ""
            }
            style={{ borderColor: "var(--border-strong)" }}
          >
            <div
              className="px-6 py-4 border-b"
              style={{
                borderColor: "var(--border-strong)",
                backgroundColor: "var(--bg-white)",
              }}
            >
              <span
                className="font-mono text-xs uppercase tracking-wide font-semibold"
                style={{ color: "var(--text-headline)" }}
              >
                {col.category}
              </span>
            </div>
            <div className="px-6 py-4 space-y-2.5">
              {col.items.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-3 h-3 flex-shrink-0 mt-0.5"
                    style={{ color: "var(--blue)" }}
                  />
                  <span
                    className="font-mono text-[11px] leading-snug"
                    style={{ color: "var(--text-body)" }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
