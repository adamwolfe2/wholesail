import Link from "next/link";
import { prisma } from "@/lib/db";
import { format, isPast, isToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Building2, AlertTriangle, ExternalLink } from "lucide-react";
import { NewTaskDialog } from "@/components/new-task-dialog";
import { TaskActions } from "@/app/admin/reps/[id]/task-actions";

const PRIORITIES = ["URGENT", "HIGH", "NORMAL", "LOW"] as const;
type Priority = (typeof PRIORITIES)[number];

const priorityConfig: Record<
  Priority,
  { label: string; headerClass: string; badgeClass: string; borderClass: string }
> = {
  URGENT: {
    label: "Urgent",
    headerClass: "bg-red-50 border-red-200 text-red-800",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    borderClass: "border-red-200",
  },
  HIGH: {
    label: "High",
    headerClass: "bg-orange-50 border-orange-200 text-orange-800",
    badgeClass: "bg-orange-100 text-orange-700 border-orange-200",
    borderClass: "border-orange-200",
  },
  NORMAL: {
    label: "Normal",
    headerClass: "bg-[#F9F7F4] border-[#E5E1DB] text-[#0A0A0A]",
    badgeClass: "bg-[#C8C0B4]/30 text-[#0A0A0A] border-[#C8C0B4]",
    borderClass: "border-[#E5E1DB]",
  },
  LOW: {
    label: "Low",
    headerClass: "bg-gray-50 border-gray-200 text-gray-600",
    badgeClass: "bg-gray-100 text-gray-500 border-gray-200",
    borderClass: "border-gray-200",
  },
};

interface PageProps {
  searchParams: Promise<{
    repId?: string;
    orgId?: string;
    due?: string;
  }>;
}

