import { cn } from "@/lib/utils";

import type { EquipmentLine } from "./dashboard-data";
import { severityStyles } from "./severity";

export function EquipmentHealth({ lines }: { lines: EquipmentLine[] }) {
  return (
    <div className="divide-y">
      {lines.map((line) => (
        <div key={line.name} className="px-5 py-3.5">
          <div className="mb-2 flex items-center justify-between gap-4">
            <span className="truncate text-[13px] font-medium">{line.name}</span>
            <span className="font-mono text-[11px] text-muted-foreground">{line.value}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", severityStyles[line.severity].bar)}
              style={{ width: `${line.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
