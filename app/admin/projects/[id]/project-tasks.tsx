"use client";

import { useState, useCallback } from "react";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Plus,
  ExternalLink,
  Loader2,
  ListChecks,
  Clock,
  Send,
  Shield,
  Globe,
  Zap,
  Search,
  Lock,
  Rocket,
  Play,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PHASE_LABELS } from "@/lib/build/default-tasks";

type Task = {
  id: string;
  label: string;
  description: string | null;
  phase: number;
  completed: boolean;
  completedAt: string | null;
  externalUrl: string | null;
  automationAction: string | null;
  automationResult: Record<string, unknown> | null;
  createdAt: string;
};

type Props = {
  projectId: string;
  initialTasks: Task[];
};

// Map automation actions to button labels and icons
const AUTOMATION_CONFIG: Record<
  string,
  { label: string; icon: typeof Play; confirmMessage: string }
> = {
  stripe_webhook: {
    label: "Configure",
    icon: Shield,
    confirmMessage:
      "This will create a Stripe webhook endpoint and save the signing secret to Vercel env vars.",
  },
  verify_env_vars: {
    label: "Verify",
    icon: Search,
    confirmMessage:
      "This will read all env vars from the Vercel project and report which are configured, pending, or missing.",
  },
  add_domain: {
    label: "Add Domain",
    icon: Globe,
    confirmMessage:
      "This will add the custom domain to the Vercel project. The client will still need to configure DNS records.",
  },
  send_assets_email: {
    label: "Send Email",
    icon: Send,
    confirmMessage:
      'This will send the "We need your assets" email to the client.',
  },
  send_review_email: {
    label: "Send Email",
    icon: Send,
    confirmMessage:
      'This will send the "Ready for review" email to the client with the staging URL.',
  },
  send_live_email: {
    label: "Send Email",
    icon: Send,
    confirmMessage:
      'This will send the "Portal is live" email to the client.',
  },
  verify_migration: {
    label: "Verify",
    icon: Search,
    confirmMessage:
      "This will hit the deployed /api/status endpoint to verify the application is running.",
  },
  verify_ssl: {
    label: "Verify SSL",
    icon: Lock,
    confirmMessage:
      "This will check the custom domain for valid HTTPS and SSL certificate.",
  },
  lighthouse_audit: {
    label: "Run Audit",
    icon: Zap,
    confirmMessage:
      "This will run a Google PageSpeed Insights audit on the site. This may take up to 60 seconds.",
  },
  mark_live: {
    label: "Go Live",
    icon: Rocket,
    confirmMessage:
      "This will set the project status to LIVE and record the launch date. This cannot be undone easily.",
  },
};

