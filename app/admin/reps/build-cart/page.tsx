"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ArrowRight,
  Plus,
  Minus,
  Loader2,
  ShoppingCart,
  Check,
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

interface CartItem {
  product: Product;
  quantity: number;
}

type Step = 1 | 2 | 3;

export default function BuildCartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>(1);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState("");
  const [repNote, setRepNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ orderId: string; orderNumber: string } | null>(null);
  const [orgSearch, setOrgSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // Pre-select repId from query params if present (used from rep detail page)
  const repIdParam = searchParams.get("repId") ?? "";

  const fetchOrgs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/build-cart/orgs");
      if (res.ok) {
        const data = await res.json();
        setOrgs(data.orgs ?? []);
      }
    } catch {
      // silently fail
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(
          (data.products ?? []).filter((p: Product) => p.available)
        );
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  function adjustQty(productId: string, delta: number) {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.product.id === productId);
      if (!existing) {
        if (delta > 0) {
          const product = products.find((p) => p.id === productId);
          if (!product) return prev;
          return [...prev, { product, quantity: delta }];
        }
        return prev;
      }
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((ci) => ci.product.id !== productId);
      }
      return prev.map((ci) =>
        ci.product.id === productId ? { ...ci, quantity: newQty } : ci
      );
    });
  }

  function getQty(productId: string) {
    return cart.find((ci) => ci.product.id === productId)?.quantity ?? 0;
  }

  const subtotal = cart.reduce(
    (acc, ci) => acc + parseFloat(ci.product.price) * ci.quantity,
    0
  );

  async function handlePlaceOrder() {
    if (!selectedOrgId || cart.length === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/build-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: selectedOrgId,
          repId: repIdParam || undefined,
          items: cart.map((ci) => ({
            productId: ci.product.id,
            quantity: ci.quantity,
          })),
          notes: notes.trim() || undefined,
          repNote: repNote.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to place order");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function goToStep2() {
    if (!selectedOrgId) return;
    setLoading(true);
    fetchProducts().finally(() => {
      setLoading(false);
      setStep(2);
    });
  }

  const selectedOrg = orgs.find((o) => o.id === selectedOrgId);
  const filteredOrgs = orgs.filter((o) =>
    o.name.toLowerCase().includes(orgSearch.toLowerCase())
  );
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (result) {
    return (
      <div className="space-y-6 max-w-lg">
        <div className="flex items-center gap-3 p-6 border border-[#E5E1DB] bg-[#F9F7F4]">
          <div className="flex items-center justify-center w-10 h-10 bg-[#0A0A0A] rounded-none shrink-0">
            <Check className="h-5 w-5 text-[#F9F7F4]" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-[#0A0A0A]">
              Order Placed
            </h2>
            <p className="text-sm text-[#0A0A0A]/60 mt-0.5">
              {result.orderNumber} has been created on behalf of{" "}
              {selectedOrg?.name}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button asChild className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none">
            <Link href={`/admin/orders/${result.orderId}`}>View Order</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setResult(null);
              setCart([]);
              setSelectedOrgId("");
              setNotes("");
              setRepNote("");
              setStep(1);
            }}
            className="border-[#E5E1DB] text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.04] rounded-none"
          >
            Build Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-[#0A0A0A]/50 hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.04] rounded-none -ml-2"
          >
            <Link href="/admin/reps">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Sales Team
            </Link>
          </Button>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
          Build Order for Client
        </h2>
        <p className="text-sm text-[#0A0A0A]/50 mt-0.5">
          Place an order on behalf of a client organization
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 text-sm">
        {(["1", "2", "3"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-6 h-6 text-xs font-bold ${
                step > parseInt(s)
                  ? "bg-[#0A0A0A] text-[#F9F7F4]"
                  : step === parseInt(s)
                  ? "bg-[#0A0A0A] text-[#F9F7F4]"
                  : "border border-[#E5E1DB] text-[#0A0A0A]/40"
              }`}
            >
              {step > parseInt(s) ? (
                <Check className="h-3 w-3" />
              ) : (
                s
              )}
            </div>
            <span
              className={`hidden sm:block ${
                step === parseInt(s)
                  ? "text-[#0A0A0A] font-medium"
                  : "text-[#0A0A0A]/40"
              }`}
            >
              {s === "1" ? "Select Client" : s === "2" ? "Add Products" : "Review & Place"}
            </span>
            {i < 2 && <div className="w-6 h-px bg-[#E5E1DB] hidden sm:block" />}
          </div>
        ))}
      </div>

      {/* Step 1: Select client org */}
      {step === 1 && (
        <Card className="border-[#E5E1DB] bg-[#F9F7F4] max-w-lg">
          <CardHeader>
            <CardTitle className="font-serif text-lg text-[#0A0A0A]">
              Select Client Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-[#0A0A0A]/60 uppercase tracking-wider">
                Search
              </Label>
              <Input
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
                placeholder="Search organizations..."
                className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none focus:border-[#0A0A0A]"
              />
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filteredOrgs.length === 0 ? (
                <p className="text-sm text-[#0A0A0A]/50 py-2">No organizations found.</p>
              ) : (
                filteredOrgs.map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => setSelectedOrgId(org.id)}
                    className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between transition-colors ${
                      selectedOrgId === org.id
                        ? "bg-[#0A0A0A] text-[#F9F7F4]"
                        : "hover:bg-[#0A0A0A]/[0.04] text-[#0A0A0A]"
                    }`}
                  >
                    <span className="font-medium">{org.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        selectedOrgId === org.id
                          ? "border-[#F9F7F4]/40 text-[#F9F7F4]"
                          : "border-[#E5E1DB] text-[#0A0A0A]/60"
                      }`}
                    >
                      {org.tier}
                    </Badge>
                  </button>
                ))
              )}
            </div>
            <Button
              onClick={goToStep2}
              disabled={!selectedOrgId || loading}
              className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              Continue to Products
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Browse catalog */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#0A0A0A]/60">
              Building for:{" "}
              <span className="font-medium text-[#0A0A0A]">
                {selectedOrg?.name}
              </span>
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#0A0A0A]/50">
                {cart.reduce((a, c) => a + c.quantity, 0)} items in cart
              </span>
              <Button
                onClick={() => setStep(3)}
                disabled={cart.length === 0}
                className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none"
              >
                Review Order
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          <Input
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Search products..."
            className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none focus:border-[#0A0A0A] max-w-sm"
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const qty = getQty(product.id);
              return (
                <Card
                  key={product.id}
                  className={`border-[#E5E1DB] bg-[#F9F7F4] ${
                    qty > 0 ? "border-[#0A0A0A]" : ""
                  }`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-[#0A0A0A]">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#0A0A0A]/50 mt-0.5">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#0A0A0A]">
                          ${parseFloat(product.price).toFixed(2)}
                        </p>
                        <p className="text-xs text-[#0A0A0A]/40">
                          {product.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adjustQty(product.id, -1)}
                        disabled={qty === 0}
                        className="h-8 w-8 p-0 border-[#E5E1DB] rounded-none"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-mono w-8 text-center text-[#0A0A0A]">
                        {qty}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adjustQty(product.id, 1)}
                        className="h-8 w-8 p-0 border-[#E5E1DB] rounded-none"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      {qty > 0 && (
                        <span className="text-xs text-[#0A0A0A]/50 ml-1">
                          = ${(parseFloat(product.price) * qty).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="border-[#E5E1DB] text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.04] rounded-none"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={cart.length === 0}
              className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none"
            >
              Review Order
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Notes */}
      {step === 3 && (
        <div className="space-y-6 max-w-2xl">
          <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
            <CardHeader>
              <CardTitle className="font-serif text-lg text-[#0A0A0A]">
                Order Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-[#0A0A0A]/60">
                Client:{" "}
                <span className="font-medium text-[#0A0A0A]">
                  {selectedOrg?.name}
                </span>
              </div>

              <div className="space-y-2">
                {cart.map((ci) => (
                  <div
                    key={ci.product.id}
                    className="flex items-center justify-between py-2 border-b border-[#E5E1DB] last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#0A0A0A]">
                        {ci.product.name}
                      </p>
                      <p className="text-xs text-[#0A0A0A]/50">
                        {ci.quantity} × ${parseFloat(ci.product.price).toFixed(2)}{" "}
                        {ci.product.unit}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[#0A0A0A]">
                      ${(parseFloat(ci.product.price) * ci.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E5E1DB]">
                <span className="text-sm font-medium text-[#0A0A0A]">Subtotal</span>
                <span className="font-serif font-bold text-lg text-[#0A0A0A]">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="order-notes"
                  className="text-xs text-[#0A0A0A]/60 uppercase tracking-wider"
                >
                  Order Notes (visible to client)
                </Label>
                <Textarea
                  id="order-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  rows={2}
                  className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none focus:border-[#0A0A0A] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="rep-note"
                  className="text-xs text-[#0A0A0A]/60 uppercase tracking-wider"
                >
                  Rep Note (internal only)
                </Label>
                <Textarea
                  id="rep-note"
                  value={repNote}
                  onChange={(e) => setRepNote(e.target.value)}
                  placeholder="Internal notes for the team..."
                  rows={2}
                  className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none focus:border-[#0A0A0A] resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2">
                  {error}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="border-[#E5E1DB] text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.04] rounded-none"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Edit Cart
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={submitting || cart.length === 0}
              className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ShoppingCart className="h-4 w-4 mr-2" />
              )}
              Place Order
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
