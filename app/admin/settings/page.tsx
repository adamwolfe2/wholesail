import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Webhook, ArrowRight } from "lucide-react";
import { BillingReminders } from "./billing-reminders";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  let overdueCount = 0;
  let dueSoonCount = 0;

  try {
    const now = new Date();
    const fiveDaysFromNow = addDays(now, 5);

    const [overdue, dueSoon] = await Promise.all([
      prisma.invoice.count({
        where: { status: "OVERDUE" },
      }),
      prisma.invoice.count({
        where: {
          status: "PENDING",
          dueDate: { lte: fiveDaysFromNow, gte: now },
        },
      }),
    ]);

    overdueCount = overdue;
    dueSoonCount = dueSoon;
  } catch {
    // DB may not be available
  }

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
        Settings
      </h2>

      {/* Billing Reminders — server-fetched counts, client interaction */}
      <BillingReminders overdueCount={overdueCount} dueSoonCount={dueSoonCount} />

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/settings/team">
          <Card className="border-shell bg-cream hover:bg-cream/80 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Team Management</CardTitle>
              <Users className="h-4 w-4 text-sand" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">View and manage admin users, reps, and roles</p>
              <span className="text-xs text-ink font-medium inline-flex items-center gap-1 mt-2">
                Manage <ArrowRight className="h-3 w-3" />
              </span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/settings/webhooks">
          <Card className="border-shell bg-cream hover:bg-cream/80 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
              <Webhook className="h-4 w-4 text-sand" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Configure webhook endpoints for event notifications</p>
              <span className="text-xs text-ink font-medium inline-flex items-center gap-1 mt-2">
                Configure <ArrowRight className="h-3 w-3" />
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Integrations, Webhooks, Quick Links — client component */}
      <SettingsClient />
    </div>
  );
}
