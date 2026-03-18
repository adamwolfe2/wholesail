"use client";

import { useState } from "react";
import { Calendar, Clock, Loader2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  projectId: string;
  targetLaunchDate: string | null; // ISO string
  goLiveTimeline: string | null; // e.g. "ASAP", "Within 1 month"
};

function getDaysRemaining(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  // Reset to start of day for consistent comparison
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

function getCountdownColor(days: number): string {
  if (days < 0) return "bg-red-50 text-red-700 border-red-200";
  if (days < 7) return "bg-red-50 text-red-600 border-red-200";
  if (days <= 14) return "bg-yellow-50 text-yellow-700 border-yellow-200";
  return "bg-green-50 text-green-700 border-green-200";
}

function getCountdownLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Launch day";
  if (days === 1) return "1 day left";
  return `${days}d remaining`;
}

export function LaunchCountdown({ projectId, targetLaunchDate, goLiveTimeline }: Props) {
  const [editing, setEditing] = useState(false);
  const [dateValue, setDateValue] = useState(
    targetLaunchDate ? new Date(targetLaunchDate).toISOString().split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(targetLaunchDate);

  async function handleSave() {
    if (!dateValue) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLaunchDate: new Date(dateValue).toISOString() }),
      });
      if (res.ok) {
        setCurrentDate(new Date(dateValue).toISOString());
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  const daysLeft = currentDate ? getDaysRemaining(currentDate) : null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Timeline badge */}
      {goLiveTimeline && (
        <Badge
          variant="outline"
          className="text-[10px] font-mono px-2 py-0.5 bg-[#F9F7F4] text-[#0A0A0A]/60 border-[#E5E1DB]"
        >
          <Clock className="h-2.5 w-2.5 mr-1 inline" />
          {goLiveTimeline}
        </Badge>
      )}

      {/* Countdown badge */}
      {currentDate && daysLeft !== null && (
        <Badge
          variant="outline"
          className={`text-[10px] font-mono px-2 py-0.5 ${getCountdownColor(daysLeft)} ${daysLeft < 0 ? "font-bold" : ""}`}
        >
          <Calendar className="h-2.5 w-2.5 mr-1 inline" />
          {getCountdownLabel(daysLeft)}
        </Badge>
      )}

      {/* Date display / edit */}
      {editing ? (
        <div className="flex items-center gap-1">
          <input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="border border-[#E5E1DB] px-2 py-1 text-[10px] font-mono bg-white focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dateValue}
            className="text-[9px] font-mono font-semibold bg-[#0A0A0A] text-white px-2 py-1 hover:bg-[#0A0A0A]/80 disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : "Set"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-[9px] font-mono text-[#0A0A0A]/50 hover:text-[#0A0A0A] px-1"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-[10px] font-mono text-[#0A0A0A]/40 hover:text-[#0A0A0A] flex items-center gap-0.5"
          title={currentDate ? "Edit launch date" : "Set launch date"}
        >
          <Pencil className="h-2.5 w-2.5" />
          {currentDate
            ? new Date(currentDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Set launch date"}
        </button>
      )}
    </div>
  );
}

/**
 * Compact countdown badge for Kanban pipeline cards.
 */
export function LaunchCountdownBadge({
  targetLaunchDate,
}: {
  targetLaunchDate: string | null;
}) {
  if (!targetLaunchDate) return null;
  const days = getDaysRemaining(targetLaunchDate);
  return (
    <span
      className={`text-[8px] font-mono px-1 py-0.5 border ${getCountdownColor(days)} ${days < 0 ? "font-bold" : ""}`}
    >
      {getCountdownLabel(days)}
    </span>
  );
}
