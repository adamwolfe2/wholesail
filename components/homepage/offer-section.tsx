"use client";

import { Store, LayoutDashboard, Handshake } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeUp, staggerContainer } from "@/lib/animations";

const OFFER = [
  {
    icon: Store,
    title: "Client Ordering Portal",
    desc: "A branded storefront where your wholesale clients browse your catalog, place orders, and pay invoices — on the web or by text message.",
  },
  {
    icon: LayoutDashboard,
    title: "Operations CRM",
    desc: "One dashboard for your team: orders, fulfillment, client accounts, tiered pricing, invoicing, and revenue analytics.",
  },
  {
    icon: Handshake,
    title: "Managed For You",
    desc: "We build it, host it, and keep it running. Changes, updates, and support are handled by our team — a system, not a software project.",
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

export function OfferSection() {
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
          What We Do
        </span>
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal"
          style={{ color: "var(--text-headline)" }}
        >
          One partner. Everything your wholesale business runs on.
        </h2>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-1 lg:grid-cols-3 gap-0"
        style={{ border: "1px solid var(--border-strong)" }}
      >
        {OFFER.map((item, i) => (
          <motion.div
            key={item.title}
            variants={cardVariant}
            className={`p-6 lg:p-8 ${
              i < OFFER.length - 1 ? "border-b lg:border-b-0 lg:border-r" : ""
            }`}
            style={{
              borderColor: "var(--border-strong)",
              backgroundColor: "var(--bg-white)",
            }}
          >
            <item.icon
              className="w-5 h-5 mb-4"
              style={{ color: "var(--blue)" }}
              strokeWidth={1.5}
            />
            <div
              className="font-serif text-lg mb-2"
              style={{ color: "var(--text-headline)" }}
            >
              {item.title}
            </div>
            <p
              className="font-mono text-xs leading-relaxed"
              style={{ color: "var(--text-body)" }}
            >
              {item.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
