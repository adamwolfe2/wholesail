"use client";

import { SailLogo } from "./sail-logo";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeIn } from "@/lib/animations";

export function FooterSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.footer
      ref={ref}
      variants={fadeIn}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="py-12"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <SailLogo className="w-5 h-5" />
            <span
              className="font-serif text-lg font-bold tracking-[0.05em]"
              style={{ color: "var(--text-headline)" }}
            >
              WHOLESAIL
            </span>
          </div>
          <p
            className="font-mono text-xs max-w-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Custom B2B wholesale ordering portals for distribution companies.
            Built on battle-tested infrastructure, deployed in under 2 weeks.
          </p>
        </div>
        <div className="flex gap-8">
          <div>
            <div
              className="font-mono text-[9px] uppercase tracking-widest mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Product
            </div>
            <div className="space-y-1">
              <a
                href="#demo"
                className="block font-mono text-xs transition-colors"
                style={{ color: "var(--text-body)" }}
              >
                Explore Platform
              </a>
              <a
                href="#intake-form"
                className="block font-mono text-xs transition-colors"
                style={{ color: "var(--text-body)" }}
              >
                Start a Build
              </a>
              <a
                href="#pricing"
                className="block font-mono text-xs transition-colors"
                style={{ color: "var(--text-body)" }}
              >
                Pricing
              </a>
              <a
                href="/blog"
                className="block font-mono text-xs transition-colors"
                style={{ color: "var(--text-body)" }}
              >
                Blog
              </a>
            </div>
          </div>
          <div>
            <div
              className="font-mono text-[9px] uppercase tracking-widest mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Company
            </div>
            <div className="space-y-1">
              <a
                href="/status"
                className="block font-mono text-xs transition-colors"
                style={{ color: "var(--text-body)" }}
              >
                Build Status
              </a>
              <a
                href="mailto:orders@wholesailhub.com"
                className="block font-mono text-xs transition-colors"
                style={{ color: "var(--text-body)" }}
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
      <div
        className="mt-8 pt-6 flex items-center justify-between"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
          &copy; {new Date().getFullYear()} Wholesail. All rights reserved.
        </span>
        <div className="flex gap-4">
          <a
            href="/privacy"
            className="font-mono text-[10px] transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="font-mono text-[10px] transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            Terms of Service
          </a>
        </div>
      </div>
    </motion.footer>
  );
}
