import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { Users, Shield, UserCircle } from "lucide-react";

export const metadata: Metadata = { title: "Team" };

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  SALES_REP: "Sales Rep",
  OPS: "Operations",
  SUPPLIER: "Supplier",
  CLIENT: "Client",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-[#0A0A0A] text-[#F9F7F4] border-[#0A0A0A]",
  SALES_REP: "bg-[#4A90D9]/10 text-[#4A90D9] border-[#4A90D9]/30",
  OPS: "bg-amber-50 text-amber-700 border-amber-200",
  SUPPLIER: "bg-purple-50 text-purple-700 border-purple-200",
  CLIENT: "bg-transparent text-[#0A0A0A]/60 border-[#C8C0B4]",
};

export default async function TeamPage() {
  let adminUsers: Awaited<ReturnType<typeof getTeamMembers>> = [];

  try {
    adminUsers = await getTeamMembers();
  } catch {
    // DB not connected
  }

  const admins = adminUsers.filter((u) => u.role === "ADMIN");
  const reps = adminUsers.filter((u) => u.role === "SALES_REP");
  const ops = adminUsers.filter((u) => u.role === "OPS");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-normal">Team</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage admin users and sales reps with access to the admin panel.
        </p>
      </div>

      {/* Role Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">Admins</CardTitle>
            <Shield className="h-4 w-4 text-[#C8C0B4]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0A0A0A]">{admins.length}</div>
            <p className="text-xs text-[#0A0A0A]/40 mt-1">Full access</p>
          </CardContent>
        </Card>

        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">Sales Reps</CardTitle>
            <UserCircle className="h-4 w-4 text-[#C8C0B4]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0A0A0A]">{reps.length}</div>
            <p className="text-xs text-[#0A0A0A]/40 mt-1">Orders + clients</p>
          </CardContent>
        </Card>

        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/60 uppercase tracking-wider">Ops</CardTitle>
            <Users className="h-4 w-4 text-[#C8C0B4]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0A0A0A]">{ops.length}</div>
            <p className="text-xs text-[#0A0A0A]/40 mt-1">Fulfillment + inventory</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Team Members</CardTitle>
          <CardDescription>
            All users with admin panel access. Manage roles via Clerk user metadata.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adminUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-[#C8C0B4] mx-auto mb-4" />
              <h3 className="font-serif text-lg font-medium mb-2 text-[#0A0A0A]">No team members</h3>
              <p className="text-[#0A0A0A]/50 text-sm">
                Admin users are created when users sign up and are assigned admin roles.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">Email</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium hidden md:table-cell">Organization</th>
                    <th className="pb-3 font-medium hidden lg:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 font-medium">{user.name}</td>
                      <td className="py-3 text-muted-foreground hidden sm:table-cell">{user.email}</td>
                      <td className="py-3">
                        <Badge variant="outline" className={ROLE_COLORS[user.role] ?? ""}>
                          {ROLE_LABELS[user.role] ?? user.role}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground hidden md:table-cell">
                        {user.organization?.name ?? "—"}
                      </td>
                      <td className="py-3 text-muted-foreground hidden lg:table-cell">
                        {user.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getTeamMembers() {
  return prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "SALES_REP", "OPS"] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organization: { select: { name: true } },
      createdAt: true,
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
}