export default async function TaskBoardPage({ searchParams }: PageProps) {
  const { repId, orgId, due } = await searchParams;

  let tasks: Awaited<ReturnType<typeof getTasks>> = [];
  let reps: { id: string; name: string }[] = [];
  let orgs: { id: string; name: string }[] = [];

  try {
    [tasks, reps, orgs] = await Promise.all([
      getTasks({ repId, orgId, due }),
      prisma.user.findMany({
        where: { role: { in: ["SALES_REP", "OPS"] } },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.organization.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);
  } catch {
    // DB not connected
  }

  const grouped = PRIORITIES.reduce<Record<Priority, typeof tasks>>(
    (acc, p) => {
      acc[p] = tasks.filter((t) => t.priority === p);
      return acc;
    },
    { URGENT: [], HIGH: [], NORMAL: [], LOW: [] }
  );

  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
            Task Board
          </h2>
          <p className="text-sm text-[#0A0A0A]/50 mt-0.5">
            {tasks.length} open task{tasks.length !== 1 ? "s" : ""} across all reps
          </p>
        </div>
        <NewTaskDialog reps={reps} orgs={orgs} />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center border border-[#E5E1DB] bg-[#F9F7F4] p-3">
        <span className="text-xs text-[#0A0A0A]/50 uppercase tracking-wider font-medium">
          Filter:
        </span>

        {/* By Rep */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#0A0A0A]/50">Rep:</span>
          <div className="flex gap-1 flex-wrap">
            <Link href={buildFilterUrl({ orgId, due })}>
              <Badge
                variant="outline"
                className={`text-xs cursor-pointer rounded-none ${
                  !repId
                    ? "bg-[#0A0A0A] text-[#F9F7F4] border-[#0A0A0A]"
                    : "border-[#E5E1DB] text-[#0A0A0A]/60 hover:border-[#0A0A0A]/40"
                }`}
              >
                All
              </Badge>
            </Link>
            {reps.map((rep) => (
              <Link
                key={rep.id}
                href={buildFilterUrl({ repId: rep.id, orgId, due })}
              >
                <Badge
                  variant="outline"
                  className={`text-xs cursor-pointer rounded-none ${
                    repId === rep.id
                      ? "bg-[#0A0A0A] text-[#F9F7F4] border-[#0A0A0A]"
                      : "border-[#E5E1DB] text-[#0A0A0A]/60 hover:border-[#0A0A0A]/40"
                  }`}
                >
                  {rep.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* By Due */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-[#0A0A0A]/50">Due:</span>
          {(
            [
              { value: undefined, label: "All" },
              { value: "overdue", label: "Overdue" },
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
            ] as const
          ).map(({ value, label }) => (
            <Link
              key={label}
              href={buildFilterUrl({ repId, orgId, due: value })}
            >
              <Badge
                variant="outline"
                className={`text-xs cursor-pointer rounded-none ${
                  due === value
                    ? "bg-[#0A0A0A] text-[#F9F7F4] border-[#0A0A0A]"
                    : "border-[#E5E1DB] text-[#0A0A0A]/60 hover:border-[#0A0A0A]/40"
                }`}
              >
                {label}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid gap-4 lg:grid-cols-4">
        {PRIORITIES.map((priority) => {
          const config = priorityConfig[priority];
          const columnTasks = grouped[priority];

          return (
            <div key={priority} className="flex flex-col gap-3">
              {/* Column Header */}
              <div
                className={`flex items-center justify-between px-3 py-2 border ${config.headerClass}`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {config.label}
                </span>
                <span className="text-xs font-mono">{columnTasks.length}</span>
              </div>

              {/* Task Cards */}
              <div className="flex flex-col gap-2">
                {columnTasks.length === 0 ? (
                  <div className="border border-dashed border-[#E5E1DB] p-4 text-center">
                    <p className="text-xs text-[#0A0A0A]/30">No tasks</p>
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const isOverdue =
                      task.dueDate && isPast(task.dueDate) && !isToday(task.dueDate);
                    const isDueToday = task.dueDate && isToday(task.dueDate);

                    return (
                      <Card
                        key={task.id}
                        className={`border ${config.borderClass} bg-[#F9F7F4] rounded-none shadow-none`}
                      >
                        <CardHeader className="p-3 pb-1">
                          <CardTitle className="text-sm font-medium text-[#0A0A0A] leading-snug">
                            {task.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-1 space-y-2">
                          {/* Description preview */}
                          {task.description && (
                            <p className="text-xs text-[#0A0A0A]/50 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {/* Meta row */}
                          <div className="flex flex-col gap-1">
                            {/* Assignee */}
                            <div className="flex items-center gap-1 text-xs text-[#0A0A0A]/60">
                              <span className="font-medium">{task.rep.name}</span>
                            </div>

                            {/* Org link */}
                            {task.organization && (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-[#C8C0B4] shrink-0" />
                                <Link
                                  href={`/admin/clients/${task.organization.id}`}
                                  className="text-xs text-[#0A0A0A]/60 hover:text-[#0A0A0A] hover:underline truncate"
                                >
                                  {task.organization.name}
                                </Link>
                                <ExternalLink className="h-2.5 w-2.5 text-[#C8C0B4] shrink-0" />
                              </div>
                            )}

                            {/* Due date */}
                            {task.dueDate && (
                              <div
                                className={`flex items-center gap-1 text-xs ${
                                  isOverdue
                                    ? "text-red-600 font-medium"
                                    : isDueToday
                                    ? "text-orange-600 font-medium"
                                    : "text-[#0A0A0A]/50"
                                }`}
                              >
                                {isOverdue && (
                                  <AlertTriangle className="h-3 w-3 shrink-0" />
                                )}
                                {format(task.dueDate, "MMM d, yyyy")}
                                {isOverdue && (
                                  <span className="text-xs">(overdue)</span>
                                )}
                                {isDueToday && (
                                  <span className="text-xs">(today)</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-1 border-t border-[#E5E1DB]">
                            <Link
                              href={`/admin/reps/${task.rep.id}`}
                              className="text-xs text-[#0A0A0A]/40 hover:text-[#0A0A0A] hover:underline"
                            >
                              View Rep
                            </Link>
                            <TaskActions taskId={task.id} />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildFilterUrl(params: {
  repId?: string;
  orgId?: string;
  due?: string;
}): string {
  const sp = new URLSearchParams();
  if (params.repId) sp.set("repId", params.repId);
  if (params.orgId) sp.set("orgId", params.orgId);
  if (params.due) sp.set("due", params.due);
  const qs = sp.toString();
  return `/admin/tasks${qs ? `?${qs}` : ""}`;
}

async function getTasks({
  repId,
  orgId,
  due,
}: {
  repId?: string;
  orgId?: string;
  due?: string;
}) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);
  const endOfWeek = new Date(
    startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000
  );

  let dueDateFilter: { lt?: Date; gte?: Date; lte?: Date } | undefined;
  if (due === "overdue") {
    dueDateFilter = { lt: startOfToday };
  } else if (due === "today") {
    dueDateFilter = { gte: startOfToday, lte: endOfToday };
  } else if (due === "week") {
    dueDateFilter = { gte: startOfToday, lte: endOfWeek };
  }

  return prisma.repTask.findMany({
    where: {
      completedAt: null,
      ...(repId ? { repId } : {}),
      ...(orgId ? { organizationId: orgId } : {}),
      ...(dueDateFilter ? { dueDate: dueDateFilter } : {}),
    },
    include: {
      rep: { select: { id: true, name: true } },
      organization: { select: { id: true, name: true } },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });
}

// Mark page as dynamic so searchParams work correctly
export const dynamic = "force-dynamic";
