import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section
      className="py-20 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-0"
      style={{ backgroundColor: "var(--bg-blue)", color: "var(--text-on-blue)" }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <span
          className="font-mono text-xs uppercase tracking-widest mb-6 block"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Ready to modernize your wholesale ordering?
        </span>
        <h2
          className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-serif font-normal mb-6 leading-tight"
          style={{ color: "var(--text-on-blue)" }}
        >
          Your clients get a portal.
          <br />
          Your team gets their time back.
        </h2>
        <p
          className="font-mono text-sm leading-relaxed mb-10 max-w-xl mx-auto"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          Stop losing orders to missed calls and buried emails. Stop chasing
          invoices manually. Stop wondering which clients are about to churn.
          Get a portal that handles all of it.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <a
            href="#demo"
            className="inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold"
            style={{
              backgroundColor: "white",
              color: "var(--bg-blue)",
              padding: "14px 28px",
              borderRadius: "6px",
            }}
          >
            Explore the Platform <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#intake-form"
            className="inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold btn-outline-white"
            style={{ padding: "14px 28px", borderRadius: "6px" }}
          >
            Start Your Build
          </a>
        </div>
        <div
          className="font-mono text-[10px] uppercase tracking-wider"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          No credit card required · Try the demo instantly · Builds start
          within 48 hours of your call
        </div>
        <div
          className="font-mono text-[11px] mt-3"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Current build queue: 2-3 weeks | Limited onboarding slots available
        </div>
      </div>
    </section>
  );
}
