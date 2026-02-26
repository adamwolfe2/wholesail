"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface InternalNotesEditorProps {
  orderId: string;
  initialNotes: string | null;
}

export function InternalNotesEditor({
  orderId,
  initialNotes,
}: InternalNotesEditorProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  function handleChange(value: string) {
    setNotes(value);
    setDirty(value !== (initialNotes ?? ""));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/internal-notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        toast.success("Internal notes saved");
        setDirty(false);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to save notes");
      }
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
        <Lock className="h-3.5 w-3.5 shrink-0" />
        <span>Internal use only — NOT visible to client</span>
      </div>
      <Textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add staff notes... (e.g. &quot;Driver: leave at loading dock&quot;, &quot;Client requested extra packaging&quot;)"
        rows={4}
        className="resize-y font-mono text-sm"
      />
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !dirty}
        >
          {saving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              Saving...
            </>
          ) : (
            "Save Notes"
          )}
        </Button>
      </div>
    </div>
  );
}
