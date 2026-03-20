"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import Link from "next/link";
import { PortalLayout } from "@/components/portal-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileCheck, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface Quote {
  id: string;
  quoteNumber: string;
  status: string;
  subtotal: string;
  discount: string;
  total: string;
  notes: string | null;
  expiresAt: string | null;
  createdAt: string;
  rep: { name: string } | null;
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-neutral-100 text-neutral-500 border-neutral-200",
  SENT: "bg-neutral-200 text-neutral-700 border-neutral-300",
  ACCEPTED: "bg-neutral-900 text-white border-neutral-800",
  DECLINED: "bg-neutral-50 text-neutral-400 border-neutral-200",
  EXPIRED: "bg-neutral-50 text-neutral-300 border-neutral-200",
};

export default function ClientQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const res = await fetch("/api/client/quotes");
        if (res.ok) {
          const data = await res.json();
          setQuotes(data.quotes ?? []);
        } else {
          setQuotes([]);
        }
      } catch {
        setQuotes([]);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchQuotes();
  }, []);

  return (
    <PortalLayout>
      <div className="space-y-6">
        {fetchError && (
          <div className="mb-4 rounded-none border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Unable to load data. Please refresh the page or try again later.
          </div>
        )}
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
            Quotes
          </h1>
          <p className="text-sm text-[#0A0A0A]/50 mt-0.5">
            Review and respond to pricing proposals from your account manager
          </p>
        </div>

        <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
          <CardHeader>
            <CardTitle className="font-serif text-lg text-[#0A0A0A]">
              Your Quotes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#C8C0B4]" />
              </div>
            ) : !quotes || quotes.length === 0 ? (
              <div className="text-center py-12">
                <FileCheck className="h-8 w-8 text-[#C8C0B4] mx-auto mb-3" />
                <p className="text-sm text-[#0A0A0A]/50">No quotes yet.</p>
                <p className="text-xs text-[#0A0A0A]/40 mt-1">
                  Your account manager will send you quotes when ready.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {quotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between py-3 border-b border-[#C8C0B4]/30 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-mono font-medium text-[#0A0A0A]">
                          {quote.quoteNumber}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusColors[quote.status] ?? ""}`}
                        >
                          {quote.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#0A0A0A]/50 mt-0.5">
                        {format(new Date(quote.createdAt), "MMM d, yyyy")}
                        {quote.rep && <> &bull; {quote.rep.name}</>}
                        {quote.expiresAt && (
                          <> &bull; Expires{" "}
                          {format(new Date(quote.expiresAt), "MMM d, yyyy")}</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-[#0A0A0A]">
                          {formatCurrency(quote.total)}
                        </p>
                        <p className="text-xs text-[#0A0A0A]/40">
                          {quote.items.length} item{quote.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-[#0A0A0A]/60 hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.06]"
                      >
                        <Link href={`/client-portal/quotes/${quote.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
