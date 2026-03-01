"use client";

import { useState } from "react";
import { Loader2, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type ExtractedData = {
  brandColors?: string[];
  logoUrl?: string;
  companyDescription?: string;
  productTypes?: string[];
};

type ScrapeData = {
  website?: {
    extract?: ExtractedData;
    markdown?: string;
  };
  inspirations?: Array<{ url: string; markdown?: string } | null>;
  scrapedAt?: string;
};

type Props = {
  intakeId: string;
  intakeWebsite: string | null;
  initialScrapeData: ScrapeData | null;
};

export function WebsiteIntelligence({
  intakeId,
  intakeWebsite,
  initialScrapeData,
}: Props) {
  const [scrapeData, setScrapeData] = useState<ScrapeData | null>(
    initialScrapeData
  );
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  async function handleScan() {
    setScanning(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/intakes/${intakeId}/scrape`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Scan failed");
      } else {
        setScrapeData(data.scrapeData);
      }
    } catch {
      setError("Network error during scan");
    } finally {
      setScanning(false);
    }
  }

  const extract = scrapeData?.website?.extract;
  const scrapedAt = scrapeData?.scrapedAt;
  const inspirations = scrapeData?.inspirations?.filter(Boolean) ?? [];

  if (!intakeWebsite) {
    return (
      <p className="text-sm text-[#0A0A0A]/40 font-mono">
        No website URL on intake — cannot scrape.
      </p>
    );
  }

  if (!scrapeData) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[#0A0A0A]/50">
          Website not yet scanned. Click below to extract brand data.
        </p>
        {error && <p className="text-sm text-red-600 font-mono">{error}</p>}
        <button
          type="button"
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-2 text-xs font-mono font-semibold bg-[#0A0A0A] text-white px-4 py-2 hover:bg-[#0A0A0A]/80 disabled:opacity-50 transition-colors"
        >
          {scanning ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> Scanning...
            </>
          ) : (
            <>
              <Globe className="h-3 w-3" /> Scan Website
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      {scrapedAt && (
        <p className="text-[10px] font-mono text-[#0A0A0A]/40">
          Scraped at: {new Date(scrapedAt).toLocaleString()}
        </p>
      )}

      {extract?.brandColors && extract.brandColors.length > 0 && (
        <div>
          <p className="text-[#0A0A0A]/50 text-xs mb-2">Brand Colors</p>
          <div className="flex gap-2 flex-wrap">
            {extract.brandColors.map((color, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 border border-[#E5E1DB] shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="font-mono text-xs">{color}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {extract?.companyDescription && (
        <div>
          <p className="text-[#0A0A0A]/50 text-xs mb-1">Company Description</p>
          <p className="text-[#0A0A0A]/80 text-xs leading-relaxed line-clamp-3">
            {extract.companyDescription}
          </p>
        </div>
      )}

      {extract?.productTypes && extract.productTypes.length > 0 && (
        <div>
          <p className="text-[#0A0A0A]/50 text-xs mb-1.5">Product Types</p>
          <div className="flex flex-wrap gap-1.5">
            {extract.productTypes.map((pt, i) => (
              <Badge key={i} variant="outline" className="text-[10px]">
                {pt}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {inspirations.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-[#0A0A0A]/50 text-xs mb-2">Inspiration Sites Scraped</p>
            <div className="space-y-1">
              {inspirations.map((insp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Globe className="h-3 w-3 text-[#0A0A0A]/40 shrink-0" />
                  <a
                    href={insp!.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-[#0A0A0A]/70 hover:text-[#0A0A0A] hover:underline truncate"
                  >
                    {insp!.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      <div>
        <button
          type="button"
          onClick={() => setShowRaw((v) => !v)}
          className="text-[10px] font-mono text-[#0A0A0A]/40 hover:text-[#0A0A0A]"
        >
          {showRaw ? "Hide" : "Show"} raw JSON
        </button>
        {showRaw && (
          <pre className="mt-2 p-3 bg-[#F9F7F4] border border-[#E5E1DB] text-[9px] font-mono overflow-auto max-h-48">
            {JSON.stringify(scrapeData, null, 2)}
          </pre>
        )}
      </div>

      <button
        type="button"
        onClick={handleScan}
        disabled={scanning}
        className="text-[10px] font-mono text-[#0A0A0A]/40 hover:text-[#0A0A0A] flex items-center gap-1 disabled:opacity-50"
      >
        {scanning ? (
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
        ) : (
          <Globe className="h-2.5 w-2.5" />
        )}
        Re-scan
      </button>
    </div>
  );
}
