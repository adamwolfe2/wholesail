import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { getProjectCosts } from "@/lib/db/costs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DollarSign, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Project Costs" };

const SERVICE_LABELS: Record<string, string> = {
  anthropic: "Anthropic (AI)",
  tavily: "Tavily (Research)",
  vercel: "Vercel (Hosting)",
  stripe: "Stripe (Payments)",
  resend: "Resend (Email)",
  sentry: "Sentry (Monitoring)",
  firecrawl: "Firecrawl (Scraping)",
  neon: "Neon (Database)",
  clerk: "Clerk (Auth)",
};

function formatCents(cents: number): string {
  return formatCurrency(cents / 100);
}

export default async function ProjectCostsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id, deletedAt: null },
    select: { id: true, company: true, shortName: true },
  });

  if (!project) notFound();

  const costs = await getProjectCosts(id);

  // Aggregate by service
  const byService: Record<string, number> = {};
  for (const cost of costs) {
    const key = cost.service.toLowerCase();
    byService[key] = (byService[key] ?? 0) + Number(cost.amountCents);
  }

  const totalCents = costs.reduce(
    (sum, c) => sum + Number(c.amountCents),
    0
  );

  // Sort services by cost descending
  const sortedServices = Object.entries(byService).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/projects/${id}`}
          className="text-ink/40 hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="font-serif text-3xl font-normal">
            {project.company} — Costs
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Build and operational costs for this project.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <Card className="border-shell bg-cream">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-ink/60 uppercase tracking-wider">
              Total Cost
            </CardTitle>
            <DollarSign className="h-4 w-4 text-sand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-ink">
              {formatCents(totalCents)}
            </div>
            <p className="text-xs text-ink/40 mt-1">
              {costs.length} record{costs.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        {/* Top 3 services */}
        {sortedServices.slice(0, 3).map(([service, cents]) => (
          <Card key={service} className="border-shell bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-ink/60 uppercase tracking-wider">
                {SERVICE_LABELS[service] ?? service}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-sand" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-ink">
                {formatCents(cents)}
              </div>
              <p className="text-xs text-ink/40 mt-1">
                {totalCents > 0
                  ? `${((cents / totalCents) * 100).toFixed(0)}% of total`
                  : "—"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Per-Service Breakdown */}
      {sortedServices.length > 0 && (
        <Card className="border-shell bg-cream">
          <CardHeader>
            <CardTitle className="font-serif text-lg">
              Cost by Service
            </CardTitle>
            <CardDescription>
              Aggregated costs across all recorded entries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedServices.map(([service, cents]) => {
                const pct =
                  totalCents > 0 ? (cents / totalCents) * 100 : 0;
                return (
                  <div key={service} className="flex items-center gap-4">
                    <span className="text-sm font-medium w-40 shrink-0">
                      {SERVICE_LABELS[service] ?? service}
                    </span>
                    <div className="flex-1 h-2 bg-shell rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ink rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono w-20 text-right">
                      {formatCents(cents)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Records Table */}
      <Card className="border-shell bg-cream">
        <CardHeader>
          <CardTitle className="font-serif text-lg">All Cost Records</CardTitle>
          <CardDescription>
            Individual cost entries ordered by date (newest first).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {costs.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-sand mx-auto mb-4" />
              <h3 className="font-serif text-lg font-medium mb-2 text-ink">
                No costs recorded
              </h3>
              <p className="text-ink/50 text-sm">
                Costs are logged automatically during the build pipeline.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Service</th>
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">
                      Tokens
                    </th>
                    <th className="pb-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map((cost) => (
                    <tr
                      key={cost.id}
                      className="border-b border-shell hover:bg-cream-hover"
                    >
                      <td className="py-3 text-muted-foreground whitespace-nowrap">
                        {cost.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center rounded border border-shell bg-cream-hover px-2 py-0.5 text-xs font-medium">
                          {SERVICE_LABELS[cost.service] ?? cost.service}
                        </span>
                      </td>
                      <td className="py-3 max-w-xs truncate">
                        {cost.description}
                      </td>
                      <td className="py-3 text-muted-foreground hidden sm:table-cell font-mono">
                        {cost.tokens?.toLocaleString() ?? "—"}
                      </td>
                      <td className="py-3 text-right font-mono font-medium">
                        {formatCents(Number(cost.amountCents))}
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
