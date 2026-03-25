import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { Plus, ArrowRight } from "lucide-react";
import { quoteStatusColors } from "@/lib/status-colors";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Quotes" };

export default async function AdminQuotesPage() {
  let quotes: Awaited<ReturnType<typeof getQuotes>> = [];

  try {
    quotes = await getQuotes();
  } catch {
    // DB not connected
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
            Quotes
          </h2>
          <p className="text-sm text-ink/50 mt-0.5">
            Manage client proposals and pricing
          </p>
        </div>
        <Button asChild className="bg-ink text-cream hover:bg-ink/80 rounded-none">
          <Link href="/admin/quotes/new">
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Link>
        </Button>
      </div>

      <Card className="border-shell bg-cream">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-ink">
            All Quotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-ink/50">No quotes yet.</p>
              <Button asChild className="mt-4 bg-ink text-cream hover:bg-ink/80 rounded-none">
                <Link href="/admin/quotes/new">Create your first quote</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-shell">
                    <th className="text-left py-3 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider">
                      Quote #
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider hidden md:table-cell">
                      Rep
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider hidden lg:table-cell">
                      Created
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider hidden lg:table-cell">
                      Expires
                    </th>
                    <th className="py-3 px-2" />
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((quote) => (
                    <tr
                      key={quote.id}
                      className="border-b border-shell last:border-0 hover:bg-ink/[0.02]"
                    >
                      <td className="py-3 px-2 font-mono text-xs font-medium text-ink">
                        {quote.quoteNumber}
                      </td>
                      <td className="py-3 px-2 text-ink font-medium">
                        {quote.organization.name}
                      </td>
                      <td className="py-3 px-2 text-ink/60 hidden md:table-cell">
                        {quote.rep?.name ?? "—"}
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            quoteStatusColors[quote.status] ?? ""
                          }`}
                        >
                          {quote.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-ink">
                        {formatCurrency(quote.total)}
                      </td>
                      <td className="py-3 px-2 text-ink/50 hidden lg:table-cell">
                        {format(quote.createdAt, "MMM d, yyyy")}
                      </td>
                      <td className="py-3 px-2 text-ink/50 hidden lg:table-cell">
                        {quote.expiresAt
                          ? format(quote.expiresAt, "MMM d, yyyy")
                          : "—"}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-ink/60 hover:text-ink hover:bg-ink/[0.06]"
                        >
                          <Link href={`/admin/quotes/${quote.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
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

async function getQuotes() {
  return prisma.quote.findMany({
    include: {
      organization: { select: { name: true } },
      rep: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
