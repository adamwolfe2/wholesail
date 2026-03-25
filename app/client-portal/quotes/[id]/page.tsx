"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PortalLayout } from "@/components/portal-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  CreditCard,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";

interface QuoteItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: string;
  total: string;
  product: { name: string; unit: string };
}

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
  acceptedAt: string | null;
  convertedOrderId: string | null;
  rep: { name: string } | null;
  items: QuoteItem[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-neutral-100 text-neutral-500 border-neutral-200",
  SENT: "bg-neutral-200 text-neutral-700 border-neutral-300",
  ACCEPTED: "bg-neutral-900 text-white border-neutral-800",
  DECLINED: "bg-neutral-50 text-neutral-400 border-neutral-200",
  EXPIRED: "bg-neutral-50 text-neutral-300 border-neutral-200",
};

function ExpiryBadge({ expiresAt }: { expiresAt: string }) {
  const expiry = new Date(expiresAt);
  const expired = isPast(expiry);
  const daysLeft = differenceInDays(expiry, new Date());

  if (expired) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
        <AlertTriangle className="h-3 w-3" />
        Expired {format(expiry, "MMM d, yyyy")}
      </span>
    );
  }
  if (daysLeft <= 2) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
        <Clock className="h-3 w-3" />
        Expires in {daysLeft === 0 ? "less than a day" : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
      </span>
    );
  }
  return (
    <span className="text-xs text-ink/50">
      Expires {format(expiry, "MMM d, yyyy")}
    </span>
  );
}

