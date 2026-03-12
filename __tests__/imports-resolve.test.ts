import { describe, it, expect } from "vitest";

/**
 * Smoke tests: verify that all modified modules resolve without import errors.
 * This catches broken imports, missing exports, and syntax errors that TSC might
 * miss when modules have complex conditional imports.
 */

describe("Critical module imports resolve", () => {
  // ── Phase 1 files ──────────────────────────────────────────────────────────
  it("lib/env.ts", async () => {
    const mod = await import("@/lib/env");
    expect(mod.validateEnv).toBeDefined();
  });

  it("instrumentation.ts", async () => {
    const mod = await import("@/instrumentation");
    expect(mod.register).toBeDefined();
  });

  // ── Components ─────────────────────────────────────────────────────────────
  it("components/product-card.tsx exports ProductCard (memo)", async () => {
    const mod = await import("@/components/product-card");
    expect(mod.ProductCard).toBeDefined();
    // React.memo wraps the component — displayName or $$typeof check
    expect(typeof mod.ProductCard).toBe("object"); // memo returns an object
  });

  it("components/faq.tsx exports FAQ", async () => {
    const mod = await import("@/components/faq");
    expect(mod.FAQ).toBeDefined();
  });

  it("components/tool-comparison.tsx exports ToolComparison", async () => {
    const mod = await import("@/components/tool-comparison");
    expect(mod.ToolComparison).toBeDefined();
  });

  it("components/nav-bar.tsx exports NavBar", async () => {
    const mod = await import("@/components/nav-bar");
    expect(mod.NavBar).toBeDefined();
  });

  // ── Lib modules ────────────────────────────────────────────────────────────
  it("lib/rate-limit.ts exports publicSignupLimiter", async () => {
    const mod = await import("@/lib/rate-limit");
    expect(mod.publicSignupLimiter).toBeDefined();
    expect(mod.checkRateLimit).toBeDefined();
    expect(mod.getIp).toBeDefined();
  });

  it("lib/client-health.ts exports calculateHealthScore", async () => {
    const mod = await import("@/lib/client-health");
    expect(mod.calculateHealthScore).toBeDefined();
  });

  it("lib/ai/platform-knowledge.ts exports PLATFORM_KNOWLEDGE", async () => {
    const mod = await import("@/lib/ai/platform-knowledge");
    expect(typeof mod.PLATFORM_KNOWLEDGE).toBe("string");
    expect(mod.PLATFORM_KNOWLEDGE.length).toBeGreaterThan(100);
  });
});
