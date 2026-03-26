import { PainPointExplorer } from "@/components/pain-point-explorer";

export function PainPointSection() {
  return (
    <section className="py-16" id="compare" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="mb-10">
        <span
          className="font-mono text-xs uppercase tracking-widest mb-4 block"
          style={{ color: "var(--text-muted)" }}
        >
          See the Real Cost
        </span>
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal mb-3"
          style={{ color: "var(--text-headline)" }}
        >
          What&apos;s your biggest challenge right now?
        </h2>
        <p
          className="font-mono text-sm max-w-xl leading-relaxed"
          style={{ color: "var(--text-body)" }}
        >
          Select a pain point below and see exactly what it&apos;s costing
          your business — in hours, dollars, and disconnected tools.
        </p>
      </div>
      <PainPointExplorer />
    </section>
  );
}
