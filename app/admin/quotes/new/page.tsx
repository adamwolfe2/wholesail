"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Loader2,
  Send,
  Save,
} from "lucide-react";

interface Org {
  id: string;
  name: string;
  tier: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
  unit: string;
  category: string;
  available: boolean;
}

interface LineItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export default function NewQuotePage() {
  const router = useRouter();

  const [orgs, setOrgs] = useState<Org[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgSearch, setOrgSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const fetchData = useCallback(async (signal: AbortSignal) => {
    try {
      const [orgsRes, productsRes] = await Promise.all([
        fetch("/api/admin/build-cart/orgs", { signal }),
        fetch("/api/products", { signal }),
      ]);
      if (orgsRes.ok) {
        const d = await orgsRes.json();
        setOrgs(d.orgs ?? []);
      }
      if (productsRes.ok) {
        const d = await productsRes.json();
        setProducts((d.products ?? []).filter((p: Product) => p.available));
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  function addProduct(product: Product) {
    const existing = items.find((i) => i.productId === product.id);
    if (existing) {
      setItems((prev) =>
        prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          quantity: 1,
          unitPrice: parseFloat(product.price),
        },
      ]);
    }
    setShowProductDropdown(false);
    setProductSearch("");
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function updateItemQty(productId: string, qty: number) {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
    );
  }

  function updateItemPrice(productId: string, price: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, unitPrice: price } : i
      )
    );
  }

  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const discountAmount = parseFloat(discount) || 0;
  const total = Math.max(0, subtotal - discountAmount);

  const selectedOrg = orgs.find((o) => o.id === selectedOrgId);
  const filteredOrgs = orgs.filter((o) =>
    o.name.toLowerCase().includes(orgSearch.toLowerCase())
  );
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  async function save(status: "DRAFT" | "SENT") {
    if (!selectedOrgId || items.length === 0) {
      setError("Select a client and add at least one item.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: selectedOrgId,
          items,
          discount: discountAmount,
          notes: notes.trim() || undefined,
          expiresAt: expiresAt || undefined,
          status,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save quote");
      }

      const data = await res.json();
      router.push(`/admin/quotes/${data.quote.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-ink/50 hover:text-ink hover:bg-ink/[0.04] rounded-none -ml-2"
          >
            <Link href="/admin/quotes">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quotes
            </Link>
          </Button>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
          New Quote
        </h2>
      </div>

      {/* Client selection */}
      <Card className="border-shell bg-cream">
        <CardHeader>
          <CardTitle className="font-serif text-base text-ink">
            Client
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Input
              value={selectedOrg ? selectedOrg.name : orgSearch}
              onChange={(e) => {
                setOrgSearch(e.target.value);
                setSelectedOrgId("");
                setShowOrgDropdown(true);
              }}
              onFocus={() => setShowOrgDropdown(true)}
              placeholder="Search for a client organization..."
              aria-label="Search client organizations"
              className="border-shell bg-cream rounded-none focus:border-ink"
            />
            {showOrgDropdown && filteredOrgs.length > 0 && !selectedOrg && (
              <div className="absolute top-full left-0 right-0 z-10 border border-shell bg-cream max-h-48 overflow-y-auto shadow-sm">
                {filteredOrgs.slice(0, 10).map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-ink/[0.04] flex items-center justify-between"
                    onClick={() => {
                      setSelectedOrgId(org.id);
                      setOrgSearch("");
                      setShowOrgDropdown(false);
                    }}
                  >
                    <span>{org.name}</span>
                    <span className="text-xs text-ink/40">{org.tier}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Line items */}
      <Card className="border-shell bg-cream">
        <CardHeader>
          <CardTitle className="font-serif text-base text-ink">
            Line Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items list */}
          {items.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-ink/50 uppercase tracking-wider pb-1 border-b border-shell">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-3 text-right">Unit Price</div>
                <div className="col-span-1 text-right">Total</div>
                <div className="col-span-1" />
              </div>
              {items.map((item) => (
                <div key={item.productId} className="grid grid-cols-12 gap-2 items-center py-1">
                  <div className="col-span-5 text-sm font-medium text-ink">
                    {item.name}
                  </div>
                  <div className="col-span-2 flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateItemQty(item.productId, item.quantity - 1)}
                      className="w-5 h-5 flex items-center justify-center border border-shell hover:border-ink transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItemQty(item.productId, parseInt(e.target.value) || 1)
                      }
                      className="h-7 w-12 text-center border-shell rounded-none text-sm p-1"
                    />
                    <button
                      type="button"
                      onClick={() => updateItemQty(item.productId, item.quantity + 1)}
                      className="w-5 h-5 flex items-center justify-center border border-shell hover:border-ink transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center justify-end">
                      <span className="text-xs text-ink/50 mr-1">$</span>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItemPrice(item.productId, parseFloat(e.target.value) || 0)
                        }
                        className="h-7 w-24 text-right border-shell rounded-none text-sm p-1"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 text-right text-sm font-medium text-ink">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-ink/30 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add product */}
          <div className="relative">
            <Input
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setShowProductDropdown(true);
              }}
              onFocus={() => setShowProductDropdown(true)}
              placeholder="Search and add a product..."
              aria-label="Search products"
              className="border-shell bg-cream rounded-none focus:border-ink"
            />
            {showProductDropdown && productSearch.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 border border-shell bg-cream max-h-48 overflow-y-auto shadow-sm">
                {filteredProducts.slice(0, 8).map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-ink/[0.04] flex items-center justify-between"
                    onClick={() => addProduct(product)}
                  >
                    <span>{product.name}</span>
                    <span className="text-xs text-ink/50">
                      {formatCurrency(product.price)} / {product.unit}
                    </span>
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="px-3 py-2 text-xs text-ink/50">
                    No products found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-2 border-t border-shell">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink/60">Subtotal</span>
              <span className="text-ink">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink/60">Discount ($)</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-ink/50">$</span>
                <Input
                  type="number"
                  min={0}
                  max={subtotal}
                  step={0.01}
                  value={discount}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val > subtotal) {
                      setDiscount(String(subtotal));
                    } else {
                      setDiscount(e.target.value);
                    }
                  }}
                  className="h-7 w-20 text-right border-shell rounded-none text-sm p-1"
                />
              </div>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span className="text-ink">Total</span>
              <span className="font-serif text-xl text-ink">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      <Card className="border-shell bg-cream">
        <CardHeader>
          <CardTitle className="font-serif text-base text-ink">
            Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="expires-at"
              className="text-xs text-ink/60 uppercase tracking-wider"
            >
              Expiry Date
            </Label>
            <Input
              id="expires-at"
              type="date"
              value={expiresAt}
              min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="border-shell bg-cream rounded-none focus:border-ink"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="quote-notes"
              className="text-xs text-ink/60 uppercase tracking-wider"
            >
              Notes
            </Label>
            <Textarea
              id="quote-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes visible to the client..."
              rows={3}
              maxLength={1000}
              className="border-shell bg-cream rounded-none focus:border-ink resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={() => save("DRAFT")}
          disabled={saving}
          variant="outline"
          className="border-ink text-ink hover:bg-ink hover:text-cream rounded-none"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Draft
        </Button>
        <Button
          onClick={() => save("SENT")}
          disabled={saving}
          className="bg-ink text-cream hover:bg-ink/80 rounded-none"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Send to Client
        </Button>
      </div>
    </div>
  );
}
