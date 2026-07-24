"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import { BackendFeatureUnavailable } from "@/components/ui/backend-feature-unavailable";

export default function ReportCenter() {
  const [fromUtc, setFromUtc] = useState("");
  const [toUtc, setToUtc] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [includeSynthetic, setIncludeSynthetic] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function exportWorkbook() {
    setPending(true); setError(""); setStatus("Preparing workbook…");
    const query = new URLSearchParams({ includeSynthetic: String(includeSynthetic), reportType: "industrial-analytics" });
    if (fromUtc) query.set("fromUtc", new Date(fromUtc).toISOString());
    if (toUtc) query.set("toUtc", new Date(toUtc).toISOString());
    if (facilityId) query.set("facilityId", facilityId);
    try {
      const response = await fetch(`/api/backend/reports/export.xlsx?${query}`, { credentials: "same-origin", signal: AbortSignal.timeout(45_000) });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const fallback = response.status === 401 ? "Your session has expired."
          : response.status === 403 ? "You do not have permission to export this report."
            : response.status === 400 ? "The report filters are invalid."
              : response.status === 503 || response.status === 504 ? "The report service is temporarily unavailable."
                : "The workbook could not be exported.";
        throw new Error(typeof body.error === "string" ? body.error : fallback);
      }
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const filename = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)?.[1] || "industrial-analytics.xlsx";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = decodeURIComponent(filename); anchor.click();
      URL.revokeObjectURL(url);
      setStatus(`Export complete: ${decodeURIComponent(filename)}`);
    } catch (cause) {
      setStatus("");
      setError(cause instanceof Error ? cause.message : "The workbook could not be exported.");
    } finally {
      setPending(false);
    }
  }

  return <div className="space-y-5">
    <header><h1 className="text-2xl font-bold">Reports</h1><p className="mt-1 text-sm text-muted-foreground">Export the confirmed nine-sheet industrial analytics workbook.</p></header>
    <section className="rounded-xl border bg-card p-5"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><label className="text-xs font-semibold">From<input type="datetime-local" value={fromUtc} onChange={(event) => setFromUtc(event.target.value)} className="mt-1 h-10 w-full rounded-lg border bg-background px-3" /></label><label className="text-xs font-semibold">To<input type="datetime-local" value={toUtc} onChange={(event) => setToUtc(event.target.value)} className="mt-1 h-10 w-full rounded-lg border bg-background px-3" /></label><label className="text-xs font-semibold">Facility ID<input inputMode="numeric" value={facilityId} onChange={(event) => setFacilityId(event.target.value.replace(/\D/g, ""))} className="mt-1 h-10 w-full rounded-lg border bg-background px-3" placeholder="All accessible facilities" /></label><label className="flex items-center gap-2 self-end rounded-lg border p-3 text-xs"><input type="checkbox" checked={includeSynthetic} onChange={(event) => setIncludeSynthetic(event.target.checked)} />Include synthetic records</label></div><button type="button" disabled={pending} onClick={() => void exportWorkbook()} className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-50"><Download className="size-4" />{pending ? "Exporting…" : "Export Excel workbook"}</button>{status && <p role="status" className="mt-3 text-xs text-emerald-600">{status}</p>}{error && <p role="alert" className="mt-3 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}</section>
    <BackendFeatureUnavailable title="On-screen report datasets" detail="There is no reports JSON API. Confirmed Dashboard and Audit views remain available on their respective pages." />
  </div>;
}
