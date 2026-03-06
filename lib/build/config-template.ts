/**
 * Shared portal.config.ts skeleton and branding utilities.
 * Used by both generate-config and build-start routes to avoid duplication.
 */

export const INDUSTRY_DEFAULTS: Record<
  string,
  { coldChain: boolean; taxRate: number; repeatThreshold: number; vipThreshold: number }
> = {
  "Food & Beverage":      { coldChain: true,  taxRate: 0.085, repeatThreshold: 5000,  vipThreshold: 50000 },
  Seafood:                { coldChain: true,  taxRate: 0.085, repeatThreshold: 3000,  vipThreshold: 30000 },
  "Specialty Foods":      { coldChain: true,  taxRate: 0.085, repeatThreshold: 5000,  vipThreshold: 50000 },
  Produce:                { coldChain: true,  taxRate: 0.000, repeatThreshold: 3000,  vipThreshold: 25000 },
  Beverage:               { coldChain: false, taxRate: 0.085, repeatThreshold: 5000,  vipThreshold: 50000 },
  "General Distribution": { coldChain: false, taxRate: 0.085, repeatThreshold: 10000, vipThreshold: 75000 },
};

export const CONFIG_SKELETON = `
import type { PortalConfig } from "@/types/portal-config";

export const portalConfig: PortalConfig = {
  company: {
    name: "COMPANY_NAME",
    shortName: "SHORT",
    domain: "example.com",
    contactEmail: "hello@example.com",
    ordersEmail: "orders@example.com",
    location: "City, ST",
    supportPhone: "",
  },
  branding: {
    primary: "#000000",
    primaryForeground: "#ffffff",
    logo: "",
  },
  catalog: {
    categories: [],
    coldChainDefault: false,
    defaultUnit: "each",
  },
  pricing: {
    currency: "USD",
    taxRate: 0.085,
    netTermOptions: [0, 30],
    volumeDiscounts: [],
  },
  tiers: {
    repeatThreshold: 5000,
    vipThreshold: 50000,
  },
  loyalty: {
    enabled: false,
    pointsPerDollar: 1,
    redemptionRate: 0.01,
  },
  referrals: {
    enabled: false,
    creditAmount: 50,
  },
  smsOrdering: {
    enabled: false,
  },
  marketing: {
    dropsEnabled: false,
    journalEnabled: false,
    supplierPortalEnabled: false,
  },
  integrations: {
    blooio: false,
  },
};
`;

/** WCAG relative luminance of a hex color */
export function luminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Returns black or white foreground that meets WCAG AA contrast on the given background */
export function primaryForeground(hex: string): string {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return "#ffffff";
  return luminance(hex) > 0.179 ? "#000000" : "#ffffff";
}
