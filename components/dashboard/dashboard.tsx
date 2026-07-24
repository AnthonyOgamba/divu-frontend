"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState, LastUpdatedIndicator, PageLoadingState, SectionError } from "@/components/ui/async-states";
import { apiRequest } from "@/lib/api-client";
import type { DashboardWorkspaceDto } from "@/lib/backend-dtos";
import type { DashboardMetric, TrendPoint } from "./dashboard-data";
import { MetricCard } from "./metric-card";
import { ProductionChart } from "./production-chart";
import { SectionCard } from "./section-card";

const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
const money = (value: number, currency = "CAD") => new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

export function Dashboard() {
  const [data, setData] = useState<DashboardWorkspaceDto>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await apiRequest<DashboardWorkspaceDto>("/api/backend/dashboard"));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Dashboard could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load();
    return () => controller.abort();
  }, [load]);

  const metrics = useMemo<DashboardMetric[]>(() => data ? [
    { label: "Active Runs", value: String(data.summary.activeRuns), delta: "Current production", icon: "activity", severity: data.summary.activeRuns ? "healthy" : "neutral" },
    { label: "Total Stations", value: String(data.summary.totalStations), delta: "Scoped stations", icon: "cpu" },
    { label: "Active Facilities", value: String(data.summary.activeFacilities), delta: "Accessible sites", icon: "activity" },
    { label: "Average OEE", value: percent(data.summary.averageOee), delta: "Availability × performance × quality", icon: "activity", severity: data.summary.averageOee >= 0.75 ? "healthy" : "warning" },
    { label: "Open Downtime Events", value: String(data.summary.openDowntimeEvents), delta: "Operational impact", icon: "alert", severity: data.summary.openDowntimeEvents ? "warning" : "healthy" },
    { label: "Open Alerts", value: String(data.summary.openAlerts), delta: "Requires review", icon: "alert", severity: data.summary.openAlerts ? "warning" : "healthy" },
    { label: "Estimated Downtime Cost", value: money(data.summary.estimatedDowntimeCost), delta: "Aggregate estimate", icon: "activity", severity: data.summary.estimatedDowntimeCost ? "warning" : "healthy" },
  ] : [], [data]);

  const productionTrend = useMemo<TrendPoint[]>(() => data?.productionTrend.map((point) => ({
    label: new Date(point.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    value: point.produced,
  })) ?? [], [data]);

  if (loading && !data) return <PageLoadingState label="Loading dashboard" />;

  return <div className="space-y-5 pb-4">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Command Center</p><h1 className="mt-1.5 text-2xl font-bold tracking-tight">Overview</h1><p className="mt-1 text-sm text-muted-foreground">Facility-scoped operational intelligence from the dashboard aggregate.</p><LastUpdatedIndicator at={data ? new Date(data.generatedAtUtc) : null} refreshing={loading} /></div>
      <button onClick={() => void load()} disabled={loading} className="inline-flex h-9 items-center gap-2 rounded-lg border bg-card px-3 text-xs font-semibold disabled:opacity-50"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />Refresh</button>
    </header>
    {error && <SectionError title="Dashboard unavailable" message={error} retry={() => void load()} />}
    {data && <>
      <section><h2 className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Production and platform status</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</div></section>
      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard title="Production trend" subtitle="Produced units"><ProductionChart data={productionTrend} /></SectionCard>
        <SectionCard title="Good versus scrap" subtitle="Daily production quality"><SimpleRows rows={data.productionTrend.map((point) => ({ label: new Date(point.timestamp).toLocaleDateString(), value: `${point.good} good · ${point.scrap} scrap`, synthetic: point.isSynthetic }))} /></SectionCard>
        <SectionCard title="OEE by facility" subtitle="Decimal values converted to percentage"><SimpleRows rows={data.oeeByFacility.map((item) => ({ label: item.facility, value: `${percent(item.oee)} OEE · A ${percent(item.availability)} · P ${percent(item.performance)} · Q ${percent(item.quality)}` }))} /></SectionCard>
        <SectionCard title="Downtime trend" subtitle="Summary only"><SimpleRows rows={data.downtimeTrend.map((item) => ({ label: new Date(item.timestamp).toLocaleDateString(), value: `${item.incidents} incidents · ${item.hours.toFixed(1)} hours` }))} /></SectionCard>
        <SectionCard title="Financial impact by facility" subtitle="Summary only"><SimpleRows rows={data.financialImpact.map((item) => ({ label: item.facility, value: `${money(item.downtimeCost, item.currency)} downtime · ${money(item.lostProductionValue, item.currency)} lost production` }))} /></SectionCard>
        <SectionCard title="Sensor health" subtitle="Detailed telemetry remains on Sensors"><SimpleRows rows={[{ label: "Active", value: `${data.sensorHealth.active}/${data.sensorHealth.total}` }, { label: "Fresh / stale", value: `${data.sensorHealth.fresh} / ${data.sensorHealth.stale}` }, { label: "Latest reading", value: data.sensorHealth.latestReadingAtUtc ? new Date(data.sensorHealth.latestReadingAtUtc).toLocaleString() : "No readings" }]} /></SectionCard>
        <SectionCard title="Security summary" subtitle="Aggregate controls"><SimpleRows rows={Object.entries(data.securitySummary).map(([label, value]) => ({ label: label.replace(/([A-Z])/g, " $1"), value: String(value) }))} /></SectionCard>
        <SectionCard title="Recent production runs" subtitle="Newest first"><SimpleRows rows={data.recentRuns.map((run) => ({ label: `${run.station} · ${run.status}`, value: `${run.facility} · ${new Date(run.startTime).toLocaleString()}`, synthetic: run.isSynthetic }))} /></SectionCard>
        <SectionCard title="Recent alerts" subtitle="Latest ten"><SimpleRows rows={data.recentAlerts.map((alert) => ({ label: alert.title, value: `${alert.severity} · ${alert.status} · ${alert.resource}` }))} /></SectionCard>
        <SectionCard title="Recent activity" subtitle="Latest twenty"><SimpleRows rows={data.recentActivity.map((activity) => ({ label: activity.action, value: `${activity.resource} · ${new Date(activity.loggedAt).toLocaleString()}` }))} /></SectionCard>
      </div>
    </>}
  </div>;
}

function SimpleRows({ rows }: { rows: Array<{ label: string; value: string; synthetic?: boolean }> }) {
  if (!rows.length) return <EmptyState title="No data available" />;
  return <div className="space-y-2">{rows.map((row, index) => <div key={`${row.label}-${index}`} className="rounded-lg border p-3"><div className="flex items-start justify-between gap-3"><strong className="text-xs">{row.label}</strong>{row.synthetic && <span className="rounded bg-violet-500/10 px-2 py-0.5 font-mono text-[9px] text-violet-600">Synthetic</span>}</div><p className="mt-1 text-[10px] text-muted-foreground">{row.value}</p></div>)}</div>;
}
