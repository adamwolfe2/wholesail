import { CheckCircle2 } from "lucide-react";

const INCLUDED = [
  {
    category: "Client Portal",
    items: [
      "Product catalog with search & filters",
      "Shopping cart with saved carts",
      "Order history & shipment tracking",
      "Invoice payments via Stripe",
      "Standing / recurring orders",
      "Loyalty points & referrals",
      "Live chat & support messaging",
      "Quote requests & approval",
      "Personal spending analytics",
      "Product drop notifications",
    ],
  },
  {
    category: "Admin Panel",
    items: [
      "Order management & fulfillment board",
      "Client CRM with health scoring",
      "Product & inventory management",
      "Pricing rules by tier & category",
      "Quote creation & management",
      "Lead CRM & wholesale applications",
      "Sales rep tools & task management",
      "Revenue analytics & CEO dashboard",
      "Supplier portal & submissions",
      "Distributor routing & multi-org",
    ],
  },
  {
    category: "Built-in Workflows",
    items: [
      "Text message ordering (clients text, orders flow in)",
      "Live chat with suggested replies",
      "Billing reminders at Day 25, 30 & 35",
      "Abandoned cart recovery emails",
      "Lapsed client re-engagement emails",
      "Partner nurture sequences (Day 3, Day 7)",
      "Weekly digest & report emails",
      "Standing order processing",
      "Low stock alerts & reorder triggers",
      "Product drop blasts & alerts",
    ],
  },
];

export function IncludedSection() {
  return (
    <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="mb-10">
        <span
          className="font-mono text-xs uppercase tracking-widest mb-4 block"
          style={{ color: "var(--text-muted)" }}
        >
          Full Feature Breakdown
        </span>
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal"
          style={{ color: "var(--text-headline)" }}
        >
          Three parts. One platform. Everything your distribution business runs on.
        </h2>
      </div>
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-0"
        style={{ border: "1px solid var(--border-strong)" }}
      >
        {INCLUDED.map((col, ci) => (
          <div
            key={col.category}
            className={
              ci < INCLUDED.length - 1
                ? "border-b lg:border-b-0 lg:border-r"
                : ""
            }
            style={{ borderColor: "var(--border-strong)" }}
          >
            <div
              className="px-6 py-4 border-b"
              style={{
                borderColor: "var(--border-strong)",
                backgroundColor: "var(--bg-white)",
              }}
            >
              <span
                className="font-mono text-xs uppercase tracking-wide font-semibold"
                style={{ color: "var(--text-headline)" }}
              >
                {col.category}
              </span>
            </div>
            <div className="px-6 py-4 space-y-2.5">
              {col.items.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-3 h-3 flex-shrink-0 mt-0.5"
                    style={{ color: "var(--blue)" }}
                  />
                  <span
                    className="font-mono text-[11px] leading-snug"
                    style={{ color: "var(--text-body)" }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
