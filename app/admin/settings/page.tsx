import { prisma } from "@/lib/db";
import { addDays } from "date-fns";
import { BillingReminders } from "./billing-reminders";
import { SettingsClient } from "./settings-client";

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
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
        Settings
      </h2>

      {/* Billing Reminders — server-fetched counts, client interaction */}
      <BillingReminders overdueCount={overdueCount} dueSoonCount={dueSoonCount} />

      {/* Integrations, Webhooks, Quick Links — client component */}
      <SettingsClient />
    </div>
  );
}
