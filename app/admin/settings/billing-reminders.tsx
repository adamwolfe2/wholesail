"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, Loader2, Send, CheckCircle2 } from "lucide-react";

interface BillingRemindersProps {
  overdueCount: number;
  dueSoonCount: number;
}

export function BillingReminders({ overdueCount, dueSoonCount }: BillingRemindersProps) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSendReminders() {
    setSending(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/billing/reminders", { method: "GET" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send reminders.");
        return;
      }

      setResult({ sent: data.sent, skipped: data.skipped });
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
      <CardHeader>
        <CardTitle className="font-serif text-lg text-[#0A0A0A]">
          Billing Reminders
        </CardTitle>
        <CardDescription className="text-[#0A0A0A]/50 text-sm">
          Net-30 invoice payment reminders. Reminders re-send at most once every 7 days.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 border border-[#E5E1DB] p-3 bg-white">
            <AlertCircle className="h-5 w-5 text-[#C8C0B4] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#0A0A0A]/50 uppercase tracking-wider font-medium">
                Overdue Invoices
              </p>
              <p className="font-serif text-2xl font-bold text-[#0A0A0A] mt-0.5">
                {overdueCount}
              </p>
            </div>
            {overdueCount > 0 && (
              <Badge className="bg-[#0A0A0A] text-[#F9F7F4] border-0 text-xs shrink-0">
                Action needed
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 border border-[#E5E1DB] p-3 bg-white">
            <Clock className="h-5 w-5 text-[#C8C0B4] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#0A0A0A]/50 uppercase tracking-wider font-medium">
                Due in Next 5 Days
              </p>
              <p className="font-serif text-2xl font-bold text-[#0A0A0A] mt-0.5">
                {dueSoonCount}
              </p>
            </div>
            {dueSoonCount > 0 && (
              <Badge className="bg-[#C8C0B4] text-[#0A0A0A] border-0 text-xs shrink-0">
                Due soon
              </Badge>
            )}
          </div>
        </div>

        {/* Result / Error Feedback */}
        {result && (
          <div className="flex items-center gap-2 border border-[#E5E1DB] bg-white px-3 py-2 text-sm text-[#0A0A0A]">
            <CheckCircle2 className="h-4 w-4 text-[#0A0A0A] shrink-0" />
            <span>
              Sent <strong>{result.sent}</strong> reminder
              {result.sent !== 1 ? "s" : ""}
              {result.skipped > 0 && (
                <>, skipped <strong>{result.skipped}</strong> (already sent recently)</>
              )}
            </span>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* Action Button */}
        <Button
          onClick={handleSendReminders}
          disabled={sending || (overdueCount === 0 && dueSoonCount === 0)}
          className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 h-9"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Reminders Now
            </>
          )}
        </Button>

        {overdueCount === 0 && dueSoonCount === 0 && (
          <p className="text-xs text-[#0A0A0A]/40">
            No invoices require reminders at this time.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
