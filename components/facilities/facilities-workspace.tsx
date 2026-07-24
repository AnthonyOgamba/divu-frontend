"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, Building2, Factory, Gauge, KeyRound, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";

import { FacilitiesOverview } from "./facilities-overview";
import { GrantAccessModal, RegisterSiteModal } from "./facility-modals";
import type { AccessLevel, Facility, FacilityStatus, OperationalInsight, SiteAccess } from "./facilities-data";
import { ProductionPerformance } from "./production-performance";
import { SiteAccessPanel } from "./site-access";
import { apiRequest } from "@/lib/api-client";
import type { AiFailureProbability, Facility as BackendFacility, Hall as BackendHall, HierarchyPerformanceResponse, ProductionLine as BackendLine, SiteAccessAssignment, Station as BackendStation } from "@/lib/backend-dtos";
import { LastUpdatedIndicator, SectionError, SectionSkeleton } from "@/components/ui/async-states";

type FacilitiesTab = "sites" | "performance" | "access";
const tabs: { key: FacilitiesTab; label: string; icon: React.ElementType }[] = [
  { key: "sites", label: "Sites & Facilities", icon: Building2 },
  { key: "performance", label: "Production Performance", icon: Gauge },
  { key: "access", label: "Site Access", icon: KeyRound },
];

const statusMap = (status: string): FacilityStatus => status.toLowerCase() === "active" ? "Active" : status.toLowerCase() === "maintenance" ? "Maintenance" : status.toLowerCase() === "inactive" || status.toLowerCase() === "offline" ? "Inactive" : "Standby";
const accessMap = (level: string): AccessLevel => level.toLowerCase() === "admin" ? "Admin" : level.toLowerCase() === "manager" ? "Manage" : level.toLowerCase() === "operator" ? "Operate" : "View";

const facilityDetailCache = new Map<number, Facility>();

function mapFacility(item: BackendFacility): Facility {
  return { id: String(item.facilityId), name: item.name, code: item.code, facilityType: "Facility", company: "DIVU Industrial", managerId: "", manager: "Backend managed", source: "registered", status: statusMap(item.status), location: { city: "", region: "", country: "Backend" }, timezone: "Backend managed", shiftPattern: "Backend managed", capacityPerDay: "Backend managed", sensorCount: 0, assetCount: 0, complianceScore: 100, lastActivity: "Live", halls: [] };
}

async function loadFacility(item: BackendFacility, signal?: AbortSignal): Promise<Facility> {
  const cached = facilityDetailCache.get(item.facilityId);
  if (cached) return cached;
  const [halls, performance] = await Promise.all([
    apiRequest<BackendHall[]>(`/api/backend/facilities/${item.facilityId}/halls`, { signal }),
    apiRequest<HierarchyPerformanceResponse>(`/api/backend/facilities/${item.facilityId}/performance`, { signal }).catch(() => null),
  ]);
  const stationMetrics = new Map((performance?.stations ?? []).map((station) => [station.stationId, station]));
  const mappedHalls = await Promise.all(halls.map(async (hall) => {
    const lines = await apiRequest<BackendLine[]>(`/api/backend/halls/${hall.hallId}/lines`, { signal });
    return {
      id: String(hall.hallId), name: hall.name, code: hall.code,
      lines: await Promise.all(lines.map(async (line) => {
        const stations = await apiRequest<BackendStation[]>(`/api/backend/lines/${line.productionLineId}/stations`, { signal });
        const mappedStations = stations.map((station) => {
          const metric = stationMetrics.get(station.stationId);
          return { id: String(station.stationId), name: station.name, status: statusMap(station.status), oee: metric?.oee ?? 0, availability: metric?.availability ?? 0, performance: metric?.performance ?? 0, quality: metric?.quality ?? 0, sensorIds: [], assetIds: [], metricKeys: ["oee", "availability", "performance", "quality"], downtimeHours: 0 };
        });
        const average = (key: "oee" | "availability" | "performance" | "quality") => mappedStations.length ? Math.round(mappedStations.reduce((sum, station) => sum + station[key], 0) / mappedStations.length) : 0;
        return { id: String(line.productionLineId), name: line.name, code: line.code, oee: average("oee"), availability: average("availability"), performance: average("performance"), quality: average("quality"), outputPerHour: Math.round(mappedStations.reduce((sum, station) => sum + (stationMetrics.get(Number(station.id))?.throughputPerHour ?? 0), 0)), sensorCount: 0, assetCount: 0, downtimeHours: 0, stations: mappedStations };
      })),
    };
  }));
  const mapped = { ...mapFacility(item), halls: mappedHalls };
  facilityDetailCache.set(item.facilityId, mapped);
  return mapped;
}

