"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import type { DashboardWorkspaceDto } from "@/lib/backend-dtos";
import { BackendFeatureUnavailable } from "@/components/ui/backend-feature-unavailable";
import { PageLoadingState, SectionError } from "@/components/ui/async-states";

type Kind = "financial" | "downtime" | "security" | "activity";

export function AggregatePage({ kind }: { kind: Kind }) {
  const [data, setData] = useState<DashboardWorkspaceDto>();
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { setData(await apiRequest("/api/backend/dashboard")); setError(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Aggregate data could not be loaded."); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  if (!data && !error) return <PageLoadingState />;
  const title = kind === "financial" ? "Financial Impact" : kind === "downtime" ? "Downtime Summary" : kind === "security" ? "Security Operations Summary" : "Recent Activity";
  return <div className="space-y-5"><header><h1 className="text-2xl font-bold">{title}</h1><p className="mt-1 text-sm text-muted-foreground">Summary data from the confirmed Dashboard aggregate.</p></header>{error && <SectionError message={error} retry={() => void load()} />}{data && <section className="grid gap-3 lg:grid-cols-2">{rows(data, kind).map((row) => <article key={row.label} className="rounded-xl border bg-card p-4"><h2 className="text-sm font-semibold">{row.label}</h2><p className="mt-2 text-xs text-muted-foreground">{row.value}</p></article>)}</section>}<BackendFeatureUnavailable title={`Detailed ${title.toLowerCase()} is unavailable`} detail="Only summary metrics and charts are supported; record editing and incident actions are disabled." /></div>;
}

function rows(data: DashboardWorkspaceDto, kind: Kind) {
  if (kind === "financial") return data.financialImpact.map((item) => ({ label: item.facility, value: `${item.currency} ${item.downtimeCost.toLocaleString()} downtime cost · ${item.lostProductionValue.toLocaleString()} lost production value` }));
  if (kind === "downtime") return data.downtimeTrend.map((item) => ({ label: new Date(item.timestamp).toLocaleDateString(), value: `${item.incidents} incidents · ${item.hours.toFixed(1)} hours` }));
  if (kind === "security") return Object.entries(data.securitySummary).map(([key, value]) => ({ label: key.replace(/([A-Z])/g, " $1"), value: String(value) }));
  return data.recentActivity.map((item) => ({ label: item.action, value: `${item.resource} · ${new Date(item.loggedAt).toLocaleString()}` }));
}
