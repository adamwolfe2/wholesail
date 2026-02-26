import { prisma } from "./index";
import type { Prisma } from "@prisma/client";

export type CreateIntakeData = Omit<
  Prisma.IntakeSubmissionCreateInput,
  "createdAt" | "updatedAt" | "project"
>;

export async function createIntakeSubmission(data: CreateIntakeData) {
  return prisma.intakeSubmission.create({ data });
}

export async function getIntakeSubmissions(opts?: {
  reviewed?: boolean;
  archived?: boolean;
}) {
  return prisma.intakeSubmission.findMany({
    where: {
      reviewedAt: opts?.reviewed === true ? { not: null } : opts?.reviewed === false ? null : undefined,
      archivedAt: opts?.archived === true ? { not: null } : opts?.archived === false ? null : undefined,
    },
    orderBy: { createdAt: "desc" },
    include: { project: { select: { id: true, status: true } } },
  });
}

export async function getIntakeSubmissionById(id: string) {
  return prisma.intakeSubmission.findUnique({
    where: { id },
    include: { project: true },
  });
}

export async function markIntakeReviewed(id: string) {
  return prisma.intakeSubmission.update({
    where: { id },
    data: { reviewedAt: new Date() },
  });
}

export async function archiveIntake(id: string) {
  return prisma.intakeSubmission.update({
    where: { id },
    data: { archivedAt: new Date() },
  });
}
