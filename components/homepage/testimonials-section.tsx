"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeUp, staggerContainer } from "@/lib/animations";

const TESTIMONIALS = [
  {
    beforeContext: "Before: 200 orders/week managed via text message and Google Sheets",
    quote:
      "We were running everything through text messages and a shared Google Sheet. Our rep would spend Sunday nights entering orders for Monday delivery. Now clients order themselves and we just fulfill. I wish we had done this two years ago.",
    name: "Marcus T.",
    company: "Fresh Coast Specialty Foods",
    industry: "Food & Beverage Distribution",
  },
  {
    beforeContext: "Before: 40+ open invoices being chased manually each month",
    quote:
      "The invoice chasing alone was worth the price. We used to have 30–40 day collection cycles because someone had to manually follow up. Now reminders go out automatically and our average collection is down to 18 days.",
    name: "Elena V.",
    company: "Pacific Rim Wine Imports",
    industry: "Wine & Spirits Distribution",
  },
  {
    beforeContext: "Before: Quoted $120K for a NetSuite implementation",
    quote:
      "I was skeptical because I've tried software before and it always required months of setup and training. This was live in 11 days. My top 20 accounts were placing orders through the portal within the first week.",
    name: "Dave K.",
    company: "Central States Industrial Supply",
    industry: "Industrial Distribution",
  },
];

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function TestimonialsSection() {
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
          From the Field
        </span>
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal"
          style={{ color: "var(--text-headline)" }}
        >
          What distribution owners say.
        </h2>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-1 lg:grid-cols-3 gap-0"
        style={{ border: "1px solid var(--border-strong)" }}
      >
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            variants={cardVariant}
            className={`p-4 sm:p-6 lg:p-8 ${i < TESTIMONIALS.length - 1 ? "border-b lg:border-b-0 lg:border-r" : ""}`}
            style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}
          >
            <div
              className="font-mono text-[10px] uppercase tracking-widest mb-5 px-3 py-1.5 inline-block"
              style={{
                backgroundColor: "var(--blue-light)",
                color: "var(--blue)",
                borderRadius: "4px",
              }}
            >
              {t.beforeContext}
            </div>
            <p
              className="font-serif text-3xl sm:text-4xl leading-none mb-4 select-none"
              style={{ color: "var(--border-strong)" }}
            >
              &ldquo;
            </p>
            <p
              className="font-mono text-xs leading-relaxed mb-8"
              style={{ color: "var(--text-body)" }}
            >
              {t.quote}
            </p>
            <div>
              <div
                className="font-mono text-[11px] font-semibold"
                style={{ color: "var(--text-headline)" }}
              >
                {t.name}
              </div>
              <div
                className="font-mono text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                {t.company}
              </div>
              <div
                className="font-mono text-[9px] uppercase tracking-wider mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                {t.industry}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
