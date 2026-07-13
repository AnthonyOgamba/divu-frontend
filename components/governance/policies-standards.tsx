"use client";

import { useState } from "react";
import { LockKeyhole, Plus, Search, ShieldCheck } from "lucide-react";

import { governancePolicies } from "./governance-data";
import { GovernanceCard } from "./governance-card";
import { StatusBadge } from "./status-badge";

export function PoliciesStandards() {
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState(false);
  const filtered = governancePolicies.filter((policy) => `${policy.name} ${policy.appliesTo} ${policy.owner}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Search policies</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search policies..." className="h-10 w-full rounded-lg border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30" /></label>
        <div className="flex items-center justify-between gap-4 sm:justify-end"><span className="text-xs text-muted-foreground">{filtered.length} policies</span><button type="button" onClick={() => setNotice(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/80"><Plus className="size-4" />Create Policy</button></div>
      </div>
      {notice && <div className="flex items-center justify-between rounded-lg border border-[var(--dv-badge-in-text)]/25 bg-[var(--dv-badge-in-bg)] px-4 py-3 text-xs text-[var(--dv-badge-in-text)]"><span>Policy creation will be enabled when governance workflows are connected.</span><button type="button" onClick={() => setNotice(false)} className="font-semibold hover:underline">Dismiss</button></div>}

      <GovernanceCard title="Policy Catalog" subtitle="Retention, protection, and review standards managed by Admin User">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-muted/60 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Policy</th><th className="px-4 py-3 font-medium">Applies to</th><th className="px-4 py-3 font-medium">Retention</th><th className="px-4 py-3 font-medium">Review</th><th className="px-4 py-3 font-medium">Protection</th><th className="px-4 py-3 font-medium">Status</th></tr></thead>
            <tbody className="divide-y">
              {filtered.map((policy) => (
                <tr key={policy.id} className="hover:bg-muted/30">
                  <td className="px-5 py-4"><div className="flex items-start gap-3"><span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-primary"><ShieldCheck className="size-4" /></span><div><p className="text-[13px] font-semibold">{policy.name}</p><p className="mt-1 max-w-sm text-[11px] leading-5 text-muted-foreground">{policy.description}</p><p className="mt-1 font-mono text-[9px] text-muted-foreground">{policy.id} · Owner: {policy.owner}</p></div></div></td>
                  <td className="px-4 py-4 text-xs">{policy.appliesTo}</td>
                  <td className="px-4 py-4 font-mono text-xs text-muted-foreground">{policy.retention}</td>
                  <td className="px-4 py-4"><p className="text-xs">{policy.review}</p><p className="mt-1 font-mono text-[9px] text-muted-foreground">Updated {policy.updated}</p></td>
                  <td className="px-4 py-4"><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><LockKeyhole className="size-3.5" />{policy.encrypted ? "Encrypted" : "Standard"}</span></td>
                  <td className="px-4 py-4"><StatusBadge status={policy.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GovernanceCard>
    </div>
  );
}
