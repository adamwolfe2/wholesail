import { CheckCircle2 } from "lucide-react";
import { LazyDemoLauncher } from "@/components/lazy-demo-launcher";

const DEMO_FEATURES = [
  "Full product catalog with your branding",
  "Client portal with order history and tracking",
  "Admin panel with CRM, analytics, and fulfillment",
  "Text message ordering demo",
  "Invoice management with Stripe integration",
  "Loyalty program, referrals, and standing orders",
];

export function DemoSection() {
  return (
    <section className="py-16" id="demo" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left -- copy */}
        <div>
          <span
            className="font-mono text-xs uppercase tracking-widest mb-4 block"
            style={{ color: "var(--text-muted)" }}
          >
            Try Before You Buy
          </span>
          <h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal mb-6"
            style={{ color: "var(--text-headline)" }}
          >
            See the platform with{" "}
            <span className="italic">your brand</span> in 30 seconds.
          </h2>
          <p
            className="font-mono text-sm leading-relaxed mb-8"
            style={{ color: "var(--text-body)" }}
          >
            Enter your website URL. We&apos;ll scrape your logo and brand
            colors, apply them to a live demo portal loaded with sample
            data, and let you click through every feature — client portal,
            admin panel, orders, invoicing, and more.
          </p>
          <div className="space-y-3">
            {DEMO_FEATURES.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: "var(--blue)" }}
                />
                <span className="font-mono text-xs" style={{ color: "var(--text-body)" }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Right -- demo launcher */}
        <div>
          <LazyDemoLauncher />
        </div>
      </div>
    </section>
  );
}
