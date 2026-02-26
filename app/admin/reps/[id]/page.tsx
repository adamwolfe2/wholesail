import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { ArrowLeft, ShoppingCart, Building2, CheckSquare } from "lucide-react";
import { NewTaskForm } from "./new-task-form";
import { TaskActions } from "./task-actions";

const priorityColors: Record<string, string> = {
  URGENT: "bg-red-100 text-red-700 border-red-200",
  HIGH: "bg-orange-100 text-orange-700 border-orange-200",
  NORMAL: "bg-[#C8C0B4]/30 text-[#0A0A0A] border-[#C8C0B4]",
  LOW: "bg-gray-100 text-gray-500 border-gray-200",
};

const tierColors: Record<string, string> = {
  NEW: "bg-neutral-100 text-neutral-600 border-neutral-200",
  REPEAT: "bg-neutral-300 text-neutral-800 border-neutral-400",
  VIP: "bg-neutral-900 text-white border-neutral-800",
};

interface RepDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RepDetailPage({ params }: RepDetailPageProps) {
  const { id } = await params;

  let rep: Awaited<ReturnType<typeof getRep>> = null;
  let orgs: { id: string; name: string }[] = [];

  try {
    [rep, orgs] = await Promise.all([
      getRep(id),
      prisma.organization.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);
  } catch {
    // DB not connected
  }

  if (!rep) {
    notFound();
  }

  const openTasks = rep.repTasks.filter((t) => !t.completedAt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-[#0A0A0A]/50 hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.04] rounded-none -ml-2"
            >
              <Link href="/admin/reps">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Sales Team
              </Link>
            </Button>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
            {rep.name}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-[#0A0A0A]/50">{rep.email}</span>
            <Badge
              variant="outline"
              className="text-xs border-[#E5E1DB] text-[#0A0A0A]/60"
            >
              {rep.role}
            </Badge>
          </div>
        </div>
        <Button
          asChild
          className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none"
        >
          <Link href={`/admin/reps/build-cart?repId=${rep.id}`}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Build Order for Client
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assigned Organizations */}
        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-lg text-[#0A0A0A] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#C8C0B4]" />
              Assigned Accounts
            </CardTitle>
            <span className="text-sm text-[#0A0A0A]/50">
              {rep.managedOrgs.length} total
            </span>
          </CardHeader>
          <CardContent>
            {rep.managedOrgs.length === 0 ? (
              <p className="text-sm text-[#0A0A0A]/50">No accounts assigned.</p>
            ) : (
              <div className="space-y-3">
                {rep.managedOrgs.map((org) => {
                  const lastOrder = org.orders[0];
                  return (
                    <div
                      key={org.id}
                      className="flex items-start justify-between py-2 border-b border-[#E5E1DB] last:border-0"
                    >
                      <div>
                        <Link
                          href={`/admin/clients/${org.id}`}
                          className="text-sm font-medium text-[#0A0A0A] hover:underline"
                        >
                          {org.name}
                        </Link>
                        {lastOrder && (
                          <p className="text-xs text-[#0A0A0A]/50 mt-0.5">
                            Last order:{" "}
                            {format(lastOrder.createdAt, "MMM d, yyyy")}
                          </p>
                        )}
                        {!lastOrder && (
                          <p className="text-xs text-[#0A0A0A]/40 mt-0.5">
                            No orders yet
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${tierColors[org.tier] ?? ""}`}
                      >
                        {org.tier}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open Tasks */}
        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-lg text-[#0A0A0A] flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-[#C8C0B4]" />
              Open Tasks
            </CardTitle>
            <span className="text-sm text-[#0A0A0A]/50">
              {openTasks.length} open
            </span>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {openTasks.length === 0 ? (
                <p className="text-sm text-[#0A0A0A]/50">No open tasks.</p>
              ) : (
                openTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between py-2 border-b border-[#E5E1DB] last:border-0"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-sm font-medium text-[#0A0A0A]">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {task.organization && (
                          <span className="text-xs text-[#0A0A0A]/50">
                            {task.organization.name}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="text-xs text-[#0A0A0A]/50">
                            Due {format(task.dueDate, "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          priorityColors[task.priority] ?? priorityColors.NORMAL
                        }`}
                      >
                        {task.priority}
                      </Badge>
                      <TaskActions taskId={task.id} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Task Form */}
      <div>
        <h3 className="font-serif text-lg font-semibold text-[#0A0A0A] mb-3">
          Add Task
        </h3>
        <NewTaskForm repId={rep.id} orgs={orgs} />
      </div>
    </div>
  );
}

async function getRep(id: string) {
  return prisma.user.findUnique({
    where: { id, role: "SALES_REP" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      managedOrgs: {
        select: {
          id: true,
          name: true,
          tier: true,
          orders: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { createdAt: true },
          },
        },
        orderBy: { name: "asc" },
      },
      repTasks: {
        where: { completedAt: null },
        include: {
          organization: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
