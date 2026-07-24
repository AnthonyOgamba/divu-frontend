"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import type { FacilitiesWorkspaceDto } from "@/lib/backend-dtos";
import { EmptyState, PageLoadingState, SectionError } from "@/components/ui/async-states";

export function AssetsPage() {
  const [workspace, setWorkspace] = useState<FacilitiesWorkspaceDto>();
  const [error, setError] = useState("");
  useEffect(() => { apiRequest<FacilitiesWorkspaceDto>("/api/backend/facilities/workspace").then(setWorkspace).catch((cause) => setError(cause instanceof Error ? cause.message : "Stations could not be loaded.")); }, []);
  if (!workspace && !error) return <PageLoadingState />;
  const stations = workspace?.facilities.flatMap((facility) => facility.halls.flatMap((hall) => hall.lines.flatMap((line) => line.stations.map((station) => ({ ...station, facility: facility.name, hall: hall.name, line: line.name }))))) ?? [];
  return <div className="space-y-5"><header><h1 className="text-2xl font-bold">Assets</h1><p className="mt-1 text-sm text-muted-foreground">Stations are the currently implemented machine resource. No standalone asset API exists.</p></header>{error && <SectionError message={error} />}{!stations.length ? <EmptyState title="No stations available" /> : <section className="grid gap-3 lg:grid-cols-2">{stations.map((station) => <article key={station.stationId} className="rounded-xl border bg-card p-4"><div className="flex justify-between gap-3"><div><h2 className="font-semibold">{station.name}</h2><p className="mt-1 text-xs text-muted-foreground">{station.facility} · {station.hall} · {station.line}</p></div><span className="font-mono text-[10px]">{station.code}</span></div><p className="mt-3 text-xs">Status: {station.status} · OEE {(station.performance.oee * 100).toFixed(1)}%</p></article>)}</section>}<p className="text-xs text-muted-foreground">Asset CRUD is not backend-connected. Products remain production master data and are not presented as physical assets.</p></div>;
}
