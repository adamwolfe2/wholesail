"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "30days", label: "Last 30 Days" },
  { value: "custom", label: "Custom Range" },
] as const;

interface OrderFiltersProps {
  searchParams: {
    status?: string | string[];
    dateRange?: string;
    dateFrom?: string;
    dateTo?: string;
    minAmount?: string;
    maxAmount?: string;
    client?: string;
    source?: string;
  };
}

export function OrderFilters({ searchParams: sp }: OrderFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentStatus = Array.isArray(sp.status)
    ? sp.status[0]
    : (sp.status ?? "all");
  const currentDateRange = sp.dateRange ?? "all";
  const currentSource = sp.source ?? "all";

  const hasFilters = !!(
    (sp.status && sp.status !== "all") ||
    (sp.dateRange && sp.dateRange !== "all") ||
    sp.dateFrom ||
    sp.dateTo ||
    sp.minAmount ||
    sp.maxAmount ||
    sp.client ||
    (sp.source && sp.source !== "all")
  );

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams();
      // Preserve existing params
      if (sp.status && sp.status !== "all") params.set("status", Array.isArray(sp.status) ? sp.status[0] : sp.status);
      if (sp.dateRange && sp.dateRange !== "all") params.set("dateRange", sp.dateRange);
      if (sp.dateFrom) params.set("dateFrom", sp.dateFrom);
      if (sp.dateTo) params.set("dateTo", sp.dateTo);
      if (sp.minAmount) params.set("minAmount", sp.minAmount);
      if (sp.maxAmount) params.set("maxAmount", sp.maxAmount);
      if (sp.client) params.set("client", sp.client);
      if (sp.source && sp.source !== "all") params.set("source", sp.source);
      // Apply update
      if (value === null || value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [sp, router, pathname]
  );

  function clearAll() {
    router.push(pathname);
  }

  return (
    <div className="bg-card border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Filters</p>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-7 text-xs gap-1.5"
          >
            <X className="h-3 w-3" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Status */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={currentStatus}
            onValueChange={(v) => updateParam("status", v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Date Range</Label>
          <Select
            value={currentDateRange}
            onValueChange={(v) => {
              updateParam("dateRange", v);
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              {DATE_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Source</Label>
          <Select
            value={currentSource}
            onValueChange={(v) => updateParam("source", v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="portal">Portal</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Min Amount */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Min Amount</Label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
            <Input
              type="number"
              min="0"
              step="1"
              placeholder="0"
              defaultValue={sp.minAmount ?? ""}
              className="h-8 text-xs pl-5"
              onBlur={(e) => updateParam("minAmount", e.target.value || null)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateParam("minAmount", (e.target as HTMLInputElement).value || null);
                }
              }}
            />
          </div>
        </div>

        {/* Max Amount */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Max Amount</Label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
            <Input
              type="number"
              min="0"
              step="1"
              placeholder="Any"
              defaultValue={sp.maxAmount ?? ""}
              className="h-8 text-xs pl-5"
              onBlur={(e) => updateParam("maxAmount", e.target.value || null)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateParam("maxAmount", (e.target as HTMLInputElement).value || null);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Second row: Client search + custom date range */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Client search */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Client Name</Label>
          <Input
            type="text"
            placeholder="Search by org name..."
            defaultValue={sp.client ?? ""}
            className="h-8 text-xs"
            onBlur={(e) => updateParam("client", e.target.value || null)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParam("client", (e.target as HTMLInputElement).value || null);
              }
            }}
          />
        </div>

        {/* Custom date range — only show when dateRange=custom */}
        {currentDateRange === "custom" && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">From Date</Label>
              <Input
                type="date"
                defaultValue={sp.dateFrom ?? ""}
                className="h-8 text-xs"
                onChange={(e) => updateParam("dateFrom", e.target.value || null)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">To Date</Label>
              <Input
                type="date"
                defaultValue={sp.dateTo ?? ""}
                className="h-8 text-xs"
                onChange={(e) => updateParam("dateTo", e.target.value || null)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
