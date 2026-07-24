export type Permission =
  | "dashboard.view" | "facilities.view" | "facilities.manage" | "assets.view" | "assets.manage"
  | "sensors.view" | "sensors.manage" | "downtime.view" | "downtime.manage"
  | "reports.view" | "reports.export" | "financial.view" | "users.view" | "users.manage"
  | "roles.view" | "roles.manage" | "security.view" | "security.manage" | "audit.view"
  | "olive.use" | "olive.configure" | "generator.use" | "settings.personal" | "settings.organization";

const allPermissions: Permission[] = [
  "dashboard.view", "facilities.view", "facilities.manage", "assets.view", "assets.manage",
  "sensors.view", "sensors.manage", "downtime.view", "downtime.manage", "reports.view",
  "reports.export", "financial.view", "users.view", "users.manage", "roles.view", "roles.manage",
  "security.view", "security.manage", "audit.view", "olive.use", "olive.configure",
  "generator.use", "settings.personal", "settings.organization",
];

const roleFallbacks: Record<string, Permission[]> = {
  super_admin: allPermissions,
  admin: allPermissions,
  manager: allPermissions.filter((permission) => !["users.manage", "roles.manage", "security.manage"].includes(permission)),
  operations_manager: allPermissions.filter((permission) => !["users.manage", "roles.manage", "security.manage"].includes(permission)),
  plant_manager: allPermissions.filter((permission) => !["users.manage", "roles.manage", "security.manage"].includes(permission)),
  security_analyst: ["dashboard.view", "security.view", "security.manage", "audit.view", "reports.view", "olive.use", "settings.personal"],
  finance_viewer: ["dashboard.view", "financial.view", "reports.view", "reports.export", "settings.personal"],
  report_viewer: ["dashboard.view", "reports.view", "reports.export", "settings.personal"],
  line_supervisor: ["dashboard.view", "facilities.view", "assets.view", "sensors.view", "downtime.view", "downtime.manage", "reports.view", "olive.use", "generator.use", "settings.personal"],
  viewer: ["dashboard.view", "facilities.view", "assets.view", "sensors.view", "reports.view", "olive.use", "settings.personal"],
};

export type PermissionSession = { role: string; capabilities?: string[] };

export function permissionsFor(session?: PermissionSession | null): Set<string> {
  if (!session) return new Set();
  if (session.capabilities?.length) return new Set(session.capabilities);
  return new Set(roleFallbacks[session.role.toLowerCase()] ?? roleFallbacks.viewer);
}

export function can(session: PermissionSession | null | undefined, capability: string) {
  return permissionsFor(session).has(capability);
}
