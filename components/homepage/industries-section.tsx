import {
  ChefHat,
  GlassWater,
  Wrench,
  Sparkles,
  Building2,
  Utensils,
  Package,
  Heart,
} from "lucide-react";

const INDUSTRIES = [
  { icon: Utensils, name: "Food & Beverage", desc: "Specialty foods, produce, dairy", href: "/food-beverage" },
  { icon: GlassWater, name: "Wine & Spirits", desc: "Importers and distributors", href: "/wine-spirits" },
  { icon: Wrench, name: "Industrial Supply", desc: "MRO and safety equipment", href: "/industrial-supply" },
  { icon: Sparkles, name: "Beauty & Cosmetics", desc: "Salon and retail wholesale", href: null },
  { icon: ChefHat, name: "Restaurant Supply", desc: "Foodservice distribution", href: null },
  { icon: Package, name: "Specialty Goods", desc: "Artisan and niche products", href: null },
  { icon: Building2, name: "Building Materials", desc: "Trade and contractor supply", href: null },
  { icon: Heart, name: "Medical Supply", desc: "Healthcare distribution", href: null },
];

export function IndustriesSection() {
  return (
    <section className="py-12" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="mb-8 text-center">
        <span
          className="font-mono text-xs uppercase tracking-widest mb-3 block"
          style={{ color: "var(--text-muted)" }}
        >
          Who this is built for
        </span>
        <p
          className="font-mono text-sm max-w-2xl leading-relaxed mx-auto"
          style={{ color: "var(--text-body)" }}
        >
          Built specifically for independent wholesale distributors. Not a marketplace. Not a generic B2B tool.
          If you&apos;re a specialty distributor doing $1M–$20M with 2–25 employees, still taking orders by phone
          or spreadsheet, and you&apos;ve been scared off by ERP pricing — this is for you.
        </p>
      </div>
      <div
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-0"
        style={{ border: "1px solid var(--border-strong)" }}
      >
        {INDUSTRIES.map((industry, i) => {
          const Icon = industry.icon;
          const Tag = industry.href ? "a" : "div";
          return (
            <Tag
              key={industry.name}
              {...(industry.href ? { href: industry.href } : {})}
              className={`p-4 flex flex-col items-center text-center transition-colors ${
                i < INDUSTRIES.length - 1 ? "border-b sm:border-b-0 sm:border-r" : ""
              } ${industry.href ? "hover:opacity-80 cursor-pointer" : ""}`}
              style={{
                borderColor: "var(--border-strong)",
                backgroundColor: "var(--bg-white)",
                textDecoration: "none",
              }}
            >
              <Icon
                className="w-5 h-5 mb-2"
                style={{ color: "var(--blue)" }}
                strokeWidth={1.5}
              />
              <div
                className="font-mono text-[9px] uppercase tracking-wide font-semibold mb-0.5"
                style={{ color: "var(--text-headline)" }}
              >
                {industry.name}
              </div>
              <div
                className="font-mono text-[8px] leading-tight"
                style={{ color: "var(--text-muted)" }}
              >
                {industry.desc}
              </div>
              {industry.href && (
                <div className="font-mono text-[7px] uppercase tracking-wider mt-1" style={{ color: "var(--blue)" }}>
                  Learn more →
                </div>
              )}
            </Tag>
          );
        })}
      </div>
    </section>
  );
}
