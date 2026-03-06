import { prisma } from "./index";
import type { ProjectStatus, Prisma } from "@prisma/client";
import { ENV_VARS } from "@/lib/client-data";

// Initialize all env vars as "missing"
function defaultEnvVars(): Record<string, string> {
  return Object.fromEntries(ENV_VARS.map((v) => [v.key, "missing"]));
}

// ── List & Search ───────────────────────────────────────────────────────────

export async function getProjects(opts?: {
  status?: ProjectStatus;
  search?: string;
}) {
  const where: Prisma.ProjectWhereInput = {};

  if (opts?.status) where.status = opts.status;
  if (opts?.search) {
    where.OR = [
      { company: { contains: opts.search, mode: "insensitive" } },
      { contactEmail: { contains: opts.search, mode: "insensitive" } },
      { contactName: { contains: opts.search, mode: "insensitive" } },
    ];
  }

  return prisma.project.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: {
      _count: { select: { notes: true, tasks: true } },
    },
  });
}

// ── Single Project ──────────────────────────────────────────────────────────

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      intake: true,
      notes: { orderBy: { createdAt: "desc" } },
      tasks: { orderBy: [{ phase: "asc" }, { createdAt: "asc" }] },
    },
  });
}

// ── Public Status Lookup ────────────────────────────────────────────────────

export async function getProjectByEmail(email: string) {
  return prisma.project.findFirst({
    where: { contactEmail: { equals: email, mode: "insensitive" } },
    include: {
      notes: {
        where: { type: { in: ["MILESTONE", "UPDATE"] } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

// ── Create ──────────────────────────────────────────────────────────────────

export type CreateProjectData = Omit<
  Prisma.ProjectCreateInput,
  "createdAt" | "updatedAt" | "notes" | "tasks" | "intake" | "envVars"
> & { intakeId?: string };

export async function createProject(data: CreateProjectData) {
  const { intakeId, ...rest } = data;
  return prisma.project.create({
    data: {
      ...rest,
      envVars: defaultEnvVars(),
      ...(intakeId ? { intake: { connect: { id: intakeId } } } : {}),
    },
  });
}

// ── Update ──────────────────────────────────────────────────────────────────

export async function updateProject(
  id: string,
  data: Prisma.ProjectUpdateInput
) {
  // Auto-set launchDate when going live
  if (data.status === "LIVE" && !data.launchDate) {
    data.launchDate = new Date();
  }
  return prisma.project.update({ where: { id }, data });
}

// ── Delete ──────────────────────────────────────────────────────────────────

export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}

// ── Convert Intake → Project ────────────────────────────────────────────────

export async function convertIntakeToProject(intakeId: string) {
  const intake = await prisma.intakeSubmission.findUnique({
    where: { id: intakeId },
  });
  if (!intake) throw new Error("Intake not found");

  const project = await prisma.project.create({
    data: {
      intake: { connect: { id: intakeId } },
      company: intake.companyName,
      shortName: intake.shortName || intake.companyName.slice(0, 3).toUpperCase(),
      industry: intake.industry,
      website: intake.website,
      contactName: intake.contactName,
      contactEmail: intake.contactEmail,
      contactPhone: intake.contactPhone,
      contactRole: intake.contactRole,
      enabledFeatures: intake.selectedFeatures,
      status: "INQUIRY",
      currentPhase: 0,
      envVars: defaultEnvVars(),
    },
  });

  // Mark intake as reviewed
  await prisma.intakeSubmission.update({
    where: { id: intakeId },
    data: { reviewedAt: new Date() },
  });

  return project;
}

// ── Notes ───────────────────────────────────────────────────────────────────

export async function addNote(
  projectId: string,
  data: { text: string; type?: "NOTE" | "UPDATE" | "MILESTONE" }
) {
  return prisma.projectNote.create({
    data: {
      projectId,
      text: data.text,
      type: data.type || "NOTE",
    },
  });
}

export async function deleteNote(noteId: string) {
  return prisma.projectNote.delete({ where: { id: noteId } });
}

// ── Tasks ───────────────────────────────────────────────────────────────────

export async function addTask(
  projectId: string,
  data: { label: string; phase: number }
) {
  return prisma.projectTask.create({
    data: { projectId, label: data.label, phase: data.phase },
  });
}

export async function updateTask(
  taskId: string,
  data: { completed?: boolean; label?: string }
) {
  return prisma.projectTask.update({
    where: { id: taskId },
    data: {
      ...data,
      ...(data.completed !== undefined
        ? { completedAt: data.completed ? new Date() : null }
        : {}),
    },
  });
}

export async function deleteTask(taskId: string) {
  return prisma.projectTask.delete({ where: { id: taskId } });
}
