"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import type { ProfileDto, ProfileUpdateDto } from "@/lib/backend-dtos";
import { PageLoadingState, SectionError } from "@/components/ui/async-states";

export function ProfilePage() {
  const [profile, setProfile] = useState<ProfileDto>();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => { try { setProfile(await apiRequest("/api/backend/profile")); setError(""); } catch (cause) { setError(cause instanceof Error ? cause.message : "Profile could not be loaded."); } }, []);
  useEffect(() => { void load(); }, [load]);
  async function save() {
    if (!profile) return;
    if ((currentPassword || newPassword) && (!currentPassword || newPassword.length < 12)) { setError("Password changes require the current password and a new password of at least 12 characters."); return; }
    setSaving(true); setError(""); setSuccess("");
    const body: ProfileUpdateDto = { displayName: profile.displayName, email: profile.email, theme: profile.theme, language: profile.language, timeZone: profile.timeZone, notificationPreferences: profile.notificationPreferences, defaultFacilityId: profile.defaultFacilityId, currentPassword: currentPassword || null, newPassword: newPassword || null };
    try { setProfile(await apiRequest("/api/backend/profile", { method: "PATCH", body: JSON.stringify(body) })); setCurrentPassword(""); setNewPassword(""); setSuccess("Profile saved."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Profile could not be saved."); }
    finally { setSaving(false); }
  }
  if (!profile && !error) return <PageLoadingState label="Loading profile" />;
  if (!profile) return <SectionError message={error} retry={() => void load()} />;
  const field = "mt-1 h-10 w-full rounded-lg border bg-background px-3 text-xs";
  return <div className="space-y-5"><header><h1 className="text-2xl font-bold">Profile</h1><p className="mt-1 text-sm text-muted-foreground">{profile.username} · {profile.role.replaceAll("_", " ")}</p></header>{error && <SectionError message={error} />}{success && <p role="status" className="rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-600">{success}</p>}<section className="grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2"><label className="text-xs font-semibold">Display name<input value={profile.displayName} onChange={(event) => setProfile({ ...profile, displayName: event.target.value })} className={field} /></label><label className="text-xs font-semibold">Email<input type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} className={field} /></label><label className="text-xs font-semibold">Theme<select value={profile.theme} onChange={(event) => setProfile({ ...profile, theme: event.target.value })} className={field}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></label><label className="text-xs font-semibold">Language<input value={profile.language} onChange={(event) => setProfile({ ...profile, language: event.target.value })} className={field} /></label><label className="text-xs font-semibold">Time zone<input value={profile.timeZone} onChange={(event) => setProfile({ ...profile, timeZone: event.target.value })} className={field} /></label><label className="text-xs font-semibold">Default facility ID<input value={profile.defaultFacilityId ?? ""} onChange={(event) => setProfile({ ...profile, defaultFacilityId: event.target.value ? Number(event.target.value) : null })} className={field} /></label><label className="text-xs font-semibold">Current password<input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={field} /></label><label className="text-xs font-semibold">New password<input type="password" autoComplete="new-password" minLength={12} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={field} /></label><div className="sm:col-span-2 text-xs text-muted-foreground">Assigned facilities: {profile.facilityIds.join(", ") || "None"} · Last login: {profile.lastLoginAtUtc ? new Date(profile.lastLoginAtUtc).toLocaleString() : "Unavailable"} · Must change password: {profile.mustChangePassword ? "Yes" : "No"}</div><button onClick={() => void save()} disabled={saving} className="h-10 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-50">{saving ? "Saving…" : "Save profile"}</button></section></div>;
}
