import { CheckCircle2, X } from "lucide-react";

const BEFORE_AFTER = [
  {
    before: "Orders arrive by phone, email, and voicemail at all hours. Someone types them in manually — and sometimes makes mistakes.",
    after: "Clients log in and place their own orders any time of day. Every order lands in your dashboard the moment it's placed.",
  },
  {
    before: "Invoices go out when someone has time. Late payments are chased one by one with phone calls and follow-up emails.",
    after: "Invoices generate when an order ships. Reminders go out on schedule at Day 25, 30, and 35. You collect 12 days faster on average.",
  },
  {
    before: "Your catalog is in a spreadsheet. Every client has different pricing and only you know it — or think you do.",
    after: "Every client sees their own catalog, their own prices, and their full order history — logged in to their private portal.",
  },
  {
    before: "You don't know a client is about to leave until they've already switched to a competitor.",
    after: "Your dashboard flags clients who haven't ordered in 14+ days. You call them before they're gone.",
  },
  {
    before: "Your team spends 3–4 hours every day on order entry, billing questions, and 'where's my order?' calls.",
    after: "Your team focuses on growing accounts and finding new clients. The portal handles the rest.",
  },
];

export function BeforeAfterSection() {
  return (
    <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="mb-10">
        <span
          className="font-mono text-xs uppercase tracking-widest mb-4 block"
          style={{ color: "var(--text-muted)" }}
        >
          The Transformation
        </span>
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal"
          style={{ color: "var(--text-headline)" }}
        >
          What changes when you go live.
        </h2>
      </div>
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-0"
        style={{ border: "1px solid var(--border-strong)" }}
      >
        {/* Before column */}
        <div
          className="p-4 sm:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r"
          style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg-white)" }}
        >
          <div
            className="font-mono text-[9px] uppercase tracking-widest mb-6"
            style={{ color: "var(--text-muted)" }}
          >
            Before Wholesail
          </div>
          <div className="space-y-5">
            {BEFORE_AFTER.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <X
                  className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                  style={{ color: 'var(--color-error)' }}
                  strokeWidth={2.5}
                />
                <p
                  className="font-mono text-xs leading-relaxed"
                  style={{ color: "var(--text-body)" }}
                >
                  {item.before}
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* After column */}
        <div
          className="p-4 sm:p-6 lg:p-8"
          style={{ backgroundColor: "var(--bg-blue)" }}
        >
          <div
            className="font-mono text-[9px] uppercase tracking-widest mb-6"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            After Wholesail
          </div>
          <div className="space-y-5">
            {BEFORE_AFTER.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2
                  className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                  strokeWidth={2}
                />
                <p
                  className="font-mono text-xs leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  {item.after}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
