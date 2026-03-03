/**
 * Smart auth redirect — runs after Clerk sign-in or sign-up.
 * Checks the user's DB role and redirects to the right section:
 *   - ADMIN / OPS / SALES_REP → /admin
 *   - SUPPLIER → /supplier/dashboard
 *   - CLIENT (with org) → /client-portal/dashboard
 *   - CLIENT (no org) → /client-portal/dashboard (empty state with apply CTA)
 */
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AuthRedirectPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, organizationId: true },
  }).catch(() => null);

  if (!dbUser) {
    // User exists in Clerk but not in DB yet — webhook may still be processing.
    // Redirect to client portal; it will show an appropriate empty state.
    redirect("/client-portal/dashboard");
  }

  switch (dbUser.role) {
    case "ADMIN":
    case "OPS":
    case "SALES_REP":
      redirect("/admin");
    case "SUPPLIER":
      redirect("/supplier/dashboard");
    case "CLIENT":
    default:
      redirect("/client-portal/dashboard");
  }
}