export default function ClientQuoteDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;

  const isPaid = searchParams.get("paid") === "true";

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineInput, setShowDeclineInput] = useState(false);

  const fetchQuote = useCallback(async () => {
    try {
      const res = await fetch(`/api/client/quotes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setQuote(data.quote ?? null);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  async function handleAccept() {
    if (actionLoading) return;
    setActionLoading("accept");
    setError(null);
    try {
      const res = await fetch(`/api/client/quotes/${id}/accept`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to accept quote");
      }

      const data = await res.json();
      // Refresh quote and show the linked order
      await fetchQuote();
      // If there's an order number, could navigate — but refetch is sufficient
      void data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDecline() {
    if (actionLoading) return;
    if (!showDeclineInput) {
      setShowDeclineInput(true);
      return;
    }
    setActionLoading("decline");
    setError(null);
    try {
      const res = await fetch(`/api/client/quotes/${id}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: declineReason || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to decline quote");
      }

      await fetchQuote();
      setShowDeclineInput(false);
      setDeclineReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionLoading(null);
    }
  }

  async function handlePay() {
    if (payLoading) return;
    setPayLoading(true);
    setPayError(null);
    try {
      const res = await fetch(`/api/client/quotes/${id}/pay`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to start checkout");
      }

      if (data.demoMode) {
        router.push(`/client-portal/quotes/${id}?paid=true`);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      throw new Error("No checkout URL returned");
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPayLoading(false);
    }
  }

  // Determine if the quote is expired
  const isExpired =
    quote?.status === "EXPIRED" ||
    (quote?.expiresAt && isPast(new Date(quote.expiresAt)) && quote.status === "SENT");

  const canAct =
    quote &&
    (quote.status === "SENT" || quote.status === "DRAFT") &&
    !isExpired;

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-ink/50 hover:text-ink hover:bg-ink/[0.04] -ml-2"
            >
              <Link href="/client-portal/quotes">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Quotes
              </Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-sand" />
          </div>
        ) : !quote ? (
          <div className="text-center py-24">
            <p className="text-sm text-ink/50">Quote not found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Payment success banner */}
            {isPaid && (
              <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">
                  Payment received — your order is being prepared.
                </p>
              </div>
            )}

            {/* Expired warning banner */}
            {isExpired && quote.status !== "ACCEPTED" && quote.status !== "DECLINED" && (
              <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">
                  This quote has expired. Please contact your rep to receive a new quote.
                </p>
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
                    {quote.quoteNumber}
                  </h1>
                  <Badge
                    variant="outline"
                    className={`text-xs ${statusColors[quote.status] ?? ""}`}
                  >
                    {quote.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-sm text-ink/50">
                  <span>{format(new Date(quote.createdAt), "MMMM d, yyyy")}</span>
                  {quote.rep && (
                    <>
                      <span>&bull;</span>
                      <span>From {quote.rep.name}</span>
                    </>
                  )}
                  {quote.expiresAt && (
                    <>
                      <span>&bull;</span>
                      <ExpiryBadge expiresAt={quote.expiresAt} />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {/* Line Items */}
                <Card className="border-sand bg-cream">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg text-ink">
                      Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-0">
                      <div className="grid grid-cols-12 gap-2 text-xs text-ink/50 uppercase tracking-wider pb-2 border-b border-sand/50">
                        <div className="col-span-6">Product</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2 text-right">Unit Price</div>
                        <div className="col-span-2 text-right">Total</div>
                      </div>
                      {quote.items.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 gap-2 py-3 border-b border-sand/30 last:border-0"
                        >
                          <div className="col-span-6 text-sm font-medium text-ink">
                            {item.name}
                            <span className="text-xs text-ink/40 ml-1">
                              / {item.product.unit}
                            </span>
                          </div>
                          <div className="col-span-2 text-center text-sm text-ink/70">
                            {item.quantity}
                          </div>
                          <div className="col-span-2 text-right text-sm text-ink/70">
                            {formatCurrency(item.unitPrice)}
                          </div>
                          <div className="col-span-2 text-right text-sm font-semibold text-ink">
                            {formatCurrency(item.total)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 pt-4 border-t border-sand/50 mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ink/60">Subtotal</span>
                        <span>{formatCurrency(quote.subtotal)}</span>
                      </div>
                      {Number(quote.discount) > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-ink/60">Discount</span>
                          <span className="text-ink">
                            -{formatCurrency(quote.discount)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between font-semibold border-t border-sand/50 pt-2">
                        <span className="text-ink">Total</span>
                        <span className="font-serif text-xl text-ink">
                          {formatCurrency(quote.total)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {quote.notes && (
                  <Card className="border-sand bg-cream">
                    <CardHeader>
                      <CardTitle className="font-serif text-base text-ink">
                        Notes from Your Rep
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-ink/70 whitespace-pre-line">
                        {quote.notes}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                {canAct && (
                  <div className="space-y-3">
                    {error && (
                      <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2">
                        {error}
                      </p>
                    )}

                    {showDeclineInput && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-ink/60 uppercase tracking-wider">
                          Reason for declining (optional)
                        </label>
                        <textarea
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          placeholder="Let your rep know why you're declining..."
                          rows={2}
                          className="w-full border border-sand bg-white text-sm text-ink px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ink resize-none"
                        />
                      </div>
                    )}

                    <div className="flex gap-3 flex-wrap">
                      <Button
                        onClick={handleAccept}
                        disabled={!!actionLoading}
                        className="bg-ink text-cream hover:bg-ink/80 rounded-none flex-1 sm:flex-none min-h-[44px]"
                      >
                        {actionLoading === "accept" ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Accept Quote
                      </Button>
                      <Button
                        onClick={handleDecline}
                        disabled={!!actionLoading}
                        variant="outline"
                        className="border-sand text-ink hover:bg-ink/[0.04] rounded-none flex-1 sm:flex-none min-h-[44px]"
                      >
                        {actionLoading === "decline" ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        {showDeclineInput ? "Confirm Decline" : "Decline Quote"}
                      </Button>
                      {showDeclineInput && (
                        <Button
                          onClick={() => { setShowDeclineInput(false); setDeclineReason(""); }}
                          disabled={!!actionLoading}
                          variant="ghost"
                          className="text-ink/40 hover:text-ink rounded-none min-h-[44px]"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Accepted + Order Created */}
                {quote.status === "ACCEPTED" && !isPaid && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 px-4 py-3 border border-sand bg-sand/10">
                      <CheckCircle className="h-4 w-4 text-ink shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-ink font-medium">
                          Quote accepted
                          {quote.acceptedAt && (
                            <> on {format(new Date(quote.acceptedAt), "MMM d, yyyy")}</>
                          )}
                        </p>
                        {quote.convertedOrderId && (
                          <p className="text-xs text-ink/60 mt-0.5">
                            Order created.{" "}
                            <Link
                              href={`/client-portal/orders/${quote.convertedOrderId}`}
                              className="underline hover:text-ink"
                            >
                              View your order
                            </Link>
                          </p>
                        )}
                      </div>
                    </div>

                    {!quote.convertedOrderId && (
                      <>
                        {payError && (
                          <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2">
                            {payError}
                          </p>
                        )}
                        <Button
                          onClick={handlePay}
                          disabled={payLoading}
                          className="bg-ink text-cream hover:bg-ink/80 rounded-none w-full sm:w-auto min-h-[44px]"
                        >
                          {payLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Preparing checkout...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay Now — $
                              {Number(quote.total).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {quote.status === "ACCEPTED" && isPaid && (
                  <div className="flex items-center gap-2 px-4 py-3 border border-sand bg-sand/10">
                    <CheckCircle className="h-4 w-4 text-ink" />
                    <p className="text-sm text-ink">
                      Quote accepted
                      {quote.acceptedAt && (
                        <> on {format(new Date(quote.acceptedAt), "MMM d, yyyy")}</>
                      )}
                      . Payment received.
                    </p>
                  </div>
                )}

                {quote.status === "DECLINED" && (
                  <div className="flex items-center gap-2 px-4 py-3 border border-shell">
                    <XCircle className="h-4 w-4 text-ink/40" />
                    <p className="text-sm text-ink/60">
                      You declined this quote. Contact your rep if you&apos;d like a new one.
                    </p>
                  </div>
                )}

                {isExpired && quote.status !== "ACCEPTED" && quote.status !== "DECLINED" && (
                  <div className="flex items-center gap-2 px-4 py-3 border border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-700">
                      This quote has expired. Contact your rep for a new quote.
                    </p>
                  </div>
                )}
              </div>

              {/* Right column: Summary */}
              <div>
                <Card className="border-sand bg-cream">
                  <CardHeader>
                    <CardTitle className="font-serif text-base text-ink">
                      Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-ink/50 uppercase tracking-wider mb-0.5">
                        Status
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${statusColors[quote.status] ?? ""}`}
                      >
                        {quote.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-ink/50 uppercase tracking-wider mb-0.5">
                        Items
                      </p>
                      <p className="text-ink">{quote.items.length} products</p>
                    </div>
                    {Number(quote.discount) > 0 && (
                      <div>
                        <p className="text-xs text-ink/50 uppercase tracking-wider mb-0.5">
                          Discount
                        </p>
                        <p className="text-ink">
                          -{formatCurrency(quote.discount)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-ink/50 uppercase tracking-wider mb-0.5">
                        Total
                      </p>
                      <p className="font-serif text-xl font-bold text-ink">
                        {formatCurrency(quote.total)}
                      </p>
                    </div>
                    {quote.expiresAt && (
                      <div>
                        <p className="text-xs text-ink/50 uppercase tracking-wider mb-0.5">
                          Expiry
                        </p>
                        <ExpiryBadge expiresAt={quote.expiresAt} />
                      </div>
                    )}
                    {quote.rep && (
                      <div>
                        <p className="text-xs text-ink/50 uppercase tracking-wider mb-0.5">
                          Your Rep
                        </p>
                        <p className="text-ink">{quote.rep.name}</p>
                      </div>
                    )}
                    {quote.convertedOrderId && (
                      <div>
                        <p className="text-xs text-ink/50 uppercase tracking-wider mb-0.5">
                          Order
                        </p>
                        <Link
                          href={`/client-portal/orders/${quote.convertedOrderId}`}
                          className="text-ink underline hover:text-ink/70 text-sm"
                        >
                          View Order
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
