"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeUp, staggerContainer, scaleUp } from "@/lib/animations";

const STEPS = [
  {
    step: "01",
    title: "Tell Us About Your Business",
    desc: "A five-minute intake covers your products, clients, and workflow.",
  },
  {
    step: "02",
    title: "Scope the Build",
    desc: "A 30-minute call to align on features, branding, and timeline — with a clear investment estimate.",
  },
  {
    step: "03",
    title: "We Build",
    desc: "Your portal is configured, branded, and loaded with your catalog, pricing, and clients.",
  },
  {
    step: "04",
    title: "Launch — and We Run It",
    desc: "We deploy, train your team, and invite your clients. Then we keep it running for you.",
  },
];

const stepVariant = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function HowItWorksSection() {
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
          Process
        </span>
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal"
          style={{ color: "var(--text-headline)" }}
        >
          From first call to live portal in about two weeks.
        </h2>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0"
        style={{ border: "1px solid var(--border-strong)" }}
      >
        {STEPS.map((item, i) => {
          const isFirst = i === 0;
          return (
            <motion.div
              key={item.step}
              variants={stepVariant}
              className={`p-6 ${
                i < STEPS.length - 1
                  ? "border-b sm:border-b-0 sm:border-r"
                  : ""
              }`}
              style={{
                borderColor: "var(--border-strong)",
                backgroundColor: isFirst
                  ? "var(--bg-blue)"
                  : i === 1
                  ? "var(--bg-blue-dark)"
                  : "var(--bg-white)",
                color: i < 2 ? "var(--text-on-blue)" : "var(--text-headline)",
              }}
            >
              <motion.div
                variants={scaleUp}
                className="font-mono text-[9px] uppercase tracking-widest mb-3"
                style={{ opacity: i < 2 ? 0.5 : undefined, color: i >= 2 ? "var(--text-muted)" : undefined }}
              >
                Step {item.step}
              </motion.div>
              <div className="font-serif text-lg mb-2">{item.title}</div>
              <p
                className="font-mono text-[11px] leading-relaxed"
                style={{
                  color: i < 2 ? "rgba(255,255,255,0.7)" : "var(--text-body)",
                }}
              >
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
