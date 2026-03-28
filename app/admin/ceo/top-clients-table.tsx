'use client'

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface TopClient {
  id: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastOrderDate: Date | null;
}

interface TopClientsTableProps {
  clients: TopClient[];
}

export function TopClientsTable({ clients }: TopClientsTableProps) {
  return (
    <Card className="border-shell bg-cream">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg text-ink">
          Top 10 Clients by Lifetime Value
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <p className="text-sm text-ink/40">
            No client order data yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-shell">
                  <th className="text-left py-2 pr-3 text-xs font-medium text-ink/50 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider hidden sm:table-cell">
                    Orders
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-ink/50 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="text-right py-2 pl-2 text-xs font-medium text-ink/50 uppercase tracking-wider hidden md:table-cell">
                    Last Order
                  </th>
                </tr>
              </thead>
              <motion.tbody
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {clients.map((client, idx) => (
                  <motion.tr
                    key={client.id}
                    variants={fadeUp}
                    className="border-b border-shell last:border-0 hover:bg-ink/[0.02] transition-colors"
                  >
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-sand font-mono w-4">
                          {idx + 1}
                        </span>
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="font-medium text-ink hover:underline truncate max-w-[120px]"
                        >
                          {client.name}
                        </Link>
                      </div>
                    </td>
                    <td className="text-right py-2.5 px-2 font-mono text-ink hidden sm:table-cell">
                      {client.totalOrders}
                    </td>
                    <td className="text-right py-2.5 px-2 font-mono font-bold text-ink">
                      $
                      {client.totalSpent.toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="text-right py-2.5 pl-2 text-ink/50 text-xs hidden md:table-cell">
                      {client.lastOrderDate
                        ? format(client.lastOrderDate, "MMM d")
                        : "--"}
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
