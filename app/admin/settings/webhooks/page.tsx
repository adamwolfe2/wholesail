"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Webhook, Plus, Trash2, Loader2, ArrowLeft, Check } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

const ALL_EVENTS = [
  "order.created",
  "order.status_changed",
  "invoice.created",
  "payment.received",
] as const;

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  _count: { logs: number };
}

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<Set<string>>(new Set(ALL_EVENTS));
  const [showForm, setShowForm] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEndpoints();
  }, []);

  async function fetchEndpoints() {
    try {
      const res = await fetch("/api/admin/webhooks");
      if (res.ok) {
        const data = await res.json();
        setEndpoints(data.endpoints || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function createEndpoint() {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl, events: Array.from(newEvents) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      setNewSecret(data.secret);
      setNewUrl("");
      setNewEvents(new Set(ALL_EVENTS));
      fetchEndpoints();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create webhook");
    } finally {
      setCreating(false);
    }
  }

  async function deleteEndpoint(id: string) {
    try {
      await fetch(`/api/admin/webhooks/${id}`, { method: "DELETE" });
      setEndpoints((prev) => prev.filter((e) => e.id !== id));
    } catch {
      // ignore
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      await fetch(`/api/admin/webhooks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      setEndpoints((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isActive: !isActive } : e)),
      );
    } catch {
      // ignore
    }
  }

  function toggleEvent(event: string) {
    setNewEvents((prev) => {
      const next = new Set(prev);
      if (next.has(event)) next.delete(event);
      else next.add(event);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="rounded-none -ml-2">
          <Link href="/admin/settings">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Settings
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-normal">Webhooks</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Send real-time event notifications to external systems.
          </p>
        </div>
        <Button
          onClick={() => { setShowForm(!showForm); setNewSecret(null); }}
          className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Endpoint
        </Button>
      </div>

      {/* New Secret Banner */}
      {newSecret && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-green-800 mb-2">
              Webhook created! Save this signing secret — it will not be shown again:
            </p>
            <code className="block bg-white border border-green-200 p-3 text-xs font-mono break-all">
              {newSecret}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-green-700"
              onClick={() => setNewSecret(null)}
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Form */}
      {showForm && (
        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader>
            <CardTitle className="font-serif text-lg">New Webhook Endpoint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Endpoint URL
              </label>
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/webhooks"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Events
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {ALL_EVENTS.map((event) => (
                  <button
                    key={event}
                    onClick={() => toggleEvent(event)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors ${
                      newEvents.has(event)
                        ? "bg-[#0A0A0A] text-[#F9F7F4] border-[#0A0A0A]"
                        : "bg-transparent text-[#0A0A0A]/60 border-[#C8C0B4]"
                    }`}
                  >
                    {newEvents.has(event) && <Check className="h-3 w-3" />}
                    {event}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button
                onClick={createEndpoint}
                disabled={creating || !newUrl || newEvents.size === 0}
                className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Endpoint
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="rounded-none"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Endpoints List */}
      <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Endpoints</CardTitle>
          <CardDescription>{endpoints.length} configured</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#C8C0B4]" />
            </div>
          ) : endpoints.length === 0 ? (
            <div className="text-center py-12">
              <Webhook className="h-12 w-12 text-[#C8C0B4] mx-auto mb-4" />
              <h3 className="font-serif text-lg font-medium mb-2 text-[#0A0A0A]">No webhooks configured</h3>
              <p className="text-[#0A0A0A]/50 text-sm">
                Add an endpoint to receive real-time event notifications.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {endpoints.map((ep) => (
                <div key={ep.id} className="flex items-start justify-between border border-[#C8C0B4]/50 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono truncate">{ep.url}</code>
                      <Badge
                        variant="outline"
                        className={ep.isActive
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-transparent text-[#0A0A0A]/40 border-[#C8C0B4]"
                        }
                      >
                        {ep.isActive ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {ep.events.map((ev) => (
                        <span key={ev} className="text-[10px] px-1.5 py-0.5 bg-[#0A0A0A]/5 text-[#0A0A0A]/60 border border-[#C8C0B4]/30">
                          {ev}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {ep._count.logs} deliveries &bull; Created{" "}
                      {new Date(ep.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(ep.id, ep.isActive)}
                      className="text-xs rounded-none"
                    >
                      {ep.isActive ? "Pause" : "Activate"}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-none"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete webhook endpoint?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this webhook endpoint and stop all event
                            deliveries to <code className="text-xs font-mono">{ep.url}</code>. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteEndpoint(ep.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete Endpoint
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
