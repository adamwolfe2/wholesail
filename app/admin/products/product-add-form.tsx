"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, AlertCircle, ImageIcon } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "Fresh Truffles",
  "Truffle Products",
  "Caviar",
  "Specialty Mushrooms",
  "Oils & Vinegars",
  "Honey & Preserves",
  "Pantry Staples",
  "Seasonal",
  "Other",
];

export function ProductAddForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("lb");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [minimumOrder, setMinimumOrder] = useState("1");
  const [sku, setSku] = useState("");
  const [marketRate, setMarketRate] = useState(false);
  const [prepayRequired, setPrepayRequired] = useState(false);
  const [coldChainRequired, setColdChainRequired] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  function reset() {
    setName("");
    setPrice("");
    setUnit("lb");
    setCategory("");
    setDescription("");
    setMinimumOrder("1");
    setSku("");
    setMarketRate(false);
    setPrepayRequired(false);
    setColdChainRequired(false);
    setImageUrl("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price || !category) {
      setError("Name, price, and category are required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: parseFloat(price),
          unit,
          category,
          description: description || undefined,
          minimumOrder: parseInt(minimumOrder, 10) || 1,
          sku: sku || undefined,
          marketRate,
          prepayRequired,
          coldChainRequired,
          image: imageUrl || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create product");
        return;
      }

      toast.success(`${name} added to catalog`);
      reset();
      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription>
            Add a single product to the catalog.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fresh Black Truffle"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lb">lb</SelectItem>
                  <SelectItem value="oz">oz</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="each">each</SelectItem>
                  <SelectItem value="case">case</SelectItem>
                  <SelectItem value="jar">jar</SelectItem>
                  <SelectItem value="bottle">bottle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumOrder">Min Order</Label>
              <Input
                id="minimumOrder"
                type="number"
                min="1"
                value={minimumOrder}
                onChange={(e) => setMinimumOrder(e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sku">SKU (optional)</Label>
              <Input
                id="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. BT-001"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief product description..."
                rows={2}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/product.jpg"
              />
              {imageUrl && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-16 h-16 border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.parentElement?.querySelector('.fallback')?.classList.remove('hidden')
                      }}
                    />
                    <ImageIcon className="fallback hidden h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">Image preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Flags */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="marketRate" className="text-sm">Market rate pricing</Label>
              <Switch id="marketRate" checked={marketRate} onCheckedChange={setMarketRate} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="prepayRequired" className="text-sm">Prepay required</Label>
              <Switch id="prepayRequired" checked={prepayRequired} onCheckedChange={setPrepayRequired} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="coldChainRequired" className="text-sm">Cold chain required</Label>
              <Switch id="coldChainRequired" checked={coldChainRequired} onCheckedChange={setColdChainRequired} />
            </div>
          </div>

          {error && (
            <div className="rounded-none border border-red-200 bg-red-50 p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Add Product
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
