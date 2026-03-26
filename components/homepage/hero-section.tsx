import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LazyBuildDemo } from "@/components/lazy-build-demo";

export function HeroSection() {
  return (
    <section className="py-20" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 items-center">
        <div>
          {/* Eyebrow pill */}
          <span
            className="inline-block font-mono text-[12px] font-semibold tracking-[0.04em] mb-2"
            style={{
              backgroundColor: "var(--blue-light)",
              color: "var(--blue)",
              borderRadius: "100px",
              padding: "4px 14px",
            }}
          >
            For wholesale distributors doing $1M–$20M
          </span>
          <h1
            className="text-2xl sm:text-3xl md:text-5xl lg:text-[3.25rem] font-normal leading-[1.08] tracking-tight font-serif mb-7"
            style={{ color: "var(--text-headline)" }}
          >
            Your Entire Wholesale Business
            <br />
            <span className="italic"><Link href="/ai-ified" style={{ color: "inherit", textDecoration: "none", position: "relative", display: "inline-block" }}>AI-ified<svg aria-hidden="true" viewBox="0 0 120 8" preserveAspectRatio="none" style={{ position: "absolute", bottom: "-6px", left: 0, width: "100%", height: "8px", overflow: "visible" }}><path d="M2 5 Q15 1 30 5 Q45 9 60 5 Q75 1 90 5 Q105 9 118 5" fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round"/></svg></Link> &amp; Fully Automated.</span>
          </h1>
          <p
            className="font-mono text-sm sm:text-base leading-relaxed mb-8 max-w-lg"
            style={{ color: "var(--text-body)" }}
          >
            Wholesail builds your custom wholesale ordering portal in under 2
            weeks. Your clients order themselves. Your team stops managing
            orders by hand. Invoices collect automatically. You own the code.
            Forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold btn-blue"
              style={{ padding: "14px 28px", borderRadius: "6px" }}
            >
              See Your Portal in 30 Seconds <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#intake-form"
              className="inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold btn-outline"
              style={{ padding: "14px 28px", borderRadius: "6px" }}
            >
              Start Your Build
            </a>
          </div>
          <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            No signup required · Starting at $25K · Live in under 2 weeks
          </div>
          <div className="font-mono text-[11px] text-sand mt-2">
            Current build queue: 2-3 weeks | Limited onboarding slots
          </div>
        </div>

        {/* Right side -- animated build demo */}
        <div>
          <LazyBuildDemo />
        </div>
      </div>
    </section>
  );
}
