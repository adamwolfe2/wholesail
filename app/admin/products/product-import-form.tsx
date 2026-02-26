"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, CheckCircle2, AlertCircle, Download } from "lucide-react";

interface ImportResult {
  message: string;
  created: number;
  updated: number;
  errors: { row: number; name: string; error: string }[];
}

export function ProductImportForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Import failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <a
          href="/product-import-template.csv"
          download
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          <Download className="h-3 w-3" />
          Download CSV template
        </a>
        <span className="text-muted-foreground">to see the expected format</span>
      </div>
      <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-3">
        <Input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv,.txt"
          disabled={isUploading}
          className="flex-1"
        />
        <Button type="submit" disabled={isUploading} className="shrink-0">
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </>
          )}
        </Button>
      </form>

      {result && (
        <div className="rounded-lg border p-4 bg-neutral-50 border-neutral-200">
          <div className="flex items-center gap-2 text-neutral-800">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">{result.message}</span>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-sm text-orange-700 font-medium">
                {result.errors.length} row(s) had issues:
              </p>
              {result.errors.slice(0, 5).map((err, i) => (
                <p key={i} className="text-xs text-orange-600">
                  Row {err.row} ({err.name}): {err.error}
                </p>
              ))}
              {result.errors.length > 5 && (
                <p className="text-xs text-orange-600">
                  ...and {result.errors.length - 5} more
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg border p-4 bg-neutral-50 border-neutral-300">
          <div className="flex items-center gap-2 text-neutral-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
