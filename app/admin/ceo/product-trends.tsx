"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductTrendsData {
  products: string[];
  months: string[];
  data: Record<string, number | string>[];
}

// Five distinct monochrome-adjacent shades that stay on-brand
const PRODUCT_COLORS = [
  "#0A0A0A",
  "#4E4E4E",
  "#928E8A",
  "#C8B8A2",
  "#B4A898",
];

function ProductTrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="border border-shell bg-cream p-3 text-xs font-mono shadow-sm min-w-[160px]">
        <p className="text-ink/60 mb-2 font-semibold">{label}</p>
        {payload
          .slice()
          .sort((a, b) => b.value - a.value)
          .map((entry) => (
            <div key={entry.name} className="flex justify-between gap-4 mb-0.5">
              <span
                className="truncate max-w-[110px]"
                style={{ color: entry.color }}
              >
                {entry.name}
              </span>
              <span className="font-bold text-ink">
                $
                {entry.value.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          ))}
      </div>
    );
  }
  return null;
}

export function ProductTrends() {
  const [trendsData, setTrendsData] = useState<ProductTrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/ceo/product-trends")
      .then((r) => r.json())
      .then((d) => {
        setTrendsData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const hasData =
    trendsData &&
    trendsData.products.length > 0 &&
    trendsData.data.some((row) =>
      trendsData.products.some((p) => Number(row[p]) > 0)
    );

  return (
    <Card className="border-shell bg-cream">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg text-ink">
          Product Revenue Momentum — Top 5
        </CardTitle>
        <p className="text-xs text-ink/50 mt-0.5">
          Monthly revenue per product over last 6 months — reveals growth vs.
          decline
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[280px] flex items-center justify-center">
            <p className="text-sm text-ink/40">
              Loading product trends…
            </p>
          </div>
        ) : error ? (
          <div className="h-[280px] flex items-center justify-center">
            <p className="text-sm text-ink/40">
              Could not load product trend data.
            </p>
          </div>
        ) : !hasData ? (
          <div className="h-[280px] flex items-center justify-center">
            <p className="text-sm text-ink/40 text-center">
              No product trend data yet. Charts will populate once orders are
              placed.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={trendsData!.data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
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
              <Tooltip content={<ProductTrendTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: "11px",
                  color: "#0A0A0A",
                  opacity: 0.6,
                  paddingTop: "8px",
                }}
              />
              {trendsData!.products.map((productName, idx) => (
                <Line
                  key={productName}
                  type="monotone"
                  dataKey={productName}
                  stroke={PRODUCT_COLORS[idx % PRODUCT_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: PRODUCT_COLORS[idx % PRODUCT_COLORS.length],
                    strokeWidth: 0,
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
