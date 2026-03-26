import {
  ShoppingCart,
  LayoutDashboard,
  MessageSquare,
  CreditCard,
  Shield,
  Heart,
  Gift,
  Truck,
  Brain,
  BarChart3,
  Globe,
  Package,
} from "lucide-react";

const FEATURES = [
  {
    icon: ShoppingCart,
    label: "Self-Service Ordering",
    title: "Your clients order when they want.",
    body: "Full product catalog, saved carts, standing orders, and quick reorder. No more phone tag or missed voicemails.",
  },
  {
    icon: LayoutDashboard,
    label: "Admin Panel",
    title: "Run your operation from one screen.",
    body: "Orders, fulfillment, CRM, inventory, pricing, analytics — 25+ pages, one dashboard. Everything in one place.",
  },
  {
    icon: CreditCard,
    label: "Billing & Invoicing",
    title: "Get paid faster. On your terms.",
    body: "Online checkout, Net-30/60/90 invoicing, payment reminders, and overdue escalation — without chasing anyone by phone.",
  },
  {
    icon: MessageSquare,
    label: "Text Message Ordering",
    title: "Clients text their order. It shows up in your system.",
    body: "Clients send a text with what they need. Your system receives it, confirms the total, and routes it to your dashboard. No voicemails.",
  },
  {
    icon: Globe,
    label: "Your Own Website",
    title: "Your brand, not a marketplace.",
    body: "A fully branded online catalog your clients can browse and order from. Your domain, your logo — not a marketplace where your competitors are one click away.",
  },
  {
    icon: BarChart3,
    label: "Client Intelligence",
    title: "Know who to call before they go quiet.",
    body: "Health scoring, reorder nudges, and lapse detection — so you always know which accounts need attention before they stop ordering.",
  },
  {
    icon: Heart,
    label: "Loyalty & Referrals",
    title: "Reward your best clients.",
    body: "Points, tiers, referral codes — clients earn credit on every order and redeem it at checkout.",
  },
  {
    icon: Truck,
    label: "Shipment Tracking",
    title: "Clients track their own orders.",
    body: "Real-time tracking pages so clients stop calling to ask 'where's my order?' — and your team stops answering that call.",
  },
  {
    icon: Package,
    label: "Inventory Management",
    title: "Never oversell. Never run dry.",
    body: "Stock levels update as orders come in. Low-stock alerts and batch tracking keep you ahead of what's running low.",
  },
  {
    icon: Shield,
    label: "Custom Domain",
    title: "Your portal. Your brand. Zero watermarks.",
    body: "White-label everything: domain, emails, logo. Your clients see your company name — never ours.",
  },
  {
    icon: Brain,
    label: "24/7 Answer Bot",
    title: "Fewer 'quick question' calls to your office.",
    body: "Clients get product and pricing answers at any hour. Handles common questions and escalates to your team for anything it can't answer.",
  },
  {
    icon: Gift,
    label: "Product Drops",
    title: "Create urgency. Drive reorders.",
    body: "Limited-time releases with instant notifications to your client list. First come, first served.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="mb-10">
        <span
          className="font-mono text-xs uppercase tracking-widest mb-4 block"
          style={{ color: "var(--text-muted)" }}
        >
          Platform Capabilities
        </span>
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal"
          style={{ color: "var(--text-headline)" }}
        >
          Everything your distribution business needs.
          <br />
          <span style={{ color: "var(--text-muted)" }}>Nothing it doesn&apos;t.</span>
        </h2>
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border"
        style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--border-strong)", gap: "1px" }}
      >
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.label}
              className="p-6"
              style={{
                backgroundColor: "var(--bg-white)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-8 h-8 flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--blue-light)",
                    borderRadius: "6px",
                  }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: "var(--blue)" }}
                    strokeWidth={1.5}
                  />
                </div>
                <span
                  className="font-mono text-[9px] uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  {feature.label}
                </span>
              </div>
              <h3
                className="font-serif text-lg mb-2"
                style={{ color: "var(--text-headline)" }}
              >
                {feature.title}
              </h3>
              <p
                className="font-mono text-xs leading-relaxed"
                style={{ color: "var(--text-body)" }}
              >
                {feature.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