export function FacilitiesWorkspace() {
  const [activeTab, setActiveTab] = useState<FacilitiesTab>("sites");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [accessRecords, setAccessRecords] = useState<SiteAccess[]>([]);
  const [insights, setInsights] = useState<OperationalInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessError, setAccessError] = useState("");
  const [insightsError, setInsightsError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [grantOpen, setGrantOpen] = useState(false);
  const detailRequest = useRef<AbortController | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError(""); setInsightsError("");
    try {
      const [facilityState, riskState] = await Promise.allSettled([
        apiRequest<BackendFacility[] | BackendFacility>("/api/backend/facilities", { signal }),
        apiRequest<AiFailureProbability[]>("/api/backend/ai/assets/failure-probabilities", { signal }),
      ]);
      if (facilityState.status === "rejected") throw facilityState.reason;
      const facilityResult = facilityState.value;
      const backendFacilities = Array.isArray(facilityResult) ? facilityResult : [facilityResult];
      const mappedFacilities = backendFacilities.map((item) => facilityDetailCache.get(item.facilityId) ?? mapFacility(item));
      setFacilities(mappedFacilities);
      if (riskState.status === "fulfilled") setInsights(riskState.value.slice(0, 3).map((risk) => ({ id: risk.asset_id, facility: "Manufacturing network", line: risk.code, message: risk.recommendation, priority: risk.risk_level === "critical" || risk.risk_level === "high" ? "High" : risk.risk_level === "medium" ? "Medium" : "Low", confidence: Math.round(risk.failure_probability * 100) })));
      else setInsightsError(riskState.reason instanceof Error ? riskState.reason.message : "AI insights could not be loaded.");
      setLastUpdated(new Date());
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Facilities could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void load(controller.signal), 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [load]);

  const loadAccess = useCallback(async () => {
    setAccessError("");
    try {
      const assignments = await apiRequest<SiteAccessAssignment[]>("/api/backend/site-access");
      setAccessRecords(assignments.map((record) => ({ id: String(record.siteAccessAssignmentId), userId: String(record.userId), userName: `User #${record.userId}`, platformRole: "Backend user", operationalRole: accessMap(record.accessLevel), facilityId: String(record.facilityId), hall: "All Halls", productionLine: "All Lines", accessLevel: accessMap(record.accessLevel), effectiveDate: record.createdAt, status: "Active" })));
    } catch (cause) { setAccessError(cause instanceof Error ? cause.message : "Site access could not be loaded."); }
  }, []);

  const loadDetails = useCallback(async (facilityId: string) => {
    const backend = facilities.find((item) => item.id === facilityId);
    if (!backend || backend.halls.length) return;
    detailRequest.current?.abort();
    const controller = new AbortController();
    detailRequest.current = controller;
    setDetailLoading(true); setDetailError("");
    try {
      const detailed = await loadFacility({ facilityId: Number(backend.id), name: backend.name, code: backend.code, status: backend.status }, controller.signal);
      setFacilities((items) => items.map((item) => item.id === detailed.id ? detailed : item));
    } catch (cause) { if (!controller.signal.aborted) setDetailError(cause instanceof Error ? cause.message : "Facility details could not be loaded."); }
    finally {
      if (detailRequest.current === controller) {
        detailRequest.current = null;
        setDetailLoading(false);
      }
    }
  }, [facilities]);

  useEffect(() => () => detailRequest.current?.abort(), []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (activeTab === "access" && !accessRecords.length) void loadAccess();
      if (activeTab === "performance" && facilities[0]) void loadDetails(facilities[0].id);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [accessRecords.length, activeTab, facilities, loadAccess, loadDetails]);

  const metrics = useMemo(() => { const lines = facilities.flatMap((facility) => facility.halls.flatMap((hall) => hall.lines)); const averageOee = lines.length ? Math.round(lines.reduce((sum, line) => sum + line.oee, 0) / lines.length) : 0; return { active: facilities.filter((facility) => facility.status === "Active").length, averageOee, compliance: facilities.length ? Math.round(facilities.reduce((sum, facility) => sum + facility.complianceScore, 0) / facilities.length) : 0, downtime: lines.reduce((sum, line) => sum + line.downtimeHours, 0) }; }, [facilities]);

  async function registerFacility(facility: Facility) {
    try {
      const created = await apiRequest<BackendFacility>("/api/backend/facilities", { method: "POST", body: JSON.stringify({ name: facility.name, code: facility.code, status: facility.status.toLowerCase() }) });
      for (const [hallIndex, hall] of facility.halls.entries()) { const createdHall = await apiRequest<BackendHall>(`/api/backend/facilities/${created.facilityId}/halls`, { method: "POST", body: JSON.stringify({ name: hall.name, code: `${facility.code}-H${hallIndex + 1}`, status: "active" }) }); for (const [lineIndex, line] of hall.lines.entries()) { const createdLine = await apiRequest<BackendLine>(`/api/backend/halls/${createdHall.hallId}/lines`, { method: "POST", body: JSON.stringify({ name: line.name, code: `${facility.code}-H${hallIndex + 1}-L${lineIndex + 1}`, status: "active" }) }); for (const [stationIndex, station] of line.stations.entries()) await apiRequest<BackendStation>(`/api/backend/lines/${createdLine.productionLineId}/stations`, { method: "POST", body: JSON.stringify({ name: station.name, stationCode: `${facility.code}-H${hallIndex + 1}-L${lineIndex + 1}-S${stationIndex + 1}`, status: "active" }) }); } }
      setRegisterOpen(false); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Facility registration failed."); setRegisterOpen(false); }
  }
  async function grantAccess(access: SiteAccess) { try { await apiRequest("/api/backend/site-access", { method: "POST", body: JSON.stringify({ userId: Number(access.userId), facilityId: Number(access.facilityId), accessLevel: access.accessLevel.toLowerCase().replace("manage", "manager").replace("operate", "operator").replace("view", "viewer") }) }); setGrantOpen(false); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Access could not be granted."); setGrantOpen(false); } }

  return <div className="space-y-5 pb-5"><header><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Manufacturing network</p><div className="flex items-start justify-between gap-3"><div><h1 className="mt-1.5 text-2xl font-bold tracking-tight">Facilities</h1><p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">Live facility structure, performance, compliance, and operational access from the DIVU backend.</p><LastUpdatedIndicator at={lastUpdated} refreshing={loading && facilities.length > 0} /></div><button onClick={() => void load()} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-xs"><RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />Refresh</button></div></header>
  {error && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}</div>}
  <section className="space-y-3" aria-labelledby="facilities-compliance-title"><div><h2 id="facilities-compliance-title" className="text-base font-semibold">Facilities &amp; Compliance</h2><p className="mt-0.5 text-xs text-muted-foreground">Live backend operating status and control posture.</p></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[{ label: "Active Facilities", value: `${metrics.active}/${facilities.length}`, note: "Online sites", icon: Factory }, { label: "Average OEE", value: `${metrics.averageOee}%`, note: "Across production lines", icon: Gauge }, { label: "Compliance Coverage", value: `${metrics.compliance}%`, note: "Site control average", icon: ShieldCheck }, { label: "Recent Downtime", value: `${metrics.downtime.toFixed(1)}h`, note: "Backend performance", icon: Activity }].map((item) => <div key={item.label} className="rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)]"><div className="flex items-start justify-between gap-3"><div><p className="text-2xl font-bold">{item.value}</p><p className="mt-1 text-xs font-medium text-muted-foreground">{item.label}</p></div><div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><item.icon className="size-4" /></div></div><p className="mt-3 font-mono text-[10px] text-muted-foreground">{item.note}</p></div>)}</div></section>
  <section className="rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)]" aria-labelledby="ai-insights-title"><div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /><h2 id="ai-insights-title" className="text-sm font-semibold">AI Operational Insights</h2><span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9px] uppercase text-primary">Live backend</span></div><div className="mt-3">{insightsError?<SectionError title="Insights unavailable" message={insightsError} retry={()=>void load()} />:<div className="grid gap-3 lg:grid-cols-3">{insights.map((insight) => <article key={insight.id} className="rounded-lg border bg-background/60 p-3"><div className="flex items-center justify-between gap-3"><p className="truncate text-xs font-semibold">{insight.facility}</p><span className="font-mono text-[9px] uppercase text-primary">{insight.priority}</span></div><p className="mt-1 font-mono text-[10px] text-muted-foreground">{insight.line} · {insight.confidence}% risk</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{insight.message}</p></article>)}{!loading && !insights.length && <p className="text-xs text-muted-foreground">No AI predictions are currently available.</p>}</div>}</div></section>
  <div className="overflow-x-auto border-b"><div className="flex min-w-max" role="tablist" aria-label="Facilities sections">{tabs.map((tab) => { const Icon = tab.icon; const active = tab.key === activeTab; return <button key={tab.key} type="button" role="tab" aria-selected={active} onClick={() => setActiveTab(tab.key)} className={`relative inline-flex h-12 items-center gap-2 px-4 text-xs font-medium transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}><Icon className={`size-4 ${active ? "text-primary" : ""}`} />{tab.label}{active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />}</button>; })}</div></div>
  {loading && !facilities.length ? <SectionSkeleton rows={2} /> : <>{activeTab === "sites" && <FacilitiesOverview facilities={facilities} onRegister={() => setRegisterOpen(true)} />}{activeTab === "performance" && (detailError?<SectionError title="Performance unavailable" message={detailError} retry={()=>facilities[0]&&void loadDetails(facilities[0].id)} />:detailLoading?<SectionSkeleton rows={3} />:<ProductionPerformance facilities={facilities} onFacilityChange={(id)=>void loadDetails(id)} />)}{activeTab === "access" && (accessError?<SectionError title="Site access unavailable" message={accessError} retry={()=>void loadAccess()} />:<SiteAccessPanel facilities={facilities} accessRecords={accessRecords} onGrant={() => setGrantOpen(true)} onRevoke={() => setError("The current backend does not expose an access-revocation endpoint.")} />)}</>}
  {registerOpen && <RegisterSiteModal onClose={() => setRegisterOpen(false)} onSave={(facility) => void registerFacility(facility)} />}{grantOpen && <GrantAccessModal facilities={facilities} onClose={() => setGrantOpen(false)} onSave={(access) => void grantAccess(access)} />}</div>;
}
