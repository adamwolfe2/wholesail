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
  FileInput,
  Kanban,
  Users,
  BarChart3,
  Settings,
  MessageSquare,
  Sparkles,
  Search,
  ExternalLink,
  ShoppingCart,
  Package,
  Truck,
  Warehouse,
  FileText,
  Tag,
  Boxes,
  Briefcase,
  UserCheck,
  Mail,
  ListChecks,
  TrendingUp,
  Store,
  Zap,
  HandCoins,
  History,
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

          <CommandGroup heading="Overview">
            <CommandItem onSelect={() => navigate("/admin")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Operations">
            <CommandItem onSelect={() => navigate("/admin/orders")} keywords={["purchase", "sales"]}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Orders
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/fulfillment")} keywords={["packing", "shipping"]}>
              <Package className="mr-2 h-4 w-4" />
              Fulfillment
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/shipments")} keywords={["tracking", "delivery"]}>
              <Truck className="mr-2 h-4 w-4" />
              Shipments
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/inventory")} keywords={["stock", "warehouse"]}>
              <Warehouse className="mr-2 h-4 w-4" />
              Inventory
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/invoices")} keywords={["billing", "payments"]}>
              <FileText className="mr-2 h-4 w-4" />
              Invoices
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/quotes")} keywords={["estimates", "proposals"]}>
              <HandCoins className="mr-2 h-4 w-4" />
              Quotes
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Clients">
            <CommandItem onSelect={() => navigate("/admin/clients")} keywords={["customers", "accounts"]}>
              <Users className="mr-2 h-4 w-4" />
              Clients
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/messages")} keywords={["chat", "inbox"]}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/wholesale")} keywords={["applications", "b2b"]}>
              <Briefcase className="mr-2 h-4 w-4" />
              Wholesale
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Catalog">
            <CommandItem onSelect={() => navigate("/admin/products")} keywords={["items", "catalog"]}>
              <Boxes className="mr-2 h-4 w-4" />
              Products
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/pricing")} keywords={["prices", "tiers"]}>
              <Tag className="mr-2 h-4 w-4" />
              Pricing
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/drops")} keywords={["releases", "launches"]}>
              <Zap className="mr-2 h-4 w-4" />
              Drops
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/suppliers")} keywords={["vendors", "sources"]}>
              <Store className="mr-2 h-4 w-4" />
              Suppliers
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Growth">
            <CommandItem onSelect={() => navigate("/admin/leads")} keywords={["prospects", "pipeline"]}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Leads
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/intakes")} keywords={["submissions", "onboarding"]}>
              <FileInput className="mr-2 h-4 w-4" />
              Intakes
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/pipeline")} keywords={["builds", "kanban"]}>
              <Kanban className="mr-2 h-4 w-4" />
              Pipeline
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/reps")} keywords={["salespeople", "agents"]}>
              <UserCheck className="mr-2 h-4 w-4" />
              Sales Reps
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/subscribers")} keywords={["email", "newsletter"]}>
              <Mail className="mr-2 h-4 w-4" />
              Subscribers
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/tasks")} keywords={["todos", "action items"]}>
              <ListChecks className="mr-2 h-4 w-4" />
              Tasks
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Analytics">
            <CommandItem onSelect={() => navigate("/admin/analytics")} keywords={["reports", "metrics"]}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/ceo")} keywords={["executive", "overview"]}>
              <TrendingUp className="mr-2 h-4 w-4" />
              CEO Dashboard
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/audit-log")} keywords={["history", "changes"]}>
              <History className="mr-2 h-4 w-4" />
              Audit Log
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="System">
            <CommandItem onSelect={() => navigate("/admin/chat")} keywords={["ai", "assistant", "help"]}>
              <Sparkles className="mr-2 h-4 w-4" />
              AI Assistant
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/settings")} keywords={["config", "preferences"]}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="External">
            <CommandItem
              onSelect={() => {
                window.open("https://wholesailhub.com", "_blank");
                setOpen(false);
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Marketing Site
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
