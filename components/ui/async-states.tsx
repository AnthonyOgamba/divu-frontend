import { AlertTriangle, Clock3, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";

export function PageLoadingState({ label = "Loading page data" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-5">
      <div className="h-16 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-xl bg-muted" />)}
      </div>
      <SectionSkeleton className="h-64" />
    </div>
  );
}

export function SectionSkeleton({ rows = 1, className }: { rows?: number; className?: string }) {
  return (
    <div role="status" aria-label="Loading section" className={cn("space-y-3 rounded-xl border bg-card p-4", className)}>
      {Array.from({ length: rows }, (_, index) => <div key={index} className="h-16 animate-pulse rounded-lg bg-muted" />)}
    </div>
  );
}

export function SectionError({ title = "Section unavailable", message, retry }: { title?: string; message: string; retry?: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{message}</p>
          {retry && <button type="button" onClick={retry} className="mt-3 inline-flex h-8 items-center gap-2 rounded-lg border bg-card px-3 text-xs font-semibold"><RefreshCw className="size-3.5" />Retry</button>}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title = "Nothing to display", description }: { title?: string; description?: string }) {
  return <div className="rounded-xl border border-dashed p-8 text-center"><p className="text-sm font-semibold">{title}</p>{description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}</div>;
}

export function SyntheticBadge() {
  return <span className="rounded bg-violet-500/10 px-2 py-1 font-mono text-[9px] font-bold text-violet-600">Synthetic</span>;
}

export function LastUpdatedIndicator({ at, refreshing = false }: { at?: Date | null; refreshing?: boolean }) {
  return <span className="inline-flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground"><Clock3 className={cn("size-3", refreshing && "animate-pulse")} />{refreshing ? "Refreshing…" : at ? `Updated ${at.toLocaleTimeString()}` : "Not updated"}</span>;
}
