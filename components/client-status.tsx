"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  BUILD_PHASES,
  FEATURES,
  STATUS_CONFIG,
  type ClientProject,
  type ClientStatus as ClientStatusType,
} from "@/lib/client-data";
import { portalConfig } from "@/lib/portal-config";

function SailLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M16 2L16 28L6 28C6 28 14 16 16 2Z" fill="var(--blue)" opacity="0.9" />
      <path d="M18 8L18 28L26 28C26 28 20 18 18 8Z" fill="var(--blue)" opacity="0.55" />
      <path d="M4 29L28 29" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function ProjectStatus({ client }: { client: ClientProject }) {
  const statusCfg = STATUS_CONFIG[client.status];
  const completedPhases = client.currentPhase >= 15 ? 15 : client.currentPhase - 1;
  const progressPct = Math.round((completedPhases / 15) * 100);
  const enabledFeatureLabels = FEATURES.filter((f) =>
    client.enabledFeatures.includes(f.id)
  ).map((f) => f.label);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <SailLogo className="w-4 h-4" />
            <span
              className="font-serif text-sm tracking-[0.05em] font-bold"
              style={{ color: "var(--text-headline)" }}
            >
              {portalConfig.brandName.toUpperCase()}
            </span>
          </span>
          <span
            className="font-mono text-[9px] uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Build Status
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Company header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1
              className="font-serif text-3xl font-normal"
              style={{ color: "var(--text-headline)" }}
            >
              {client.company}
            </h1>
            <span
              className="font-mono text-[10px] font-bold uppercase tracking-wide px-2 py-0.5"
              style={{
                backgroundColor: statusCfg.bg,
                color: statusCfg.color,
              }}
            >
              {statusCfg.label}
            </span>
          </div>
          {client.status === "live" && client.customDomain && (
            <a
              href={`https://${client.customDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-xs"
              style={{ color: "var(--blue)" }}
            >
              {client.customDomain} <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Progress overview */}
        <div
          className="border p-6 mb-6"
          style={{
            borderColor: "var(--border-strong)",
            backgroundColor: "var(--bg-white)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="font-mono text-[9px] uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Build Progress
            </span>
            <span
              className="font-serif text-2xl"
              style={{ color: "var(--text-headline)" }}
            >
              {progressPct}%
            </span>
          </div>
          <div
            className="h-2 w-full mb-4"
            style={{ backgroundColor: "var(--border)" }}
          >
            <div
              className="h-full transition-all"
              style={{
                backgroundColor:
                  client.status === "live" ? "#059669" : "var(--blue)",
                width: `${progressPct}%`,
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div
                className="font-mono text-[9px] uppercase tracking-widest mb-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                Started
              </div>
              <div
                className="font-mono text-xs font-semibold"
                style={{ color: "var(--text-headline)" }}
              >
                {client.startDate || "Pending"}
              </div>
            </div>
            <div>
              <div
                className="font-mono text-[9px] uppercase tracking-widest mb-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                Target Launch
              </div>
              <div
                className="font-mono text-xs font-semibold"
                style={{ color: "var(--text-headline)" }}
              >
                {client.targetLaunchDate || "TBD"}
              </div>
            </div>
            <div>
              <div
                className="font-mono text-[9px] uppercase tracking-widest mb-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {client.launchDate ? "Launched" : "Phase"}
              </div>
              <div
                className="font-mono text-xs font-semibold"
                style={{
                  color: client.launchDate ? "#059669" : "var(--text-headline)",
                }}
              >
                {client.launchDate || `${client.currentPhase} of 15`}
              </div>
            </div>
          </div>
        </div>

        {/* Phase timeline */}
        <div
          className="border mb-6"
          style={{
            borderColor: "var(--border-strong)",
            backgroundColor: "var(--bg-white)",
          }}
        >
          <div
            className="px-6 py-3 border-b"
            style={{ borderColor: "var(--border-strong)" }}
          >
            <span
              className="font-mono text-[9px] uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Build Phases
            </span>
          </div>
          <div>
            {BUILD_PHASES.map((phase) => {
              const isComplete = phase.phase < client.currentPhase;
              const isCurrent = phase.phase === client.currentPhase;
              const isPending = phase.phase > client.currentPhase;
              return (
                <div
                  key={phase.phase}
                  className="flex items-center gap-3 px-6 py-3 border-b last:border-b-0"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: isCurrent
                      ? "var(--blue-light)"
                      : "transparent",
                    opacity: isPending ? 0.4 : 1,
                  }}
                >
                  {isComplete ? (
                    <CheckCircle2
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: 'var(--color-success)' }}
                    />
                  ) : isCurrent ? (
                    <Loader2
                      className="w-4 h-4 flex-shrink-0 animate-spin"
                      style={{ color: "var(--blue)" }}
                    />
                  ) : (
                    <Clock
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: "var(--border-strong)" }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-mono text-xs font-semibold"
                      style={{
                        color: isCurrent
                          ? "var(--blue)"
                          : "var(--text-headline)",
                      }}
                    >
                      Phase {phase.phase}: {phase.label}
                    </div>
                    <div
                      className="font-mono text-[10px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {phase.description}
                    </div>
                  </div>
                  {isComplete && (
                    <span
                      className="font-mono text-[9px] uppercase tracking-wide"
                      style={{ color: 'var(--color-success)' }}
                    >
                      Done
                    </span>
                  )}
                  {isCurrent && (
                    <span
                      className="font-mono text-[9px] uppercase tracking-wide font-bold"
                      style={{ color: "var(--blue)" }}
                    >
                      In Progress
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Features included */}
        <div
          className="border mb-6"
          style={{
            borderColor: "var(--border-strong)",
            backgroundColor: "var(--bg-white)",
          }}
        >
          <div
            className="px-6 py-3 border-b"
            style={{ borderColor: "var(--border-strong)" }}
          >
            <span
              className="font-mono text-[9px] uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Your Portal Includes ({enabledFeatureLabels.length} features)
            </span>
          </div>
          <div className="px-6 py-4">
            <div className="flex flex-wrap gap-1.5">
              {enabledFeatureLabels.map((label) => (
                <span
                  key={label}
                  className="font-mono text-[10px] px-2.5 py-1 border"
                  style={{
                    borderColor: "var(--border-strong)",
                    color: "var(--text-body)",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent updates */}
        <div
          className="border mb-6"
          style={{
            borderColor: "var(--border-strong)",
            backgroundColor: "var(--bg-white)",
          }}
        >
          <div
            className="px-6 py-3 border-b"
            style={{ borderColor: "var(--border-strong)" }}
          >
            <span
              className="font-mono text-[9px] uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Recent Updates
            </span>
          </div>
          <div>
            {client.notes.map((note, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-6 py-3 border-b last:border-b-0"
                style={{ borderColor: "var(--border)" }}
              >
                <div
                  className="w-1.5 h-1.5 mt-1.5 flex-shrink-0"
                  style={{
                    backgroundColor:
                      note.type === "milestone"
                        ? "var(--blue)"
                        : note.type === "update"
                        ? "#059669"
                        : "var(--border-strong)",
                  }}
                />
                <div className="flex-1">
                  <div
                    className="font-mono text-xs"
                    style={{ color: "var(--text-body)" }}
                  >
                    {note.text}
                  </div>
                  <div
                    className="font-mono text-[9px] mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {note.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div
          className="border p-6 text-center"
          style={{
            borderColor: "var(--border-strong)",
            backgroundColor: "var(--blue-light)",
          }}
        >
          <p
            className="font-mono text-xs mb-3"
            style={{ color: "var(--text-body)" }}
          >
            Questions about your build? We respond within 2 hours.
          </p>
          <a
            href={`mailto:${portalConfig.contactEmail}`}
            className="inline-flex items-center gap-2 text-white px-5 py-2.5 font-mono text-xs font-semibold"
            style={{ backgroundColor: "var(--blue)" }}
          >
            Contact Your Build Team <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </main>
    </div>
  );
}

export function ClientStatusPage() {
  const [email, setEmail] = useState("");
  const [client, setClient] = useState<ClientProject | null>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!email.trim()) return;
    setSearching(true);
    setNotFound(false);

    try {
      const res = await fetch(`/api/status?email=${encodeURIComponent(email.trim())}`);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      // Map API response to ClientProject shape for the ProjectStatus component
      const mapped: ClientProject = {
        id: data.id,
        company: data.company,
        shortName: data.shortName,
        contact: { name: "", email: email.trim(), phone: "", role: "" },
        domain: data.domain || "",
        website: data.website || "",
        industry: "",
        status: data.status.toLowerCase() as ClientStatusType,
        currentPhase: data.currentPhase,
        startDate: data.startDate ? data.startDate.split("T")[0] : "",
        targetLaunchDate: data.targetLaunchDate ? data.targetLaunchDate.split("T")[0] : "",
        launchDate: data.launchDate ? data.launchDate.split("T")[0] : undefined,
        enabledFeatures: data.enabledFeatures || [],
        customDomain: data.customDomain,
        vercelUrl: data.vercelUrl,
        envVars: {},
        contractValue: 0,
        retainer: 0,
        monthlyRevenue: 0,
        notes: (data.notes || []).map((n: { date: string; text: string; type: string }) => ({
          date: n.date,
          text: n.text,
          type: n.type.toLowerCase() as "note" | "update" | "milestone",
        })),
        tasks: [],
      };
      setClient(mapped);
    } catch (err) {
      console.warn("Status lookup failed:", err);
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  if (client) {
    return <ProjectStatus client={client} />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <SailLogo className="w-8 h-8 mx-auto mb-4" />
          <h1
            className="font-serif text-2xl mb-2"
            style={{ color: "var(--text-headline)" }}
          >
            Check your build status
          </h1>
          <p
            className="font-mono text-xs"
            style={{ color: "var(--text-body)" }}
          >
            Enter your email or company name to see your portal progress.
          </p>
        </div>

        <div
          className="border p-6"
          style={{
            borderColor: "var(--border-strong)",
            backgroundColor: "var(--bg-white)",
          }}
        >
          <div className="flex gap-0">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setNotFound(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Email or company name"
                className="w-full border pl-10 pr-4 py-3 font-mono text-sm bg-white focus:outline-none"
                style={{
                  borderColor: "var(--border-strong)",
                  borderRight: "none",
                  color: "var(--text-headline)",
                }}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!email.trim() || searching}
              className="text-white px-5 py-3 font-mono text-xs font-semibold disabled:opacity-40 flex items-center gap-2"
              style={{ backgroundColor: "var(--blue)" }}
            >
              {searching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Look Up"
              )}
            </button>
          </div>

          {notFound && (
            <p
              className="font-mono text-xs mt-3"
              style={{ color: "var(--text-body)" }}
            >
              No project found for that email. Check your spelling or contact us
              at {portalConfig.contactEmail}
            </p>
          )}

          <p
            className="font-mono text-[9px] mt-3"
            style={{ color: "var(--text-muted)" }}
          >
            Enter the email address you used on your intake form.
          </p>
        </div>
      </div>
    </div>
  );
}
