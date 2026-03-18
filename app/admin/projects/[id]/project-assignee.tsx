"use client";

import { useState } from "react";
import { UserCircle, Loader2, Pencil, Check } from "lucide-react";

type Props = {
  projectId: string;
  initialAssignedTo: string | null;
};

export function ProjectAssignee({ projectId, initialAssignedTo }: Props) {
  const [assignedTo, setAssignedTo] = useState(initialAssignedTo || "");
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(assignedTo);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: inputValue.trim() || null }),
      });
      if (res.ok) {
        setAssignedTo(inputValue.trim());
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <UserCircle className="h-3.5 w-3.5 text-[#C8C0B4] shrink-0" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setEditing(false);
              setInputValue(assignedTo);
            }
          }}
          placeholder="Assign to..."
          autoFocus
          className="border border-[#E5E1DB] px-2 py-0.5 text-[10px] font-mono bg-white focus:outline-none w-28"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="text-[#0A0A0A]/60 hover:text-[#0A0A0A]"
        >
          {saving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Check className="h-3 w-3" />
          )}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setInputValue(assignedTo);
        setEditing(true);
      }}
      className="flex items-center gap-1 text-[10px] font-mono text-[#0A0A0A]/50 hover:text-[#0A0A0A] transition-colors"
      title="Edit assignee"
    >
      <UserCircle className="h-3.5 w-3.5 text-[#C8C0B4]" />
      {assignedTo ? (
        <span>{assignedTo}</span>
      ) : (
        <span className="text-[#0A0A0A]/30">Unassigned</span>
      )}
      <Pencil className="h-2.5 w-2.5 text-[#0A0A0A]/20" />
    </button>
  );
}
