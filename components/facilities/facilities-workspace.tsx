"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Building2, Factory, Gauge, KeyRound, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";

import { FacilitiesOverview } from "./facilities-overview";
import { GrantAccessModal, RegisterSiteModal } from "./facility-modals";
import type { AccessLevel, Facility, FacilityStatus, OperationalInsight, SiteAccess } from "./facilities-data";
import { ProductionPerformance } from "./production-performance";
import { SiteAccessPanel } from "./site-access";
import { apiRequest } from "@/lib/api-client";
import type { FacilitiesWorkspaceDto, Facility as BackendFacility, Hall as BackendHall, ProductionLine as BackendLine, Station as BackendStation } from "@/lib/backend-dtos";
import { LastUpdatedIndicator, SectionError, SectionSkeleton } from "@/components/ui/async-states";

type FacilitiesTab = "sites" | "performance" | "access";
const tabs: { key: FacilitiesTab; label: string; icon: React.ElementType }[] = [
  { key: "sites", label: "Sites & Facilities", icon: Building2 },
  { key: "performance", label: "Production Performance", icon: Gauge },
  { key: "access", label: "Site Access", icon: KeyRound },
];

const statusMap = (status: string): FacilityStatus => status.toLowerCase() === "active" ? "Active" : status.toLowerCase() === "maintenance" ? "Maintenance" : status.toLowerCase() === "inactive" || status.toLowerCase() === "offline" ? "Inactive" : "Standby";
const accessMap = (level: string): AccessLevel => level.toLowerCase() === "admin" ? "Admin" : level.toLowerCase() === "manager" ? "Manage" : level.toLowerCase() === "operator" ? "Operate" : "View";

const ratio = (value: number) => Math.round(value * 100);
function mapWorkspaceFacility(item: FacilitiesWorkspaceDto["facilities"][number]): Facility {
  return {
    id: String(item.facilityId), name: item.name, code: item.location, facilityType: "Facility",
    company: "DIVU Industrial", managerId: "", manager: "Backend managed", source: "registered",
    status: statusMap(item.status), location: { city: item.location, region: "", country: "" },
    timezone: "Backend managed", shiftPattern: "Backend managed", capacityPerDay: "Backend managed",
    sensorCount: 0, assetCount: item.halls.flatMap((hall) => hall.lines.flatMap((line) => line.stations)).length,
    complianceScore: item.complianceCoverage, lastActivity: "Live",
    halls: item.halls.map((hall) => ({
      id: String(hall.hallId), name: hall.name, code: `H-${hall.hallId}`,
      lines: hall.lines.map((line) => ({
        id: String(line.productionLineId), name: line.name, code: `L-${line.productionLineId}`,
        oee: ratio(line.performance.oee), availability: ratio(line.performance.availability),
        performance: ratio(line.performance.performance), quality: ratio(line.performance.quality),
        outputPerHour: 0, sensorCount: 0, assetCount: line.stations.length,
        downtimeHours: line.performance.downtimeHours,
        stations: line.stations.map((station) => ({
          id: String(station.stationId), name: station.name, status: statusMap(station.status),
          oee: ratio(station.performance.oee), availability: ratio(station.performance.availability),
          performance: ratio(station.performance.performance), quality: ratio(station.performance.quality),
          sensorIds: [], assetIds: [], metricKeys: ["oee", "availability", "performance", "quality"],
          downtimeHours: station.performance.downtimeHours,
        })),
      })),
    })),
  };
}

