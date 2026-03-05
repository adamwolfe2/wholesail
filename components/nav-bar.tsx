"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

function SailLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M16 2L16 28L6 28C6 28 14 16 16 2Z" fill="var(--blue)" opacity="0.9" />
      <path d="M18 8L18 28L26 28C26 28 20 18 18 8Z" fill="var(--blue)" opacity="0.55" />
      <path d="M4 29L28 29" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

interface DropdownItem {
  label: string;
  href: string;
  desc?: string;
}

function Dropdown({ label, items }: { label: string; items: DropdownItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="font-mono text-[13px] flex items-center gap-1 cursor-pointer link-body"
        style={{ background: "none", border: "none", padding: 0 }}
      >
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-2 z-50 py-1 min-w-[220px]"
          style={{
            border: "1px solid var(--border-strong)",
            backgroundColor: "var(--bg-white)",
            borderRadius: "6px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 hover:opacity-70 transition-opacity"
              style={{ textDecoration: "none" }}
            >
              <div className="font-mono text-[12px] font-semibold" style={{ color: "var(--text-headline)" }}>
                {item.label}
              </div>
              {item.desc && (
                <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {item.desc}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function NavBar() {
  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{ backgroundColor: "var(--bg-primary)", borderBottom: "1px solid var(--border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
          <SailLogo className="w-5 h-5" />
          <span className="font-serif text-lg font-bold tracking-[0.05em]" style={{ color: "var(--text-headline)" }}>
            WHOLESAIL
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-5">
          <Link href="/#demo" className="font-mono text-[13px] link-body">
            Platform
          </Link>
          <Link href="/#pricing" className="font-mono text-[13px] link-body">
            Pricing
          </Link>
          <Dropdown
            label="Industries"
            items={[
              { label: "Food & Beverage", href: "/food-beverage", desc: "Specialty foods, produce, dairy" },
              { label: "Wine & Spirits", href: "/wine-spirits", desc: "Importers and distributors" },
              { label: "Industrial Supply", href: "/industrial-supply", desc: "MRO and safety equipment" },
              { label: "Coffee & Tea", href: "/coffee-tea", desc: "Roasters and importers" },
              { label: "Seafood & Meat", href: "/seafood-meat", desc: "Protein and perishables" },
              { label: "Specialty Food", href: "/specialty-food", desc: "Artisan and gourmet importers" },
              { label: "Beauty & Cosmetics", href: "/beauty-cosmetics", desc: "Salon and professional supply" },
              { label: "Pet Supply", href: "/pet-supply", desc: "Pet stores and groomers" },
              { label: "View All Industries →", href: "/food-beverage", desc: "" },
            ]}
          />
          <Link href="/blog" className="font-mono text-[13px] link-body">
            Blog
          </Link>
          <Link href="/about" className="font-mono text-[13px] link-body">
            About
          </Link>
          <Dropdown
            label="More"
            items={[
              { label: "What Is AI-ified?", href: "/ai-ified", desc: "AI automation for distributors" },
              { label: "Press", href: "/press" },
              { label: "Shopify B2B vs Wholesail", href: "/blog/shopify-b2b-vs-custom-wholesale-portal" },
              { label: "Wholesail vs NetSuite", href: "/blog/wholesail-vs-netsuite-for-distributors" },
              { label: "vs HubSpot / Salesforce", href: "/blog/hubspot-salesforce-distribution-alternatives" },
              { label: "vs Handshake / Faire", href: "/blog/handshake-faire-vs-custom-wholesale-portal" },
            ]}
          />
        </div>

        <Link
          href="/#intake-form"
          className="font-mono text-[13px] font-semibold btn-blue"
          style={{ padding: "9px 20px", borderRadius: "6px" }}
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
