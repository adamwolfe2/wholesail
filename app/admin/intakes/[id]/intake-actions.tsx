"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
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
import { CheckCircle, Circle, ArrowRight, Loader2, Copy, Download, Link2 } from "lucide-react";

interface SerializedIntake {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  reviewedAt: string | null;
  archivedAt: string | null;
  project: { id: string; status: string } | null;
}

export function IntakeActions({ intake }: { intake: SerializedIntake }) {
  const router = useRouter();

  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(
    intake.project?.id ?? null
  );

  const [isMarkingReviewed, setIsMarkingReviewed] = useState(false);
  const [reviewedAt, setReviewedAt] = useState<string | null>(intake.reviewedAt);

  const [isArchiving, setIsArchiving] = useState(false);

  const [isGeneratingConfig, setIsGeneratingConfig] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [configContent, setConfigContent] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [isBuildStarting, setIsBuildStarting] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [buildResult, setBuildResult] = useState<{
    pendingManualActions: string[];
    githubRepo: string;
    vercelUrl: string;
  } | null>(null);
  const [buildSheetOpen, setBuildSheetOpen] = useState(false);

  const [statusCopySuccess, setStatusCopySuccess] = useState(false);

  async function handleConvert() {
    setIsConverting(true);
    setConvertError(null);
    try {
      const res = await fetch(`/api/admin/intakes/${intake.id}/convert`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 && data.projectId) {
          setProjectId(data.projectId);
          return;
        }
        setConvertError(data.error ?? "Failed to convert intake");
        return;
      }
      setProjectId(data.projectId);
      setReviewedAt(new Date().toISOString());
      router.refresh();
    } catch {
      setConvertError("Network error — please try again");
    } finally {
      setIsConverting(false);
    }
  }

  async function handleMarkReviewed() {
    setIsMarkingReviewed(true);
    try {
      const res = await fetch(`/api/admin/intakes/${intake.id}/review`, {
        method: "PATCH",
      });
      if (res.ok) {
        setReviewedAt(new Date().toISOString());
        router.refresh();
      }
    } catch {
      // silent
    } finally {
      setIsMarkingReviewed(false);
    }
  }

  async function handleArchive() {
    setIsArchiving(true);
    try {
      const res = await fetch(`/api/admin/intakes/${intake.id}/archive`, {
        method: "PATCH",
      });
      if (res.ok) {
        router.push("/admin/intakes");
      }
    } catch {
      // silent
    } finally {
      setIsArchiving(false);
    }
  }

  async function handleGenerateConfig() {
    setIsGeneratingConfig(true);
    setConfigError(null);
    try {
      const res = await fetch(`/api/admin/intakes/${intake.id}/generate-config`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setConfigError(data.error ?? "Failed to generate config");
        return;
      }
      setConfigContent(data.config);
      setIsSheetOpen(true);
    } catch {
      setConfigError("Network error — please try again");
    } finally {
      setIsGeneratingConfig(false);
    }
  }

  async function handleCopyConfig() {
    if (!configContent) return;
    await navigator.clipboard.writeText(configContent);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }

  function handleDownloadConfig() {
    if (!configContent) return;
    const blob = new Blob([configContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portal.config.ts";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleStartBuild() {
    setIsBuildStarting(true);
    setBuildError(null);
    try {
      const res = await fetch(`/api/admin/intakes/${intake.id}/build-start`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setBuildError(data.error ?? "Failed to start build");
        return;
      }
      setBuildResult(data);
      setBuildSheetOpen(true);
    } catch {
      setBuildError("Network error — please try again");
    } finally {
      setIsBuildStarting(false);
    }
  }

  async function handleCopyStatusLink() {
    const url = `${window.location.origin}/status?email=${encodeURIComponent(intake.contactEmail)}`;
    await navigator.clipboard.writeText(url);
    setStatusCopySuccess(true);
    setTimeout(() => setStatusCopySuccess(false), 2000);
  }

  const isConverted = !!projectId;
  const isReviewed = !!reviewedAt;

  return (
    <>
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle className="font-serif text-lg font-normal">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status indicators */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {isReviewed ? (
                <CheckCircle className="h-4 w-4 text-neutral-700 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-neutral-400 shrink-0" />
              )}
              <span className={isReviewed ? "text-ink" : "text-ink/50"}>
                {isReviewed ? "Reviewed" : "Pending review"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isConverted ? (
                <CheckCircle className="h-4 w-4 text-neutral-700 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-neutral-400 shrink-0" />
              )}
              <span className={isConverted ? "text-ink" : "text-ink/50"}>
                {isConverted ? "Converted to project" : "Not converted"}
              </span>
            </div>
          </div>

          <div className="border-t border-shell pt-4 space-y-2">
            {/* Convert to Project */}
            {isConverted ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  asChild
                >
                  <Link href={`/admin/projects/${projectId}`}>
                    View Project
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-ink text-cream hover:bg-ink/80 justify-between"
                  onClick={handleStartBuild}
                  disabled={isBuildStarting}
                >
                  {isBuildStarting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Starting...
                    </>
                  ) : (
                    <>
                      Start Build →
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                {buildError && (
                  <p className="text-xs text-red-600">{buildError}</p>
                )}
              </>
            ) : (
              <Button
                size="sm"
                className="w-full bg-ink text-cream hover:bg-ink/80"
                onClick={handleConvert}
                disabled={isConverting}
              >
                {isConverting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Converting...
                  </>
                ) : (
                  "Convert to Project"
                )}
              </Button>
            )}
            {convertError && (
              <p className="text-xs text-red-600">{convertError}</p>
            )}

            {/* Generate Config */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleGenerateConfig}
              disabled={isGeneratingConfig}
            >
              {isGeneratingConfig ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                "Generate Config"
              )}
            </Button>
            {configError && (
              <p className="text-xs text-red-600">{configError}</p>
            )}

            {/* Mark Reviewed */}
            {!isReviewed && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleMarkReviewed}
                disabled={isMarkingReviewed}
              >
                {isMarkingReviewed ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Marking...
                  </>
                ) : (
                  "Mark Reviewed"
                )}
              </Button>
            )}

            {/* Archive */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-ink/50 hover:text-ink"
                  disabled={isArchiving}
                >
                  {isArchiving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Archiving...
                    </>
                  ) : (
                    "Archive"
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive this intake?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will move the intake for{" "}
                    <strong>{intake.companyName}</strong> to the archived tab. You
                    can find it there if needed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleArchive}>
                    Archive
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Copy Status Link */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-ink/50 hover:text-ink flex items-center gap-2"
              onClick={handleCopyStatusLink}
            >
              <Link2 className="h-4 w-4" />
              {statusCopySuccess ? "Copied!" : "Copy Status Link"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Config Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-serif font-normal">
              portal.config.ts — {intake.companyName}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-hidden mt-4">
            <pre className="text-xs font-mono overflow-auto max-h-[60vh] bg-neutral-50 border border-shell p-4 whitespace-pre">
              {configContent}
            </pre>
          </div>

          <SheetFooter className="mt-4 flex-row gap-2 justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyConfig}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              {copySuccess ? "Copied!" : "Copy to Clipboard"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadConfig}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download portal.config.ts
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Build Sheet */}
      <Sheet open={buildSheetOpen} onOpenChange={setBuildSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-serif font-normal">
              Build started — {intake.companyName}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto mt-4 space-y-3">
            {buildResult?.pendingManualActions && buildResult.pendingManualActions.length > 0 ? (
              <>
                <p className="text-xs text-ink/50 font-mono">Pending manual steps:</p>
                {buildResult.pendingManualActions.map((action, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Circle className="h-4 w-4 text-ink/30 shrink-0" />
                    <span>{action}</span>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-sm text-ink/50">No manual steps required.</p>
            )}
          </div>

          <SheetFooter className="mt-4">
            {buildResult?.githubRepo || buildResult?.vercelUrl ? (
              <div className="flex flex-col gap-2 w-full text-xs font-mono text-ink/60">
                {buildResult.githubRepo && (
                  <p>Repo: {buildResult.githubRepo}</p>
                )}
                {buildResult.vercelUrl && (
                  <p>Staging: {buildResult.vercelUrl}</p>
                )}
              </div>
            ) : null}
            {projectId && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/projects/${projectId}`}>
                  View project →
                </Link>
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
