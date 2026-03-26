"use client";

import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { portalConfig } from "@/lib/portal-config";
import type { Step1Data, Step2Data, Step3Data } from "./types";
import {
  STEPS, STEP_HEADINGS, STEP_SUBTITLES,
  DRAFT_KEY, STEP1_DEFAULT, STEP2_DEFAULT, STEP3_DEFAULT,
  loadDraft, buildIntakePayload,
} from "./constants";
import { StepCompany } from "./step-company";
import { StepDistribution } from "./step-distribution";
import { StepFeatures } from "./step-features";
import { StepBooking } from "./step-booking";

export function IntakeWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [step1, setStep1] = useState<Step1Data>(STEP1_DEFAULT);
  const [step2, setStep2] = useState<Step2Data>(STEP2_DEFAULT);
  const [step3, setStep3] = useState<Step3Data>(STEP3_DEFAULT);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReturnType<typeof loadDraft>>(null);
  const [draftChecked, setDraftChecked] = useState(false);

  useEffect(() => {
    const saved = loadDraft();
    if (saved && saved.step1.companyName) setDraft(saved);
    setDraftChecked(true);
  }, []);

  useEffect(() => {
    if (!draftChecked || submitted || currentStep === 3) return;
    if (!step1.companyName && !step1.contactEmail) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        step: currentStep, step1, step2, step3, savedAt: Date.now(),
      }));
    } catch { /* quota exceeded or SSR -- ignore */ }
  }, [currentStep, step1, step2, step3, submitted, draftChecked]);

  const canProceed = () => {
    if (currentStep === 0)
      return step1.companyName.trim().length > 0 && step1.contactName.trim().length > 0 && step1.contactEmail.trim().length > 0;
    if (currentStep === 1) return step2.industry.trim().length > 0;
    return true;
  };

  const handleNext = async () => {
    if (!canProceed()) { setAttempted(true); return; }
    setAttempted(false);
    setSubmitError(null);
    if (currentStep === 2 && !submitted) {
      setSubmitting(true);
      try {
        const res = await fetch("/api/intake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildIntakePayload(step1, step2, step3)),
        });
        if (res.ok) {
          setSubmitted(true);
          try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
        } else {
          setSubmitError(`Something went wrong submitting your information. Please try again, or email us at ${portalConfig.contactEmail}.`);
          return;
        }
      } catch {
        setSubmitError(`Something went wrong submitting your information. Please try again, or email us at ${portalConfig.contactEmail}.`);
        return;
      } finally {
        setSubmitting(false);
      }
    }
    setCurrentStep((p) => p + 1);
  };

  const handleResumeDraft = () => {
    if (!draft) return;
    setStep1(draft.step1);
    setStep2(draft.step2);
    setStep3(draft.step3);
    setCurrentStep(draft.step);
    setDraft(null);
  };

  const handleDiscardDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    setDraft(null);
  };

  return (
    <div className="border bg-white" style={{ borderColor: "var(--border-strong)", borderRadius: "8px", overflow: "hidden" }}>
      {draft && (
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap" style={{ backgroundColor: "var(--blue-light)", borderBottom: "1px solid var(--border-strong)" }}>
          <p className="font-mono text-xs" style={{ color: "var(--blue)" }}>
            Welcome back — continue your application{draft.step1.companyName ? ` for ${draft.step1.companyName}` : ""}?
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={handleResumeDraft} className="font-mono text-xs font-semibold underline underline-offset-2" style={{ color: "var(--blue)" }}>Resume</button>
            <button type="button" onClick={handleDiscardDraft} className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>Start over</button>
          </div>
        </div>
      )}

      <div className="border-b" style={{ borderColor: "var(--border-strong)" }}>
        <div className="flex">
          {STEPS.map((step, i) => (
            <div key={step} className="flex-1 px-4 py-3 text-center transition-colors" style={{
              borderRight: i < STEPS.length - 1 ? "1px solid var(--border-strong)" : "none",
              backgroundColor: i === currentStep ? "var(--blue)" : i < currentStep ? "var(--blue-light)" : "var(--bg-white)",
              color: i === currentStep ? "white" : i < currentStep ? "var(--blue)" : "var(--text-muted)",
            }}>
              <div className="font-mono text-[9px] uppercase tracking-widest">{`0${i + 1}`}</div>
              <div className="font-mono text-[10px] hidden sm:block mt-0.5">{step}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-b px-4 sm:px-6 py-4 sm:py-5" style={{ borderColor: "var(--border)" }}>
        <h3 className="font-serif text-lg sm:text-xl font-normal" style={{ color: "var(--text-headline)" }}>{STEP_HEADINGS[currentStep]}</h3>
        <p className="font-mono text-xs mt-1" style={{ color: "var(--text-body)" }}>{STEP_SUBTITLES[currentStep]}</p>
      </div>

      <div className="px-3 sm:px-6 py-4 sm:py-6">
        {currentStep === 0 && <StepCompany data={step1} onChange={(d) => setStep1((p) => ({ ...p, ...d }))} attempted={attempted} />}
        {currentStep === 1 && <StepDistribution data={step2} onChange={(d) => setStep2((p) => ({ ...p, ...d }))} />}
        {currentStep === 2 && <StepFeatures data={step3} onChange={(d) => setStep3((p) => ({ ...p, ...d }))} />}
        {currentStep === 3 && <StepBooking step1={step1} step2={step2} step3={step3} />}
      </div>

      {submitError && (
        <div className="px-4 sm:px-6 py-3 flex items-start justify-between gap-3 bg-error/5" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="font-mono text-xs leading-relaxed" style={{ color: "var(--color-error, #dc2626)" }}>{submitError}</p>
          <button type="button" onClick={() => setSubmitError(null)} className="flex-shrink-0 text-xs font-mono" style={{ color: "var(--text-muted)" }}>Dismiss</button>
        </div>
      )}

      {currentStep < 3 && (
        <div className="px-4 sm:px-6 py-4 border-t" style={{ borderColor: "var(--border)" }}>
          {currentStep === 2 && (
            <p className="font-mono text-[10px] text-center mb-3" style={{ color: "var(--text-muted)" }}>Typical build: 3-5 weeks · White-glove setup included</p>
          )}
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => setCurrentStep((p) => p - 1)} disabled={currentStep === 0} className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide disabled:opacity-30 disabled:cursor-not-allowed transition-colors" style={{ color: "var(--text-body)" }}>
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <div className="flex flex-col items-end gap-1">
              {attempted && !canProceed() && (
                <span className="font-mono text-[10px]" style={{ color: "var(--destructive)" }}>Fill in the required fields above</span>
              )}
              <button type="button" onClick={handleNext} disabled={submitting} className="flex items-center justify-center gap-2 text-white px-5 py-3 font-mono text-xs font-semibold tracking-wide disabled:opacity-40 disabled:cursor-not-allowed transition-colors w-full sm:w-auto" style={{ backgroundColor: "var(--blue)", borderRadius: "6px" }}>
                {submitting ? "Submitting..." : currentStep === 2 ? "Book My Call" : "Continue"}{" "}
                {!submitting && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
