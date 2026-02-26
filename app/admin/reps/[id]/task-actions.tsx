"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Trash2, Loader2 } from "lucide-react";

interface TaskActionsProps {
  taskId: string;
}

export function TaskActions({ taskId }: TaskActionsProps) {
  const router = useRouter();
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleComplete() {
    setCompleting(true);
    try {
      await fetch(`/api/admin/rep-tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });
      router.refresh();
    } finally {
      setCompleting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this task?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/rep-tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete" }),
      });
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={handleComplete}
        disabled={completing}
        className="border-[#E5E1DB] text-[#0A0A0A]/60 hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.04] rounded-none text-xs"
      >
        {completing ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <CheckCircle className="h-3 w-3" />
        )}
        <span className="ml-1">Complete</span>
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={deleting}
        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-none text-xs"
      >
        {deleting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Trash2 className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
