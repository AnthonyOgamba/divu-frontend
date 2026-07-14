"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { initialFacilities } from "@/components/facilities/facilities-data";

import { AssetFilters, type AssetViewMode } from "./asset-filters";
import { AssetDetailModal } from "./asset-detail-modal";
import { AssetGrid } from "./asset-grid";
import { AssetListView } from "./asset-list-view";
import { AssetStatsCards } from "./asset-stats-cards";
import { assetMaintenanceRecords, assetSensors, initialAssets, type AssetStatus, type IndustrialAsset } from "./assets-data";
import { RegisterAssetModal } from "./register-asset-modal";

function nextAssetId(assets: IndustrialAsset[]) {
  const maximum = assets.reduce((highest, asset) => Math.max(highest, Number(asset.assetId.replace(/\D/g, "")) || 0), 0);
  return `AST-${String(maximum + 1).padStart(4, "0")}`;
}

export function AssetsPage() {
  const [assets, setAssets] = useState<IndustrialAsset[]>(initialAssets);
  const [query, setQuery] = useState("");
  const [site, setSite] = useState("All Sites");
  const [type, setType] = useState("All Types");
  const [status, setStatus] = useState<"All" | AssetStatus>("All");
  const [viewMode, setViewMode] = useState<AssetViewMode>("grid");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<IndustrialAsset | null>(null);

  const sites = useMemo(() => [...new Set(assets.map((asset) => asset.location.siteName))].sort(), [assets]);
  const types = useMemo(() => [...new Set(assets.map((asset) => asset.machineType))].sort(), [assets]);
  const filteredAssets = useMemo(() => {
    const search = query.trim().toLowerCase();
    return assets.filter((asset) => {
      const searchable = [asset.assetId, asset.name, asset.machineType, asset.manufacturer, asset.location.siteName, asset.location.hallName, asset.location.lineName, asset.location.stationName].join(" ").toLowerCase();
      return (!search || searchable.includes(search)) && (site === "All Sites" || asset.location.siteName === site) && (type === "All Types" || asset.machineType === type) && (status === "All" || asset.lifecycle.status === status);
    });
  }, [assets, query, site, status, type]);

  return (
    <div className="space-y-5 pb-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Assets</p><h1 className="mt-1.5 text-2xl font-bold tracking-tight">Asset Registry</h1><p className="mt-1 text-sm text-muted-foreground">Industrial asset inventory — machines, controllers, and production equipment</p></div><button type="button" onClick={() => setRegisterOpen(true)} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="size-4" />Register Asset</button></header>

      <AssetStatsCards assets={assets} />
      <AssetFilters query={query} onQueryChange={setQuery} site={site} onSiteChange={setSite} sites={sites} type={type} onTypeChange={setType} types={types} status={status} onStatusChange={setStatus} viewMode={viewMode} onViewModeChange={setViewMode} />
      <p className="font-mono text-[10px] text-muted-foreground">{filteredAssets.length} asset{filteredAssets.length === 1 ? "" : "s"} found</p>
      {viewMode === "grid" ? <AssetGrid assets={filteredAssets} onSelect={setSelectedAsset} /> : <AssetListView assets={filteredAssets} onSelect={setSelectedAsset} />}

      {registerOpen && <RegisterAssetModal facilities={initialFacilities} nextAssetId={nextAssetId(assets)} onClose={() => setRegisterOpen(false)} onSave={(asset) => { setAssets((items) => [asset, ...items]); setRegisterOpen(false); }} />}
      {selectedAsset && <AssetDetailModal key={selectedAsset.id} asset={selectedAsset} maintenance={assetMaintenanceRecords.filter((record) => record.assetId === selectedAsset.id)} sensors={assetSensors.filter((sensor) => sensor.assetId === selectedAsset.id)} onClose={() => setSelectedAsset(null)} />}
    </div>
  );
}
