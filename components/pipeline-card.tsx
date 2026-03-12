"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GitBranch, Globe, AlertCircle, Layers, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPhaseName } from "@/lib/build/phases";

export type PipelineItem = {
  id: string;
  column: string;
  company: string;
  industry: string;
  createdAt: string; // ISO string
  // intake-specific
  intakeId?: string;
  reviewedAt?: string | null;
  projectId?: string | null;
  projectStatus?: string | null;
  // project-specific
  currentPhase?: number;
  enabledFeatures?: string[];
  githubRepo?: string | null;
  vercelUrl?: string | null;
  customDomain?: string | null;
  buildChecklist?: Record<string, boolean> | null;
  // cost health
  contractValue?: number;     // dollars
  totalSpentCents?: number;   // sum of ProjectCost.amountCents
  // next action label
  nextAction?: string;
};

function daysAgo(isoString: string): number {
  return Math.floor((Date.now() - new Date(isoString).getTime()) / 86400000);
}

function missingCount(item: PipelineItem): number {
  if (item.column === "new" || item.column === "scoping") return 0;
  let missing = 0;
  if (!item.githubRepo) missing++;
  if (!item.vercelUrl) missing++;
  if (!item.buildChecklist?.configGenerated) missing++;
  return missing;
}

export function PipelineCard({ item }: { item: PipelineItem }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = daysAgo(item.createdAt);
  const missing = missingCount(item);
  const featureCount = item.enabledFeatures?.length ?? 0;

  async function handleStartBuild() {
    if (!item.intakeId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/intakes/${item.intakeId}/build-start`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Build failed");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkLive() {
    if (!item.projectId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/projects/${item.projectId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "LIVE" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Failed to mark live:", data);
        setError(data.error ?? "Failed to update status");
        return;
      }
      router.refresh();
    } catch {
      setError("Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-[#E5E1DB] bg-white p-3 space-y-2.5 hover:border-[#0A0A0A]/20 transition-colors">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-serif font-bold text-sm text-[#0A0A0A] truncate leading-tight">
            {item.company}
          </p>
          <Badge
            variant="outline"
            className="text-[9px] px-1.5 py-0 mt-0.5 border-[#E5E1DB] text-[#0A0A0A]/50 font-mono"
          >
            {item.industry}
          </Badge>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {missing > 0 && (
            <span className="text-[9px] font-mono bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 flex items-center gap-0.5">
              <AlertCircle className="h-2.5 w-2.5" />
              {missing}
            </span>
          )}
          {featureCount > 0 && (
            <span className="text-[9px] font-mono bg-[#F9F7F4] text-[#0A0A0A]/50 border border-[#E5E1DB] px-1.5 py-0.5 flex items-center gap-0.5">
              <Layers className="h-2.5 w-2.5" />
              {featureCount}
            </span>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono text-[#0A0A0A]/40">
          {days === 0 ? "today" : `${days}d ago`}
        </span>
        {item.currentPhase !== undefined && item.currentPhase > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-16 bg-[#E5E1DB]">
              <div
                className="h-full bg-[#0A0A0A]"
                style={{ width: `${Math.round((item.currentPhase / 15) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-[#0A0A0A]/40">
              {item.currentPhase} · {getPhaseName(item.currentPhase)}
            </span>
          </div>
        )}
      </div>

      {/* Budget health bar */}
      {item.contractValue !== undefined && item.contractValue > 0 && item.totalSpentCents !== undefined && (() => {
        const budgetPct = Math.round((item.totalSpentCents / 100 / item.contractValue) * 100);
        const barColor = budgetPct > 85 ? "#dc2626" : budgetPct > 60 ? "#d97706" : "#16a34a";
        if (budgetPct === 0) return null;
        return (
          <div>
            <div className="h-[3px] w-full bg-[#E5E1DB]">
              <div className="h-full transition-all" style={{ width: `${Math.min(budgetPct, 100)}%`, backgroundColor: barColor }} />
            </div>
            {budgetPct > 60 && (
              <span className="text-[8px] font-mono" style={{ color: barColor }}>
                {budgetPct}% of budget
              </span>
            )}
          </div>
        );
      })()}

      {/* Infra badges */}
      {(item.githubRepo || item.vercelUrl) && (
        <div className="flex gap-1.5">
          {item.githubRepo && (
            <a
              href={`https://github.com/${item.githubRepo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-mono flex items-center gap-0.5 text-[#0A0A0A]/50 hover:text-[#0A0A0A]"
            >
              <GitBranch className="h-2.5 w-2.5" />
              repo
            </a>
          )}
          {item.vercelUrl && (
            <a
              href={item.vercelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-mono flex items-center gap-0.5 text-[#0A0A0A]/50 hover:text-[#0A0A0A]"
            >
              <Globe className="h-2.5 w-2.5" />
              staging
            </a>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-[9px] font-mono text-red-600 truncate">{error}</p>
      )}

      {/* Action button */}
      <div className="pt-0.5">
        {item.column === "new" && item.intakeId && (
          <Link
            href={`/admin/intakes/${item.intakeId}`}
            className="text-[10px] font-mono font-semibold text-[#0A0A0A] hover:underline flex items-center gap-1"
          >
            Review <ExternalLink className="h-2.5 w-2.5" />
          </Link>
        )}

        {item.column === "scoping" && item.intakeId && (
          <button
            type="button"
            onClick={handleStartBuild}
            disabled={loading}
            className="w-full text-[10px] font-mono font-semibold bg-[#0A0A0A] text-white px-2 py-1.5 hover:bg-[#0A0A0A]/80 disabled:opacity-50 flex items-center justify-center gap-1 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                Building...
              </>
            ) : (
              "Start Build"
            )}
          </button>
        )}

        {item.column === "building" && item.projectId && (
          <Link
            href={`/admin/projects/${item.projectId}`}
            className="text-[10px] font-mono font-semibold text-[#0A0A0A] hover:underline flex items-center gap-1"
          >
            View Project <ExternalLink className="h-2.5 w-2.5" />
          </Link>
        )}

        {item.column === "review" && item.projectId && (
          <Link
            href={`/admin/projects/${item.projectId}`}
            className="text-[10px] font-mono font-semibold text-[#0A0A0A] hover:underline flex items-center gap-1"
          >
            View Project <ExternalLink className="h-2.5 w-2.5" />
          </Link>
        )}

        {item.column === "staging" && (
          <div className="flex items-center gap-2">
            {item.vercelUrl && (
              <a
                href={item.vercelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono font-semibold text-[#0A0A0A] hover:underline flex items-center gap-1"
              >
                Open Staging <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
            {item.projectId && (
              <button
                type="button"
                onClick={handleMarkLive}
                disabled={loading}
                className="text-[10px] font-mono font-semibold bg-[#0A0A0A] text-white px-2 py-1 hover:bg-[#0A0A0A]/80 disabled:opacity-50 transition-colors"
              >
                {loading ? "..." : "Mark Live"}
              </button>
            )}
          </div>
        )}

        {item.column === "live" && (
          <a
            href={item.customDomain ? `https://${item.customDomain}` : (item.vercelUrl ?? "#")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono font-semibold text-[#0A0A0A] hover:underline flex items-center gap-1"
          >
            Open Portal <ExternalLink className="h-2.5 w-2.5" />
          </a>
        )}
      </div>

      {/* Next action badge */}
      {item.nextAction && (
        <div className="pt-1">
          <span className="text-[9px] font-mono bg-[#F9F7F4] text-[#0A0A0A]/50 border border-[#E5E1DB] px-1.5 py-0.5">
            {item.nextAction}
          </span>
        </div>
      )}
    </div>
  );
}
