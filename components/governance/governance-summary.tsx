import {
  AlertTriangle,
  ChevronRight,
  Database,
  LockKeyhole,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import type { GovernanceSection } from "./governance-data";

const summaryItems: Array<{
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  target: GovernanceSection;
  tone?: "good" | "bad";
}> = [
  { label: "Total Datasets", value: "1,248", detail: "+4% this month", icon: Database, target: "classification", tone: "good" },
  { label: "Active Policies", value: "3", detail: "5 total", icon: ShieldCheck, target: "policies" },
  { label: "Compliance Score", value: "88%", detail: "2 controls failing", icon: UserRoundCheck, target: "compliance", tone: "good" },
  { label: "Open Alerts", value: "5", detail: "2 critical", icon: AlertTriangle, target: "alerts", tone: "bad" },
  { label: "Restricted Datasets", value: "7", detail: "Access controlled", icon: LockKeyhole, target: "classification" },
  { label: "PII Datasets", value: "1", detail: "Audit ready", icon: UserRoundCheck, target: "classification", tone: "good" },
];

export function GovernanceSummary({ onSelect }: { onSelect: (section: GovernanceSection) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {summaryItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            type="button"
            key={item.label}
            onClick={() => onSelect(item.target)}
            className="group rounded-xl border bg-card p-4 text-left shadow-[var(--dv-shadow)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--dv-shadow-m)]"
          >
            <div className="flex items-start justify-between">
              <span className="grid size-9 place-items-center rounded-lg bg-muted text-primary">
                <Icon className="size-4" />
              </span>
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="mt-4 text-2xl font-bold tracking-tight">{item.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
            <p className={`mt-2 text-[11px] ${item.tone === "good" ? "text-[var(--dv-badge-ok-text)]" : item.tone === "bad" ? "text-[var(--dv-badge-cr-text)]" : "text-muted-foreground"}`}>
              {item.detail}
            </p>
          </button>
        );
      })}
    </div>
  );
}
