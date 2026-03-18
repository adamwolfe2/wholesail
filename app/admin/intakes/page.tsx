import type { Metadata } from "next";
import Link from "next/link";
import { FileInput, CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { getIntakeSubmissions } from "@/lib/db/intake";

export const metadata: Metadata = { title: "Intakes" };
export const dynamic = "force-dynamic";

const FILTERS = ["pending", "reviewed", "archived"] as const;
type Filter = (typeof FILTERS)[number];

function intakeStatusBadge(intake: {
  reviewedAt: Date | null;
  archivedAt: Date | null;
  project: { id: string; status: string } | null;
}) {
  if (intake.project) {
    return (
      <Badge
        variant="outline"
        className="bg-neutral-900 text-white border-neutral-800 text-xs"
      >
        Converted
      </Badge>
    );
  }
  if (intake.reviewedAt) {
    return (
      <Badge
        variant="outline"
        className="bg-neutral-200 text-neutral-700 border-neutral-300 text-xs"
      >
        Reviewed
      </Badge>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600">
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse" />
      New
    </span>
  );
}

export default async function AdminIntakesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const filter: Filter = FILTERS.includes(sp.filter as Filter)
    ? (sp.filter as Filter)
    : "pending";

  let intakes: Awaited<ReturnType<typeof getIntakeSubmissions>> = [];
  let pendingCount = 0;

  try {
    const opts =
      filter === "pending"
        ? { reviewed: false, archived: false }
        : filter === "reviewed"
        ? { reviewed: true, archived: false }
        : { archived: true };

    [intakes, pendingCount] = await Promise.all([
      getIntakeSubmissions(opts),
      getIntakeSubmissions({ reviewed: false, archived: false }).then((r) => r.length),
    ]);
  } catch {
    // DB not connected
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-normal">Intakes</h2>
        {pendingCount > 0 && (
          <p className="text-sm text-[#0A0A0A]/50 mt-1">
            {pendingCount} pending review
          </p>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-[#E5E1DB]">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/intakes?filter=${f}`}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "border-b-2 border-[#0A0A0A] text-[#0A0A0A]"
                : "text-[#0A0A0A]/50 hover:text-[#0A0A0A]"
            }`}
          >
            {f}
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {intakes.length}{" "}
            {filter === "pending"
              ? "pending"
              : filter === "reviewed"
              ? "reviewed"
              : "archived"}{" "}
            intake{intakes.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {intakes.length === 0 ? (
            <EmptyState
              icon={FileInput}
              title="No intakes"
              description={
                filter === "pending"
                  ? "New form submissions will appear here."
                  : filter === "reviewed"
                  ? "Reviewed intakes will appear here."
                  : "Archived intakes will appear here."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E1DB]">
                    <th className="text-left py-3 pr-4 font-medium text-[#0A0A0A]/50 font-normal">
                      Company
                    </th>
                    <th className="text-left py-3 pr-4 font-medium text-[#0A0A0A]/50 font-normal hidden md:table-cell">
                      Contact
                    </th>
                    <th className="text-left py-3 pr-4 font-medium text-[#0A0A0A]/50 font-normal hidden lg:table-cell">
                      Industry
                    </th>
                    <th className="text-left py-3 pr-4 font-medium text-[#0A0A0A]/50 font-normal hidden sm:table-cell">
                      Features
                    </th>
                    <th className="text-left py-3 pr-4 font-medium text-[#0A0A0A]/50 font-normal">
                      Submitted
                    </th>
                    <th className="text-left py-3 pr-4 font-medium text-[#0A0A0A]/50 font-normal hidden sm:table-cell">
                      Call
                    </th>
                    <th className="text-left py-3 font-medium text-[#0A0A0A]/50 font-normal">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {intakes.map((intake) => (
                    <tr
                      key={intake.id}
                      className="border-b border-[#E5E1DB] last:border-0 hover:bg-[#0A0A0A]/[0.02] transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/intakes/${intake.id}`}
                          className="font-medium hover:underline"
                        >
                          {intake.companyName}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-[#0A0A0A]/60 hidden md:table-cell">
                        {intake.contactName}
                      </td>
                      <td className="py-3 pr-4 hidden lg:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {intake.industry}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-[#0A0A0A]/60 hidden sm:table-cell">
                        {intake.selectedFeatures.length}
                      </td>
                      <td className="py-3 pr-4 text-[#0A0A0A]/60 tabular-nums">
                        {new Date(intake.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell">
                        {intake.calBooked ? (
                          <span className="inline-flex items-center gap-1 text-xs font-mono text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5">
                            <CalendarCheck className="h-3 w-3" />
                            Booked
                          </span>
                        ) : (
                          <span className="text-xs text-[#0A0A0A]/30 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-3">
                        <Link href={`/admin/intakes/${intake.id}`}>
                          {intakeStatusBadge(intake)}
                        </Link>
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
