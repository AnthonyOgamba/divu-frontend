import { ChevronRight } from "lucide-react";

import { complianceControls } from "./governance-data";
import { GovernanceCard } from "./governance-card";
import { StatusBadge } from "./status-badge";

export function ComplianceControls() {
  const passing = complianceControls.filter((control) => control.status === "Passing").length;
  const failing = complianceControls.filter((control) => control.status === "Failing").length;
  const monitoring = complianceControls.filter((control) => control.status === "Monitoring").length;
  const categories = complianceControls.reduce<Record<string, typeof complianceControls>>((groups, control) => {
    (groups[control.category] ??= []).push(control);
    return groups;
  }, {});

  return (
    <div className="space-y-5">
      <GovernanceCard className="p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div><p className="text-3xl font-bold text-[var(--dv-badge-wa-text)]">63%</p><p className="mt-1 text-xs text-muted-foreground">Compliance Score</p></div>
          <div className="flex gap-8 sm:gap-10">
            <div className="text-center"><p className="text-xl font-bold text-[var(--dv-badge-ok-text)]">{passing}</p><p className="mt-1 text-[10px] text-muted-foreground">Passing</p></div>
            <div className="text-center"><p className="text-xl font-bold text-[var(--dv-badge-wa-text)]">{monitoring}</p><p className="mt-1 text-[10px] text-muted-foreground">Review</p></div>
            <div className="text-center"><p className="text-xl font-bold text-[var(--dv-badge-cr-text)]">{failing}</p><p className="mt-1 text-[10px] text-muted-foreground">Failing</p></div>
          </div>
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-[63%] rounded-full bg-[var(--dv-badge-wa-text)]" /></div>
      </GovernanceCard>

      {Object.entries(categories).map(([category, controls]) => (
        <section key={category}>
          <h2 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{category}</h2>
          <GovernanceCard>
            <div className="divide-y">
              {controls.map((control) => (
                <div key={control.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30">
                  <span className={`size-2 shrink-0 rounded-full ${control.status === "Passing" ? "bg-[var(--dv-badge-ok-text)]" : control.status === "Failing" ? "bg-[var(--dv-badge-cr-text)]" : "bg-[var(--dv-badge-wa-text)]"}`} />
                  <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold">{control.name}</p><p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{control.framework} · {control.owner}</p></div>
                  <StatusBadge status={control.status} />
                  <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">{control.lastChecked}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </div>
              ))}
            </div>
          </GovernanceCard>
        </section>
      ))}
    </div>
  );
}
