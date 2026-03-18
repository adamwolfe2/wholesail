import { prisma } from "@/lib/db";

export type NotificationType =
  | "ORDER_UPDATE"
  | "INVOICE_DUE"
  | "QUOTE_RECEIVED"
  | "REFERRAL_CONVERTED"
  | "LOW_STOCK";

/**
 * Create an in-app notification for a user.
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
) {
  return prisma.notification.create({
    data: { userId, type, title, message, link },
  });
}

/**
 * Create notifications for all users in an organization.
 */
export async function notifyOrg(
  orgId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
) {
  const users = await prisma.user.findMany({
    where: { organizationId: orgId },
    select: { id: true },
  });

  if (users.length === 0) return;

  await prisma.notification.createMany({
    data: users.map((u) => ({ userId: u.id, type, title, message, link })),
  });
}
