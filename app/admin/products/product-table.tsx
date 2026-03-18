"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Check, X, TrendingUp, ImageIcon, Search, Download, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useBulkSelection } from "@/hooks/use-bulk-selection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  sku?: string | null;
  category: string;
  price: string;
  costPrice?: string | null;
  unit: string;
  available: boolean;
  marketRate: boolean;
  prepayRequired: boolean;
  coldChainRequired: boolean;
  minimumOrder: string | null;
  description: string | null;
  image: string | null;
}

export function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editCostPrice, setEditCostPrice] = useState("");
  const [editMinOrder, setEditMinOrder] = useState("");
  const [editImage, setEditImage] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  // Bulk selection
  const bulk = useBulkSelection(products);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");

  // Derive unique categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query));

      const matchesCategory =
        categoryFilter === "all" || p.category === categoryFilter;

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "active" && p.available) ||
        (availabilityFilter === "inactive" && !p.available);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [products, searchQuery, categoryFilter, availabilityFilter]);

  async function toggleAvailability(id: string, available: boolean) {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available }),
      });
      if (res.ok) {
        toast.success(available ? "Product activated" : "Product deactivated");
        router.refresh();
      }
    } catch {
      toast.error("Failed to update product");
    } finally {
      setSaving(null);
    }
  }

  async function saveEdit(id: string) {
    setSaving(id);
    try {
      const updates: Record<string, unknown> = {};
      if (editPrice) updates.price = parseFloat(editPrice);
      if (editCostPrice) updates.costPrice = parseFloat(editCostPrice);
      else updates.costPrice = null;
      if (editMinOrder) updates.minimumOrder = parseInt(editMinOrder, 10);
      updates.image = editImage || null;

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        toast.success("Product updated");
        setEditingId(null);
        router.refresh();
      }
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(null);
    }
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setEditPrice(Number(product.price).toFixed(2));
    setEditCostPrice(product.costPrice ? Number(product.costPrice).toFixed(2) : "");
    setEditMinOrder(product.minimumOrder || "1");
    setEditImage(product.image || "");
  }

  function getMarginPct(product: Product): number | null {
    if (!product.costPrice) return null;
    const price = Number(product.price);
    const cost = Number(product.costPrice);
    if (price <= 0) return null;
    return ((price - cost) / price) * 100;
  }

  const handleBulkAction = useCallback(async (action: string) => {
    if (bulk.count === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/products/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: bulk.selectedIds, action }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.updated} product(s) updated`);
        bulk.clear();
        router.refresh();
      } else {
        toast.error("Bulk action failed");
      }
    } catch {
      toast.error("Bulk action failed");
    } finally {
      setBulkLoading(false);
    }
  }, [bulk, router]);

  return (
    <div>
      {/* Bulk Actions Bar */}
      {bulk.count > 0 && (
        <div className="flex items-center gap-3 mb-3 p-3 border border-[#E5E1DB] bg-[#F9F7F4]">
          <span className="text-sm font-medium">{bulk.count} selected</span>
          <Button
            variant="outline"
            size="sm"
            disabled={bulkLoading}
            onClick={() => handleBulkAction("set_available")}
          >
            Activate
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={bulkLoading}
            onClick={() => handleBulkAction("set_unavailable")}
          >
            Deactivate
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={bulkLoading}
            onClick={() => handleBulkAction("delete")}
          >
            Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={bulk.clear} className="ml-auto">
            Clear
          </Button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU, or category..."
            className="pl-9"
            aria-label="Search products"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-10" asChild>
          <a href="/api/admin/products/export" download>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </a>
        </Button>
      </div>

      {/* Result count */}
      <p className="text-xs text-muted-foreground mb-3">
        {filteredProducts.length} of {products.length} products
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-3 font-medium w-8">
                <Checkbox
                  checked={bulk.allSelected}
                  onCheckedChange={() => bulk.toggleAll()}
                  aria-label="Select all"
                />
              </th>
              <th className="pb-3 font-medium w-10 hidden md:table-cell">Img</th>
              <th className="pb-3 font-medium">Product</th>
              <th className="pb-3 font-medium hidden sm:table-cell">Category</th>
              <th className="pb-3 font-medium">Price</th>
              <th className="pb-3 font-medium hidden lg:table-cell">Cost</th>
              <th className="pb-3 font-medium hidden lg:table-cell">Margin</th>
              <th className="pb-3 font-medium hidden sm:table-cell">Unit</th>
              <th className="pb-3 font-medium hidden md:table-cell">Min Order</th>
              <th className="pb-3 font-medium hidden lg:table-cell">Flags</th>
              <th className="pb-3 font-medium">Active</th>
              <th className="pb-3 font-medium w-24"></th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const isEditing = editingId === product.id;
              const isSaving = saving === product.id;
              const margin = getMarginPct(product);

              return (
                <tr key={product.id} className="border-b">
                  <td className="py-3">
                    <Checkbox
                      checked={bulk.isSelected(product.id)}
                      onCheckedChange={() => bulk.toggleOne(product.id)}
                      aria-label={`Select ${product.name}`}
                    />
                  </td>
                  <td className="py-3 hidden md:table-cell">
                    {isEditing ? (
                      <div className="space-y-1 w-48">
                        <Input
                          value={editImage}
                          onChange={(e) => setEditImage(e.target.value)}
                          className="h-7 text-xs"
                          placeholder="https://…"
                          aria-label="Image URL"
                        />
                        {editImage && (
                          <div className="w-8 h-8 border border-border overflow-hidden">
                            <img
                              src={editImage}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      product.image ? (
                        <div className="w-8 h-8 border border-border overflow-hidden">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 border border-border flex items-center justify-center bg-muted">
                          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      )
                    )}
                  </td>
                  <td className="py-3">
                    <div>
                      <span className="font-medium">{product.name}</span>
                      {product.sku && (
                        <span className="ml-2 text-xs text-muted-foreground">{product.sku}</span>
                      )}
                      {product.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 hidden sm:table-cell">{product.category}</td>
                  <td className="py-3">
                    {isEditing ? (
                      <Input
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-24 h-8"
                        type="number"
                        step="0.01"
                        min="0"
                        aria-label="Price"
                      />
                    ) : (
                      <span>${Number(product.price).toFixed(2)}</span>
                    )}
                  </td>
                  <td className="py-3 hidden lg:table-cell">
                    {isEditing ? (
                      <Input
                        value={editCostPrice}
                        onChange={(e) => setEditCostPrice(e.target.value)}
                        className="w-24 h-8"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Cost"
                        aria-label="Cost price"
                      />
                    ) : (
                      <span className="text-muted-foreground">
                        {product.costPrice ? `$${Number(product.costPrice).toFixed(2)}` : "—"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 hidden lg:table-cell">
                    {margin !== null ? (
                      <span className={margin >= 30 ? "text-green-700" : margin >= 15 ? "text-amber-600" : "text-red-600"}>
                        {margin.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 text-muted-foreground hidden sm:table-cell">{product.unit}</td>
                  <td className="py-3 hidden md:table-cell">
                    {isEditing ? (
                      <Input
                        value={editMinOrder}
                        onChange={(e) => setEditMinOrder(e.target.value)}
                        className="w-20 h-8"
                        type="number"
                        min="1"
                        aria-label="Minimum order"
                      />
                    ) : (
                      <span className="text-muted-foreground">{product.minimumOrder}</span>
                    )}
                  </td>
                  <td className="py-3 space-x-1 hidden lg:table-cell">
                    <TooltipProvider delayDuration={200}>
                      {product.marketRate && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-xs cursor-help">Market</Badge>
                          </TooltipTrigger>
                          <TooltipContent>Price varies with market conditions</TooltipContent>
                        </Tooltip>
                      )}
                      {product.prepayRequired && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-xs cursor-help">Prepay</Badge>
                          </TooltipTrigger>
                          <TooltipContent>Prepayment required before fulfillment</TooltipContent>
                        </Tooltip>
                      )}
                      {product.coldChainRequired && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-xs cursor-help">Cold</Badge>
                          </TooltipTrigger>
                          <TooltipContent>Requires cold chain logistics</TooltipContent>
                        </Tooltip>
                      )}
                    </TooltipProvider>
                  </td>
                  <td className="py-3">
                    <Switch
                      checked={product.available}
                      disabled={isSaving}
                      onCheckedChange={(checked) =>
                        toggleAvailability(product.id, checked)
                      }
                    />
                  </td>
                  <td className="py-3">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => saveEdit(product.id)}
                          disabled={isSaving}
                          aria-label="Save changes"
                        >
                          {isSaving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingId(null)}
                          disabled={isSaving}
                          aria-label="Cancel editing"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => startEdit(product)}
                          aria-label="Edit product"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                          aria-label="View product analytics"
                        >
                          <Link href={`/admin/products/${product.id}`}>
                            <TrendingUp className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
