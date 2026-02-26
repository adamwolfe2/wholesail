"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface CategoryRevenue {
  category: string;
  revenue: number;
}

interface CeoChartsProps {
  monthlyRevenue: MonthlyRevenue[];
  categoryRevenue: CategoryRevenue[];
}

const CATEGORY_COLORS = [
  "#0A0A0A",
  "#2C2C2C",
  "#4E4E4E",
  "#706E6B",
  "#928E8A",
  "#B4B0AB",
  "#C8C0B4",
  "#DDD9D3",
];

function CustomTooltip({
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
      <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-2 text-xs font-mono shadow-sm">
        <p className="text-[#0A0A0A]/60 mb-1">{label}</p>
        <p className="font-bold text-[#0A0A0A]">
          ${payload[0].value.toLocaleString("en-US")}
        </p>
      </div>
    );
  }
  return null;
}

function CategoryTooltip({
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
      <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-2 text-xs font-mono shadow-sm">
        <p className="text-[#0A0A0A]/60 mb-1">{label}</p>
        <p className="font-bold text-[#0A0A0A]">
          ${payload[0].value.toLocaleString("en-US")}
        </p>
      </div>
    );
  }
  return null;
}

export function CeoCharts({ monthlyRevenue, categoryRevenue }: CeoChartsProps) {
  const hasRevenueData = monthlyRevenue.some((m) => m.revenue > 0);
  const hasCategoryData = categoryRevenue.some((c) => c.revenue > 0);

  return (
    <div className="space-y-6">
      {/* Revenue Trend — Area Chart */}
      <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-lg text-[#0A0A0A]">
            Revenue Trend — Last 12 Months
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasRevenueData ? (
            <p className="text-sm text-[#0A0A0A]/40 py-8 text-center">
              No revenue data yet. Charts will populate once orders are placed.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={monthlyRevenue}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F9F7F4" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#F9F7F4" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#0A0A0A", opacity: 0.4 }}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#0A0A0A", opacity: 0.4 }}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`
                  }
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0A0A0A"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  fillOpacity={1}
                  dot={false}
                  activeDot={{ r: 4, fill: "#0A0A0A", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Category Revenue — Horizontal Bar Chart */}
      <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-lg text-[#0A0A0A]">
            Revenue by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasCategoryData ? (
            <p className="text-sm text-[#0A0A0A]/40 py-8 text-center">
              No category data yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, categoryRevenue.length * 42)}>
              <BarChart
                layout="vertical"
                data={categoryRevenue}
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#0A0A0A", opacity: 0.4 }}
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
                  tick={{ fill: "#0A0A0A", opacity: 0.6 }}
                  width={130}
                />
                <Tooltip content={<CategoryTooltip />} />
                <Bar dataKey="revenue" radius={0} barSize={18}>
                  {categoryRevenue.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
