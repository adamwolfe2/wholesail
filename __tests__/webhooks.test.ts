import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import crypto from "crypto";
import { createMockPrisma, type MockPrisma } from "./helpers/mock-prisma";

let mockPrisma: MockPrisma;

vi.mock("@/lib/db", () => ({
  get prisma() {
    return mockPrisma;
  },
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const { dispatchWebhook } = await import("@/lib/webhooks");

describe("webhooks", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma();
    vi.useFakeTimers();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("HMAC signature generation", () => {
    it("produces a valid SHA-256 HMAC for the request body", () => {
      const secret = "test-secret-key";
      const body = JSON.stringify({ event: "order.created", data: {} });

      const expected = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      // Verify the HMAC algorithm works correctly
      expect(expected).toMatch(/^[a-f0-9]{64}$/);

      // Verify determinism
      const again = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");
      expect(again).toBe(expected);
    });
  });

  describe("dispatchWebhook", () => {
    it("queries active endpoints subscribed to the event", async () => {
      mockPrisma.webhookEndpoint.findMany.mockResolvedValue([]);

      await dispatchWebhook("order.created", { orderId: "123" });

      expect(mockPrisma.webhookEndpoint.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          events: { has: "order.created" },
        },
      });
    });

    it("does nothing when no endpoints match", async () => {
      mockPrisma.webhookEndpoint.findMany.mockResolvedValue([]);

      await dispatchWebhook("order.created", { orderId: "123" });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("sends POST to each active endpoint with correct headers", async () => {
      const endpoint = {
        id: "ep-1",
        url: "https://example.com/webhook",
        secret: "my-secret",
        isActive: true,
        events: ["order.created"],
      };
      mockPrisma.webhookEndpoint.findMany.mockResolvedValue([endpoint]);
      mockPrisma.webhookLog.create.mockResolvedValue({});

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve("OK"),
      });

      await dispatchWebhook("order.created", { orderId: "abc" });

      // Allow the fire-and-forget promise to resolve
      await vi.advanceTimersByTimeAsync(0);

      expect(mockFetch).toHaveBeenCalledTimes(1);

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe("https://example.com/webhook");
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/json");
      expect(options.headers["X-Webhook-Event"]).toBe("order.created");
      expect(options.headers["X-Webhook-Attempt"]).toBe("1");
      expect(options.headers["X-Webhook-Signature"]).toMatch(/^[a-f0-9]{64}$/);

      // Verify the signature matches the body
      const body = options.body;
      const expectedSig = crypto
        .createHmac("sha256", "my-secret")
        .update(body)
        .digest("hex");
      expect(options.headers["X-Webhook-Signature"]).toBe(expectedSig);
    });

    it("logs each delivery attempt", async () => {
      const endpoint = {
        id: "ep-1",
        url: "https://example.com/hook",
        secret: "s",
        isActive: true,
        events: ["order.created"],
      };
      mockPrisma.webhookEndpoint.findMany.mockResolvedValue([endpoint]);
      mockPrisma.webhookLog.create.mockResolvedValue({});

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve("OK"),
      });

      await dispatchWebhook("order.created", { orderId: "x" });
      await vi.advanceTimersByTimeAsync(0);

      expect(mockPrisma.webhookLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          endpointId: "ep-1",
          event: "order.created",
          statusCode: 200,
          success: true,
          attempt: 1,
        }),
      });
    });

    it("retries on fetch failure with exponential backoff", async () => {
      const endpoint = {
        id: "ep-1",
        url: "https://example.com/hook",
        secret: "s",
        isActive: true,
        events: ["invoice.created"],
      };
      mockPrisma.webhookEndpoint.findMany.mockResolvedValue([endpoint]);
      mockPrisma.webhookLog.create.mockResolvedValue({});

      // First attempt fails
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      // Second attempt succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve("OK"),
      });

      await dispatchWebhook("invoice.created", { invoiceId: "i1" });

      // Let the first attempt fire-and-forget resolve
      await vi.advanceTimersByTimeAsync(0);

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Advance by 2s (2^1 * 1000) for the first retry
      await vi.advanceTimersByTimeAsync(2000);

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("does not retry after MAX_RETRIES (3) attempts", async () => {
      const endpoint = {
        id: "ep-1",
        url: "https://example.com/hook",
        secret: "s",
        isActive: true,
        events: ["payment.received"],
      };
      mockPrisma.webhookEndpoint.findMany.mockResolvedValue([endpoint]);
      mockPrisma.webhookLog.create.mockResolvedValue({});

      // All attempts fail
      mockFetch.mockRejectedValue(new Error("Network error"));

      await dispatchWebhook("payment.received", { paymentId: "p1" });

      // Attempt 1
      await vi.advanceTimersByTimeAsync(0);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Attempt 2 after 2s
      await vi.advanceTimersByTimeAsync(2000);
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Attempt 3 after 4s
      await vi.advanceTimersByTimeAsync(4000);
      expect(mockFetch).toHaveBeenCalledTimes(3);

      // No attempt 4 after 8s — MAX_RETRIES is 3
      await vi.advanceTimersByTimeAsync(8000);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});
