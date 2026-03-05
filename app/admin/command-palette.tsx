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
            <CommandItem onSelect={() => navigate("/admin/intakes")}>
              <FileInput className="mr-2 h-4 w-4" />
              Intakes
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/pipeline")}>
              <Kanban className="mr-2 h-4 w-4" />
              Pipeline
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/clients")}>
              <Users className="mr-2 h-4 w-4" />
              Clients
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/messages")}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/analytics")}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </CommandItem>
            <CommandItem onSelect={() => navigate("/admin/chat")}>
              <Sparkles className="mr-2 h-4 w-4" />
              AI Assistant
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
