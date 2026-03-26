"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface TopProduct {
  name: string;
  revenue: number;
  quantity: number;
}

interface TopProductsProps {
  byRevenue: TopProduct[];
  byQuantity: TopProduct[];
}

export function TopProducts({ byRevenue, byQuantity }: TopProductsProps) {
  if (byRevenue.length === 0 && byQuantity.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground text-sm">
            No product data available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = byRevenue.length > 0 ? byRevenue[0].revenue : 1;
  const maxQuantity = byQuantity.length > 0 ? byQuantity[0].quantity : 1;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* By Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products by Revenue</CardTitle>
          <CardDescription>Highest revenue-generating products</CardDescription>
        </CardHeader>
        <CardContent>
          {byRevenue.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {byRevenue.map((product, idx) => (
                <div key={product.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-medium truncate">{product.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {product.quantity} sold
                      </span>
                      <span className="font-semibold tabular-nums">
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted overflow-hidden">
                    <div
                      className="h-full bg-foreground transition-all"
                      style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* By Quantity */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products by Quantity</CardTitle>
          <CardDescription>Most frequently ordered products</CardDescription>
        </CardHeader>
        <CardContent>
          {byQuantity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {byQuantity.map((product, idx) => (
                <div key={product.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-medium truncate">{product.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(product.revenue)}
                      </span>
                      <span className="font-semibold tabular-nums">
                        {product.quantity.toLocaleString()} units
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted overflow-hidden">
                    <div
                      className="h-full bg-foreground transition-all"
                      style={{ width: `${(product.quantity / maxQuantity) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
