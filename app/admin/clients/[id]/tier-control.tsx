"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Loader2 } from "lucide-react";

const tiers = ["NEW", "REPEAT", "VIP"] as const;

export function TierControl({
  organizationId,
  currentTier,
}: {
  organizationId: string;
  currentTier: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateTier(tier: string) {
    if (tier === currentTier) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${organizationId}/tier`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <ChevronDown className="h-4 w-4 mr-1" />
          )}
          Change Tier
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {tiers.map((tier) => (
          <DropdownMenuItem
            key={tier}
            onClick={() => updateTier(tier)}
            className={tier === currentTier ? "font-bold" : ""}
          >
            {tier}
            {tier === currentTier && " (current)"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
