"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

  const fetchData = useCallback(async () => {
    try {
      const [orgsRes, productsRes] = await Promise.all([
        fetch("/api/admin/build-cart/orgs"),
        fetch("/api/products"),
      ]);
      if (orgsRes.ok) {
        const d = await orgsRes.json();
        setOrgs(d.orgs ?? []);
      }
      if (productsRes.ok) {
        const d = await productsRes.json();
        setProducts((d.products ?? []).filter((p: Product) => p.available));
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchData();
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
            className="text-[#0A0A0A]/50 hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.04] rounded-none -ml-2"
          >
            <Link href="/admin/quotes">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quotes
            </Link>
          </Button>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
          New Quote
        </h2>
      </div>

      {/* Client selection */}
      <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardHeader>
          <CardTitle className="font-serif text-base text-[#0A0A0A]">
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
              className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none focus:border-[#0A0A0A]"
            />
            {showOrgDropdown && filteredOrgs.length > 0 && !selectedOrg && (
              <div className="absolute top-full left-0 right-0 z-10 border border-[#E5E1DB] bg-[#F9F7F4] max-h-48 overflow-y-auto shadow-sm">
                {filteredOrgs.slice(0, 10).map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#0A0A0A]/[0.04] flex items-center justify-between"
                    onClick={() => {
                      setSelectedOrgId(org.id);
                      setOrgSearch("");
                      setShowOrgDropdown(false);
                    }}
                  >
                    <span>{org.name}</span>
                    <span className="text-xs text-[#0A0A0A]/40">{org.tier}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Line items */}
      <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardHeader>
          <CardTitle className="font-serif text-base text-[#0A0A0A]">
            Line Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items list */}
          {items.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-[#0A0A0A]/50 uppercase tracking-wider pb-1 border-b border-[#E5E1DB]">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-3 text-right">Unit Price</div>
                <div className="col-span-1 text-right">Total</div>
                <div className="col-span-1" />
              </div>
              {items.map((item) => (
                <div key={item.productId} className="grid grid-cols-12 gap-2 items-center py-1">
                  <div className="col-span-5 text-sm font-medium text-[#0A0A0A]">
                    {item.name}
                  </div>
                  <div className="col-span-2 flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateItemQty(item.productId, item.quantity - 1)}
                      className="w-5 h-5 flex items-center justify-center border border-[#E5E1DB] hover:border-[#0A0A0A] transition-colors"
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
                      className="h-7 w-12 text-center border-[#E5E1DB] rounded-none text-sm p-1"
                    />
                    <button
                      type="button"
                      onClick={() => updateItemQty(item.productId, item.quantity + 1)}
                      className="w-5 h-5 flex items-center justify-center border border-[#E5E1DB] hover:border-[#0A0A0A] transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center justify-end">
                      <span className="text-xs text-[#0A0A0A]/50 mr-1">$</span>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItemPrice(item.productId, parseFloat(e.target.value) || 0)
                        }
                        className="h-7 w-24 text-right border-[#E5E1DB] rounded-none text-sm p-1"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 text-right text-sm font-medium text-[#0A0A0A]">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-[#0A0A0A]/30 hover:text-red-500 transition-colors"
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
              className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none focus:border-[#0A0A0A]"
            />
            {showProductDropdown && productSearch.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 border border-[#E5E1DB] bg-[#F9F7F4] max-h-48 overflow-y-auto shadow-sm">
                {filteredProducts.slice(0, 8).map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#0A0A0A]/[0.04] flex items-center justify-between"
                    onClick={() => addProduct(product)}
                  >
                    <span>{product.name}</span>
                    <span className="text-xs text-[#0A0A0A]/50">
                      ${parseFloat(product.price).toFixed(2)} / {product.unit}
                    </span>
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="px-3 py-2 text-xs text-[#0A0A0A]/50">
                    No products found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-2 border-t border-[#E5E1DB]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#0A0A0A]/60">Subtotal</span>
              <span className="text-[#0A0A0A]">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#0A0A0A]/60">Discount ($)</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#0A0A0A]/50">$</span>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="h-7 w-20 text-right border-[#E5E1DB] rounded-none text-sm p-1"
                />
              </div>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span className="text-[#0A0A0A]">Total</span>
              <span className="font-serif text-xl text-[#0A0A0A]">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardHeader>
          <CardTitle className="font-serif text-base text-[#0A0A0A]">
            Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="expires-at"
              className="text-xs text-[#0A0A0A]/60 uppercase tracking-wider"
            >
              Expiry Date
            </Label>
            <Input
              id="expires-at"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none focus:border-[#0A0A0A]"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="quote-notes"
              className="text-xs text-[#0A0A0A]/60 uppercase tracking-wider"
            >
              Notes
            </Label>
            <Textarea
              id="quote-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes visible to the client..."
              rows={3}
              className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none focus:border-[#0A0A0A] resize-none"
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
          className="border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#F9F7F4] rounded-none"
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
          className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none"
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
