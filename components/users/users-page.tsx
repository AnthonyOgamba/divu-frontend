"use client";

import { Copy, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import type { CreateUserDto, CreatedUserDto, InvitationDto, RoleDto, UserDto } from "@/lib/backend-dtos";
import { EmptyState, PageLoadingState, SectionError } from "@/components/ui/async-states";

export function UsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [credential, setCredential] = useState<CreatedUserDto>();
  const [invitation, setInvitation] = useState<InvitationDto>();
  const load = useCallback(async () => {
    setLoading(true);
    try { const [userRows, roleRows] = await Promise.all([apiRequest<UserDto[]>("/api/backend/users"), apiRequest<RoleDto[]>("/api/backend/roles")]); setUsers(userRows); setRoles(roleRows); setError(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Users could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function invite(uid: number) { try { setInvitation(await apiRequest(`/api/backend/users/${uid}/invitation`, { method: "POST", body: "{}" })); } catch (cause) { setError(cause instanceof Error ? cause.message : "Invitation could not be created."); } }
  if (loading && !users.length) return <PageLoadingState />;
  return <div className="space-y-5"><header className="flex items-start justify-between"><div><h1 className="text-2xl font-bold">Users</h1><p className="mt-1 text-sm text-muted-foreground">Identity directory. Listed roles may differ from the signed-in user’s effective role.</p></div><button onClick={() => setCreating(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-xs text-primary-foreground"><Plus className="size-4" />Create user</button></header>{error && <SectionError message={error} retry={() => void load()} />}{!users.length ? <EmptyState title="No users" /> : <section className="overflow-x-auto rounded-xl border bg-card"><table className="min-w-[720px] w-full text-left text-xs"><thead><tr className="border-b text-muted-foreground"><th className="p-3">Username</th><th>Email</th><th>Persisted role</th><th>Status</th><th>Last login</th><th /></tr></thead><tbody>{users.map((user) => <tr key={user.uid} className="border-b last:border-0"><td className="p-3 font-semibold">{user.username}</td><td>{user.email}</td><td>{user.role}</td><td>{user.status}{user.mustChangePassword ? " · password change required" : ""}</td><td>{user.lastLoginAtUtc ? new Date(user.lastLoginAtUtc).toLocaleString() : "Never"}</td><td><button onClick={() => void invite(user.uid)} className="rounded border px-2 py-1">Create invitation</button></td></tr>)}</tbody></table></section>}{creating && <CreateUserDialog roles={roles} close={() => setCreating(false)} created={(result) => { setCreating(false); setCredential(result); void load(); }} />}{credential && <SecretDialog title="Temporary password" value={credential.temporaryPassword} close={() => setCredential(undefined)} warning={`This password will not be shown again. Role: ${credential.role}. Facilities: ${credential.facilityIds.join(", ") || "none"}. Password change required: yes.`} />}{invitation && <SecretDialog title="Invitation URL" value={invitation.invitationUrl} close={() => setInvitation(undefined)} warning={`Expires ${new Date(invitation.expiresAtUtc).toLocaleString()}. Invitation redemption is not implemented in the current backend.`} />}</div>;
}

function CreateUserDialog({ roles, close, created }: { roles: RoleDto[]; close: () => void; created: (user: CreatedUserDto) => void }) {
  const [form, setForm] = useState<CreateUserDto>({ username: "", email: "", role: roles[0]?.role ?? "viewer", facilityIds: [] });
  const [facility, setFacility] = useState("");
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) { event.preventDefault(); try { created(await apiRequest("/api/backend/users", { method: "POST", body: JSON.stringify({ ...form, facilityIds: facility ? [Number(facility)] : [] }) })); } catch (cause) { setError(cause instanceof Error ? cause.message : "User could not be created."); } }
  const input = "mt-1 h-10 w-full rounded-lg border bg-background px-3";
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"><form onSubmit={submit} className="w-full max-w-lg space-y-4 rounded-xl border bg-card p-5"><h2 className="font-bold">Create user</h2>{error && <SectionError message={error} />}<label className="block text-xs">Username<input required value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} className={input} /></label><label className="block text-xs">Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={input} /></label><label className="block text-xs">Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className={input}>{roles.map((role) => <option key={role.role}>{role.role}</option>)}</select></label><label className="block text-xs">Facility ID<input inputMode="numeric" value={facility} onChange={(event) => setFacility(event.target.value.replace(/\D/g, ""))} className={input} /></label><div className="flex justify-end gap-2"><button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-xs">Cancel</button><button className="rounded-lg bg-primary px-4 py-2 text-xs text-primary-foreground">Create</button></div></form></div>;
}

function SecretDialog({ title, value, warning, close }: { title: string; value: string; warning: string; close: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-lg rounded-xl border bg-card p-5"><div className="flex justify-between"><h2 className="font-bold">{title}</h2><button onClick={close} aria-label="Close"><X className="size-4" /></button></div><p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">{warning}</p><div className="mt-3 flex gap-2"><code className="min-w-0 flex-1 overflow-x-auto rounded-lg bg-muted p-3 text-xs">{value}</code><button onClick={() => void navigator.clipboard.writeText(value)} aria-label={`Copy ${title}`} className="rounded-lg border px-3"><Copy className="size-4" /></button></div></section></div>;
}