export function FacilitiesWorkspace() {
  const [activeTab, setActiveTab] = useState<FacilitiesTab>("sites");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [accessRecords, setAccessRecords] = useState<SiteAccess[]>([]);
  const [insights, setInsights] = useState<OperationalInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessError] = useState("");
  const [insightsError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [grantOpen, setGrantOpen] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try {
      const workspace = await apiRequest<FacilitiesWorkspaceDto>("/api/backend/facilities/workspace", { signal });
      setFacilities(workspace.facilities.map(mapWorkspaceFacility));
      setAccessRecords(workspace.siteAccess.map((record) => ({ id: String(record.siteAccessAssignmentId), userId: String(record.userId), userName: `User #${record.userId}`, platformRole: "Backend user", operationalRole: accessMap(record.accessLevel), facilityId: String(record.facilityId), hall: "All Halls", productionLine: "All Lines", accessLevel: accessMap(record.accessLevel), effectiveDate: record.createdAt, status: "Active" })));
      setInsights(workspace.aiInsights.map((insight) => ({ id: String(insight.alertId), facility: "Manufacturing network", line: insight.resource, message: insight.title, priority: insight.severity === "critical" || insight.severity === "high" ? "High" : insight.severity === "warning" ? "Medium" : "Low", confidence: 100 })));
      setLastUpdated(new Date(workspace.generatedAtUtc));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Facilities could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void load(controller.signal), 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [load]);

  const metrics = useMemo(() => { const lines = facilities.flatMap((facility) => facility.halls.flatMap((hall) => hall.lines)); const averageOee = lines.length ? Math.round(lines.reduce((sum, line) => sum + line.oee, 0) / lines.length) : 0; return { active: facilities.filter((facility) => facility.status === "Active").length, averageOee, compliance: facilities.length ? Math.round(facilities.reduce((sum, facility) => sum + facility.complianceScore, 0) / facilities.length) : 0, downtime: lines.reduce((sum, line) => sum + line.downtimeHours, 0) }; }, [facilities]);

  async function registerFacility(facility: Facility) {
    try {
      const created = await apiRequest<BackendFacility>("/api/backend/facilities", { method: "POST", body: JSON.stringify({ name: facility.name, code: facility.code, status: facility.status.toLowerCase() }) });
      for (const [hallIndex, hall] of facility.halls.entries()) { const createdHall = await apiRequest<BackendHall>(`/api/backend/facilities/${created.facilityId}/halls`, { method: "POST", body: JSON.stringify({ name: hall.name, code: `${facility.code}-H${hallIndex + 1}`, status: "active" }) }); for (const [lineIndex, line] of hall.lines.entries()) { const createdLine = await apiRequest<BackendLine>(`/api/backend/halls/${createdHall.hallId}/lines`, { method: "POST", body: JSON.stringify({ name: line.name, code: `${facility.code}-H${hallIndex + 1}-L${lineIndex + 1}`, status: "active" }) }); for (const [stationIndex, station] of line.stations.entries()) await apiRequest<BackendStation>(`/api/backend/lines/${createdLine.productionLineId}/stations`, { method: "POST", body: JSON.stringify({ name: station.name, code: `${facility.code}-H${hallIndex + 1}-L${lineIndex + 1}-S${stationIndex + 1}`, status: "active" }) }); } }
      setRegisterOpen(false); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Facility registration failed."); setRegisterOpen(false); }
  }
  async function grantAccess(access: SiteAccess) { try { await apiRequest("/api/backend/site-access", { method: "POST", body: JSON.stringify({ userId: Number(access.userId), facilityId: Number(access.facilityId), accessLevel: access.accessLevel.toLowerCase().replace("manage", "manager").replace("operate", "operator").replace("view", "viewer") }) }); setGrantOpen(false); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Access could not be granted."); setGrantOpen(false); } }

  return <div className="space-y-5 pb-5"><header><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Manufacturing network</p><div className="flex items-start justify-between gap-3"><div><h1 className="mt-1.5 text-2xl font-bold tracking-tight">Facilities</h1><p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">Live facility structure, performance, compliance, and operational access from the DIVU backend.</p><LastUpdatedIndicator at={lastUpdated} refreshing={loading && facilities.length > 0} /></div><button onClick={() => void load()} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-xs"><RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />Refresh</button></div></header>
  {error && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}</div>}
  <section className="space-y-3" aria-labelledby="facilities-compliance-title"><div><h2 id="facilities-compliance-title" className="text-base font-semibold">Facilities &amp; Compliance</h2><p className="mt-0.5 text-xs text-muted-foreground">Live backend operating status and control posture.</p></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[{ label: "Active Facilities", value: `${metrics.active}/${facilities.length}`, note: "Online sites", icon: Factory }, { label: "Average OEE", value: `${metrics.averageOee}%`, note: "Across production lines", icon: Gauge }, { label: "Compliance Coverage", value: `${metrics.compliance}%`, note: "Site control average", icon: ShieldCheck }, { label: "Recent Downtime", value: `${metrics.downtime.toFixed(1)}h`, note: "Backend performance", icon: Activity }].map((item) => <div key={item.label} className="rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)]"><div className="flex items-start justify-between gap-3"><div><p className="text-2xl font-bold">{item.value}</p><p className="mt-1 text-xs font-medium text-muted-foreground">{item.label}</p></div><div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><item.icon className="size-4" /></div></div><p className="mt-3 font-mono text-[10px] text-muted-foreground">{item.note}</p></div>)}</div></section>
  <section className="rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)]" aria-labelledby="ai-insights-title"><div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /><h2 id="ai-insights-title" className="text-sm font-semibold">AI Operational Insights</h2><span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9px] uppercase text-primary">Live backend</span></div><div className="mt-3">{insightsError?<SectionError title="Insights unavailable" message={insightsError} retry={()=>void load()} />:<div className="grid gap-3 lg:grid-cols-3">{insights.map((insight) => <article key={insight.id} className="rounded-lg border bg-background/60 p-3"><div className="flex items-center justify-between gap-3"><p className="truncate text-xs font-semibold">{insight.facility}</p><span className="font-mono text-[9px] uppercase text-primary">{insight.priority}</span></div><p className="mt-1 font-mono text-[10px] text-muted-foreground">{insight.line} · {insight.confidence}% risk</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{insight.message}</p></article>)}{!loading && !insights.length && <p className="text-xs text-muted-foreground">No AI predictions are currently available.</p>}</div>}</div></section>
  <div className="overflow-x-auto border-b"><div className="flex min-w-max" role="tablist" aria-label="Facilities sections">{tabs.map((tab) => { const Icon = tab.icon; const active = tab.key === activeTab; return <button key={tab.key} type="button" role="tab" aria-selected={active} onClick={() => setActiveTab(tab.key)} className={`relative inline-flex h-12 items-center gap-2 px-4 text-xs font-medium transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}><Icon className={`size-4 ${active ? "text-primary" : ""}`} />{tab.label}{active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />}</button>; })}</div></div>
  {loading && !facilities.length ? <SectionSkeleton rows={2} /> : <>{activeTab === "sites" && <FacilitiesOverview facilities={facilities} onRegister={() => setRegisterOpen(true)} />}{activeTab === "performance" && <ProductionPerformance facilities={facilities} />}{activeTab === "access" && (accessError?<SectionError title="Site access unavailable" message={accessError} retry={()=>void load()} />:<SiteAccessPanel facilities={facilities} accessRecords={accessRecords} onGrant={() => setGrantOpen(true)} onRevoke={() => setError("The current backend does not expose an access-revocation endpoint.")} />)}</>}
  {registerOpen && <RegisterSiteModal onClose={() => setRegisterOpen(false)} onSave={(facility) => void registerFacility(facility)} />}{grantOpen && <GrantAccessModal facilities={facilities} onClose={() => setGrantOpen(false)} onSave={(access) => void grantAccess(access)} />}</div>;
}
