"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeUp, staggerContainer } from "@/lib/animations";

/**
 * Client testimonials. Currently not rendered on the homepage.
 *
 * Only add entries here for real, verifiable client quotes (name, company,
 * and permission to publish). The section renders nothing while empty.
 */
const TESTIMONIALS: {
  beforeContext: string;
  quote: string;
  name: string;
  company: string;
  industry: string;
}[] = [];

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

  if (TESTIMONIALS.length === 0) return null;

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
