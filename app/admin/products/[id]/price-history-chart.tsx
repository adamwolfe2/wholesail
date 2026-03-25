"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface PricePoint {
  date: string;
  price: number;
  oldPrice: number | null;
  changedBy: string;
}

interface PriceHistoryChartProps {
  productId: string;
  currentPrice: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: PricePoint }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;

  return (
    <div className="border border-shell bg-cream p-3 text-xs shadow-sm">
      <p className="font-medium text-ink mb-1">
        {label ? format(new Date(label), "MMM d, yyyy") : ""}
      </p>
      <p className="text-ink">
        New price:{" "}
        <span className="font-semibold">{formatCurrency(point.price)}</span>
      </p>
      {point.oldPrice !== null && (
        <p className="text-ink/60">
          Was: {formatCurrency(point.oldPrice)}
        </p>
      )}
      <p className="text-ink/50 mt-1">Changed by: {point.changedBy}</p>
    </div>
  );
}

export function PriceHistoryChart({
  productId,
  currentPrice,
}: PriceHistoryChartProps) {
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/products/${productId}/price-history`)
      .then((r) => r.json())
      .then((data) => {
        setHistory(data.history ?? []);
      })
      .catch(() => {
        setHistory([]);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-sm text-ink/40">Loading price history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="border border-dashed border-shell p-6 text-center">
        <p className="text-sm text-ink/50">
          No price changes recorded yet — price changes going forward will
          appear here.
        </p>
        <p className="text-xs text-ink/30 mt-1">
          Current price: {formatCurrency(currentPrice)}
        </p>
      </div>
    );
  }

  // Add a synthetic "today" point at the current price so the chart extends to now
  const lastEntry = history[history.length - 1];
  const chartData: PricePoint[] =
    lastEntry.price !== currentPrice
      ? [
          ...history,
          {
            date: new Date().toISOString(),
            price: currentPrice,
            oldPrice: lastEntry.price,
            changedBy: "Current",
          },
        ]
      : history;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={chartData}
        margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
      >
        <CartesianGrid stroke="#E5E1DB" strokeDasharray="4 4" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => format(new Date(v), "MMM d")}
          tick={{ fontSize: 11, fill: "#0A0A0A99" }}
          axisLine={{ stroke: "#E5E1DB" }}
          tickLine={false}
          minTickGap={40}
        />
        <YAxis
          tickFormatter={(v) => `$${v}`}
          tick={{ fontSize: 11, fill: "#0A0A0A99" }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="stepAfter"
          dataKey="price"
          stroke="#0A0A0A"
          strokeWidth={2}
          dot={{ fill: "#0A0A0A", r: 4, strokeWidth: 0 }}
          activeDot={{ fill: "#0A0A0A", r: 5, strokeWidth: 2, stroke: "#F9F7F4" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
