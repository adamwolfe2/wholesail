"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";

interface Rep {
  id: string;
  name: string;
}

interface Org {
  id: string;
  name: string;
}

interface NewTaskDialogProps {
  reps: Rep[];
  orgs: Org[];
  /** Pre-fill a specific rep */
  defaultRepId?: string;
  /** Pre-fill a specific org */
  defaultOrgId?: string;
  /** Custom trigger label */
  triggerLabel?: string;
  /** Called after successful creation so parent can refresh */
  onCreated?: () => void;
}

export function NewTaskDialog({
  reps,
  orgs,
  defaultRepId,
  defaultOrgId,
  triggerLabel = "New Task",
  onCreated,
}: NewTaskDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repId, setRepId] = useState(defaultRepId ?? "");
  const [organizationId, setOrganizationId] = useState(defaultOrgId ?? "none");
  const [priority, setPriority] = useState("NORMAL");
  const [dueDate, setDueDate] = useState("");

  function resetForm() {
    setTitle("");
    setDescription("");
    setRepId(defaultRepId ?? "");
    setOrganizationId(defaultOrgId ?? "none");
    setPriority("NORMAL");
    setDueDate("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !repId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/rep-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repId,
          organizationId: organizationId === "none" ? undefined : organizationId,
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: dueDate || undefined,
          priority,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create task");
      }

      resetForm();
      setOpen(false);
      if (onCreated) {
        onCreated();
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none">
          <Plus className="h-4 w-4 mr-2" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#F9F7F4] border-[#E5E1DB] rounded-none max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg text-[#0A0A0A]">
            New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-2">
            <Label
              htmlFor="nt-title"
              className="text-xs text-[#0A0A0A]/60 uppercase tracking-wider"
            >
              Title *
            </Label>
            <Input
              id="nt-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
              className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none focus:border-[#0A0A0A]"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="nt-desc"
              className="text-xs text-[#0A0A0A]/60 uppercase tracking-wider"
            >
              Description
            </Label>
            <Textarea
              id="nt-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details"
              rows={2}
              className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none focus:border-[#0A0A0A] resize-none"
            />
          </div>

          {/* Priority + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-[#0A0A0A]/60 uppercase tracking-wider">
                Priority
              </Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="nt-due"
                className="text-xs text-[#0A0A0A]/60 uppercase tracking-wider"
              >
                Due Date
              </Label>
              <Input
                id="nt-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none focus:border-[#0A0A0A]"
              />
            </div>
          </div>

          {/* Assign to Rep */}
          <div className="space-y-2">
            <Label className="text-xs text-[#0A0A0A]/60 uppercase tracking-wider">
              Assign to Rep *
            </Label>
            <Select value={repId} onValueChange={setRepId}>
              <SelectTrigger className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none">
                <SelectValue placeholder="Select a rep" />
              </SelectTrigger>
              <SelectContent>
                {reps.map((rep) => (
                  <SelectItem key={rep.id} value={rep.id}>
                    {rep.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Link to Client */}
          <div className="space-y-2">
            <Label className="text-xs text-[#0A0A0A]/60 uppercase tracking-wider">
              Link to Client (Optional)
            </Label>
            <Select value={organizationId} onValueChange={setOrganizationId}>
              <SelectTrigger className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {orgs.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              disabled={loading || !title.trim() || !repId}
              className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Task
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              className="border-[#E5E1DB] text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.04] rounded-none"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
