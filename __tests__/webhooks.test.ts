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

    it("queues failed deliveries for cron-based retry via database", async () => {
      const endpoint = {
        id: "ep-1",
        url: "https://example.com/hook",
        secret: "s",
        isActive: true,
        events: ["invoice.created"],
      };
      mockPrisma.webhookEndpoint.findMany.mockResolvedValue([endpoint]);
      mockPrisma.webhookLog.create.mockResolvedValue({});

      // Attempt fails
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await dispatchWebhook("invoice.created", { invoiceId: "i1" });

      // Let the fire-and-forget promise resolve
      await vi.advanceTimersByTimeAsync(0);

      // Only one fetch call — no setTimeout-based retries
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Verify the log was created with retry fields for cron pickup
      expect(mockPrisma.webhookLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          endpointId: "ep-1",
          event: "invoice.created",
          success: false,
          attempt: 1,
          retryCount: 1,
          nextRetryAt: expect.any(Date),
        }),
      });

      // No further retries via setTimeout — advancing timers should not trigger more fetches
      await vi.advanceTimersByTimeAsync(10000);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("does not schedule retry when max retries reached", async () => {
      const endpoint = {
        id: "ep-1",
        url: "https://example.com/hook",
        secret: "s",
        isActive: true,
        events: ["payment.received"],
      };
      mockPrisma.webhookEndpoint.findMany.mockResolvedValue([endpoint]);
      mockPrisma.webhookLog.create.mockResolvedValue({});

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      // Import deliverWebhook directly to test max retry behavior
      const { deliverWebhook } = await import("@/lib/webhooks");

      // Simulate attempt 5 (MAX_RETRIES = 5), so no more retries should be scheduled
      await deliverWebhook("ep-1", "https://example.com/hook", "s", "payment.received", '{"test":true}', 5);

      expect(mockPrisma.webhookLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          success: false,
          retryCount: 5,
          nextRetryAt: null, // No more retries
        }),
      });
    });
  });
});
