"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ArrowRight, Loader2, Send } from "lucide-react";

interface QuoteActionsProps {
  quoteId: string;
  status: string;
  convertedOrderId: string | null;
}

export function QuoteActions({ quoteId, status, convertedOrderId }: QuoteActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isTerminal =
    status === "DECLINED" || status === "EXPIRED" || convertedOrderId !== null;

  const canSend = status === "DRAFT";

  async function doAction(action: "accept" | "decline" | "convert" | "send") {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Action failed");
      }

      const data = await res.json();
      if (action === "convert" && data.orderId) {
        router.push(`/admin/orders/${data.orderId}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  if (isTerminal && !canSend) {
    return null;
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-red-600 border border-red-200 bg-red-50 px-3 py-2">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {canSend && (
          <Button
            onClick={() => doAction("send")}
            disabled={!!loading}
            className="bg-sky text-white hover:bg-sky/90 rounded-none"
          >
            {loading === "send" ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send to Client
          </Button>
        )}
        {!isTerminal && (
          <>
            <Button
              onClick={() => doAction("accept")}
              disabled={!!loading}
              className="bg-ink text-cream hover:bg-ink/80 rounded-none"
            >
              {loading === "accept" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Mark Accepted
            </Button>
            <Button
              onClick={() => doAction("decline")}
              disabled={!!loading}
              variant="outline"
              className="border-shell text-ink hover:bg-ink/[0.04] rounded-none"
            >
              {loading === "decline" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Mark Declined
            </Button>
            <Button
              onClick={() => doAction("convert")}
              disabled={!!loading}
              variant="outline"
              className="border-ink text-ink hover:bg-ink hover:text-cream rounded-none"
            >
              {loading === "convert" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              Convert to Order
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
