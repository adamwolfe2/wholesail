"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Package,
  Users,
  BarChart3,
  Settings,
  Plus,
  Search,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  function navigate(path: string) {
    router.push(path);
    setOpen(false);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex items-center gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="text-xs">Search...</span>
        <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, actions..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Pages">
            <CommandItem onSelect={() => navigate("/admin")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/orders")}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Orders
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/invoices")}>
              <FileText className="mr-2 h-4 w-4" />
              Invoices
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/products")}>
              <Package className="mr-2 h-4 w-4" />
              Products
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/clients")}>
              <Users className="mr-2 h-4 w-4" />
              Clients
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/analytics")}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => navigate("/admin/products")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/invoices")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </CommandItem>
            <CommandItem
              onSelect={() => {
                window.location.href = "/api/admin/orders/export";
                setOpen(false);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Orders CSV
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="External">
            <CommandItem
              onSelect={() => {
                window.open("/", "_blank");
                setOpen(false);
              }}
            >
              <Package className="mr-2 h-4 w-4" />
              View Storefront
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
