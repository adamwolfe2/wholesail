import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma, type MockPrisma } from "./helpers/mock-prisma";

// Mock the db module before importing the module under test
let mockPrisma: MockPrisma;

vi.mock("@/lib/db", () => ({
  get prisma() {
    return mockPrisma;
  },
}));

// Patch Prisma namespace — define class inline so it's available after hoisting
vi.mock("@prisma/client", () => {
  class PrismaClientKnownRequestError extends Error {
    code: string;
    constructor(message: string, meta?: { code: string }) {
      super(message);
      this.name = "PrismaClientKnownRequestError";
      this.code = meta?.code ?? message;
    }
  }
  return {
    Prisma: { PrismaClientKnownRequestError },
    PrismaClient: vi.fn(),
  };
});

// Import after mocks are set up
const { createOrderWithRetry } = await import("@/lib/order-number");
const { Prisma } = await import("@prisma/client");

describe("order-number", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma();
    vi.restoreAllMocks();
  });

  function makeP2002Error() {
    return new (Prisma.PrismaClientKnownRequestError as unknown as new (
      msg: string,
      meta?: { code: string },
    ) => Error & { code: string })("P2002", { code: "P2002" });
  }

  describe("generateOrderNumber (tested via createOrderWithRetry)", () => {
    it("generates a valid ORD-YYYY-NNNN format when no existing orders", async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);

      let captured = "";
      const createFn = vi.fn(async (orderNumber: string) => {
        captured = orderNumber;
        return { id: "1", orderNumber };
      });

      await createOrderWithRetry(createFn);

      const year = new Date().getFullYear();
      expect(captured).toMatch(new RegExp(`^ORD-${year}-\\d{4}$`));
      expect(captured).toBe(`ORD-${year}-0001`);
    });

    it("increments from the last existing order number", async () => {
      const year = new Date().getFullYear();
      mockPrisma.order.findFirst.mockResolvedValue({
        orderNumber: `ORD-${year}-0042`,
      });

      let captured = "";
      const createFn = vi.fn(async (orderNumber: string) => {
        captured = orderNumber;
        return { id: "1", orderNumber };
      });

      await createOrderWithRetry(createFn);

      expect(captured).toBe(`ORD-${year}-0043`);
    });
  });

  describe("createOrderWithRetry", () => {
    it("retries on P2002 unique constraint errors", async () => {
      const year = new Date().getFullYear();
      mockPrisma.order.findFirst.mockResolvedValue(null);

      const createFn = vi.fn();
      // First call: P2002 error
      createFn.mockRejectedValueOnce(makeP2002Error());
      // Second call: success
      createFn.mockResolvedValueOnce({
        id: "1",
        orderNumber: `ORD-${year}-0001`,
      });

      const result = await createOrderWithRetry(createFn);

      expect(createFn).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        id: "1",
        orderNumber: `ORD-${year}-0001`,
      });
    });

    it("gives up after maxAttempts and throws", async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);

      const createFn = vi.fn().mockRejectedValue(makeP2002Error());

      await expect(createOrderWithRetry(createFn, 3)).rejects.toThrow("P2002");

      expect(createFn).toHaveBeenCalledTimes(3);
    });

    it("throws immediately on non-P2002 errors without retrying", async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);

      const createFn = vi
        .fn()
        .mockRejectedValue(new Error("Connection lost"));

      await expect(createOrderWithRetry(createFn)).rejects.toThrow(
        "Connection lost",
      );

      expect(createFn).toHaveBeenCalledTimes(1);
    });

    it("succeeds on first attempt when no collisions", async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);

      const createFn = vi.fn(async (orderNumber: string) => ({
        id: "abc",
        orderNumber,
      }));

      const result = await createOrderWithRetry(createFn);

      expect(createFn).toHaveBeenCalledTimes(1);
      expect(result.id).toBe("abc");
    });
  });
});
