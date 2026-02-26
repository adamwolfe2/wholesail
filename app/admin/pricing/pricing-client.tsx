"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const TIERS = ["NEW", "REPEAT", "VIP"] as const;
type OrgTier = (typeof TIERS)[number];

const CATEGORIES = [
  "All Categories",
  "Truffles",
  "Caviar",
  "Wagyu & Foie Gras",
  "Salumi & Artisan",
  "Seafood",
  "Coffee & Matcha",
  "Accessories",
] as const;

type PricingRule = {
  id: string;
  tier: OrgTier;
  category: string | null;
  discountPct: number;
  isActive: boolean;
};

const tierColors: Record<OrgTier, string> = {
  NEW: "bg-[#E5E1DB] text-[#0A0A0A]",
  REPEAT: "bg-[#4A90D9] text-white",
  VIP: "bg-[#B8860B] text-white",
};

const tierHeaderColors: Record<OrgTier, string> = {
  NEW: "bg-[#E5E1DB] text-[#0A0A0A]",
  REPEAT: "bg-[#DBEAFE] text-[#1E40AF]",
  VIP: "bg-[#FEF3C7] text-[#92400E]",
};

const tierDescriptions: Record<OrgTier, string> = {
  NEW: "New clients — standard pricing",
  REPEAT: "Clients with $5k+ lifetime spend",
  VIP: "Clients with $50k+ lifetime spend",
};

