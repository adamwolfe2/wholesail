import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { AdminMobileNav } from "./mobile-nav";
import { CommandPalette } from "./command-palette";
import { AdminSearchBar } from "./search-bar";
import { adminNavGroups } from "./nav-config";
import { AdminSidebar } from "./admin-sidebar";
import { AdminNotifications } from "@/components/admin-notifications";

export const dynamic = 'force-dynamic';

const BRAND_NAME = process.env.BRAND_NAME || "Wholesail";

const ALLOWED_ROLES = ["ADMIN", "OPS", "SALES_REP"] as const;

// Cache badge counts for 60 seconds — 3 DB queries max once per minute across all admins.
const getNavBadgeCounts = unstable_cache(
  async () => {
    const [unreadMessages, pendingIntakes, activeBuilds] =
      await Promise.all([
        prisma.message.count({ where: { senderRole: "client", readAt: null } }).catch(() => 0),
        prisma.intakeSubmission.count({ where: { reviewedAt: null, archivedAt: null } }).catch(() => 0),
        prisma.project.count({ where: { status: { in: ["ONBOARDING", "BUILDING", "REVIEW"] } } }).catch(() => 0),
      ]);
    return { unreadMessages, pendingIntakes, activeBuilds };
  },
  ['admin-nav-badges'],
  { revalidate: 60, tags: ['admin-nav-badges'] }
);

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

  const { unreadMessages, pendingIntakes, activeBuilds } = await getNavBadgeCounts();

  const navBadges: Record<string, number> = {
    unreadMessages,
    pendingIntakes,
    activeBuilds,
  };

  return (
    <div className="flex min-h-screen bg-[#F9F7F4]">
      {/* Skip to main content — screen readers and keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-[#0A0A0A] focus:text-[#F9F7F4] focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      <aside className="w-60 border-r border-[#E5E1DB] bg-[#F9F7F4] hidden md:flex md:flex-col overflow-y-auto">
        <div className="mb-4 px-6 pt-5">
          <Link href="/admin" className="font-serif font-bold text-xl text-[#0A0A0A] tracking-tight">
            {BRAND_NAME}
          </Link>
          <p className="font-serif italic text-sm text-[#C8C0B4] mt-0.5">Admin</p>
        </div>
        <AdminSidebar groups={adminNavGroups} navBadges={navBadges} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-[#E5E1DB] px-4 md:px-6 py-3 flex items-center justify-between bg-[#F9F7F4]">
          <div className="flex items-center gap-3">
            <AdminMobileNav navBadges={navBadges} />
            <span className="font-serif font-bold text-base text-[#0A0A0A] md:hidden">{BRAND_NAME}</span>
            <span className="font-serif font-bold text-lg text-[#0A0A0A] hidden md:block">{BRAND_NAME} Admin</span>
          </div>
          <AdminSearchBar />
          <div className="flex items-center gap-3">
            <AdminNotifications />
            <CommandPalette />
            <UserButton />
          </div>
        </header>
        <main id="main-content" className="flex-1 p-3 sm:p-4 md:p-6 animate-fade-in bg-[#F9F7F4]">{children}</main>
      </div>
    </div>
  );
}
