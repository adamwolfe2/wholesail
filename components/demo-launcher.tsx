"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Globe,
  Loader2,
  CheckCircle2,
  Palette,
  Image,
  Building2,
  ExternalLink,
} from "lucide-react";

type ScrapeResult = {
  companyName: string;
  logoUrl: string;
  brandColor: string;
  domain: string;
};

type Phase = "input" | "scanning" | "result";

const SCAN_STEPS = [
  { label: "Crawling your website", icon: Globe, delay: 0 },
  { label: "Extracting brand colors", icon: Palette, delay: 800 },
  { label: "Finding your logo", icon: Image, delay: 1600 },
  { label: "Preparing your demo portal", icon: Building2, delay: 2400 },
];

export function DemoLauncher() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (phase !== "scanning") return;
    const timers = SCAN_STEPS.map((_, i) =>
      setTimeout(() => setScanStep(i + 1), SCAN_STEPS[i].delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const handleSubmit = async () => {
    if (!url.trim()) return;
    setPhase("scanning");
    setScanStep(0);
    setError("");

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) throw new Error("Scrape failed");

      const data: ScrapeResult = await res.json();
      setResult(data);

      // Wait for scan animation to finish, then show result
      setTimeout(() => setPhase("result"), 3200);
    } catch {
      setError("Could not analyze that website. Please check the URL and try again.");
      setPhase("input");
    }
  };

  const launchDemo = () => {
    if (!result) return;
    const params = new URLSearchParams({
      company: result.companyName,
      logo: result.logoUrl,
      color: result.brandColor.replace("#", ""),
      domain: result.domain,
    });
    window.open(`/demo?${params.toString()}`, "_blank");
  };

  const reset = () => {
    setPhase("input");
    setResult(null);
    setScanStep(0);
    setUrl("");
  };

  return (
    <div className="border border-black bg-white">
      <AnimatePresence mode="wait">
        {/* ── Input Phase ────────────────────────────────────────── */}
        {phase === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8"
          >
            <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-3">
              Try it with your brand
            </div>
            <h3 className="font-serif text-2xl font-normal mb-2">
              Enter your website. See your portal in 30 seconds.
            </h3>
            <p className="font-mono text-xs text-neutral-500 mb-6">
              We&apos;ll scrape your site, extract your logo and brand colors,
              and spin up a personalized demo portal with sample data — so you
              can experience exactly what your clients will see.
            </p>

            {error && (
              <div className="font-mono text-xs text-red-600 mb-4 px-3 py-2 border border-red-200 bg-red-50">
                {error}
              </div>
            )}

            <div className="flex gap-0">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="yourcompany.com"
                  className="w-full border border-black border-r-0 pl-10 pr-4 py-4 font-mono text-sm bg-white focus:outline-none"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!url.trim()}
                className="bg-black text-white px-6 py-4 font-mono text-xs uppercase tracking-wide border border-black hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2 flex-shrink-0"
              >
                Launch Demo <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="font-mono text-[9px] text-neutral-400 mt-2">
              No signup required. Your data is not stored.
            </div>
          </motion.div>
        )}

        {/* ── Scanning Phase ─────────────────────────────────────── */}
        {phase === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Loader2 className="w-5 h-5 animate-spin text-black" />
              <div>
                <div className="font-mono text-xs uppercase tracking-wide font-semibold">
                  Analyzing {url}
                </div>
                <div className="font-mono text-[9px] text-neutral-400">
                  This takes about 10 seconds
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {SCAN_STEPS.map((step, i) => {
                const done = i < scanStep;
                const active = i === scanStep;
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.label}
                    animate={{ opacity: done ? 1 : active ? 0.6 : 0.2 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between px-4 py-3 border border-black/15 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      {done ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 340,
                            damping: 20,
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 text-black" />
                        </motion.div>
                      ) : active ? (
                        <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                      ) : (
                        <Icon className="w-4 h-4 text-neutral-300" />
                      )}
                      <span className="font-mono text-xs">{step.label}</span>
                    </div>
                    {done && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-mono text-[9px] text-neutral-400"
                      >
                        Done
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-[3px] bg-neutral-200">
              <div
                className="h-full bg-black transition-all duration-500 ease-out"
                style={{
                  width: `${(scanStep / SCAN_STEPS.length) * 100}%`,
                }}
              />
            </div>
          </motion.div>
        )}

        {/* ── Result Phase ───────────────────────────────────────── */}
        {phase === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-5 h-5 text-black" />
              <span className="font-mono text-xs uppercase tracking-wide font-semibold">
                Your demo portal is ready
              </span>
            </div>

            {/* Brand preview */}
            <div className="border border-black p-6 bg-[#F3F3EF] mb-6">
              <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-4">
                Extracted Brand Profile
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">
                    Company
                  </div>
                  <div className="font-mono text-sm font-semibold">
                    {result.companyName}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">
                    Logo
                  </div>
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={result.logoUrl}
                      alt={result.companyName}
                      className="w-8 h-8 object-contain border border-black/10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span className="font-mono text-[9px] text-neutral-400 truncate max-w-[120px]">
                      Extracted
                    </span>
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">
                    Brand Color
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 border border-black"
                      style={{ backgroundColor: result.brandColor }}
                    />
                    <span className="font-mono text-xs">
                      {result.brandColor}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* What the demo includes */}
            <div className="border border-black p-4 mb-6">
              <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-3">
                Your demo includes
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Full product catalog",
                  "Client portal dashboard",
                  "Admin panel with CRM",
                  "Order management",
                  "Invoice system",
                  "SMS ordering flow",
                  "Loyalty & referrals",
                  "Sample wholesale clients",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-black flex-shrink-0" />
                    <span className="font-mono text-[10px] text-neutral-600">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch + Reset buttons */}
            <div className="flex gap-3">
              <button
                onClick={launchDemo}
                className="flex-1 flex items-center justify-center gap-2 bg-black text-white px-6 py-4 font-mono text-xs uppercase tracking-wide border border-black hover:bg-neutral-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Open Your Demo Portal{" "}
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={reset}
                className="px-4 py-4 font-mono text-xs uppercase tracking-wide text-neutral-500 border border-neutral-300 hover:border-black transition-colors"
              >
                Try Another
              </button>
            </div>
            <div className="font-mono text-[9px] text-neutral-400 mt-2">
              Demo opens in a new tab with your branding applied to real
              platform features
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
