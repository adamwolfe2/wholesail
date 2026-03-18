import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink, Download } from "lucide-react";

export const metadata: Metadata = { title: "Quote Details" };
import { quoteStatusColors } from "@/lib/status-colors";
import { QuoteActions } from "./quote-actions";

interface QuoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  const { id } = await params;

  let quote: Awaited<ReturnType<typeof getQuote>> = null;
  let auditEvents: Awaited<ReturnType<typeof getQuoteAuditEvents>> = [];

  try {
    quote = await getQuote(id);
    auditEvents = await getQuoteAuditEvents(id);
  } catch {
    // DB not connected
  }

  if (!quote) {
    notFound();
  }

  // Build timeline from createdAt + audit events + expiresAt
  const timeline = buildTimeline(quote, auditEvents);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-[#0A0A0A]/50 hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.04] rounded-none -ml-2"
            >
              <Link href="/admin/quotes">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Quotes
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
              {quote.quoteNumber}
            </h2>
            <Badge
              variant="outline"
              className={`text-xs ${quoteStatusColors[quote.status] ?? ""}`}
            >
              {quote.status}
            </Badge>
          </div>
          <p className="text-sm text-[#0A0A0A]/50 mt-1">
            {quote.organization.name}
            {quote.rep && <> &bull; Rep: {quote.rep.name}</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            asChild
            className="border-[#E5E1DB] text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.04] rounded-none"
          >
            <a href={`/api/admin/quotes/${quote.id}/pdf`} download>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </a>
          </Button>
          {quote.convertedOrderId && (
            <Button
              variant="outline"
              asChild
              className="border-[#E5E1DB] text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.04] rounded-none"
            >
              <Link href={`/admin/orders/${quote.convertedOrderId}`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Order
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Items + Totals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items */}
          <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
            <CardHeader>
              <CardTitle className="font-serif text-lg text-[#0A0A0A]">
                Line Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                <div className="grid grid-cols-12 gap-2 text-xs text-[#0A0A0A]/50 uppercase tracking-wider pb-2 border-b border-[#E5E1DB]">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                {quote.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 py-3 border-b border-[#E5E1DB] last:border-0"
                  >
                    <div className="col-span-6 text-sm font-medium text-[#0A0A0A]">
                      {item.name}
                    </div>
                    <div className="col-span-2 text-center text-sm text-[#0A0A0A]/70">
                      {item.quantity}
                    </div>
                    <div className="col-span-2 text-right text-sm text-[#0A0A0A]/70">
                      ${Number(item.unitPrice).toFixed(2)}
                    </div>
                    <div className="col-span-2 text-right text-sm font-semibold text-[#0A0A0A]">
                      ${Number(item.total).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-[#E5E1DB] mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#0A0A0A]/60">Subtotal</span>
                  <span>${Number(quote.subtotal).toFixed(2)}</span>
                </div>
                {Number(quote.discount) > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#0A0A0A]/60">Discount</span>
                    <span>−${Number(quote.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between font-semibold border-t border-[#E5E1DB] pt-2">
                  <span className="text-[#0A0A0A]">Total</span>
                  <span className="font-serif text-xl text-[#0A0A0A]">
                    ${Number(quote.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {quote.notes && (
            <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
              <CardHeader>
                <CardTitle className="font-serif text-base text-[#0A0A0A]">
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#0A0A0A]/70 whitespace-pre-line">
                  {quote.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Client Response Banner */}
          {(quote.status === "ACCEPTED" || quote.status === "DECLINED") && (
            <Card
              className={`border-[#E5E1DB] ${
                quote.status === "ACCEPTED"
                  ? "bg-[#F0FDF4] border-green-200"
                  : "bg-[#FFF7F7] border-red-100"
              }`}
            >
              <CardContent className="pt-4 pb-4">
                <p className="text-sm font-medium text-[#0A0A0A]">
                  {quote.status === "ACCEPTED" ? (
                    <>
                      Client accepted this quote
                      {quote.acceptedAt && (
                        <> on {format(new Date(quote.acceptedAt), "MMM d, yyyy 'at' h:mm a")}</>
                      )}
                      .
                      {quote.convertedOrderId && (
                        <>
                          {" "}
                          <Link
                            href={`/admin/orders/${quote.convertedOrderId}`}
                            className="underline hover:opacity-70"
                          >
                            View created order
                          </Link>
                        </>
                      )}
                    </>
                  ) : (
                    <>Client declined this quote.</>
                  )}
                </p>
                {/* Look for decline reason in audit events */}
                {quote.status === "DECLINED" && (() => {
                  const declineEvent = auditEvents.find(
                    (e) => e.action === "quote_declined_by_client" && e.metadata
                  );
                  const reason = declineEvent?.metadata
                    ? (declineEvent.metadata as Record<string, string>).reason
                    : null;
                  return reason ? (
                    <p className="text-xs text-[#0A0A0A]/60 mt-1 italic">&ldquo;{reason}&rdquo;</p>
                  ) : null;
                })()}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div>
            <QuoteActions
              quoteId={quote.id}
              status={quote.status}
              convertedOrderId={quote.convertedOrderId}
            />
          </div>
        </div>

        {/* Right column: Details + Status History */}
        <div className="space-y-6">
          {/* Details */}
          <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
            <CardHeader>
              <CardTitle className="font-serif text-base text-[#0A0A0A]">
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-[#0A0A0A]/50 uppercase tracking-wider mb-0.5">
                  Client
                </p>
                <Link
                  href={`/admin/clients/${quote.organization.id}`}
                  className="font-medium text-[#0A0A0A] hover:underline"
                >
                  {quote.organization.name}
                </Link>
              </div>
              {quote.rep && (
                <div>
                  <p className="text-xs text-[#0A0A0A]/50 uppercase tracking-wider mb-0.5">
                    Sales Rep
                  </p>
                  <p className="text-[#0A0A0A]">{quote.rep.name}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-[#0A0A0A]/50 uppercase tracking-wider mb-0.5">
                  Created
                </p>
                <p className="text-[#0A0A0A]">
                  {format(quote.createdAt, "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              {quote.sentAt && (
                <div>
                  <p className="text-xs text-[#0A0A0A]/50 uppercase tracking-wider mb-0.5">
                    Sent
                  </p>
                  <p className="text-[#0A0A0A]">
                    {format(quote.sentAt, "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              )}
              {quote.expiresAt && (
                <div>
                  <p className="text-xs text-[#0A0A0A]/50 uppercase tracking-wider mb-0.5">
                    Expires
                  </p>
                  <p className="text-[#0A0A0A]">
                    {format(quote.expiresAt, "MMM d, yyyy")}
                  </p>
                </div>
              )}
              {quote.convertedOrderId && (
                <div>
                  <p className="text-xs text-[#0A0A0A]/50 uppercase tracking-wider mb-0.5">
                    Converted Order
                  </p>
                  <Link
                    href={`/admin/orders/${quote.convertedOrderId}`}
                    className="font-medium text-[#0A0A0A] hover:underline"
                  >
                    View Order
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status History */}
          <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
            <CardHeader>
              <CardTitle className="font-serif text-base text-[#0A0A0A]">
                Status History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-4">
                {timeline.map((event, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 mt-1.5 shrink-0 ${
                        event.active ? "bg-[#0A0A0A]" : "bg-[#C8C0B4]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          event.active ? "text-[#0A0A0A]" : "text-[#0A0A0A]/40"
                        }`}
                      >
                        {event.label}
                      </p>
                      {event.actor && (
                        <p className="text-xs text-[#0A0A0A]/40 truncate">{event.actor}</p>
                      )}
                      <p className="text-xs text-[#0A0A0A]/50">
                        {format(event.date, "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Data fetchers ─────────────────────────────────────────────────────────────

async function getQuote(id: string) {
  return prisma.quote.findUnique({
    where: { id },
    include: {
      organization: { select: { id: true, name: true } },
      rep: { select: { name: true } },
      items: {
        include: { product: { select: { name: true, unit: true } } },
      },
    },
  });
}

async function getQuoteAuditEvents(quoteId: string) {
  return prisma.auditEvent.findMany({
    where: { entityType: "Quote", entityId: quoteId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });
}

// ── Timeline builder ──────────────────────────────────────────────────────────

type AuditEventRow = Awaited<ReturnType<typeof getQuoteAuditEvents>>[number];

function buildTimeline(
  quote: NonNullable<Awaited<ReturnType<typeof getQuote>>>,
  auditEvents: AuditEventRow[]
): { label: string; date: Date; active: boolean; actor?: string }[] {
  const events: { label: string; date: Date; active: boolean; actor?: string }[] = [];

  events.push({ label: "Quote Created", date: quote.createdAt, active: true });

  // Append audit events in order
  for (const ev of auditEvents) {
    const label = ACTION_LABELS[ev.action] ?? ev.action;
    const actor = ev.user?.name ?? undefined;
    events.push({ label, date: ev.createdAt, active: true, actor });
  }

  // Pending expiry (future)
  if (quote.expiresAt && new Date() < quote.expiresAt) {
    events.push({
      label: "Expires",
      date: quote.expiresAt,
      active: false,
    });
  }

  return events;
}

const ACTION_LABELS: Record<string, string> = {
  quote_sent_to_client: "Sent to Client",
  quote_accepted_by_client: "Accepted by Client",
  quote_declined_by_client: "Declined by Client",
  converted_to_order: "Converted to Order",
  quote_checkout_initiated: "Checkout Initiated",
  quote_converted_to_order_demo: "Order Created (Demo)",
};
