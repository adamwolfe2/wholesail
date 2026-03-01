"use client";

import { useState } from "react";
import { CheckCircle2, Circle, GitBranch, Globe, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type ChecklistSection = {
  label: string;
  readOnly: boolean;
  items: { key: string; label: string }[];
};

const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    label: "Automated",
    readOnly: true,
    items: [
      { key: "configGenerated", label: "Config generated" },
      { key: "githubRepoCreated", label: "GitHub repo created" },
      { key: "vercelProjectCreated", label: "Vercel project created" },
    ],
  },
  {
    label: "Admin to-do",
    readOnly: false,
    items: [
      { key: "clerkSetup", label: "Clerk app created" },
      { key: "neonDbProvisioned", label: "Neon DB provisioned" },
      { key: "stripeConfigured", label: "Stripe configured" },
      { key: "customDomainConnected", label: "Custom domain connected" },
      { key: "envVarsConfigured", label: "Env vars all configured" },
      { key: "contentPopulated", label: "Content populated" },
    ],
  },
  {
    label: "Waiting on client",
    readOnly: false,
    items: [
      { key: "logoReceived", label: "Logo received" },
      { key: "productCatalogReceived", label: "Product catalog received" },
      { key: "marketingPhotosReceived", label: "Marketing photos received" },
      { key: "domainTransferred", label: "Domain transferred" },
      { key: "clientApproved", label: "Client approved" },
    ],
  },
];

type Props = {
  projectId: string;
  buildChecklist: Record<string, boolean>;
  githubRepo: string | null;
  vercelUrl: string | null;
  customDomain: string | null;
  currentStatus: string;
};

export function ProjectActions({
  projectId,
  buildChecklist: initialChecklist,
  githubRepo,
  vercelUrl,
  customDomain,
  currentStatus,
}: Props) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>(initialChecklist);
  const [status, setStatus] = useState(currentStatus);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  async function toggleChecklist(key: string) {
    const newVal = !checklist[key];
    setSaving(key);
    try {
      await fetch(`/api/admin/projects/${projectId}/checklist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: newVal }),
      });
      setChecklist((prev) => ({ ...prev, [key]: newVal }));
    } finally {
      setSaving(null);
    }
  }

  async function handleStatusChange(newStatus: string) {
    setStatusSaving(true);
    try {
      await fetch(`/api/admin/projects/${projectId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleAddNote() {
    if (!noteText.trim()) return;
    setNoteSaving(true);
    try {
      await fetch(`/api/admin/projects/${projectId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: noteText.trim() }),
      });
      setNoteText("");
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 2000);
    } finally {
      setNoteSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Build Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg font-normal">Build Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm">
          {CHECKLIST_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#0A0A0A]/40 mb-2">
                {section.label}
              </p>
              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const checked = !!checklist[item.key];
                  const isSaving = saving === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      disabled={section.readOnly || isSaving}
                      onClick={() => !section.readOnly && toggleChecklist(item.key)}
                      className="w-full flex items-center gap-2.5 text-left group disabled:cursor-default"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#0A0A0A]/30 shrink-0" />
                      ) : checked ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-[#0A0A0A]/20 shrink-0 group-hover:text-[#0A0A0A]/40" />
                      )}
                      <span
                        className={`text-xs font-mono ${checked ? "text-[#0A0A0A]/60 line-through" : "text-[#0A0A0A]"}`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Links */}
      {(githubRepo || vercelUrl) && (
        <Card>
          <CardContent className="pt-4 space-y-2">
            {githubRepo && (
              <a
                href={`https://github.com/${githubRepo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-mono text-[#0A0A0A]/70 hover:text-[#0A0A0A]"
              >
                <GitBranch className="h-3.5 w-3.5" />
                Open GitHub
                <ExternalLink className="h-2.5 w-2.5 ml-auto" />
              </a>
            )}
            {vercelUrl && (
              <a
                href={vercelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-mono text-[#0A0A0A]/70 hover:text-[#0A0A0A]"
              >
                <Globe className="h-3.5 w-3.5" />
                Open Staging
                <ExternalLink className="h-2.5 w-2.5 ml-auto" />
              </a>
            )}
            {customDomain && (
              <a
                href={`https://${customDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-mono text-[#0A0A0A]/70 hover:text-[#0A0A0A]"
              >
                <Globe className="h-3.5 w-3.5" />
                Open Portal
                <ExternalLink className="h-2.5 w-2.5 ml-auto" />
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Mover */}
      <Card>
        <CardContent className="pt-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-[#0A0A0A]/40 mb-2">
            Project Status
          </p>
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={statusSaving}
              className="flex-1 border border-[#E5E1DB] px-3 py-2 text-xs font-mono bg-white focus:outline-none"
            >
              {["INQUIRY", "ONBOARDING", "BUILDING", "REVIEW", "LIVE", "CHURNED"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                )
              )}
            </select>
            {statusSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0A0A0A]/40" />}
          </div>
          <div className="mt-2">
            <Badge
              variant="outline"
              className="text-[9px] font-mono"
            >
              {status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-base font-normal">Add Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note, update, or milestone..."
            rows={3}
            className="w-full border border-[#E5E1DB] px-3 py-2 text-xs font-mono bg-white focus:outline-none resize-none"
          />
          <Separator />
          <button
            type="button"
            onClick={handleAddNote}
            disabled={noteSaving || !noteText.trim()}
            className="w-full text-xs font-mono font-semibold bg-[#0A0A0A] text-white px-3 py-2 hover:bg-[#0A0A0A]/80 disabled:opacity-40 flex items-center justify-center gap-1 transition-colors"
          >
            {noteSaving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : noteSuccess ? (
              "Saved"
            ) : (
              "Save Note"
            )}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
