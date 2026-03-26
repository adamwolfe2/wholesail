export function ErpAlternativeSection() {
  return (
    <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="mb-10">
        <span
          className="font-mono text-xs uppercase tracking-widest mb-4 block"
          style={{ color: "var(--text-muted)" }}
        >
          The Alternative
        </span>
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal mb-4 max-w-3xl"
          style={{ color: "var(--text-headline)" }}
        >
          You&apos;ve been quoted $75K and told to wait a year.
          <br />
          <span style={{ color: "var(--blue)" }}>There&apos;s another way.</span>
        </h2>
        <p
          className="font-mono text-sm leading-relaxed max-w-xl"
          style={{ color: "var(--text-body)" }}
        >
          NetSuite, SAP, and Acumatica are built for enterprises with IT departments and
          implementation teams. Independent distributors get quoted $50K–$150K, handed a
          9-month project plan, and told to figure it out. Most walk away and go back to
          spreadsheets. Wholesail exists for those distributors.
        </p>
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-0"
        style={{ border: "1px solid var(--border-strong)" }}
      >
        {[
          {
            label: "Traditional ERP",
            stat: "9–12 months",
            sub: "average implementation timeline",
            cost: "$75K–$150K",
            costSub: "typical upfront investment",
            dark: false,
          },
          {
            label: "Wholesail",
            stat: "< 2 weeks",
            sub: "from first call to live portal",
            cost: "Starting at $25K",
            costSub: "one-time build, you own it forever",
            dark: true,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="p-4 sm:p-6 lg:p-8"
            style={{
              backgroundColor: item.dark ? "var(--bg-blue)" : "var(--bg-white)",
            }}
          >
            <div
              className="font-mono text-[9px] uppercase tracking-widest mb-6"
              style={{ color: item.dark ? "rgba(255,255,255,0.4)" : "var(--text-muted)" }}
            >
              {item.label}
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div
                  className="font-serif text-2xl sm:text-3xl lg:text-4xl mb-1"
                  style={{ color: item.dark ? "rgba(255,255,255,0.9)" : "var(--text-headline)" }}
                >
                  {item.stat}
                </div>
                <div
                  className="font-mono text-[11px]"
                  style={{ color: item.dark ? "rgba(255,255,255,0.5)" : "var(--text-muted)" }}
                >
                  {item.sub}
                </div>
              </div>
              <div>
                <div
                  className="font-serif text-2xl sm:text-3xl lg:text-4xl mb-1"
                  style={{ color: item.dark ? "rgba(255,255,255,0.9)" : "var(--text-headline)" }}
                >
                  {item.cost}
                </div>
                <div
                  className="font-mono text-[11px]"
                  style={{ color: item.dark ? "rgba(255,255,255,0.5)" : "var(--text-muted)" }}
                >
                  {item.costSub}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
