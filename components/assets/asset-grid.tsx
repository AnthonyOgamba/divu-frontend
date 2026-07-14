import { Cpu } from "lucide-react";

import { AssetCard } from "./asset-card";
import type { IndustrialAsset } from "./assets-data";

export function AssetGrid({ assets, onSelect }: { assets: IndustrialAsset[]; onSelect: (asset: IndustrialAsset) => void }) {
  if (!assets.length) return <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground"><Cpu className="mx-auto mb-3 size-9 opacity-40" />No assets match the selected filters.</div>;
  return <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{assets.map((asset) => <AssetCard key={asset.id} asset={asset} onSelect={onSelect} />)}</div>;
}