export function ProjectTasks({ projectId, initialTasks }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>(() => {
    // Auto-expand phases that have incomplete tasks
    const expanded: Record<number, boolean> = {};
    for (let i = 0; i <= 5; i++) {
      const phaseTasks = initialTasks.filter((t) => t.phase === i);
      const hasIncomplete = phaseTasks.some((t) => !t.completed);
      expanded[i] = hasIncomplete && phaseTasks.length > 0;
    }
    return expanded;
  });
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [savingTasks, setSavingTasks] = useState<Record<string, boolean>>({});
  const [executingTasks, setExecutingTasks] = useState<Record<string, boolean>>({});
  const [executionResults, setExecutionResults] = useState<
    Record<string, { success: boolean; message: string; details?: Record<string, unknown> }>
  >({});
  const [addingPhase, setAddingPhase] = useState<number | null>(null);
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [newTaskSaving, setNewTaskSaving] = useState(false);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const togglePhase = useCallback((phase: number) => {
    setExpandedPhases((prev) => ({ ...prev, [phase]: !prev[phase] }));
  }, []);

  const toggleDescription = useCallback((taskId: string) => {
    setExpandedDescriptions((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  }, []);

  async function toggleTask(taskId: string, currentCompleted: boolean) {
    setSavingTasks((prev) => ({ ...prev, [taskId]: true }));
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentCompleted }),
      });
      if (res.ok) {
        const { task: updated } = await res.json();
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, completed: updated.completed, completedAt: updated.completedAt }
              : t
          )
        );
      }
    } finally {
      setSavingTasks((prev) => ({ ...prev, [taskId]: false }));
    }
  }

  async function executeTask(taskId: string, action: string) {
    const config = AUTOMATION_CONFIG[action];
    if (!config) return;

    const confirmed = window.confirm(`${config.confirmMessage}\n\nContinue?`);
    if (!confirmed) return;

    setExecutingTasks((prev) => ({ ...prev, [taskId]: true }));
    // Clear previous result
    setExecutionResults((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    // Auto-expand description to show result
    setExpandedDescriptions((prev) => ({ ...prev, [taskId]: true }));

    try {
      const res = await fetch(
        `/api/admin/projects/${projectId}/tasks/${taskId}/execute`,
        { method: "POST" }
      );

      const data = await res.json();

      setExecutionResults((prev) => ({
        ...prev,
        [taskId]: {
          success: data.success,
          message: data.message,
          details: data.details ?? undefined,
        },
      }));

      // If auto-completed, update task state
      if (data.autoCompleted && data.task) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  completed: data.task.completed,
                  completedAt: data.task.completedAt,
                }
              : t
          )
        );
      }
    } catch (err) {
      setExecutionResults((prev) => ({
        ...prev,
        [taskId]: {
          success: false,
          message: `Network error: ${(err as Error).message}`,
        },
      }));
    } finally {
      setExecutingTasks((prev) => ({ ...prev, [taskId]: false }));
    }
  }

  async function handleAddTask(phase: number) {
    if (!newTaskLabel.trim()) return;
    setNewTaskSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newTaskLabel.trim(), phase }),
      });
      if (res.ok) {
        const { task } = await res.json();
        setTasks((prev) => [...prev, { ...task, automationAction: null, automationResult: null }]);
        setNewTaskLabel("");
        setAddingPhase(null);
      }
    } finally {
      setNewTaskSaving(false);
    }
  }

  // Group tasks by phase
  const phases = [0, 1, 2, 3, 4, 5];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg font-normal flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-[#C8C0B4]" />
          Fulfillment Tasks
        </CardTitle>
        <div className="pt-2">
          {/* Overall progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 bg-[#E5E1DB]">
              <div
                className="h-full bg-[#0A0A0A] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="font-mono text-xs text-[#0A0A0A]/60 shrink-0">
              {completedTasks}/{totalTasks} done
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {phases.map((phase) => {
          const phaseTasks = tasks.filter((t) => t.phase === phase);
          if (phaseTasks.length === 0 && addingPhase !== phase) return null;

          const phaseCompleted = phaseTasks.filter((t) => t.completed).length;
          const phaseTotal = phaseTasks.length;
          const isExpanded = expandedPhases[phase] ?? false;
          const allDone = phaseTotal > 0 && phaseCompleted === phaseTotal;

          return (
            <div key={phase} className="border border-[#E5E1DB]">
              {/* Phase header */}
              <button
                type="button"
                onClick={() => togglePhase(phase)}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-[#F9F7F4] transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-[#0A0A0A]/40 shrink-0" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-[#0A0A0A]/40 shrink-0" />
                )}
                {allDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                ) : (
                  <span
                    className="h-3.5 w-3.5 shrink-0 border border-[#0A0A0A]/20 flex items-center justify-center text-[8px] font-mono text-[#0A0A0A]/50"
                    style={{ borderRadius: 0 }}
                  >
                    {phase}
                  </span>
                )}
                <span className="flex-1 font-mono text-xs text-[#0A0A0A]">
                  Phase {phase} — {PHASE_LABELS[phase] ?? `Phase ${phase}`}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[9px] font-mono px-1.5 py-0 shrink-0 ${
                    allDone
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-[#F9F7F4] text-[#0A0A0A]/50 border-[#E5E1DB]"
                  }`}
                >
                  {phaseCompleted}/{phaseTotal}
                </Badge>
              </button>

              {/* Phase tasks */}
              {isExpanded && (
                <div className="border-t border-[#E5E1DB]">
                  {phaseTasks.map((task) => {
                    const isSaving = savingTasks[task.id];
                    const isExecuting = executingTasks[task.id];
                    const isDescExpanded = expandedDescriptions[task.id];
                    const execResult = executionResults[task.id];
                    const automationConfig = task.automationAction
                      ? AUTOMATION_CONFIG[task.automationAction]
                      : null;

                    const ActionIcon = automationConfig?.icon ?? Play;

                    return (
                      <div
                        key={task.id}
                        className="border-b border-[#E5E1DB] last:border-0"
                      >
                        <div className="flex items-start gap-2.5 px-3 py-2">
                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={() => toggleTask(task.id, task.completed)}
                            disabled={isSaving}
                            className="mt-0.5 shrink-0 disabled:cursor-wait"
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin text-[#0A0A0A]/30" />
                            ) : task.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-[#0A0A0A]/20 hover:text-[#0A0A0A]/40" />
                            )}
                          </button>

                          {/* Label + description */}
                          <div className="flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => task.description && toggleDescription(task.id)}
                              className="text-left w-full"
                            >
                              <span
                                className={`text-xs font-mono block ${
                                  task.completed
                                    ? "text-[#0A0A0A]/40 line-through"
                                    : "text-[#0A0A0A]"
                                }`}
                              >
                                {task.label}
                              </span>
                            </button>
                            {isDescExpanded && task.description && (
                              <p className="text-[10px] text-[#0A0A0A]/50 mt-1 leading-relaxed">
                                {task.description}
                              </p>
                            )}
                            {/* Execution result */}
                            {isDescExpanded && execResult && (
                              <div
                                className={`mt-1.5 px-2 py-1.5 text-[10px] font-mono leading-relaxed border ${
                                  execResult.success
                                    ? "bg-green-50 border-green-200 text-green-800"
                                    : "bg-red-50 border-red-200 text-red-800"
                                }`}
                              >
                                <p>{execResult.message}</p>
                                {execResult.details && (
                                  <details className="mt-1">
                                    <summary className="cursor-pointer text-[9px] opacity-60">
                                      Details
                                    </summary>
                                    <pre className="mt-1 text-[9px] whitespace-pre-wrap break-all opacity-80">
                                      {JSON.stringify(execResult.details, null, 2)}
                                    </pre>
                                  </details>
                                )}
                              </div>
                            )}
                            {task.completedAt && (
                              <span className="text-[9px] font-mono text-green-600/60 flex items-center gap-0.5 mt-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                {new Date(task.completedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            )}
                          </div>

                          {/* Automation run button */}
                          {automationConfig && !task.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => executeTask(task.id, task.automationAction!)}
                              disabled={isExecuting}
                              className="mt-0 shrink-0 h-6 px-2 text-[10px] font-mono gap-1 border-[#E5E1DB] hover:bg-[#F9F7F4]"
                            >
                              {isExecuting ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <ActionIcon className="h-3 w-3" />
                              )}
                              {isExecuting ? "Running..." : automationConfig.label}
                            </Button>
                          )}

                          {/* External link */}
                          {task.externalUrl && (
                            <a
                              href={task.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-0.5 shrink-0"
                              title="Open external link"
                            >
                              <ExternalLink className="h-3 w-3 text-[#0A0A0A]/30 hover:text-[#0A0A0A]" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add task row */}
                  {addingPhase === phase ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#F9F7F4]">
                      <input
                        type="text"
                        value={newTaskLabel}
                        onChange={(e) => setNewTaskLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddTask(phase);
                          if (e.key === "Escape") {
                            setAddingPhase(null);
                            setNewTaskLabel("");
                          }
                        }}
                        placeholder="Task name..."
                        autoFocus
                        className="flex-1 text-xs font-mono border border-[#E5E1DB] px-2 py-1.5 bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTask(phase)}
                        disabled={newTaskSaving || !newTaskLabel.trim()}
                        className="text-[10px] font-mono font-semibold bg-[#0A0A0A] text-white px-2.5 py-1.5 hover:bg-[#0A0A0A]/80 disabled:opacity-40 transition-colors"
                      >
                        {newTaskSaving ? "..." : "Add"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddingPhase(null);
                          setNewTaskLabel("");
                        }}
                        className="text-[10px] font-mono text-[#0A0A0A]/50 hover:text-[#0A0A0A] px-1"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAddingPhase(phase);
                        setNewTaskLabel("");
                      }}
                      className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono text-[#0A0A0A]/30 hover:text-[#0A0A0A]/60 hover:bg-[#F9F7F4] transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Add task
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
