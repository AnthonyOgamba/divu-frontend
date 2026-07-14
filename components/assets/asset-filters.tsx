"use client";

import { LayoutGrid, List, Search } from "lucide-react";

import type { AssetStatus } from "./assets-data";

export type AssetViewMode = "grid" | "list";

type AssetFiltersProps = {
  query: string; onQueryChange: (value: string) => void;
  site: string; onSiteChange: (value: string) => void; sites: string[];
  type: string; onTypeChange: (value: string) => void; types: string[];
  status: "All" | AssetStatus; onStatusChange: (value: "All" | AssetStatus) => void;
  viewMode: AssetViewMode; onViewModeChange: (value: AssetViewMode) => void;
};

const selectClass = "h-10 min-w-36 rounded-lg border bg-card px-3 text-xs outline-none focus:ring-2 focus:ring-ring/30";

export function AssetFilters(props: AssetFiltersProps) {
  return <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-[var(--dv-shadow)] lg:flex-row lg:items-center"><label className="relative min-w-0 flex-1"><span className="sr-only">Search assets</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={props.query} onChange={(event) => props.onQueryChange(event.target.value)} placeholder="Search by asset ID, name, type, station..." className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-xs outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30" /></label><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex"><select aria-label="Filter assets by site" value={props.site} onChange={(event) => props.onSiteChange(event.target.value)} className={selectClass}><option>All Sites</option>{props.sites.map((site) => <option key={site}>{site}</option>)}</select><select aria-label="Filter assets by type" value={props.type} onChange={(event) => props.onTypeChange(event.target.value)} className={selectClass}><option>All Types</option>{props.types.map((type) => <option key={type}>{type}</option>)}</select><select aria-label="Filter assets by status" value={props.status} onChange={(event) => props.onStatusChange(event.target.value as "All" | AssetStatus)} className={selectClass}><option>All</option>{["Online", "Warning", "Maintenance", "Offline", "Decommissioned"].map((status) => <option key={status}>{status}</option>)}</select></div><div className="flex w-fit overflow-hidden rounded-lg border" aria-label="Asset view mode">{(["grid", "list"] as const).map((mode) => { const Icon = mode === "grid" ? LayoutGrid : List; return <button key={mode} type="button" aria-label={`${mode} view`} aria-pressed={props.viewMode === mode} onClick={() => props.onViewModeChange(mode)} className={`grid size-10 place-items-center transition-colors ${props.viewMode === mode ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}><Icon className="size-4" /></button>; })}</div></div>;
}
