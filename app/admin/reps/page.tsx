import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import {
  Users,
  CheckSquare,
  FileText,
  ShoppingCart,
  ArrowRight,
  Building2,
} from "lucide-react";

export const metadata: Metadata = { title: "Sales Reps" };

const priorityColors: Record<string, string> = {
  URGENT: "bg-red-100 text-red-700 border-red-200",
  HIGH: "bg-orange-100 text-orange-700 border-orange-200",
  NORMAL: "bg-sand/30 text-ink border-sand",
  LOW: "bg-gray-100 text-gray-500 border-gray-200",
};

export default async function SalesRepsPage() {
  let totalReps = 0;
  let totalAssignedAccounts = 0;
  let openQuotes = 0;
  let pendingTasks = 0;
  let reps: Awaited<ReturnType<typeof getReps>> = [];
  let recentTasks: Awaited<ReturnType<typeof getRecentTasks>> = [];

  try {
    [totalReps, totalAssignedAccounts, openQuotes, pendingTasks, reps, recentTasks] =
      await Promise.all([
        prisma.user.count({ where: { role: "SALES_REP" } }),
        prisma.organization.count({ where: { accountManagerId: { not: null } } }),
        prisma.quote.count({
          where: { status: { notIn: ["ACCEPTED", "DECLINED", "EXPIRED"] } },
        }),
        prisma.repTask.count({ where: { completedAt: null } }),
        getReps(),
        getRecentTasks(),
      ]);
  } catch {
    // DB not connected
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
            Sales Team
          </h2>
          <p className="text-sm text-ink/50 mt-0.5">
            Manage reps, accounts, and pipeline
          </p>
        </div>
        <Button asChild className="bg-ink text-cream hover:bg-ink/80 rounded-none">
          <Link href="/admin/reps/build-cart">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Build Order
          </Link>
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-shell bg-cream">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
              Total Reps
            </CardTitle>
            <Users className="h-4 w-4 text-sand" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-ink">
              {totalReps}
            </div>
            <p className="text-xs text-ink/40 mt-1">Sales representatives</p>
          </CardContent>
        </Card>

        <Card className="border-shell bg-cream">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
              Assigned Accounts
            </CardTitle>
            <Building2 className="h-4 w-4 text-sand" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-ink">
              {totalAssignedAccounts}
            </div>
            <p className="text-xs text-ink/40 mt-1">Organizations with a rep</p>
          </CardContent>
        </Card>

        <Card className="border-shell bg-cream">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
              Open Quotes
            </CardTitle>
            <FileText className="h-4 w-4 text-sand" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-ink">
              {openQuotes}
            </div>
            <p className="text-xs text-ink/40 mt-1">Draft or sent</p>
          </CardContent>
        </Card>

        <Card className="border-shell bg-cream">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
              Pending Tasks
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-sand" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-ink">
              {pendingTasks}
            </div>
            <p className="text-xs text-ink/40 mt-1">Incomplete tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Reps Table */}
      <Card className="border-shell bg-cream">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-ink">
            All Sales Reps
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reps.length === 0 ? (
            <p className="text-sm text-ink/50">
              No sales reps yet. Assign the SALES_REP role to users.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-shell">
                    <th className="text-left py-3 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider">
                      Accounts
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider">
                      Open Tasks
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider">
                      Quotes Sent
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider">
                      Orders Placed
                    </th>
                    <th className="py-3 px-2" />
                  </tr>
                </thead>
                <tbody>
                  {reps.map((rep) => (
                    <tr
                      key={rep.id}
                      className="border-b border-shell last:border-0 hover:bg-ink/[0.02]"
                    >
                      <td className="py-3 px-2 font-medium text-ink">
                        {rep.name}
                      </td>
                      <td className="py-3 px-2 text-ink/60">{rep.email}</td>
                      <td className="py-3 px-2 text-right text-ink">
                        {rep._count.managedOrgs}
                      </td>
                      <td className="py-3 px-2 text-right text-ink">
                        {rep._count.repTasks}
                      </td>
                      <td className="py-3 px-2 text-right text-ink">
                        {rep._count.repQuotes}
                      </td>
                      <td className="py-3 px-2 text-right text-ink">
                        {rep._count.ordersPlacedAsRep}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-ink/60 hover:text-ink hover:bg-ink/[0.06]"
                        >
                          <Link href={`/admin/reps/${rep.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card className="border-shell bg-cream">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-ink">
            Recent Open Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-ink/50">No open tasks.</p>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between py-3 border-b border-shell last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">{task.title}</p>
                    <p className="text-xs text-ink/50 mt-0.5">
                      {task.rep.name}
                      {task.organization && (
                        <> &bull; {task.organization.name}</>
                      )}
                      {task.dueDate && (
                        <> &bull; Due {format(task.dueDate, "MMM d, yyyy")}</>
                      )}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ml-3 shrink-0 ${
                      priorityColors[task.priority] ?? priorityColors.NORMAL
                    }`}
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getReps() {
  return prisma.user.findMany({
    where: { role: "SALES_REP" },
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: {
          managedOrgs: true,
          repTasks: {
            where: { completedAt: null },
          },
          repQuotes: true,
          ordersPlacedAsRep: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

async function getRecentTasks() {
  return prisma.repTask.findMany({
    where: { completedAt: null },
    include: {
      rep: { select: { name: true } },
      organization: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}
