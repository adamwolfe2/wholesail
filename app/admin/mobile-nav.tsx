"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Package } from "lucide-react";
import { adminNav } from "./nav-config";
import { cn } from "@/lib/utils";

export function AdminMobileNav({ navBadges = {} }: { navBadges?: Record<string, number> }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {process.env.NEXT_PUBLIC_BRAND_NAME || 'Wholesail'} Admin
          </SheetTitle>
        </SheetHeader>
        <nav className="p-3 space-y-1">
          {adminNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const badgeCount = item.badgeKey ? (navBadges[item.badgeKey] ?? 0) : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {badgeCount > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-[#0A0A0A] text-[#F9F7F4] px-1.5 py-0.5 min-w-[18px] text-center leading-tight rounded-sm">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
