export type Permission =
  | "dashboard.view" | "facilities.view" | "assets.view" | "sensors.view" | "downtime.view"
  | "reports.view" | "financial.view" | "olive.use" | "users.manage" | "roles.manage"
  | "activity.view" | "security.view" | "audit.view" | "governance.view" | "data-input.manage"
  | "settings.view" | "profile.view";

const allPermissions: Permission[] = [
  "dashboard.view", "facilities.view", "assets.view", "sensors.view", "downtime.view",
  "reports.view", "financial.view", "olive.use", "users.manage", "roles.manage",
  "activity.view", "security.view", "audit.view", "governance.view", "data-input.manage",
  "settings.view", "profile.view",
];

const roleFallbacks: Record<string, Permission[]> = {
  super_admin: allPermissions,
  admin: allPermissions,
  manager: ["dashboard.view", "facilities.view", "assets.view", "sensors.view", "downtime.view", "reports.view", "olive.use", "activity.view", "governance.view", "data-input.manage", "settings.view", "profile.view"],
  security_analyst: ["dashboard.view", "activity.view", "security.view", "audit.view", "olive.use", "settings.view", "profile.view"],
  finance_viewer: ["dashboard.view", "financial.view", "reports.view", "settings.view", "profile.view"],
  line_supervisor: ["dashboard.view", "facilities.view", "sensors.view", "downtime.view", "olive.use", "profile.view"],
  viewer: ["dashboard.view", "facilities.view", "assets.view", "sensors.view", "downtime.view", "reports.view", "profile.view"],
};

export type PermissionSession = { role: string; permissions?: string[] };

export function permissionsFor(session?: PermissionSession | null): Set<string> {
  if (!session) return new Set();
  if (session.permissions?.length) return new Set(session.permissions);
  return new Set(roleFallbacks[session.role.toLowerCase()] ?? roleFallbacks.viewer);
}

export function can(session: PermissionSession | null | undefined, permission: Permission) {
  return permissionsFor(session).has(permission);
}
