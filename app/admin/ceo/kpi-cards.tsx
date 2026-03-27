import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
} from "lucide-react";

interface KpiData {
  totalRevenue: number;
  revenueThisMonth: number;
  activeClients: number;
  ordersThisMonth: number;
  ytdRevenue: number;
  ytdRevenueLastYear: number;
  outstandingAR: number;
}

interface ForecastData {
  forecastAmount: number;
  trendDirection: "up" | "flat" | "down";
  last30DayAvg: number;
  prev30DayAvg: number;
}

interface KpiCardsProps {
  kpis: KpiData;
  forecast: ForecastData;
  ytdChangePercent: number | null;
  nrrPct: number | null;
  trendIcon: string;
  trendColor: string;
  trendLabel: string;
}

export function KpiCards({
  kpis,
  forecast,
  ytdChangePercent,
  nrrPct,
  trendIcon,
  trendColor,
  trendLabel,
}: KpiCardsProps) {
  return (
    <>
      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        {/* Total Revenue */}
        <div className="xl:col-span-1">
          <Card className="border-shell bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-sand" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-ink">
                $
                {kpis.totalRevenue.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
              <p className="text-xs text-ink/40 mt-1">
                Cumulative all-time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* YTD vs Last Year */}
        <div className="xl:col-span-1">
          <Card className="border-shell bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                YTD Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-sand" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-ink">
                $
                {kpis.ytdRevenue.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
              {ytdChangePercent !== null ? (
                <p
                  className={`text-xs mt-1 font-medium ${
                    ytdChangePercent >= 0 ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {ytdChangePercent >= 0 ? "+" : ""}
                  {ytdChangePercent.toFixed(1)}% vs last year
                </p>
              ) : (
                <p className="text-xs text-ink/40 mt-1">
                  $
                  {kpis.ytdRevenueLastYear.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  last year
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* MRR (Revenue This Month) */}
        <div className="xl:col-span-1">
          <Card className="border-shell bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                Revenue This Month
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-sand" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-ink">
                $
                {kpis.revenueThisMonth.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
              <p className="text-xs text-ink/40 mt-1">Month to date</p>
            </CardContent>
          </Card>
        </div>

        {/* Outstanding AR */}
        <div className="xl:col-span-1">
          <Card className="border-shell bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                Outstanding AR
              </CardTitle>
              <FileText className="h-4 w-4 text-sand" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-ink">
                $
                {kpis.outstandingAR.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
              <p className="text-xs text-ink/40 mt-1">
                Pending + overdue invoices
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Clients */}
        <div className="xl:col-span-1">
          <Card className="border-shell bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                Active Clients
              </CardTitle>
              <Users className="h-4 w-4 text-sand" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-ink">
                {kpis.activeClients}
              </div>
              <p className="text-xs text-ink/40 mt-1">
                Active organizations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Orders This Month */}
        <div className="xl:col-span-1">
          <Card className="border-shell bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                Orders This Month
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-sand" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-ink">
                {kpis.ordersThisMonth}
              </div>
              <p className="text-xs text-ink/40 mt-1">Month to date</p>
            </CardContent>
          </Card>
        </div>

        {/* Next 30 Days Forecast */}
        <div className="xl:col-span-1">
          <Card className="border-shell bg-cream">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                30-Day Forecast
              </CardTitle>
              {forecast.trendDirection === "up" ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : forecast.trendDirection === "down" ? (
                <TrendingDown className="h-4 w-4 text-red-400" />
              ) : (
                <Minus className="h-4 w-4 text-sand" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-ink">
                $
                {forecast.forecastAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
              <p className={`text-xs mt-1 font-medium ${trendColor}`}>
                {trendIcon} {trendLabel}
              </p>
              <p className="text-[10px] text-ink/30 mt-0.5">
                Based on last 90 days
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Second KPI Row: Net Revenue Retention */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-shell bg-cream">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
              Net Revenue Retention
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-sand" />
          </CardHeader>
          <CardContent>
            {nrrPct !== null ? (
              <>
                <div
                  className={`text-3xl font-bold font-serif ${
                    nrrPct >= 100
                      ? "text-emerald-600"
                      : nrrPct >= 75
                        ? "text-ink"
                        : "text-red-500"
                  }`}
                >
                  {nrrPct}%
                </div>
                <p className="text-xs text-ink/40 mt-1">
                  Existing client spend vs last month
                </p>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold font-serif text-ink/30">
                  --
                </div>
                <p className="text-xs text-ink/40 mt-1">
                  No prior month data yet
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