export function PricingClient({ rules: initialRules }: { rules: PricingRule[] }) {
  const router = useRouter();
  const [rules, setRules] = useState<PricingRule[]>(initialRules);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formTier, setFormTier] = useState<OrgTier>("NEW");
  const [formCategory, setFormCategory] = useState<string>("All Categories");
  const [formDiscount, setFormDiscount] = useState<string>("");

  // Build lookup: tier+category -> rule
  function getRule(tier: OrgTier, category: string): PricingRule | undefined {
    const catKey = category === "All Categories" ? null : category;
    return rules.find(
      (r) => r.tier === tier && r.category === catKey
    );
  }

  async function handleToggle(id: string, currentActive: boolean) {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/pricing/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle");
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isActive: !currentActive } : r))
      );
    } catch {
      setError("Failed to update rule. Please try again.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/pricing/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Failed to delete rule. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleQuickAdd(tier: OrgTier, category: string) {
    setFormTier(tier);
    setFormCategory(category);
    // Scroll to form
    document.getElementById("add-rule-form")?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleAddRule(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const discount = parseFloat(formDiscount);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      setError("Discount must be a number between 0 and 100.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: formTier,
          category: formCategory,
          discountPct: discount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create rule.");
        return;
      }

      // Refresh data from server
      router.refresh();
      setRules((prev) => [
        ...prev,
        {
          id: data.rule.id,
          tier: data.rule.tier,
          category: data.rule.category,
          discountPct: Number(data.rule.discountPct),
          isActive: data.rule.isActive,
        },
      ]);
      setFormDiscount("");
      setFormTier("NEW");
      setFormCategory("All Categories");
    } catch {
      setError("Failed to create rule. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Tier Overview ───────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {TIERS.map((tier) => {
          const tierRules = rules.filter((r) => r.tier === tier && r.isActive);
          return (
            <Card
              key={tier}
              className={`border-[#E5E1DB] ${tier === "VIP" ? "bg-[#FFFBEB] border-[#B8860B]/30" : "bg-[#F9F7F4]"}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className={`text-xs font-semibold border-0 ${tierColors[tier]}`}>
                    {tier}
                  </Badge>
                  {tier === "VIP" && (
                    <span className="text-xs text-[#B8860B] font-medium">★ Premium</span>
                  )}
                </div>
                <p className="text-xs text-[#0A0A0A]/50 mt-1">{tierDescriptions[tier]}</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-serif font-bold text-[#0A0A0A]">
                  {tierRules.length}
                  <span className="text-sm font-sans font-normal text-[#0A0A0A]/50 ml-1">
                    active rule{tierRules.length !== 1 ? "s" : ""}
                  </span>
                </p>
                {tierRules.length > 0 && (
                  <p className="text-xs text-[#0A0A0A]/40 mt-1">
                    Up to{" "}
                    {Math.max(...tierRules.map((r) => Number(r.discountPct))).toFixed(0)}% discount
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Visual Matrix ───────────────────────────────────────────────── */}
      <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-lg text-[#0A0A0A]">
            Discount Matrix
          </CardTitle>
          <p className="text-xs text-[#0A0A0A]/50">
            All tier × category combinations. Click + to add a missing rule.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider border-b border-[#E5E1DB]">
                    Category
                  </th>
                  {TIERS.map((tier) => (
                    <th
                      key={tier}
                      className="text-center py-2 px-3 text-xs font-medium uppercase tracking-wider border-b border-[#E5E1DB]"
                    >
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold ${tierHeaderColors[tier]}`}>
                        {tier}
                        {tier === "VIP" && " ★"}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((category) => (
                  <tr
                    key={category}
                    className="border-b border-[#E5E1DB] last:border-0 hover:bg-[#0A0A0A]/[0.02] transition-colors"
                  >
                    <td className="py-3 pr-4 text-sm font-medium text-[#0A0A0A]">
                      {category === "All Categories" ? (
                        <span className="italic text-[#0A0A0A]/60">All Categories</span>
                      ) : (
                        category
                      )}
                    </td>
                    {TIERS.map((tier) => {
                      const rule = getRule(tier, category);
                      if (!rule) {
                        return (
                          <td key={tier} className="text-center py-3 px-3">
                            <button
                              onClick={() => handleQuickAdd(tier, category)}
                              className="text-[#C8C0B4] hover:text-[#0A0A0A] transition-colors flex items-center justify-center gap-0.5 mx-auto text-xs"
                              title={`Add ${tier} rule for ${category}`}
                            >
                              <span className="text-[#E5E1DB]">—</span>
                              <Plus className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100" />
                            </button>
                          </td>
                        );
                      }
                      return (
                        <td key={tier} className="text-center py-3 px-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <span
                              className={`font-mono font-bold text-sm ${
                                rule.isActive
                                  ? tier === "VIP"
                                    ? "text-[#B8860B]"
                                    : "text-[#0A0A0A]"
                                  : "text-[#C8C0B4] line-through"
                              }`}
                            >
                              {Number(rule.discountPct).toFixed(1)}%
                            </span>
                            <button
                              onClick={() => handleDelete(rule.id)}
                              disabled={deletingId === rule.id}
                              className="text-[#E5E1DB] hover:text-red-400 transition-colors"
                              aria-label="Delete rule"
                            >
                              {deletingId === rule.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          {!rule.isActive && (
                            <p className="text-[10px] text-[#C8C0B4]">inactive</p>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Rules List (by tier) ─────────────────────────────────────────── */}
      <div className="space-y-4">
        {TIERS.map((tier) => {
          const tierRules = rules.filter((r) => r.tier === tier);
          if (tierRules.length === 0) return null;
          return (
            <Card
              key={tier}
              className={`border-[#E5E1DB] ${tier === "VIP" ? "bg-[#FFFBEB] border-[#B8860B]/30" : "bg-[#F9F7F4]"}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="font-serif text-base text-[#0A0A0A]">
                    {tier} Tier Rules
                  </CardTitle>
                  <Badge className={`text-xs font-medium border-0 ${tierColors[tier]}`}>
                    {tier}
                    {tier === "VIP" && " ★"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E1DB]">
                        <th className="text-left py-2 pr-4 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
                          Discount
                        </th>
                        <th className="text-center py-2 px-3 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
                          Active
                        </th>
                        <th className="text-right py-2 pl-3 text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tierRules.map((rule) => (
                        <tr
                          key={rule.id}
                          className="border-b border-[#E5E1DB] last:border-0 hover:bg-[#0A0A0A]/[0.02] transition-colors"
                        >
                          <td className="py-3 pr-4 text-[#0A0A0A]">
                            {rule.category ?? (
                              <span className="text-[#C8C0B4] italic">All Categories</span>
                            )}
                          </td>
                          <td className="text-right py-3 px-3 font-mono font-bold text-[#0A0A0A]">
                            {tier === "VIP" ? (
                              <span className="text-[#B8860B]">
                                {Number(rule.discountPct).toFixed(1)}%
                              </span>
                            ) : (
                              `${Number(rule.discountPct).toFixed(1)}%`
                            )}
                          </td>
                          <td className="text-center py-3 px-3">
                            <button
                              onClick={() => handleToggle(rule.id, rule.isActive)}
                              disabled={togglingId === rule.id}
                              className={`relative inline-flex h-5 w-9 items-center border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] ${
                                rule.isActive
                                  ? tier === "VIP"
                                    ? "bg-[#B8860B] border-[#B8860B]"
                                    : "bg-[#0A0A0A] border-[#0A0A0A]"
                                  : "bg-[#E5E1DB] border-[#C8C0B4]"
                              }`}
                              aria-label={rule.isActive ? "Deactivate rule" : "Activate rule"}
                            >
                              {togglingId === rule.id ? (
                                <Loader2 className="h-3 w-3 animate-spin mx-auto text-[#F9F7F4]" />
                              ) : (
                                <span
                                  className={`inline-block h-3 w-3 transform transition-transform ${
                                    rule.isActive
                                      ? "translate-x-5 bg-[#F9F7F4]"
                                      : "translate-x-1 bg-[#C8C0B4]"
                                  }`}
                                />
                              )}
                            </button>
                          </td>
                          <td className="text-right py-3 pl-3">
                            <button
                              onClick={() => handleDelete(rule.id)}
                              disabled={deletingId === rule.id}
                              className="text-[#C8C0B4] hover:text-[#0A0A0A] transition-colors"
                              aria-label="Delete rule"
                            >
                              {deletingId === rule.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Add Rule Form ────────────────────────────────────────────────── */}
      <Card id="add-rule-form" className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-lg text-[#0A0A0A] flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#C8C0B4]" />
            Add Pricing Rule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddRule} className="grid gap-4 sm:grid-cols-4 sm:items-end">
            {/* Tier */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#0A0A0A]/70 uppercase tracking-wider">
                Tier
              </Label>
              <select
                value={formTier}
                onChange={(e) => setFormTier(e.target.value as OrgTier)}
                className="w-full h-9 border border-[#E5E1DB] bg-white text-sm text-[#0A0A0A] px-3 focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] focus:border-[#0A0A0A]"
              >
                {TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t}{t === "VIP" ? " ★" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#0A0A0A]/70 uppercase tracking-wider">
                Category
              </Label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full h-9 border border-[#E5E1DB] bg-white text-sm text-[#0A0A0A] px-3 focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] focus:border-[#0A0A0A]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Discount % */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#0A0A0A]/70 uppercase tracking-wider">
                Discount %
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formDiscount}
                  onChange={(e) => setFormDiscount(e.target.value)}
                  placeholder="e.g. 10"
                  className="border-[#E5E1DB] bg-white pr-7 focus:ring-1 focus:ring-[#0A0A0A] focus:border-[#0A0A0A]"
                  required
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#C8C0B4] text-sm pointer-events-none">
                  %
                </span>
              </div>
            </div>

            {/* Submit */}
            <div>
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 h-9 text-sm"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Rule
              </Button>
            </div>
          </form>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
