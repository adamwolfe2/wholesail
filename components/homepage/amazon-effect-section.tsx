"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeUp, staggerContainer } from "@/lib/animations";

const BUYER_STATS = [
  { stat: "83%", label: "of B2B buyers prefer self-service ordering over sales rep interaction", source: "Gartner B2B Buyer Report" },
  { stat: "74%", label: "of B2B buyers would switch suppliers for a better digital ordering experience", source: "Forrester, 2024" },
  { stat: "3×", label: "more likely to reorder when clients have a self-service portal vs. email/phone", source: "Shopify B2B Research" },
];

const statCardVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function AmazonEffectSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-16"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <span
            className="font-mono text-xs uppercase tracking-widest mb-4 block"
            style={{ color: "var(--text-muted)" }}
          >
            The Amazon Effect
          </span>
          <h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal mb-4"
            style={{ color: "var(--text-headline)" }}
          >
            83% of your clients now prefer to order online.
            <br />
            <span style={{ color: "var(--blue)" }}>The ones who can&apos;t are choosing someone who lets them.</span>
          </h2>
          <p
            className="font-mono text-sm leading-relaxed mb-6"
            style={{ color: "var(--text-body)" }}
          >
            B2B buyers have been trained by Amazon, DoorDash, and every consumer app they use.
            They expect to place orders at 11pm on a Sunday, see their history, and get a
            confirmation — without calling anyone. Distributors who don&apos;t offer this are
            losing accounts to the ones who do.
          </p>
          <p
            className="font-mono text-sm leading-relaxed"
            style={{ color: "var(--text-body)" }}
          >
            Your portal doesn&apos;t just save you time. It&apos;s a competitive moat. When your
            clients can order themselves, reorder in 2 clicks, and pay invoices online — they
            don&apos;t switch. Convenience is stickier than price.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="p-4 sm:p-6 lg:p-8"
          style={{ border: "1px solid var(--border-strong)", backgroundColor: "var(--bg-white)" }}
        >
          {BUYER_STATS.map((item, i) => (
            <motion.div
              key={item.stat}
              variants={statCardVariant}
              className={`py-5 ${i < 2 ? "border-b" : ""}`}
              style={{ borderColor: "var(--border-strong)" }}
            >
              <div
                className="font-serif text-3xl mb-1"
                style={{ color: "var(--text-headline)" }}
              >
                {item.stat}
              </div>
              <p
                className="font-mono text-[11px] leading-relaxed mb-1"
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
      </div>
    </section>
  );
}
