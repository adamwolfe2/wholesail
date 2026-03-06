import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { ClientTable } from "./client-table";
import { ImportClientsButton } from "./import-button";
import { HealthSummaryCards } from "./health-summary-cards";
import { EmptyState } from "@/components/empty-state";
import { Users } from "lucide-react";

export default async function AdminClientsPage() {
  let organizations: Awaited<ReturnType<typeof getOrganizations>> = [];

  try {
    organizations = await getOrganizations();
  } catch {
    // DB not connected
  }

  const serialized = organizations.map((org) => ({
    id: org.id,
    name: org.name,
    contactPerson: org.contactPerson,
    email: org.email,
    phone: org.phone,
    tier: org.tier,
    paymentTerms: org.paymentTerms,
    orderCount: org._count.orders,
    isWholesaler: org.isWholesaler,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-3xl font-normal">Clients</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {organizations.length} organizations
          </span>
          <ImportClientsButton />
        </div>
      </div>

      {/* Health score summary — client component, fetches its own data */}
      <HealthSummaryCards />

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          {organizations.length === 0 ? (
            <div className="flex flex-col items-center">
              <EmptyState
                icon={Users}
                title="No Clients Yet"
                description="Import a CSV above or clients will be created automatically when users sign up and place orders."
              />
              <div className="pb-8">
                <ImportClientsButton />
              </div>
            </div>
          ) : (
            <ClientTable clients={serialized} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getOrganizations() {
  return prisma.organization.findMany({
    include: {
      _count: { select: { orders: true } },
    },
    orderBy: { name: "asc" },
    take: 1000,
  });
}
