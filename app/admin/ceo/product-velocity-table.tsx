import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductVelocityItem {
  productId: string;
  name: string;
  category: string;
  totalQty: number;
  totalRevenue: number;
}

interface ProductVelocityTableProps {
  items: ProductVelocityItem[];
}

export function ProductVelocityTable({ items }: ProductVelocityTableProps) {
  return (
    <Card className="border-shell bg-cream">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg text-ink">
          Product Velocity — Top 10 (Last 90 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-ink/40">
            No product order data yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-shell">
                  <th className="text-left py-2 pr-4 text-xs font-medium text-ink/50 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-ink/50 uppercase tracking-wider hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-ink/50 uppercase tracking-wider">
                    Qty Ordered
                  </th>
                  <th className="text-right py-2 pl-3 text-xs font-medium text-ink/50 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={item.productId}
                    className="border-b border-shell last:border-0 hover:bg-ink/[0.02] transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-sand font-mono w-5">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-ink">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-ink/60 text-xs hidden sm:table-cell">
                      {item.category}
                    </td>
                    <td className="text-right py-3 px-3 font-mono font-bold text-ink">
                      {item.totalQty.toLocaleString()}
                    </td>
                    <td className="text-right py-3 pl-3 font-mono text-ink">
                      $
                      {item.totalRevenue.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
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
  );
}
