import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminMobileNav } from "./mobile-nav";
import { CommandPalette } from "./command-palette";
import { AdminSearchBar } from "./search-bar";
import { adminNav } from "./nav-config";

export const dynamic = 'force-dynamic';

const ALLOWED_ROLES = ["ADMIN", "OPS", "SALES_REP"] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth guard — block non-staff before rendering anything
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  }).catch(() => null);

  if (!dbUser || !(ALLOWED_ROLES as readonly string[]).includes(dbUser.role)) {
    redirect("/");
  }

  // Badge counts for nav items — fetched once per layout render
  const [unreadMessages, pendingOrders, overdueInvoices, pendingApplications, openTasks] =
    await Promise.all([
      prisma.message.count({ where: { senderRole: "client", readAt: null } }).catch(() => 0),
      prisma.order.count({ where: { status: "PENDING" } }).catch(() => 0),
      prisma.invoice.count({ where: { status: "OVERDUE" } }).catch(() => 0),
      prisma.wholesaleApplication.count({ where: { status: "PENDING" } }).catch(() => 0),
      prisma.repTask.count({ where: { completedAt: null } }).catch(() => 0),
    ]);

  const navBadges: Record<string, number> = {
    unreadMessages,
    pendingOrders,
    overdueInvoices,
    pendingApplications,
    openTasks,
  };

  return (
    <div className="flex min-h-screen bg-[#F9F7F4]">
      {/* Desktop Sidebar */}
      <aside className="w-60 border-r border-[#E5E1DB] bg-[#F9F7F4] p-5 hidden md:flex md:flex-col overflow-y-auto">
        <div className="mb-6 px-1">
          <Link href="/admin" className="font-serif font-bold text-xl text-[#0A0A0A] tracking-tight">
            TBGC
          </Link>
          <p className="font-serif italic text-sm text-[#C8C0B4] mt-0.5">Admin</p>
        </div>
        <nav className="space-y-0.5 flex-1">
          {adminNav.map((item) => {
            const badgeCount = "badgeKey" in item ? (navBadges[item.badgeKey] ?? 0) : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#0A0A0A]/60 hover:bg-[#0A0A0A]/[0.06] hover:text-[#0A0A0A] transition-colors"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
                {badgeCount > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-[#0A0A0A] text-[#F9F7F4] px-1.5 py-0.5 min-w-[18px] text-center leading-tight">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-[#E5E1DB] px-4 md:px-6 py-3 flex items-center justify-between bg-[#F9F7F4]">
          <div className="flex items-center gap-3">
            <AdminMobileNav navBadges={navBadges} />
            <span className="font-serif font-bold text-lg text-[#0A0A0A] hidden md:block">TBGC Admin</span>
          </div>
          <AdminSearchBar />
          <div className="flex items-center gap-3">
            <CommandPalette />
            <UserButton />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 animate-fade-in bg-[#F9F7F4]">{children}</main>
      </div>
    </div>
  );
}
