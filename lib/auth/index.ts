const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export async function requireAdmin(): Promise<string> {
  if (!hasClerk) {
    // No Clerk configured — allow access (dev mode / pre-setup)
    return "dev-admin";
  }
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function getAuthUserId(): Promise<string | null> {
  if (!hasClerk) return "dev-admin";
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  return userId;
}
