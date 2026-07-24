"use client";

import type { ReactNode } from "react";

import { SectionError } from "@/components/ui/async-states";
import { can, type Permission, type PermissionSession } from "@/lib/permissions";

export function PermissionGuard({ session, permission, children, fallback }: { session?: PermissionSession | null; permission: Permission; children: ReactNode; fallback?: ReactNode }) {
  if (can(session, permission)) return children;
  return fallback ?? <SectionError title="Unauthorized" message="Your account does not have permission to view this module." />;
}
