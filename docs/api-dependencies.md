# Frontend API dependency map

Source of truth: backend `docs/frontend-integration-contract.md`, implementation commit `ed28834232889268fb6082585e3ef6ef293dcea9`.

The backend is complete locally but not deployed to Azure. All confirmed routes below are therefore also **blocked pending Azure deployment** for production. Local development uses server-only `BACKEND_API_URL=http://localhost:8080`; browser code uses `/api/backend/*`.

| Page/module | Confirmed route | Integration status | Contract notes |
|---|---|---|---|
| Login | `POST auth/login` | Confirmed and integrated | JWT remains in the HttpOnly cookie |
| Current user | `GET auth/me` | Confirmed and integrated | Flat `uid`, `username`, `email`, `role`, `capabilities`, `facilityIds`, `mustChangePassword` |
| Forgot password | `POST auth/forgot-password` | Confirmed and integrated | Acknowledgement only |
| Profile | `GET/PATCH profile` | Confirmed and integrated | Preferences are separate from `/auth/me`; password requires current password and 12+ characters |
| Organization settings | `GET/PATCH settings/organization` | Confirmed and integrated | PATCH writes one key/category/value |
| Users | `GET/POST users` | Confirmed and integrated | Temporary password shown once |
| Invitations | `POST users/{id}/invitation` | Confirmed and integrated | Generation/copy only; redemption is missing |
| Roles | `GET roles` | Confirmed and integrated | Read-only; mutation routes are missing |
| Site access | `GET/POST site-access` | Confirmed and integrated | One facility/access-level assignment |
| Dashboard | `GET dashboard` | Confirmed and integrated | No public filters; decimals converted to percentages; legacy analytics removed |
| Facilities | `GET facilities/workspace` | Confirmed and integrated | One initial aggregate request; optional `aiInsights` never blocks hierarchy |
| Hierarchy creation | `POST facilities`, `POST facilities/{id}/halls`, `POST halls/{id}/lines`, `POST lines/{id}/stations` | Confirmed and integrated | Used only for user create actions |
| Assets | `GET facilities/workspace`, `GET lines/{id}/stations`, `GET runs/stations` | Confirmed and partially integrated | Stations are the implemented machine resource; no asset CRUD route |
| Sensor inventory | `GET sensors/streams`, `GET sensors/streams/{id}/sensors` | Confirmed and integrated | Telemetry reads are not facility-filtered |
| Sensor mutations/readings | stream/sensor POST/PUT, readings POST, run readings GET | Confirmed but not yet integrated | BFF allowlisted; UI mutation forms remain to be connected |
| Runs | list/create/active/stations and lifecycle PATCH routes | Confirmed but not yet integrated | Existing page does not expose the complete run workflow |
| Products | products CRUD | Confirmed but not yet integrated | Production master data, never physical assets |
| Reports export | `GET reports/export.xlsx` | Confirmed and integrated | Binary body, MIME, disposition and filename preserved |
| Reports JSON | none | Missing backend route | On-screen report datasets explicitly unavailable |
| Audit | `GET audit` | Confirmed and integrated | Latest 100 only; no server pagination |
| Downtime | Dashboard `downtimeTrend` | Confirmed and integrated for summary | Detailed downtime API is missing |
| Financial | Dashboard `financialImpact` | Confirmed and integrated for summary | Detailed financial API is missing |
| Security Operations | Dashboard `securitySummary`, `recentAlerts` | Confirmed and integrated for summary | Security events/actions API is missing |
| Activity | Dashboard `recentActivity`; Audit separately | Confirmed and integrated for summary | Standalone activity API is missing |
| Olive | health, ready, chat, risks, alerts, notifications, rules, settings, scan, generators | Confirmed and integrated | Explicit snake_case DTOs |
| Olive SSE | `GET ai/events` | Confirmed and integrated | Fetch stream, Last-Event-ID, named events, bounded exponential reconnect, cancellation and duplicate protection |
| Data Governance | none | Missing backend route | Explicit unavailable-contract state |
| Data Input/imports | none | Missing backend route | Explicit unavailable-contract state |

## Backend inconsistencies

- Capabilities drive frontend visibility, while backend enforcement mostly uses role lists.
- `maintenance_technician` is accepted by some Telemetry/run-failure controllers but cannot be created through `/users`.
- `/users` returns persisted `UserRole`; `/auth/me` and `/profile` return the effective current-user role.
- Telemetry reads and several legacy analytics routes are not facility-filtered.
- Olive alerts, notifications, rules, settings and generator reads are not facility-filtered; Station Risk is assignment-scoped.
- Some Olive mutations/read routes enforce less than their nominal capability. The frontend still hides controls by capability, but the backend remains authoritative.
- Public `/dashboard` accepts no date or facility filters.

## Missing APIs

Asset CRUD, standalone downtime, detailed financial records, standalone security events, standalone activity, reports JSON, governance, imports, generation-batch history, invitation redemption, password-reset redemption, active sessions, token refresh/revocation, user update/delete, and role/permission mutations.

## Mock-data disposition

Mock-backed components and data files remain in the repository only where other inactive presentation modules import them. Active routes for Dashboard, Facilities, Assets, Reports, Financial, Downtime, Security Operations, Activity, Profile, Settings, Users, Roles and Sensors no longer use their previous mock page implementations. `lib/platform-workflow-store.ts` still seeds the global notification drawer; a unified notification contract is ambiguous because Olive notifications do not cover local approval workflows.
