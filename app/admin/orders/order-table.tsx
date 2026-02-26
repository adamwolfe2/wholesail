"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Loader2, Search, ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { orderStatusColors as statusColors } from "@/lib/status-colors";

const PAGE_SIZE = 20;

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string;
  organization: { name: string };
  _count: { items: number };
  notes?: string | null;
}

export function OrderTable({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        !search ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.organization.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  // Reset page when filters change
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  const allSelected =
    paginatedOrders.length > 0 &&
    paginatedOrders.every((o) => selected.has(o.id));

  function toggleAll() {
    if (allSelected) {
      const next = new Set(selected);
      paginatedOrders.forEach((o) => next.delete(o.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      paginatedOrders.forEach((o) => next.add(o.id));
      setSelected(next);
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  }

  async function bulkUpdate(status: string) {
    if (selected.size === 0) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders/bulk-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: Array.from(selected),
          status,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.updated} order${data.updated > 1 ? "s" : ""} updated to ${status}`);
        setSelected(new Set());
        router.refresh();
      } else {
        toast.error("Failed to update orders");
      }
    } catch {
      toast.error("Failed to update orders");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div>
      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order # or client..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg border">
          <span className="text-sm font-medium shrink-0">
            {selected.size} order{selected.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={updating}
              onClick={() => bulkUpdate("CONFIRMED")}
            >
              {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
              Mark as Confirmed
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={updating}
              onClick={() => bulkUpdate("PACKED")}
            >
              Mark as Packed
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={updating}
              onClick={() => bulkUpdate("SHIPPED")}
            >
              Mark as Shipped
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={updating}>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {STATUSES.filter(
                  (s) => !["CONFIRMED", "PACKED", "SHIPPED"].includes(s)
                ).map((s) => (
                  <DropdownMenuItem key={s} onClick={() => bulkUpdate(s)}>
                    <Badge
                      variant="secondary"
                      className={`mr-2 ${statusColors[s] || ""}`}
                    >
                      {s}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelected(new Set())}
            className="ml-auto"
          >
            Clear
          </Button>
        </div>
      )}

      {paginatedOrders.length === 0 ? (
        <EmptyState
          icon={search || statusFilter !== "all" ? Search : ShoppingBag}
          title={search || statusFilter !== "all" ? "No Orders Match" : "No Orders Yet"}
          description={search || statusFilter !== "all" ? "Try a different search term or status filter." : "Orders will appear here once clients place them."}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-2 w-8">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="pb-3 font-medium">Order #</th>
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Items</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b hover:bg-muted/50 cursor-pointer"
                >
                  <td className="py-3 pr-2">
                    <Checkbox
                      checked={selected.has(order.id)}
                      onCheckedChange={() => toggleOne(order.id)}
                      aria-label={`Select ${order.orderNumber}`}
                    />
                  </td>
                  <td className="py-3 font-mono">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3">{order.organization.name}</td>
                  <td className="py-3 hidden sm:table-cell">{order._count.items}</td>
                  <td className="py-3">
                    ${Number(order.total).toFixed(2)}
                  </td>
                  <td className="py-3">
                    <Badge
                      variant="secondary"
                      className={statusColors[order.status] || ""}
                    >
                      {order.status}
                    </Badge>
                  </td>
                  <td className="py-3 hidden md:table-cell">
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-muted-foreground">
          Showing {(currentPage - 1) * PAGE_SIZE + 1}–
          {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} of{" "}
          {filteredOrders.length} orders
        </p>
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                  className={
                    currentPage <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={pageNum === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(pageNum);
                      }}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                  className={
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
