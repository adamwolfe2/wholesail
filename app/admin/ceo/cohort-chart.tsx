"use client";

import { useEffect, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CohortData {
  month: string;
  newClients: number;
  retained30d: number;
  retentionPct: number;
}

function CohortTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    const newClients =
      payload.find((p) => p.name === "newClients")?.value ?? 0;
    const retentionPct =
      payload.find((p) => p.name === "retentionPct")?.value ?? 0;
    const retained30d =
      payload.find((p) => p.name === "retained30d")?.value ?? 0;
    return (
      <div className="border border-shell bg-cream p-3 text-xs font-mono shadow-sm">
        <p className="text-ink/60 mb-2 font-semibold">{label}</p>
        <p className="text-ink">
          {newClients} client{newClients !== 1 ? "s" : ""} joined
        </p>
        <p className="text-ink/70">
          {retained30d} still ordering at 30d
        </p>
        <p className="font-bold text-ink mt-1">
          {retentionPct}% retained
        </p>
      </div>
    );
  }
  return null;
}

export function CohortChart() {
  const [data, setData] = useState<CohortData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/ceo/cohorts")
      .then((r) => r.json())
      .then((d) => {
        setData(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const hasData = data.some((d) => d.newClients > 0);

  return (
    <Card className="border-shell bg-cream">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg text-ink">
          New Client Cohort Retention
        </CardTitle>
        <p className="text-xs text-ink/50 mt-0.5">
          Clients joined each month vs. still ordering 30 days later
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[260px] flex items-center justify-center">
            <p className="text-sm text-ink/40">Loading cohort data…</p>
          </div>
        ) : error ? (
          <div className="h-[260px] flex items-center justify-center">
            <p className="text-sm text-ink/40">
              Could not load cohort data.
            </p>
          </div>
        ) : !hasData ? (
          <div className="h-[260px] flex items-center justify-center">
            <p className="text-sm text-ink/40 text-center">
              No client cohort data yet. Charts will populate once organizations
              are created.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart
              data={data}
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
                yAxisId="left"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#0A0A0A", opacity: 0.4 }}
                allowDecimals={false}
                width={30}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#0A0A0A", opacity: 0.4 }}
                tickFormatter={(v: number) => `${v}%`}
                domain={[0, 100]}
                width={40}
              />
              <Tooltip content={<CohortTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: "11px",
                  color: "#0A0A0A",
                  opacity: 0.5,
                  paddingTop: "8px",
                }}
                formatter={(value: string) => {
                  if (value === "newClients") return "Clients Joined";
                  if (value === "retentionPct") return "30d Retention %";
                  return value;
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="newClients"
                fill="#0A0A0A"
                opacity={0.15}
                barSize={28}
                radius={0}
                name="newClients"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="retentionPct"
                stroke="#0A0A0A"
                strokeWidth={2}
                dot={{ r: 4, fill: "#0A0A0A", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#0A0A0A" }}
                name="retentionPct"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
