"use client";

import { LiveSensorStreams } from "./live-sensor-streams";

export function SensorsPage() {
  return <div className="space-y-5"><header><h1 className="text-2xl font-bold">Sensors and live telemetry</h1><p className="mt-1 text-sm text-muted-foreground">Confirmed sensor streams and stream sensors through the secured backend.</p></header><p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">Telemetry reads are authenticated but are not currently facility-filtered by the backend. Site-scoped telemetry security is not complete.</p><LiveSensorStreams /></div>;
}
