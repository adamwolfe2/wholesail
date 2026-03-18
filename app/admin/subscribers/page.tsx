import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Users } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = { title: "Subscribers" };
export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  let subscribers: Awaited<ReturnType<typeof getSubscribers>> = [];
  let total = 0;

  try {
    [subscribers, total] = await Promise.all([
      getSubscribers(),
      prisma.emailSubscriber.count(),
    ]);
  } catch {
    // DB not connected
  }

  // Count by source
  const bySources = subscribers.reduce<Record<string, number>>((acc, s) => {
    acc[s.source] = (acc[s.source] ?? 0) + 1;
    return acc;
  }, {});

  const thisMonth = subscribers.filter(
    (s) =>
      s.subscribedAt >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-normal flex items-center gap-3">
          <Mail className="h-7 w-7 text-[#C8C0B4]" />
          Email Subscribers
        </h2>
        <p className="text-sm text-[#0A0A0A]/50 mt-1 font-mono">
          {total} total &middot; {thisMonth} this month
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(bySources).map(([source, count]) => (
          <Card key={source}>
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-serif font-bold">{count}</p>
              <p className="text-xs font-mono text-[#0A0A0A]/50 mt-0.5">{source}</p>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-serif font-bold">{thisMonth}</p>
            <p className="text-xs font-mono text-[#0A0A0A]/50 mt-0.5">this month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{subscribers.length} subscribers (most recent first)</CardTitle>
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No subscribers yet"
              description="Newsletter signups from blog posts and industry pages will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E1DB]">
                    <th className="text-left py-3 pr-4 font-medium text-[#0A0A0A]/50 font-normal">
                      Email
                    </th>
                    <th className="text-left py-3 pr-4 font-medium text-[#0A0A0A]/50 font-normal hidden sm:table-cell">
                      Source
                    </th>
                    <th className="text-left py-3 pr-4 font-medium text-[#0A0A0A]/50 font-normal hidden md:table-cell">
                      Cursive
                    </th>
                    <th className="text-left py-3 font-medium text-[#0A0A0A]/50 font-normal">
                      Subscribed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-[#E5E1DB] last:border-0 hover:bg-[#0A0A0A]/[0.02] transition-colors"
                    >
                      <td className="py-3 pr-4 font-mono text-xs">{sub.email}</td>
                      <td className="py-3 pr-4 hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs font-mono">
                          {sub.source}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 hidden md:table-cell">
                        {sub.cursiveContactId ? (
                          <span className="text-xs font-mono text-green-700">synced</span>
                        ) : (
                          <span className="text-xs font-mono text-[#0A0A0A]/30">—</span>
                        )}
                      </td>
                      <td className="py-3 text-[#0A0A0A]/60 tabular-nums text-xs">
                        {new Date(sub.subscribedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
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

async function getSubscribers() {
  return prisma.emailSubscriber.findMany({
    orderBy: { subscribedAt: "desc" },
    take: 500,
    select: {
      id: true,
      email: true,
      source: true,
      subscribedAt: true,
      cursiveContactId: true,
    },
  });
}
