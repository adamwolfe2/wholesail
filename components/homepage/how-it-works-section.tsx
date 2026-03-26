const STEPS = [
  {
    step: "01",
    title: "Fill Out the Intake Form",
    desc: "Tell us about your company, products, clients, and feature needs. Takes 5 minutes and gives us everything we need to scope your build.",
  },
  {
    step: "02",
    title: "Consultation Call",
    desc: "30-minute call to walk through features, discuss branding, review integrations, and get a timeline with investment estimate.",
  },
  {
    step: "03",
    title: "We Build Your Portal",
    desc: "Our team configures your portal — branding, products, pricing, integrations, email templates, and all features. Built on battle-tested infrastructure.",
  },
  {
    step: "04",
    title: "Launch & Onboard Clients",
    desc: "Deploy to production, train your team, invite your first wholesale clients, and activate text message ordering. You're live.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="mb-10">
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
          From intake to live portal in under 2 weeks.
        </h2>
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0"
        style={{ border: "1px solid var(--border-strong)" }}
      >
        {STEPS.map((item, i) => {
          const isFirst = i === 0;
          return (
            <div
              key={item.step}
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
              <div
                className="font-mono text-[9px] uppercase tracking-widest mb-3"
                style={{ opacity: i < 2 ? 0.5 : undefined, color: i >= 2 ? "var(--text-muted)" : undefined }}
              >
                Step {item.step}
              </div>
              <div className="font-serif text-lg mb-2">{item.title}</div>
              <p
                className="font-mono text-[11px] leading-relaxed"
                style={{
                  color: i < 2 ? "rgba(255,255,255,0.7)" : "var(--text-body)",
                }}
              >
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
