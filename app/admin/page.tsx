import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getProjects } from "@/lib/db/projects";
import { getIntakeSubmissions } from "@/lib/db/intake";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminOnboardingChecklist } from "@/components/admin-onboarding-checklist";
import { mapProjectsForDashboard } from "@/lib/client-data";
import Link from "next/link";
import { ClipboardList, Users, Package } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };
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
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl font-bold text-ink mb-2">
          Welcome to your dashboard
        </h1>
        <p className="text-sm text-ink/50 mb-10 max-w-md">
          It looks like you are just getting started. Pick an action below to begin setting up your portal.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <Link
            href="/admin/intakes"
            className="group border border-shell bg-white hover:border-ink/20 transition-colors p-6 text-left"
          >
            <ClipboardList className="h-6 w-6 text-ink/40 mb-3" />
            <p className="font-semibold text-sm text-ink mb-1">Create an intake</p>
            <p className="text-xs text-ink/50">
              Set up your first intake form to start collecting submissions.
            </p>
          </Link>

          <Link
            href="/admin/clients"
            className="group border border-shell bg-white hover:border-ink/20 transition-colors p-6 text-left"
          >
            <Users className="h-6 w-6 text-ink/40 mb-3" />
            <p className="font-semibold text-sm text-ink mb-1">Import clients</p>
            <p className="text-xs text-ink/50">
              Add your existing clients to manage orders and invoicing.
            </p>
          </Link>

          <Link
            href="/admin/products"
            className="group border border-shell bg-white hover:border-ink/20 transition-colors p-6 text-left"
          >
            <Package className="h-6 w-6 text-ink/40 mb-3" />
            <p className="font-semibold text-sm text-ink mb-1">Add products</p>
            <p className="text-xs text-ink/50">
              Build your product catalog so clients can start ordering.
            </p>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminOnboardingChecklist />
      <AdminDashboard
        initialProjects={clientProjects}
        intakeCount={intakes.length}
      />
    </>
  );
}
