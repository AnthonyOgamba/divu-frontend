"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Database, FileText, LockKeyhole, Search } from "lucide-react";

import { datasets, type ClassificationLevel } from "./governance-data";
import { GovernanceCard } from "./governance-card";
import { ClassificationBadge, StatusBadge } from "./status-badge";

const levels: Array<"All" | ClassificationLevel> = ["All", "Public", "Internal", "Confidential", "Restricted"];

export function ClassificationRegistry() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<(typeof levels)[number]>("All");
  const filtered = useMemo(
    () =>
      datasets.filter(
        (dataset) =>
          (level === "All" || dataset.classification === level) &&
          `${dataset.name} ${dataset.department} ${dataset.owner}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [level, query],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <span className="sr-only">Search datasets</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search datasets, owners, or departments"
            className="h-10 w-full rounded-lg border bg-card pl-9 pr-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
          />
        </label>
        <div className="flex items-center gap-3">
          <select
            value={level}
            onChange={(event) => setLevel(event.target.value as (typeof levels)[number])}
            className="h-10 rounded-lg border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
            aria-label="Filter by classification"
          >
            {levels.map((item) => <option key={item}>{item}</option>)}
          </select>
          <span className="whitespace-nowrap text-xs text-muted-foreground">{filtered.length} shown</span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((dataset) => (
          <GovernanceCard key={dataset.id}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-primary"><Database className="size-4" /></span>
                  <div className="min-w-0"><h2 className="truncate text-sm font-semibold">{dataset.name}</h2><div className="mt-1.5 flex flex-wrap gap-1.5"><ClassificationBadge level={dataset.classification} />{dataset.encrypted && <span className="inline-flex items-center gap-1 rounded bg-[var(--dv-badge-ok-bg)] px-2 py-1 font-mono text-[9px] font-semibold uppercase text-[var(--dv-badge-ok-text)]"><LockKeyhole className="size-3" />Encrypted</span>}{dataset.pii && <span className="rounded bg-[var(--dv-badge-cr-bg)] px-2 py-1 font-mono text-[9px] font-semibold uppercase text-[var(--dv-badge-cr-text)]">PII</span>}</div></div>
                </div>
                <StatusBadge status={dataset.status} />
              </div>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">{dataset.description}</p>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-[11px] font-medium text-accent-foreground"><FileText className="size-3.5 shrink-0" /><span className="truncate">{dataset.policy}</span></div>
            </div>
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-3 border-t bg-muted/20 px-5 py-3">
              <div><p className="font-mono text-[8px] uppercase tracking-[0.08em] text-muted-foreground">Owner</p><p className="mt-1 truncate text-[11px] font-semibold">{dataset.owner}</p></div>
              <div><p className="font-mono text-[8px] uppercase tracking-[0.08em] text-muted-foreground">Dept</p><p className="mt-1 truncate text-[11px] font-semibold">{dataset.department}</p></div>
              <div><p className="font-mono text-[8px] uppercase tracking-[0.08em] text-muted-foreground">Volume</p><p className="mt-1 truncate text-[11px] font-semibold">{dataset.volume}</p></div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </GovernanceCard>
        ))}
      </div>
    </div>
  );
}
