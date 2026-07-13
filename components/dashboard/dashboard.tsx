import {
  equipmentHealth,
  governanceMetrics,
  operationalMetrics,
  productionTrend,
  recentActivity,
  sensorGroups,
} from "./dashboard-data";
import { EquipmentHealth } from "./equipment-health";
import { MetricCard } from "./metric-card";
import { ProductionChart } from "./production-chart";
import { SectionCard } from "./section-card";
import { RecentActivity, SensorStatus } from "./status-panels";

function MetricBand({ title, metrics }: { title: string; metrics: typeof operationalMetrics }) {
  return (
    <section>
      <h2 className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
    </section>
  );
}

export function Dashboard() {
  return (
    <div className="space-y-5 pb-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            Command Center
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Industrial performance, governance, and security at a glance.</p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-full border bg-card px-3 py-1.5 shadow-[var(--dv-shadow)]">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--dv-badge-ok-text)] opacity-50" />
            <span className="relative inline-flex size-2 rounded-full bg-[var(--dv-badge-ok-text)]" />
          </span>
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Simulated feed · 14:32
          </span>
        </div>
      </div>

      <MetricBand title="Operational Performance" metrics={operationalMetrics} />
      <MetricBand title="Governance & Financial" metrics={governanceMetrics} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <SectionCard
          title="Production Output Trend"
          subtitle="Today · units per hour"
          action={<span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Mock telemetry</span>}
        >
          <ProductionChart data={productionTrend} />
        </SectionCard>
        <SectionCard title="Equipment Health" subtitle="Current OEE by production line">
          <EquipmentHealth lines={equipmentHealth} />
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <SensorStatus sensors={sensorGroups} />
        <RecentActivity events={recentActivity} />
      </div>
    </div>
  );
}
