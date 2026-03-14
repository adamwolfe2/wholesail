import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * Generates an order number like ORD-2026-0001.
 *
 * Uses MAX existing number + 1 (more robust than COUNT under concurrent inserts).
 * On retry attempts, adds a random offset to avoid repeated collisions.
 */
async function generateOrderNumber(attempt = 0): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;
  const last = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  const lastNum = last ? parseInt(last.orderNumber.replace(prefix, ""), 10) : 0;
  // On retry, add random offset to avoid collision with concurrent requests
  const offset = attempt > 0 ? Math.floor(Math.random() * 100) + attempt : 0;
  return `${prefix}${String(lastNum + 1 + offset).padStart(4, "0")}`;
}

/**
 * Creates an order using the provided callback, retrying up to `maxAttempts`
 * times on P2002 unique constraint violations (order number collision).
 *
 * @param createFn - receives a generated orderNumber and should perform the
 *   prisma.order.create (or $transaction). Must propagate P2002 errors.
 * @param maxAttempts - retry budget (default 5)
 * @returns the value returned by `createFn`
 *
 * @example
 * ```ts
 * const order = await createOrderWithRetry(async (orderNumber) => {
 *   return prisma.order.create({ data: { orderNumber, ... } });
 * });
 * ```
 */
export async function createOrderWithRetry<T>(
  createFn: (orderNumber: string) => Promise<T>,
  maxAttempts = 5,
): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const orderNumber = await generateOrderNumber(attempt);
    try {
      return await createFn(orderNumber);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002" &&
        attempt < maxAttempts - 1
      ) {
        continue; // retry with a new number
      }
      throw err;
    }
  }

  // Unreachable — the last attempt either succeeds or throws
  throw new Error("Failed to generate unique order number");
}
