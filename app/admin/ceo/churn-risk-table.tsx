'use client'

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface ChurnRiskClient {
  id: string;
  name: string;
  lastOrderDate: Date;
  daysSinceOrder: number;
  totalSpent: number;
}

interface ChurnRiskTableProps {
  clients: ChurnRiskClient[];
}

export function ChurnRiskTable({ clients }: ChurnRiskTableProps) {
  return (
    <Card className="border-shell bg-cream">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <CardTitle className="font-serif text-lg text-ink">
            Churn Risk
          </CardTitle>
        </div>
        <p className="text-xs text-ink/50 mt-1">
          Clients with no orders in 60+ days
        </p>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <p className="text-sm text-ink/40 py-4 text-center">
            All clients have ordered recently.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-shell">
                  <th className="text-left py-2 pr-3 text-xs font-medium text-ink/50 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider">
                    Days Idle
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider hidden sm:table-cell">
                    Last Order
                  </th>
                  <th className="text-right py-2 pl-2 text-xs font-medium text-ink/50 uppercase tracking-wider hidden sm:table-cell">
                    LTV
                  </th>
                </tr>
              </thead>
              <motion.tbody
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {clients.map((client) => (
                  <motion.tr
                    key={client.id}
                    variants={fadeUp}
                    className="border-b border-shell last:border-0 hover:bg-ink/[0.02] transition-colors"
                  >
                    <td className="py-2.5 pr-3">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="font-medium text-ink hover:underline truncate max-w-[130px] block"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="text-right py-2.5 px-2">
                      <span
                        className={`font-mono text-xs font-bold ${
                          client.daysSinceOrder >= 90
                            ? "text-red-500"
                            : "text-amber-500"
                        }`}
                      >
                        {client.daysSinceOrder}d
                      </span>
                    </td>
                    <td className="text-right py-2.5 px-2 text-ink/50 text-xs hidden sm:table-cell">
                      {format(client.lastOrderDate, "MMM d, yyyy")}
                    </td>
                    <td className="text-right py-2.5 pl-2 font-mono text-xs text-ink hidden sm:table-cell">
                      $
                      {client.totalSpent.toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
