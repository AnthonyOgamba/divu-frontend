/**
 * Compile-time boundaries for backend work that is confirmed as pending.
 * Deliberately contains no URL constants: endpoint paths and wire contracts
 * must come from the gateway OpenAPI before an adapter may perform I/O.
 */
export type DependencyStatus = "confirmed-available" | "confirmed-pending-deployment" | "missing" | "ambiguous";

export type PendingFacilitiesWorkspace = {
  summary: unknown;
  facilities: unknown[];
  capabilities?: string[];
};

export type PendingDashboardAggregate = {
  summary: unknown;
  widgets: Record<string, unknown>;
};

export type PendingPermissionSession = {
  user: unknown;
  permissions: string[];
  assignedFacilities: unknown[];
};

export type PendingReportExport = {
  filename: string;
  contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
};

export type PendingSettingsEnvelope = {
  personal: unknown;
  organization?: unknown;
};
