export type PlatformUserScope = {
  id: string;
  role: string;
  department: string;
  siteIds: string[];
};

// TODO: Replace this mock identity with the authenticated session returned by the backend.
export const currentUserScope: PlatformUserScope = {
  id: "1",
  role: "Super Admin",
  department: "Information Technology",
  siteIds: [],
};

export function canViewAllPlants(user: PlatformUserScope) {
  return user.role === "Super Admin";
}

export function filterByPlantScope<T extends { id: string }>(items: T[], user: PlatformUserScope) {
  return canViewAllPlants(user) ? items : items.filter((item) => user.siteIds.includes(item.id));
}
