"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ExternalLink, Loader2, Unlink } from "lucide-react";

interface ConnectStatus {
  connected: boolean;
  stripeAccountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

export function StripeConnectPanel({ organizationId }: { organizationId: string }) {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/clients/${organizationId}/stripe-connect`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      // silently fail — panel will show loading state
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleConnect = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${organizationId}/stripe-connect`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.open(data.url, "_blank");
        }
        // Refresh status after a short delay (account may not be fully onboarded yet)
        setTimeout(fetchStatus, 2000);
      }
    } catch {
      // error handled silently
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect this Stripe account? Existing payments will not be affected.")) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${organizationId}/stripe-connect`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStatus({
          connected: false,
          stripeAccountId: null,
          chargesEnabled: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
        });
      }
    } catch {
      // error handled silently
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Stripe Connect
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Stripe Connect
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status?.connected ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3 border border-border bg-muted/30 p-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Account ID</p>
                <p className="font-mono text-sm">{status.stripeAccountId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Charges</p>
                <Badge
                  variant="outline"
                  className={
                    status.chargesEnabled
                      ? "bg-green-50 text-green-800 border-green-200"
                      : "bg-yellow-50 text-yellow-800 border-yellow-200"
                  }
                >
                  {status.chargesEnabled ? "Enabled" : "Pending"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Payouts</p>
                <Badge
                  variant="outline"
                  className={
                    status.payoutsEnabled
                      ? "bg-green-50 text-green-800 border-green-200"
                      : "bg-yellow-50 text-yellow-800 border-yellow-200"
                  }
                >
                  {status.payoutsEnabled ? "Enabled" : "Pending"}
                </Badge>
              </div>
            </div>

            {!status.detailsSubmitted && (
              <p className="text-sm text-muted-foreground">
                The connected account has not completed onboarding yet. Send them the onboarding link to finish setup.
              </p>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleConnect}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-1" />
                )}
                {status.detailsSubmitted ? "Open Onboarding" : "Resend Onboarding Link"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                disabled={actionLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Unlink className="h-4 w-4 mr-1" />
                )}
                Disconnect
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              No Stripe account connected. Connect a Stripe account so this client can receive payments directly.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnect}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <CreditCard className="h-4 w-4 mr-1" />
              )}
              Connect Stripe Account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
