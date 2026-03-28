"use client";

import { LazyIntakeWizard } from "@/components/lazy-intake-wizard";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeUp, fadeIn } from "@/lib/animations";

export function IntakeSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-16"
      id="intake-form"
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
          Start Your Build
        </span>
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal mb-3"
          style={{ color: "var(--text-headline)" }}
        >
          Tell us about your distribution business.
        </h2>
        <p
          className="font-mono text-sm max-w-xl leading-relaxed"
          style={{ color: "var(--text-body)" }}
        >
          5 minutes. We review your answers before your call so every minute
          is spent on building your portal, not discovery.
        </p>
      </motion.div>

      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ delay: 0.15 }}
      >
        <LazyIntakeWizard />
      </motion.div>
    </section>
  );
}
