"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  projectId: string;
  stripeAccountId: string | null;
};

type StripeStatus = {
  status: "active" | "pending" | "not_started" | "error" | "unknown";
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
};

export function StripeConnectBadge({ projectId, stripeAccountId }: Props) {
  const [data, setData] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(!!stripeAccountId);

  useEffect(() => {
    if (!stripeAccountId) return;
    fetch(`/api/admin/projects/${projectId}/stripe-status`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ status: "error", detailsSubmitted: false, chargesEnabled: false }))
      .finally(() => setLoading(false));
  }, [projectId, stripeAccountId]);

  if (!stripeAccountId && !loading) {
    return (
      <Badge
        variant="outline"
        className="text-[9px] font-mono bg-red-50 text-red-600 border-red-200 px-1.5 py-0.5"
      >
        <CreditCard className="h-2.5 w-2.5 mr-0.5 inline" />
        Stripe: Not started
      </Badge>
    );
  }

  if (loading) {
    return (
      <Badge
        variant="outline"
        className="text-[9px] font-mono bg-cream text-ink/40 border-shell px-1.5 py-0.5"
      >
        <Loader2 className="h-2.5 w-2.5 mr-0.5 inline animate-spin" />
        Stripe: Checking...
      </Badge>
    );
  }

  if (!data) return null;

  if (data.status === "active") {
    return (
      <Badge
        variant="outline"
        className="text-[9px] font-mono bg-green-50 text-green-700 border-green-200 px-1.5 py-0.5"
      >
        <CreditCard className="h-2.5 w-2.5 mr-0.5 inline" />
        Stripe: Active
      </Badge>
    );
  }

  if (data.status === "pending") {
    return (
      <Badge
        variant="outline"
        className="text-[9px] font-mono bg-yellow-50 text-yellow-700 border-yellow-200 px-1.5 py-0.5"
      >
        <CreditCard className="h-2.5 w-2.5 mr-0.5 inline" />
        Stripe: Pending onboarding
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="text-[9px] font-mono bg-red-50 text-red-600 border-red-200 px-1.5 py-0.5"
    >
      <CreditCard className="h-2.5 w-2.5 mr-0.5 inline" />
      Stripe: Not started
    </Badge>
  );
}
