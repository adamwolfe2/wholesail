import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wrench,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Rocket,
} from "lucide-react";

type Props = {
  buildChecklist: Record<string, boolean>;
  buildLog: string[];
  status: string;
  intakeId: string | null;
};

const MANUAL_STEPS: { key: string; label: string }[] = [
  { key: "clerkSetup", label: "Clerk app created" },
  { key: "neonDbProvisioned", label: "Neon DB provisioned" },
  { key: "stripeConfigured", label: "Stripe configured" },
  { key: "customDomainConnected", label: "Custom domain connected" },
  { key: "envVarsConfigured", label: "Env vars all configured" },
  { key: "contentPopulated", label: "Content populated" },
  { key: "logoReceived", label: "Logo received" },
  { key: "productCatalogReceived", label: "Product catalog received" },
];

export function BuildStatusCard({ buildChecklist, buildLog, status, intakeId }: Props) {
  const hasChecklist = Object.keys(buildChecklist).length > 0;
  const autoStepsComplete =
    !!buildChecklist.configGenerated &&
    !!buildChecklist.githubRepoCreated &&
    !!buildChecklist.vercelProjectCreated;

  const pendingManual = MANUAL_STEPS.filter((s) => !buildChecklist[s.key]);
  const allChecklistDone = hasChecklist && pendingManual.length === 0;

  // Determine state
  let stateIcon: React.ReactNode;
  let stateLabel: string;
  let stateDescription: string;
  let stateBg: string;

  if (!hasChecklist && buildLog.length === 0) {
    stateIcon = <Rocket className="h-4 w-4 text-[#0A0A0A]/40" />;
    stateLabel = "Ready to build";
    stateDescription = intakeId
      ? "Click 'Start Build' on the intake page to begin provisioning infrastructure."
      : "Convert an intake submission to start the build pipeline.";
    stateBg = "bg-[#F9F7F4]";
  } else if (hasChecklist && !autoStepsComplete) {
    stateIcon = <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />;
    stateLabel = "Infrastructure provisioning";
    stateDescription = "Automated build steps are in progress. Check the build log for details.";
    stateBg = "bg-yellow-50";
  } else if (hasChecklist && !allChecklistDone) {
    stateIcon = <AlertCircle className="h-4 w-4 text-yellow-600" />;
    stateLabel = `Infrastructure ready — ${pendingManual.length} manual step${pendingManual.length !== 1 ? "s" : ""} remaining`;
    stateDescription = "Automated provisioning is complete. Complete the remaining manual steps below.";
    stateBg = "bg-yellow-50";
  } else if (allChecklistDone) {
    stateIcon = <CheckCircle2 className="h-4 w-4 text-green-600" />;
    stateLabel = "All configuration complete";
    stateDescription =
      status === "REVIEW" || status === "LIVE"
        ? "Configuration verified. Project is in review or live."
        : "All checklist items are done. Ready for QA.";
    stateBg = "bg-green-50";
  } else {
    stateIcon = <Wrench className="h-4 w-4 text-[#0A0A0A]/40" />;
    stateLabel = "Build in progress";
    stateDescription = "Check the build log for the latest status.";
    stateBg = "bg-[#F9F7F4]";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg font-normal flex items-center gap-2">
          <Wrench className="h-4 w-4 text-[#C8C0B4]" />
          Build Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={`${stateBg} border border-[#E5E1DB] px-3 py-3`}>
          <div className="flex items-start gap-2">
            <div className="mt-0.5 shrink-0">{stateIcon}</div>
            <div>
              <p className="font-mono text-xs font-semibold text-[#0A0A0A]">
                {stateLabel}
              </p>
              <p className="text-[10px] text-[#0A0A0A]/50 mt-0.5">
                {stateDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Pending manual steps list */}
        {hasChecklist && pendingManual.length > 0 && pendingManual.length <= 6 && (
          <div className="space-y-1">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#0A0A0A]/40">
              Pending
            </p>
            {pendingManual.map((step) => (
              <div key={step.key} className="flex items-center gap-2 text-xs">
                <AlertCircle className="h-3 w-3 text-yellow-500 shrink-0" />
                <span className="font-mono text-[#0A0A0A]/60">{step.label}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
