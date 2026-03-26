const BUYER_STATS = [
  { stat: "83%", label: "of B2B buyers prefer self-service ordering over sales rep interaction", source: "Gartner B2B Buyer Report" },
  { stat: "74%", label: "of B2B buyers would switch suppliers for a better digital ordering experience", source: "Forrester, 2024" },
  { stat: "3\u00d7", label: "more likely to reorder when clients have a self-service portal vs. email/phone", source: "Shopify B2B Research" },
];

export function AmazonEffectSection() {
  return (
    <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
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
        </div>
        <div
          className="p-4 sm:p-6 lg:p-8"
          style={{ border: "1px solid var(--border-strong)", backgroundColor: "var(--bg-white)" }}
        >
          {BUYER_STATS.map((item, i) => (
            <div
              key={item.stat}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
