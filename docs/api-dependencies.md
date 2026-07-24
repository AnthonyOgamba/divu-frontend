# Frontend API dependency map

Status values:

1. **confirmed and available** — present in the published contract and/or observed on the production gateway.
2. **confirmed but pending deployment** — backend work is known but no production contract is available.
3. **missing** — no endpoint is published.
4. **ambiguous** — a related endpoint exists, but it does not prove the required page contract.

All browser requests use `/api/backend/*`. `BACKEND_API_URL` is server-only. No browser module calls an Azure Container App directly.

| Frontend page/module | Current request | Required dependency | Status | Loading/error behavior | Mock data |
|---|---|---|---:|---|---|
| Login/session | `/api/auth/login`, dashboard validation | `/api/auth/me` with permissions and assignments | 2 | Form errors; existing session flow retained until verified | Display identity fallback |
| Dashboard summary | `/api/backend/dashboard` | Aggregate production summary | 1 | Summary independent from analytics | No primary mock |
| Dashboard analytics | `/api/backend/runs/analytics` | Production trend | 1 | Independent widget error/retry | No primary mock |
| Dashboard optional widgets | none | OEE, downtime, finance, sensor health, security, alerts/activity aggregates | 2/4 | Explicit pending empty states | Historical dashboard display data remains unused |
| Facilities list | `/api/backend/facilities` | Aggregate workspace endpoint | 2 | First request loads shallow cards; existing data retained | Legacy facility seed file remains for other pages |
| Facilities hierarchy/performance | existing hierarchy endpoints, loaded lazily | Aggregate detail endpoint | 4 | Per-tab skeleton/error; in-memory cache | No fallback data in active Facilities page |
| Facilities access | `/api/backend/site-access` | Access list/create | 1 | Loaded only when Access tab opens | None in active page |
| Facilities insights | `/api/backend/ai/assets/failure-probabilities` | Station risk | 1 | Optional section error does not blank hierarchy | None |
| Olive readiness | `/api/backend/ai/ready` | AI readiness | 1 | Dedicated readiness gate | None |
| Olive chat | `/api/backend/ai/chat` | Chat | 1 | Abort, 45s timeout, elapsed time, failed-request retry | Suggested questions only |
| Olive risk/alerts/notifications/rules/settings | matching `/api/backend/ai/*` routes | Published Olive OpenAPI | 1 | Each tab mounts and fetches independently | None |
| Olive generators | `/api/backend/ai/data-generators*` | Published generator contract | 1 | SSE with 30s disconnected fallback poll | None |
| Sensors streams | `/api/backend/sensors/streams*` | Stream/sensor inventory | 1 | Independent stream/detail state | Main sensor cards still seeded |
| Sensors live readings | none | Incremental reading/SSE contract | 4 | Pending | Yes |
| Assets | none | Asset CRUD, station assignment, telemetry, maintenance | 3 | Demonstration UI | Yes |
| Downtime | none | Events, reasons, duration, cost, trend | 3 | Demonstration UI | Yes |
| Audit | `/api/backend/audit` | Audit list | 1 | Page-specific | Legacy presentation data remains |
| Reports | none | Query/report/export `.xlsx` | 3 | Demonstration UI | Yes; frontend mock download must not be called production integration |
| Financial | none | Cost/loss/maintenance/avoided-cost aggregates | 3 | Demonstration UI | Yes |
| Security Operations/API Security | none | Security events, failures, integrity incidents, clients | 3 | Demonstration UI | Yes |
| Activity | none | Combined user and operational activity | 3 | Demonstration UI | Yes |
| Users/Roles/Invitations | none | CRUD, capabilities, assignments, invitation lifecycle | 2 | Demonstration UI | Yes |
| Settings/Profile | `/api/auth/session` only | Personal/org settings and full profile | 2 | Existing local state | Yes |
| Notifications drawer | `/api/backend/ai/notifications` plus local workflow data | Unified notification contract | 4 | AI errors isolated | Partial |
| Governance/Data Input | none | Governance/import/batch contracts | 3 | Demonstration UI | Yes |

## Static/mock dependencies still present

- `components/assets/assets-data.ts`
- `components/sensors/sensors-data.ts`
- `components/downtime/downtime-data.ts`
- `components/reports/report-data.tsx`
- `components/users/users-data.ts`
- `components/roles/roles-data.ts`
- `components/activity/activity-data.ts`
- `components/financial/financial-data.ts`
- `components/security-operations/security-operations-data.ts`
- `components/governance/*-data.ts`
- `components/data-input/data-input-data.ts`
- `components/profile/profile-page.tsx` local initial profile
- `lib/platform-workflow-store.ts` seeded notifications/activity

These dependencies are identified, not silently replaced with guessed requests. Typed placeholders live in `lib/pending-backend-contracts.ts`; they contain no endpoint paths.
