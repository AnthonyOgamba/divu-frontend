"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import type { RoleDto } from "@/lib/backend-dtos";
import { EmptyState, PageLoadingState, SectionError } from "@/components/ui/async-states";

export function RolesPage() {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { apiRequest<RoleDto[]>("/api/backend/roles").then(setRoles).catch((cause) => setError(cause instanceof Error ? cause.message : "Roles could not be loaded.")); }, []);
  if (!roles.length && !error) return <PageLoadingState />;
  return <div className="space-y-5"><header><h1 className="text-2xl font-bold">Roles and capabilities</h1><p className="mt-1 text-sm text-muted-foreground">Read-only catalog. The backend does not provide role mutation endpoints.</p></header>{error && <SectionError message={error} />}{!roles.length ? <EmptyState title="No roles" /> : <section className="grid gap-3 lg:grid-cols-2">{roles.map((role) => <article key={role.role} className="rounded-xl border bg-card p-4"><h2 className="font-semibold">{role.role}</h2><div className="mt-3 flex flex-wrap gap-1">{role.capabilities.map((capability) => <span key={capability} className="rounded bg-muted px-2 py-1 font-mono text-[9px]">{capability}</span>)}</div></article>)}</section>}</div>;
}
