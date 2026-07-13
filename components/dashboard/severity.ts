import type { DashboardSeverity } from "./dashboard-data";

export const severityStyles: Record<DashboardSeverity, { badge: string; bar: string; dot: string }> = {
  neutral: {
    badge: "bg-muted text-muted-foreground",
    bar: "bg-muted-foreground",
    dot: "bg-muted-foreground",
  },
  healthy: {
    badge: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]",
    bar: "bg-[var(--dv-badge-ok-text)]",
    dot: "bg-[var(--dv-badge-ok-text)]",
  },
  warning: {
    badge: "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]",
    bar: "bg-[var(--dv-badge-wa-text)]",
    dot: "bg-[var(--dv-badge-wa-text)]",
  },
  critical: {
    badge: "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]",
    bar: "bg-[var(--dv-badge-cr-text)]",
    dot: "bg-[var(--dv-badge-cr-text)]",
  },
  info: {
    badge: "bg-[var(--dv-badge-in-bg)] text-[var(--dv-badge-in-text)]",
    bar: "bg-[var(--dv-badge-in-text)]",
    dot: "bg-[var(--dv-badge-in-text)]",
  },
};
