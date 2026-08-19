"use client";

import { ArrowRight } from "lucide-react";
import { LazyBuildDemo } from "@/components/lazy-build-demo";
import { motion } from "framer-motion";
import { fadeUp, fadeIn, staggerContainer } from "@/lib/animations";

const wordVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const headline = "Custom ordering portals & CRM,";
const words = headline.split(" ");

export function HeroSection() {
  return (
    <section className="py-20" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 items-center">
        <div>
          {/* Eyebrow pill */}
          <motion.span
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="inline-block font-mono text-[12px] font-semibold tracking-[0.04em] mb-2"
            style={{
              backgroundColor: "var(--blue-light)",
              color: "var(--blue)",
              borderRadius: "100px",
              padding: "4px 14px",
            }}
          >
            For wholesale distribution companies
          </motion.span>

          {/* Headline with word stagger */}
          <h1
            className="text-2xl sm:text-3xl md:text-5xl lg:text-[3.25rem] font-normal leading-[1.08] tracking-tight font-serif mb-7"
            style={{ color: "var(--text-headline)" }}
          >
            <motion.span
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="inline"
              aria-label={headline}
            >
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  variants={wordVariant}
                  className="inline-block mr-[0.25em]"
                >
                  {word}
                </motion.span>
              ))}
            </motion.span>
            <br />
            <motion.span
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="italic inline-block"
            >
              built and run for you.
            </motion.span>
          </h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="font-mono text-sm sm:text-base leading-relaxed mb-8 max-w-lg"
            style={{ color: "var(--text-body)" }}
          >
            We design, build, and manage your branded wholesale platform.
            Your clients order online or by text. Your team runs everything
            from one dashboard. You own the code.
          </motion.p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 mb-3"
          >
            <motion.a
              variants={fadeUp}
              href="#demo"
              className="inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold btn-blue"
              style={{ padding: "14px 28px", borderRadius: "6px" }}
            >
              See a Live Demo <ArrowRight className="w-4 h-4" />
            </motion.a>
            <motion.a
              variants={fadeUp}
              href="#intake-form"
              className="inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold btn-outline"
              style={{ padding: "14px 28px", borderRadius: "6px" }}
            >
              Start Your Build
            </motion.a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.55 }}
            className="font-mono text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Builds from $25K · Ongoing management included · Live in about 2 weeks
          </motion.div>
        </div>

        {/* Right side -- animated build demo */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
        >
          <LazyBuildDemo />
        </motion.div>
      </div>
    </section>
  );
}
