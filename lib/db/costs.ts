import { prisma } from "./index";
import type { Prisma } from "@prisma/client";

export async function logCost(
  projectId: string,
  opts: {
    service: string;
    amountCents: number;
    description: string;
    tokens?: number;
    metadata?: Prisma.InputJsonValue;
  }
) {
  return prisma.projectCost.create({
    data: {
      projectId,
      service: opts.service,
      amountCents: opts.amountCents,
      description: opts.description,
      tokens: opts.tokens,
      metadata: opts.metadata,
    },
  });
}

export async function getProjectCosts(projectId: string) {
  return prisma.projectCost.findMany({
    where: { projectId },
    orderBy: { date: "desc" },
  });
}
