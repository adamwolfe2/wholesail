"use client";

import { useState } from "react";
import { Mail, Loader2, Check, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  projectId: string;
  contactEmail: string;
};

type Template = {
  id: "building" | "assets" | "review" | "live";
  label: string;
  description: string;
};

const TEMPLATES: Template[] = [
  {
    id: "building",
    label: "Portal is being built",
    description: "Notify client that their portal build has started with a timeline estimate.",
  },
  {
    id: "assets",
    label: "We need your assets",
    description: "Request logo, product catalog, photos, and brand guidelines from client.",
  },
  {
    id: "review",
    label: "Ready for your review",
    description: "Send the staging/preview URL for client to review before launch.",
  },
  {
    id: "live",
    label: "Portal is live!",
    description: "Announce the live portal with the production URL and getting-started guide.",
  },
];

export function ProjectCommunications({ projectId, contactEmail }: Props) {
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState<string | null>(null);

  async function handleSend(templateId: string) {
    setSending(templateId);
    setErrors((prev) => ({ ...prev, [templateId]: "" }));
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: templateId }),
      });
      const data = await res.json();
      if (data.success) {
        setSent((prev) => ({ ...prev, [templateId]: true }));
      } else {
        setErrors((prev) => ({ ...prev, [templateId]: data.error || "Failed to send" }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, [templateId]: "Network error" }));
    } finally {
      setSending(null);
      setConfirming(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg font-normal flex items-center gap-2">
          <Mail className="h-4 w-4 text-sand" />
          Communications
        </CardTitle>
        <p className="text-[10px] font-mono text-ink/40 mt-1">
          Send to: {contactEmail}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {TEMPLATES.map((template) => {
          const isSending = sending === template.id;
          const wasSent = sent[template.id];
          const error = errors[template.id];
          const isConfirming = confirming === template.id;

          return (
            <div
              key={template.id}
              className="border border-shell px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-ink font-medium">
                    {template.label}
                  </p>
                  <p className="text-[10px] text-ink/40 mt-0.5">
                    {template.description}
                  </p>
                </div>
                <div className="shrink-0">
                  {isConfirming ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSend(template.id)}
                        disabled={isSending}
                        className="text-[9px] font-mono font-semibold bg-ink text-white px-2 py-1 hover:bg-ink/80 disabled:opacity-40"
                      >
                        {isSending ? (
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        ) : (
                          "Confirm"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirming(null)}
                        className="text-[9px] font-mono text-ink/50 hover:text-ink px-1"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : wasSent ? (
                    <span className="text-[9px] font-mono text-green-600 flex items-center gap-0.5">
                      <Check className="h-2.5 w-2.5" />
                      Sent
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirming(template.id)}
                      className="text-[9px] font-mono font-semibold border border-shell px-2 py-1 hover:bg-cream text-ink/70 transition-colors"
                    >
                      Send
                    </button>
                  )}
                </div>
              </div>
              {error && (
                <p className="text-[9px] font-mono text-red-600 mt-1 flex items-center gap-0.5">
                  <AlertCircle className="h-2.5 w-2.5" />
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
