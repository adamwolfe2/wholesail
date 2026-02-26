import { prisma } from "./index";

export async function getOrganizationById(id: string) {
  return prisma.organization.findUnique({
    where: { id },
    include: {
      addresses: true,
      members: true,
    },
  });
}

export async function getOrganizationByUserId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: {
        include: {
          addresses: true,
        },
      },
    },
  });
  return user?.organization ?? null;
}

export async function getAllOrganizations() {
  return prisma.organization.findMany({
    include: {
      _count: { select: { orders: true, members: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getOrganizationStats(organizationId: string) {
  const [orderCount, totalSpent, lastOrder] = await Promise.all([
    prisma.order.count({ where: { organizationId } }),
    prisma.order.aggregate({
      where: { organizationId, status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
    prisma.order.findFirst({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, orderNumber: true },
    }),
  ]);

  return {
    orderCount,
    totalSpent: totalSpent._sum.total ?? 0,
    lastOrderDate: lastOrder?.createdAt ?? null,
    lastOrderNumber: lastOrder?.orderNumber ?? null,
  };
}
