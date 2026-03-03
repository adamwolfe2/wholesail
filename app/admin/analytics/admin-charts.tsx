"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  Line,
  LineChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface AdminChartsProps {
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  topClients: { name: string; revenue: number; orders: number }[];
  statusBreakdown: { status: string; count: number }[];
  /** Legacy: product counts per category — still used for the donut */
  topCategories: { category: string; count: number }[];
  /** Revenue per category — used for the horizontal bar chart */
  topCategoryRevenue: { category: string; revenue: number }[];
  /** AOV per month — last 6 months */
  aovByMonth: { month: string; aov: number }[];
  /** Order count per day of week */
  dayOfWeekCounts: { day: string; orders: number }[];
}

const statusColors: Record<string, string> = {
  PENDING: "#a1a1aa",
  CONFIRMED: "#71717a",
  PACKED: "#52525b",
  SHIPPED: "#3f3f46",
  DELIVERED: "#18181b",
  CANCELLED: "#d4d4d8",
};

const pieFills = ["#18181b", "#3f3f46", "#71717a", "#a1a1aa", "#d4d4d8", "#e4e4e7"];

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded border bg-background p-2 text-xs shadow-sm">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className="font-bold">${payload[0].value.toLocaleString("en-US")}</p>
      </div>
    );
  }
  return null;
}

function AovTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="border bg-background p-2 text-xs shadow-sm">
        <p className="text-[#0A0A0A]/50 mb-1">{label}</p>
        <p className="font-bold">
          ${payload[0].value.toLocaleString("en-US")} AOV
        </p>
      </div>
    );
  }
  return null;
}

function DayTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="border bg-background p-2 text-xs shadow-sm">
        <p className="font-bold">
          {payload[0].value} orders on {label}s
        </p>
      </div>
    );
  }
  return null;
}

export function AdminCharts({
  monthlyRevenue,
  topClients,
  statusBreakdown,
  topCategories,
  topCategoryRevenue,
  aovByMonth,
  dayOfWeekCounts,
}: AdminChartsProps) {
  const hasData = monthlyRevenue.some((m) => m.revenue > 0);

  if (!hasData && topClients.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No data to display yet. Charts will populate once orders are placed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly Revenue Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
          <CardDescription>Revenue trend over the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: { label: "Revenue", color: "#18181b" },
            }}
            className="h-[250px] sm:h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyRevenue}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`
                  }
                  width={48}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) => [
                    `$${Number(value).toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Bar dataKey="revenue" fill="#18181b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Status Breakdown — Donut */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Distribution of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {statusBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <>
                <ChartContainer
                  config={{ count: { label: "Count" } }}
                  className="h-[220px] sm:h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={45}
                        strokeWidth={2}
                        stroke="#fff"
                      >
                        {statusBreakdown.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={statusColors[entry.status] || "#a1a1aa"}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {statusBreakdown.map((entry) => (
                    <div
                      key={entry.status}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="h-3 w-3 rounded-sm shrink-0"
                        style={{
                          backgroundColor:
                            statusColors[entry.status] || "#a1a1aa",
                        }}
                      />
                      <span className="text-muted-foreground">
                        {entry.status}
                      </span>
                      <span className="font-medium ml-auto">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Top Categories by Revenue — Horizontal Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <CardDescription>
              Top product categories by total revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topCategoryRevenue.length === 0 ? (
              /* Fallback: show product counts if no revenue data */
              topCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No products in database yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {topCategories.map((cat, index) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-sm shrink-0"
                            style={{ backgroundColor: pieFills[index % pieFills.length] }}
                          />
                          <span className="text-muted-foreground truncate max-w-[140px]">
                            {cat.category}
                          </span>
                        </div>
                        <span className="font-medium">{cat.count} products</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <ResponsiveContainer
                width="100%"
                height={Math.max(180, topCategoryRevenue.length * 44)}
              >
                <BarChart
                  layout="vertical"
                  data={topCategoryRevenue}
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={130}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Bar dataKey="revenue" radius={0} barSize={18}>
                    {topCategoryRevenue.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieFills[index % pieFills.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AOV + Day of Week — 2-column grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart A: AOV over last 6 months */}
        <Card>
          <CardHeader>
            <CardTitle>Average Order Value — 6 Months</CardTitle>
            <CardDescription>Monthly AOV trend for non-cancelled orders</CardDescription>
          </CardHeader>
          <CardContent>
            {aovByMonth.every((m) => m.aov === 0) ? (
              <p className="text-sm text-[#0A0A0A]/50">No order data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={aovByMonth}
                  margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis hide />
                  <Tooltip content={<AovTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="aov"
                    stroke="#0A0A0A"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#0A0A0A", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#0A0A0A" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Chart B: Orders by day of week */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Day of Week</CardTitle>
            <CardDescription>Order volume distribution — last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {dayOfWeekCounts.every((d) => d.orders === 0) ? (
              <p className="text-sm text-[#0A0A0A]/50">No order data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={dayOfWeekCounts}
                  margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis hide />
                  <Tooltip content={<DayTooltip />} />
                  <Bar dataKey="orders" fill="#0A0A0A" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 10 Clients by Revenue — Progress Bars */}
      {topClients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Clients by Revenue</CardTitle>
            <CardDescription>
              Your highest-value client relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClients.map((client, idx) => {
                const maxRevenue = topClients[0].revenue || 1;
                return (
                  <div key={client.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold"
                        >
                          {idx + 1}
                        </Badge>
                        <span className="font-medium">{client.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {client.orders} orders
                        </span>
                        <span className="font-semibold tabular-nums">
                          ${client.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-foreground rounded-full transition-all"
                        style={{
                          width: `${(client.revenue / maxRevenue) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
