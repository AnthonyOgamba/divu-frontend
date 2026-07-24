"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import type { CurrentUserDto, OrganizationSettingDto } from "@/lib/backend-dtos";
import { can } from "@/lib/permissions";
import { PageLoadingState, SectionError } from "@/components/ui/async-states";

export function SettingsPage() {
  const [session, setSession] = useState<CurrentUserDto>();
  const [settings, setSettings] = useState<OrganizationSettingDto[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");
  const load = useCallback(async () => {
    try {
      const current = await apiRequest<CurrentUserDto>("/api/auth/session");
      setSession(current);
      if (can(current, "settings.organization")) setSettings(await apiRequest("/api/backend/settings/organization"));
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Settings could not be loaded."); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function save(setting: OrganizationSettingDto) {
    setSaving(setting.key);
    try { await apiRequest("/api/backend/settings/organization", { method: "PATCH", body: JSON.stringify({ key: setting.key, category: setting.category, value: setting.value }) }); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Setting could not be saved."); }
    finally { setSaving(""); }
  }
  if (!session && !error) return <PageLoadingState />;
  return <div className="space-y-5"><header><h1 className="text-2xl font-bold">Settings</h1><p className="mt-1 text-sm text-muted-foreground">Organization settings from the Identity service.</p></header>{error && <SectionError message={error} retry={() => void load()} />}{session && !can(session, "settings.organization") && <SectionError title="Insufficient permission" message="Your account can edit personal preferences from Profile, but cannot view organization settings." />}{settings.map((setting) => <section key={setting.key} className="rounded-xl border bg-card p-4"><label className="text-xs font-semibold">{setting.key}<input value={typeof setting.value === "string" || typeof setting.value === "number" ? String(setting.value) : JSON.stringify(setting.value)} onChange={(event) => setSettings((items) => items.map((item) => item.key === setting.key ? { ...item, value: event.target.value } : item))} className="mt-1 h-10 w-full rounded-lg border bg-background px-3" /></label><p className="mt-1 text-[10px] text-muted-foreground">{setting.category}</p>{session && can(session, "settings.organization") && ["admin", "super_admin"].includes(session.role) && <button onClick={() => void save(setting)} disabled={saving === setting.key} className="mt-3 rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground">{saving === setting.key ? "Saving…" : "Save"}</button>}</section>)}</div>;
}
