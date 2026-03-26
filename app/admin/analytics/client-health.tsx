"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClientHealth {
  name: string;
  lastOrderDate: string | null;
  orderCount: number;
  totalRevenue: number;
  status: "active" | "at-risk" | "churned";
}

interface ClientHealthOverviewProps {
  clients: ClientHealth[];
}

function getHealthBadge(status: ClientHealth["status"]) {
  switch (status) {
    case "active":
      return (
        <Badge variant="outline" className="bg-ink text-cream border-ink text-xs">
          Active
        </Badge>
      );
    case "at-risk":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
          At Risk
        </Badge>
      );
    case "churned":
      return (
        <Badge variant="outline" className="bg-transparent text-ink/40 border-sand/50 text-xs">
          Churned
        </Badge>
      );
  }
}

function daysSinceLabel(dateStr: string | null): string {
  if (!dateStr) return "No orders";
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function ClientHealthOverview({ clients }: ClientHealthOverviewProps) {
  const activeCt = clients.filter((c) => c.status === "active").length;
  const atRiskCt = clients.filter((c) => c.status === "at-risk").length;
  const churnedCt = clients.filter((c) => c.status === "churned").length;
  const total = clients.length;

  if (total === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground text-sm">
            No clients to display yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Health Overview</CardTitle>
        <CardDescription>
          Based on order recency: active ({"<"}30d), at-risk (30-90d), churned ({">"}90d)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary pills */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-ink shrink-0" />
            <span className="text-sm text-muted-foreground">
              Active: <span className="font-semibold text-foreground">{activeCt}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-amber-400 shrink-0" />
            <span className="text-sm text-muted-foreground">
              At Risk: <span className="font-semibold text-foreground">{atRiskCt}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-sand shrink-0" />
            <span className="text-sm text-muted-foreground">
              Churned: <span className="font-semibold text-foreground">{churnedCt}</span>
            </span>
          </div>
        </div>

        {/* Health bar */}
        <div className="flex h-3 w-full overflow-hidden mb-6">
          {activeCt > 0 && (
            <div
              className="h-full bg-ink"
              style={{ width: `${(activeCt / total) * 100}%` }}
            />
          )}
          {atRiskCt > 0 && (
            <div
              className="h-full bg-amber-400"
              style={{ width: `${(atRiskCt / total) * 100}%` }}
            />
          )}
          {churnedCt > 0 && (
            <div
              className="h-full bg-sand"
              style={{ width: `${(churnedCt / total) * 100}%` }}
            />
          )}
        </div>

        {/* Client list */}
        <div className="space-y-2">
          {clients.map((client) => (
            <div
              key={client.name}
              className="flex items-center justify-between py-2 border-b border-muted/30 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {getHealthBadge(client.status)}
                <span className="text-sm font-medium truncate">{client.name}</span>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {client.orderCount} orders
                </span>
                <span className="text-xs text-muted-foreground">
                  {daysSinceLabel(client.lastOrderDate)}
                </span>
                <span className="text-sm font-semibold tabular-nums w-20 text-right">
                  ${client.totalRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
