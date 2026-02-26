"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Check, X, TrendingUp, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
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
  const [editMinOrder, setEditMinOrder] = useState("");
  const [editImage, setEditImage] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

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
    setEditMinOrder(product.minimumOrder || "1");
    setEditImage(product.image || "");
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-3 font-medium w-10 hidden md:table-cell">Img</th>
            <th className="pb-3 font-medium">Product</th>
            <th className="pb-3 font-medium hidden sm:table-cell">Category</th>
            <th className="pb-3 font-medium">Price</th>
            <th className="pb-3 font-medium hidden sm:table-cell">Unit</th>
            <th className="pb-3 font-medium hidden md:table-cell">Min Order</th>
            <th className="pb-3 font-medium hidden lg:table-cell">Flags</th>
            <th className="pb-3 font-medium">Active</th>
            <th className="pb-3 font-medium w-24"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const isEditing = editingId === product.id;
            const isSaving = saving === product.id;

            return (
              <tr key={product.id} className="border-b">
                <td className="py-3 hidden md:table-cell">
                  {isEditing ? (
                    <div className="space-y-1 w-48">
                      <Input
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        className="h-7 text-xs"
                        placeholder="https://…"
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
                    />
                  ) : (
                    <span>${Number(product.price).toFixed(2)}</span>
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
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
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
  );
}
