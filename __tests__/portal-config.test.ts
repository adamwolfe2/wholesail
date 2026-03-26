import { describe, it, expect } from "vitest";

/**
 * Tests for lib/portal-config.ts — the single source of truth for
 * per-client portal configuration. Verifies all keys exist, numeric
 * parsing works, and the appDomain getter strips protocols correctly.
 */

describe("portalConfig", () => {
  it("exports portalConfig with all expected keys", async () => {
    const { portalConfig } = await import("@/lib/portal-config");

    const expectedKeys = [
      "brandName",
      "brandNameServer",
      "brandLocation",
      "appUrl",
      "appDomain",
      "contactEmail",
      "adminEmail",
      "opsName",
      "reportRecipients",
      "primaryColor",
      "freeDeliveryThreshold",
      "standardDeliveryFee",
      "defaultTaxRate",
      "fromEmail",
      "calNamespace",
      "instagramUrl",
      "instagramHandle",
      "githubOwner",
      "githubTemplateRepo",
    ];

    for (const key of expectedKeys) {
      expect(portalConfig).toHaveProperty(key);
    }
  });

  it("exports the PortalConfig type", async () => {
    const mod = await import("@/lib/portal-config");
    // Type export is compile-time only; verify the runtime object exists
    expect(mod.portalConfig).toBeDefined();
  });

  describe("numeric values parse correctly", () => {
    it("freeDeliveryThreshold is a finite number", async () => {
      const { portalConfig } = await import("@/lib/portal-config");
      expect(typeof portalConfig.freeDeliveryThreshold).toBe("number");
      expect(Number.isFinite(portalConfig.freeDeliveryThreshold)).toBe(true);
    });

    it("standardDeliveryFee is a finite number", async () => {
      const { portalConfig } = await import("@/lib/portal-config");
      expect(typeof portalConfig.standardDeliveryFee).toBe("number");
      expect(Number.isFinite(portalConfig.standardDeliveryFee)).toBe(true);
    });

    it("defaultTaxRate is a finite number between 0 and 1", async () => {
      const { portalConfig } = await import("@/lib/portal-config");
      expect(typeof portalConfig.defaultTaxRate).toBe("number");
      expect(portalConfig.defaultTaxRate).toBeGreaterThanOrEqual(0);
      expect(portalConfig.defaultTaxRate).toBeLessThanOrEqual(1);
    });

    it("falls back to default when env var is not set", async () => {
      const { portalConfig } = await import("@/lib/portal-config");
      // Without env vars set, should use defaults
      expect(portalConfig.freeDeliveryThreshold).toBe(500);
      expect(portalConfig.standardDeliveryFee).toBe(25);
      expect(portalConfig.defaultTaxRate).toBe(0.0875);
    });
  });

  describe("string values have sensible defaults", () => {
    it("brandName defaults to Wholesail", async () => {
      const { portalConfig } = await import("@/lib/portal-config");
      expect(portalConfig.brandName).toBe("Wholesail");
    });

    it("contactEmail defaults to a valid email", async () => {
      const { portalConfig } = await import("@/lib/portal-config");
      expect(portalConfig.contactEmail).toContain("@");
    });

    it("appUrl defaults to a valid URL", async () => {
      const { portalConfig } = await import("@/lib/portal-config");
      expect(portalConfig.appUrl).toMatch(/^https?:\/\//);
    });

    it("primaryColor is a valid hex color", async () => {
      const { portalConfig } = await import("@/lib/portal-config");
      expect(portalConfig.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it("fromEmail contains a valid email address", async () => {
      const { portalConfig } = await import("@/lib/portal-config");
      expect(portalConfig.fromEmail).toContain("@");
    });
  });

  describe("appDomain getter", () => {
    it("strips https:// protocol from appUrl", async () => {
      const { portalConfig } = await import("@/lib/portal-config");
      expect(portalConfig.appDomain).not.toContain("https://");
      expect(portalConfig.appDomain).not.toContain("http://");
    });

    it("returns domain portion of appUrl", async () => {
      const { portalConfig } = await import("@/lib/portal-config");
      // appUrl is "https://wholesailhub.com" by default
      expect(portalConfig.appDomain).toBe("wholesailhub.com");
    });
  });
});
