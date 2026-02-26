"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Search } from "lucide-react";

type OrgResult = {
  id: string;
  name: string;
  email: string;
  tier: string;
};

type OrderResult = {
  id: string;
  orderNumber: string;
  status: string;
  organization: { name: string };
};

type InvoiceResult = {
  id: string;
  invoiceNumber: string;
  status: string;
  organization: { name: string };
};

type SearchResults = {
  organizations: OrgResult[];
  orders: OrderResult[];
  invoices: InvoiceResult[];
};

const TIER_COLORS: Record<string, string> = {
  VIP: "bg-[#0A0A0A] text-[#F9F7F4]",
  REPEAT: "bg-[#E5E1DB] text-[#0A0A0A]",
  NEW: "bg-[#F3F0EB] text-[#0A0A0A]/60",
};

const STATUS_COLORS: Record<string, string> = {
  OVERDUE: "bg-red-100 text-red-700",
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  DRAFT: "bg-[#F3F0EB] text-[#0A0A0A]/60",
  SHIPPED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CONFIRMED: "bg-sky-100 text-sky-700",
  CANCELLED: "bg-[#E5E1DB] text-[#0A0A0A]/40",
  PACKED: "bg-violet-100 text-violet-700",
};

function Badge({ label }: { label: string }) {
  const colorClass =
    TIER_COLORS[label] ?? STATUS_COLORS[label] ?? "bg-[#E5E1DB] text-[#0A0A0A]/60";
  return (
    <span
      className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 leading-tight uppercase tracking-wide ${colorClass}`}
    >
      {label}
    </span>
  );
}

function SearchPanel({
  query,
  setQuery,
  results,
  loading,
  open,
  navigate,
}: {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResults | null;
  loading: boolean;
  open: boolean;
  navigate: (path: string) => void;
}) {
  const hasResults =
    results &&
    (results.organizations.length > 0 ||
      results.orders.length > 0 ||
      results.invoices.length > 0);

  return (
    <>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#0A0A0A]/30 pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clients, orders..."
          className="pl-8 pr-8 h-8 text-sm border-[#E5E1DB] bg-white focus-visible:ring-0 focus-visible:border-[#0A0A0A] placeholder:text-[#0A0A0A]/30"
          autoFocus
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#0A0A0A]/30 animate-spin" />
        )}
      </div>

      {open && (
        <div className="bg-[#F9F7F4] border border-[#E5E1DB] shadow-sm mt-2">
          {!hasResults ? (
            <p className="px-3 py-4 text-sm text-[#0A0A0A]/40 text-center">
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            <>
              {results.organizations.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#0A0A0A]/40 px-3 py-2 border-b border-[#E5E1DB]">
                    Clients
                  </p>
                  {results.organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => navigate(`/admin/clients/${org.id}`)}
                      className="w-full px-3 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#0A0A0A]/5 cursor-pointer flex items-center justify-between gap-2 text-left"
                    >
                      <span className="truncate">
                        <span className="text-[#0A0A0A]/40 mr-1.5">›</span>
                        {org.name}
                        <span className="ml-1.5 text-xs text-[#0A0A0A]/40">
                          {org.email}
                        </span>
                      </span>
                      <Badge label={org.tier} />
                    </button>
                  ))}
                </div>
              )}
              {results.orders.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#0A0A0A]/40 px-3 py-2 border-b border-[#E5E1DB] border-t border-t-[#E5E1DB]">
                    Orders
                  </p>
                  {results.orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="w-full px-3 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#0A0A0A]/5 cursor-pointer flex items-center justify-between gap-2 text-left"
                    >
                      <span className="truncate">
                        <span className="text-[#0A0A0A]/40 mr-1.5">›</span>
                        {order.orderNumber}
                        <span className="ml-1.5 text-xs text-[#0A0A0A]/40">
                          {order.organization.name}
                        </span>
                      </span>
                      <Badge label={order.status} />
                    </button>
                  ))}
                </div>
              )}
              {results.invoices.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#0A0A0A]/40 px-3 py-2 border-b border-[#E5E1DB] border-t border-t-[#E5E1DB]">
                    Invoices
                  </p>
                  {results.invoices.map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => navigate(`/admin/invoices`)}
                      className="w-full px-3 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#0A0A0A]/5 cursor-pointer flex items-center justify-between gap-2 text-left"
                    >
                      <span className="truncate">
                        <span className="text-[#0A0A0A]/40 mr-1.5">›</span>
                        {inv.invoiceNumber}
                        <span className="ml-1.5 text-xs text-[#0A0A0A]/40">
                          {inv.organization.name}
                        </span>
                      </span>
                      <Badge label={inv.status} />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

export function AdminSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/search?q=${encodeURIComponent(query.trim())}`
        );
        if (res.ok) {
          const data: SearchResults = await res.json();
          setResults(data);
          setOpen(true);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDropdown();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function closeDropdown() {
    setOpen(false);
  }

  function navigate(path: string) {
    router.push(path);
    setQuery("");
    setResults(null);
    setOpen(false);
    setMobileOpen(false);
  }

  function handleMobileClose(isOpen: boolean) {
    setMobileOpen(isOpen);
    if (!isOpen) {
      setQuery("");
      setResults(null);
      setOpen(false);
    }
  }

  return (
    <>
      {/* Mobile search trigger — icon button, md:hidden */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-8 w-8"
        onClick={() => setMobileOpen(true)}
        aria-label="Search"
      >
        <Search className="h-4 w-4 text-[#0A0A0A]/60" />
      </Button>

      {/* Mobile search dialog */}
      <Dialog open={mobileOpen} onOpenChange={handleMobileClose}>
        <DialogContent className="bg-[#F9F7F4] border-[#E5E1DB] sm:max-w-md top-[10%] translate-y-0 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-base text-[#0A0A0A]">Search</DialogTitle>
          </DialogHeader>
          <SearchPanel
            query={query}
            setQuery={setQuery}
            results={results}
            loading={loading}
            open={open}
            navigate={navigate}
          />
        </DialogContent>
      </Dialog>

      {/* Desktop search — hidden on mobile */}
      <div ref={containerRef} className="relative hidden md:block w-64">
        {/* Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#0A0A0A]/30 pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients, orders..."
            className="pl-8 pr-8 h-8 text-sm border-[#E5E1DB] bg-white focus-visible:ring-0 focus-visible:border-[#0A0A0A] placeholder:text-[#0A0A0A]/30"
          />
          {loading && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#0A0A0A]/30 animate-spin" />
          )}
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-[#F9F7F4] border border-[#E5E1DB] shadow-sm z-50 min-w-[280px]">
            {!(results &&
              (results.organizations.length > 0 ||
                results.orders.length > 0 ||
                results.invoices.length > 0)) ? (
              <p className="px-3 py-4 text-sm text-[#0A0A0A]/40 text-center">
                No results for &ldquo;{query}&rdquo;
              </p>
            ) : (
              <>
                {results.organizations.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#0A0A0A]/40 px-3 py-2 border-b border-[#E5E1DB]">
                      Clients
                    </p>
                    {results.organizations.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => navigate(`/admin/clients/${org.id}`)}
                        className="w-full px-3 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#0A0A0A]/5 cursor-pointer flex items-center justify-between gap-2 text-left"
                      >
                        <span className="truncate">
                          <span className="text-[#0A0A0A]/40 mr-1.5">›</span>
                          {org.name}
                          <span className="ml-1.5 text-xs text-[#0A0A0A]/40">
                            {org.email}
                          </span>
                        </span>
                        <Badge label={org.tier} />
                      </button>
                    ))}
                  </div>
                )}
                {results.orders.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#0A0A0A]/40 px-3 py-2 border-b border-[#E5E1DB] border-t border-t-[#E5E1DB]">
                      Orders
                    </p>
                    {results.orders.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="w-full px-3 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#0A0A0A]/5 cursor-pointer flex items-center justify-between gap-2 text-left"
                      >
                        <span className="truncate">
                          <span className="text-[#0A0A0A]/40 mr-1.5">›</span>
                          {order.orderNumber}
                          <span className="ml-1.5 text-xs text-[#0A0A0A]/40">
                            {order.organization.name}
                          </span>
                        </span>
                        <Badge label={order.status} />
                      </button>
                    ))}
                  </div>
                )}
                {results.invoices.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#0A0A0A]/40 px-3 py-2 border-b border-[#E5E1DB] border-t border-t-[#E5E1DB]">
                      Invoices
                    </p>
                    {results.invoices.map((inv) => (
                      <button
                        key={inv.id}
                        onClick={() => navigate(`/admin/invoices`)}
                        className="w-full px-3 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#0A0A0A]/5 cursor-pointer flex items-center justify-between gap-2 text-left"
                      >
                        <span className="truncate">
                          <span className="text-[#0A0A0A]/40 mr-1.5">›</span>
                          {inv.invoiceNumber}
                          <span className="ml-1.5 text-xs text-[#0A0A0A]/40">
                            {inv.organization.name}
                          </span>
                        </span>
                        <Badge label={inv.status} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
