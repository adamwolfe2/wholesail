"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";

interface Org {
  id: string;
  name: string;
}

interface NewTaskFormProps {
  repId: string;
  orgs: Org[];
}

export function NewTaskForm({ repId, orgs }: NewTaskFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organizationId, setOrganizationId] = useState("none");
  const [priority, setPriority] = useState("NORMAL");
  const [dueDate, setDueDate] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

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

      setTitle("");
      setDescription("");
      setOrganizationId("none");
      setPriority("NORMAL");
      setDueDate("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="bg-ink text-cream hover:bg-ink/80 rounded-none"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Task
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-shell bg-cream p-4 space-y-4"
    >
      <h3 className="font-serif text-base font-semibold text-ink">
        New Task
      </h3>

      <div className="space-y-2">
        <Label htmlFor="task-title" className="text-xs text-ink/60 uppercase tracking-wider">
          Title *
        </Label>
        <Input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          required
          className="border-shell bg-cream rounded-none focus:border-ink"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-desc" className="text-xs text-ink/60 uppercase tracking-wider">
          Description
        </Label>
        <Textarea
          id="task-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details"
          rows={2}
          maxLength={1000}
          className="border-shell bg-cream rounded-none focus:border-ink resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-ink/60 uppercase tracking-wider">
            Organization
          </Label>
          <Select value={organizationId} onValueChange={setOrganizationId}>
            <SelectTrigger className="border-shell bg-cream rounded-none">
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

        <div className="space-y-2">
          <Label className="text-xs text-ink/60 uppercase tracking-wider">
            Priority
          </Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="border-shell bg-cream rounded-none">
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-due" className="text-xs text-ink/60 uppercase tracking-wider">
          Due Date
        </Label>
        <Input
          id="task-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border-shell bg-cream rounded-none focus:border-ink"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button
          type="submit"
          disabled={loading || !title.trim()}
          className="bg-ink text-cream hover:bg-ink/80 rounded-none"
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
          onClick={() => setOpen(false)}
          className="border-shell text-ink hover:bg-ink/[0.04] rounded-none"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
