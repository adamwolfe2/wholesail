import { CheckCircle2, X } from "lucide-react";

const BUILD_ITEMS = [
  "Every feature selected in your build",
  "Your logo, colors, and custom domain",
  "Data migration from existing tools",
  "Team training and onboarding",
  "All 18 software platforms — replaced",
  "45+ hours/week of manual work — eliminated",
];

const RETAINER_ITEMS = [
  "Unlimited change requests",
  "Bug fixes and platform updates",
  "Performance monitoring",
  "Priority support — direct access to our team",
  "New feature additions as your business grows",
  "No more software subscriptions to manage",
];

const REPLACES = [
  "QuickBooks for invoicing",
  "Spreadsheets for orders",
  "Phone ordering workflows",
  "NetSuite / SAP / ERP",
  "CRM for client tracking",
  "Manual invoice follow-up",
];

export function PricingSection() {
  return (
    <section className="py-16" id="pricing" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="mb-10">
        <span
          className="font-mono text-xs uppercase tracking-widest mb-4 block"
          style={{ color: "var(--text-muted)" }}
        >
          Your Investment
        </span>
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal mb-3"
          style={{ color: "var(--text-headline)" }}
        >
          One build. One retainer.
          <br />
          <span style={{ color: "var(--blue)" }}>The ERP you couldn&apos;t afford — replaced.</span>
        </h2>
        <p
          className="font-mono text-sm max-w-xl leading-relaxed"
          style={{ color: "var(--text-body)" }}
        >
          No more juggling subscriptions. No more duct-taping platforms
          together. We build your portal, migrate your data, train your
          team, and keep everything running.
        </p>
      </div>
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-0"
        style={{ border: "1px solid var(--border-strong)" }}
      >
        {/* Build */}
        <div
          className="p-4 sm:p-6 lg:p-8 border-b md:border-b-0 md:border-r"
          style={{
            borderColor: "var(--border-strong)",
            backgroundColor: "var(--bg-blue)",
            color: "var(--text-on-blue)",
          }}
        >
          <div
            className="font-mono text-[9px] uppercase tracking-widest mb-2"
            style={{ opacity: 0.5 }}
          >
            One-Time Build
          </div>
          <div className="font-serif text-2xl sm:text-3xl lg:text-4xl mb-1">Starting at $25K</div>
          <p
            className="font-mono text-[11px] leading-relaxed mb-6"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Custom portal built to your exact business, branded to your
            company, deployed in under 2 weeks.
          </p>
          <div className="space-y-2.5">
            {BUILD_ITEMS.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2
                  className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                />
                <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Retainer */}
        <div
          className="p-4 sm:p-6 lg:p-8"
          style={{ backgroundColor: "var(--bg-white)" }}
        >
          <div
            className="font-mono text-[9px] uppercase tracking-widest mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Monthly Retainer
          </div>
          <div
            className="font-serif text-2xl sm:text-3xl lg:text-4xl mb-1"
            style={{ color: "var(--text-headline)" }}
          >
            Starting at $5K
            <span
              className="font-mono text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              /mo
            </span>
          </div>
          <p
            className="font-mono text-[11px] leading-relaxed mb-6"
            style={{ color: "var(--text-body)" }}
          >
            Direct access to our team. We maintain your portal, make
            changes when you need them, and keep everything running
            smoothly.
          </p>
          <div className="space-y-2.5">
            {RETAINER_ITEMS.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2
                  className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                  style={{ color: "var(--blue)" }}
                />
                <span
                  className="font-mono text-xs"
                  style={{ color: "var(--text-body)" }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* ROI callout */}
      <div
        className="border border-t-0 p-6"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--blue-light)",
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div
              className="font-serif text-2xl mb-0.5"
              style={{ color: "var(--text-headline)" }}
            >
              $180K+
              <span
                className="font-mono text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                /yr
              </span>
            </div>
            <span
              className="font-mono text-[10px]"
              style={{ color: "var(--text-body)" }}
            >
              What you&apos;re spending now on software + manual labor
            </span>
          </div>
          <div>
            <div
              className="font-serif text-2xl mb-0.5"
              style={{ color: "var(--blue)" }}
            >
              $60K–$85K
              <span
                className="font-mono text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                /yr
              </span>
            </div>
            <span
              className="font-mono text-[10px]"
              style={{ color: "var(--text-body)" }}
            >
              Wholesail retainer — everything included
            </span>
          </div>
          <div>
            <div
              className="font-serif text-2xl mb-0.5"
              style={{ color: "var(--blue)" }}
            >
              Pays for itself
            </div>
            <span
              className="font-mono text-[10px]"
              style={{ color: "var(--text-body)" }}
            >
              Within 2–3 months of going live
            </span>
          </div>
        </div>
      </div>
      {/* What Wholesail replaces */}
      <div
        className="border border-t-0 p-6"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--bg-white)",
        }}
      >
        <div
          className="font-mono text-[9px] uppercase tracking-widest mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          What Wholesail replaces
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {REPLACES.map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 px-3 py-2"
              style={{
                border: "1px solid var(--border-strong)",
                borderRadius: "4px",
              }}
            >
              <X className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-error)' }} strokeWidth={2.5} />
              <span className="font-mono text-[10px] leading-tight" style={{ color: "var(--text-body)" }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
