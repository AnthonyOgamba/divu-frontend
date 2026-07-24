"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import type { AnalyticsMetricDto, DashboardSummaryDto } from "@/lib/backend-dtos";
import type { DashboardMetric, TrendPoint } from "./dashboard-data";
import { MetricCard } from "./metric-card";
import { ProductionChart } from "./production-chart";
import { SectionCard } from "./section-card";
import { EmptyState, LastUpdatedIndicator, PageLoadingState, SectionError, SectionSkeleton } from "@/components/ui/async-states";

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsMetricDto[]>([]);
  const [summaryError, setSummaryError] = useState("");
  const [analyticsError, setAnalyticsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setSummaryError(""); setAnalyticsError("");
    const [summaryState, analyticsState] = await Promise.allSettled([
        apiRequest<DashboardSummaryDto>("/api/backend/dashboard"),
        apiRequest<AnalyticsMetricDto[]>("/api/backend/runs/analytics"),
    ]);
    if (summaryState.status === "fulfilled") setSummary(summaryState.value);
    else setSummaryError(summaryState.reason instanceof Error ? summaryState.reason.message : "Dashboard summary could not be loaded.");
    if (analyticsState.status === "fulfilled") setAnalytics(analyticsState.value);
    else setAnalyticsError(analyticsState.reason instanceof Error ? analyticsState.reason.message : "Dashboard analytics could not be loaded.");
    if (summaryState.status === "fulfilled" || analyticsState.status === "fulfilled") setLastUpdated(new Date());
    setLoading(false);
  }, []);
  useEffect(() => {
    // The effect starts the external gateway synchronization on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  const metrics = useMemo<DashboardMetric[]>(() => summary ? [
    { label:"Active Production Runs", value:String(summary.activeRuns), delta:"Live gateway value", icon:"activity", severity:summary.activeRuns?"healthy":"neutral" },
    { label:"Production Stations", value:String(summary.totalStations), delta:"Registered stations", icon:"cpu" },
    { label:"Open Incidents", value:String(summary.openIncidents), delta:"Requires operational review", icon:"alert", severity:summary.openIncidents?"warning":"healthy" },
    { label:"Platform Users", value:String(summary.totalUsers), delta:"Backend directory total", icon:"users", href:"/users" },
  ] : [], [summary]);
  const trend = useMemo<TrendPoint[]>(() => analytics.find(item=>item.id==="runs-started")?.dataPoints.map(point=>({label:point.label,value:point.value})) ?? [], [analytics]);
  if (loading && !summary && !analytics.length) return <PageLoadingState label="Loading dashboard" />;
  return <div className="space-y-5 pb-4">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Command Center</p><h1 className="mt-1.5 text-2xl font-bold tracking-tight">Overview</h1><p className="mt-1 text-sm text-muted-foreground">Production summary first, analytics second, optional modules last.</p><LastUpdatedIndicator at={lastUpdated} refreshing={loading} /></div><button onClick={()=>void load()} disabled={loading} className="inline-flex h-9 items-center gap-2 rounded-lg border bg-card px-3 text-xs font-semibold disabled:opacity-50"><RefreshCw className={`size-4 ${loading?"animate-spin":""}`}/>Refresh</button></header>
    <section><h2 className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Production and platform status</h2>{summaryError?<SectionError title="Summary unavailable" message={summaryError} retry={()=>void load()} />:summary?<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(metric=><MetricCard key={metric.label} {...metric}/>)}</div>:<EmptyState title="No dashboard summary" />}</section>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(22rem,1fr)]">
      <SectionCard title="Production versus target" subtitle="Gateway analytics">{analyticsError?<SectionError title="Analytics unavailable" message={analyticsError} retry={()=>void load()} />:loading&&!analytics.length?<SectionSkeleton />:trend.length?<ProductionChart data={trend}/>:<p className="grid h-48 place-items-center text-sm text-muted-foreground">No production-run trend points are available.</p>}</SectionCard>
      <SectionCard title="Recent production runs" subtitle="Newest first"><div className="space-y-2">{summary?.recentRuns.length?summary.recentRuns.map(run=><article key={run.rid} className="rounded-lg border p-3"><div className="flex items-center justify-between gap-3"><strong className="text-xs">Run #{run.rid}</strong><span className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase ${run.status==="active"?"bg-emerald-500/10 text-emerald-600":"bg-muted text-muted-foreground"}`}>{run.status}</span></div><p className="mt-1 text-[10px] text-muted-foreground">{run.station}</p><p className="mt-1 font-mono text-[9px] text-muted-foreground">Started {new Date(run.startTime).toLocaleString()} · {run.shiftLead}</p></article>):<p className="py-10 text-center text-sm text-muted-foreground">No recent production runs.</p>}</div></SectionCard>
    </div>
    <section className="grid gap-5 lg:grid-cols-3" aria-label="Optional dashboard modules">{["Financial impact","Sensor health summary","Security summary"].map(title=><SectionCard key={title} title={title} subtitle="Backend contract pending"><EmptyState title="Awaiting verified aggregate data" description="This module will activate when its endpoint contract is published." /></SectionCard>)}</section>
  </div>;
}
