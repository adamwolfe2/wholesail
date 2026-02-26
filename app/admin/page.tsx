import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/auth";
import { getProjects } from "@/lib/db/projects";
import { getIntakeSubmissions } from "@/lib/db/intake";
import { AdminDashboard } from "@/components/admin-dashboard";
import { mapProjectsForDashboard } from "@/lib/client-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  const [projects, intakes] = await Promise.all([
    getProjects(),
    getIntakeSubmissions({ reviewed: false, archived: false }),
  ]);

  const clientProjects = mapProjectsForDashboard(projects);

  return (
    <AdminDashboard
      initialProjects={clientProjects}
      intakeCount={intakes.length}
    />
  );
}
