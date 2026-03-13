import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getProjects } from "@/lib/db/projects";
import { getIntakeSubmissions } from "@/lib/db/intake";
import { AdminDashboard } from "@/components/admin-dashboard";
import { mapProjectsForDashboard } from "@/lib/client-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [projects, intakes] = await Promise.all([
    getProjects(),
    getIntakeSubmissions({ reviewed: false, archived: false }),
  ]);

  const clientProjects = mapProjectsForDashboard(projects);

  if (clientProjects.length === 0 && intakes.length === 0) {
    redirect('/admin/intakes')
  }

  return (
    <AdminDashboard
      initialProjects={clientProjects}
      intakeCount={intakes.length}
    />
  );
}
