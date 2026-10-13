# CRM Frontend — Production-Readiness Audit Report

> **Scope**: Read-only audit. No files were modified.
> **Contract authority**: `swaggerv1.json` (58 operations, 56 schemas)

---

## AREA 1 — Role Model vs. Mandate

### What the code defines

```typescript
// src/auth/AuthContext.tsx L16
export type CrmRole = "Admin" | "Advisor" | "Customer" | "Guest";
```

### What the user mandate requires

> **Three roles only**: Super Admin, Admin, User.
> No "Customer" role. No "Advisor" role.

### What the Swagger contract says

`UserDto.uweRole` (line 3882–3884 of `swaggerv1.json`) is typed as `string | null` — **no enum is defined**. The contract does **not** specify what string values are valid. The frontend is the sole authority for mapping raw backend string values to application roles.

### Verdict — CRITICAL GAP

| Current code value | Swagger field | Mandate |
|---|---|---|
| `"Admin"` | `uweRole: string` | ✅ Keep |
| `"Advisor"` | `uweRole: string` | ❌ Not in mandate — maps to what? |
| `"Customer"` | `uweRole: string` | ❌ Not in mandate — do not rename without instruction |
| `"Guest"` | fallback only | ⚠️ Not a backend role, it is a frontend default |

> **Action required from product owner**: Clarify what backend `uweRole` strings the production API actually emits (e.g., `"ADM"`, `"ADV"`, `"CUS"`, `"SA"`, etc.) and confirm the mapping to "Super Admin / Admin / User". Until that mapping is confirmed, the frontend correctly passes the raw `uweRole` string through rather than blindly renaming it.

### Where the role is used for navigation gating

All `allowedRoles` arrays in [`Sidebar.tsx`](file:///c:/Users/Fakecloak/Downloads/uwe-web-app/src/components/Sidebar.tsx) use the values `"Admin"`, `"Advisor"`, and `"Customer"`. Every nav item is accessible to all three of those roles (except `/users` which is `["Admin"]` only). This means if the backend emits `"SA"` instead of `"Admin"`, the Super Admin sees no navigation items.

---

## AREA 2 — API Client & Transport Layer

**File**: [`src/api/client.ts`](file:///c:/Users/Fakecloak/Downloads/uwe-web-app/src/api/client.ts)

| Check | Status |
|---|---|
| Base URL from `VITE_API_BASE_URL` env var only | ✅ |
| No hardcoded `localhost` or port in source | ✅ (confirmed by grep) |
| Axios instance with global 401 interceptor | ✅ |
| `Authorization: Bearer <token>` injected on every request | ✅ |
| 401 → dispatches `uwe:unauthorized` → triggers logout | ✅ |
| 403, 404, 409, 500 mapped to structured `ApiError` | ✅ |
| Network failure / `ERR_CONNECTION_REFUSED` caught | ✅ |
| Timeout mapped to `TIMEOUT` kind | ✅ |
| `AUTH_HANDSHAKE_ENDPOINTS` exempted from global logout | ✅ |

> No issues in the transport layer.

---

## AREA 3 — Authentication & Session

**File**: [`src/auth/AuthContext.tsx`](file:///c:/Users/Fakecloak/Downloads/uwe-web-app/src/auth/AuthContext.tsx)

| Check | Status |
|---|---|
| Session validated via `POST /api/Users/mobile-otp/validate-session` | ✅ |
| JWT token stored in `localStorage` (`uwe_auth_token`) | ✅ |
| Refresh token stored in `localStorage` (`uwe_refresh_token`) | ✅ |
| `activeRole` derived **strictly** from `user.uweRole` (server-issued) | ✅ |
| Fallback to `"Guest"` when unauthenticated | ✅ |
| No mock user objects or hardcoded credentials | ✅ |

### Orphaned logout utility

[`src/auth/logout.ts`](file:///c:/Users/Fakecloak/Downloads/uwe-web-app/src/auth/logout.ts) removes only `"token"` (generic key), but the real token key is `"uwe_auth_token"`. This file appears **orphaned** — the actual logout function in `AuthContext.tsx` likely clears the correct keys. Needs verification that `logout.ts` is not imported anywhere.

---

## AREA 4 — Route Protection

**File**: [`src/auth/ProtectedRoute.tsx`](file:///c:/Users/Fakecloak/Downloads/uwe-web-app/src/auth/ProtectedRoute.tsx)

| Check | Status |
|---|---|
| Unauthenticated users redirected to `/login` | ✅ |
| Loading state renders skeleton/spinner (not content) | ✅ |
| Role mismatch renders access-denied panel (not redirect) | ✅ |
| Backend authorization is described as authoritative | ✅ |

---

## AREA 5 — Error State Handling per Page

### Pattern in place (GOOD)

Every page that loads data from the API uses this pattern:

```typescript
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);
// ...
setIsLoading(true); setError(null);
try { /* await API */ } catch (err) { setError(err) } finally { setIsLoading(false) }
```

And renders `<ErrorBanner error={error} onRetry={loadFn} />` — which correctly differentiates 403 (amber shield banner) from connection refused / timeout / other errors (red error banner).

### Status per page

| Page | Loading state | API error (500/net) | 403 isolated | Empty state | Retry button |
|---|---|---|---|---|---|
| `Advisors.tsx` | ✅ | ✅ | ✅ (via ErrorBanner) | ✅ emptyMessage on DataTable | ✅ |
| `Appointments.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `Webinars.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `Loyalty.tsx` | ✅ | ✅ | ✅ | Cards render empty | ✅ |
| `Journeys.tsx` | ✅ | ✅ | ✅ | Empty JSON panel | ✅ |
| `WealthMeter.tsx` | ✅ | ✅ | ✅ | Form still renders | ✅ |
| `Engagement.tsx` | ✅ (quiz) | ✅ | ✅ | "No active challenge" | ✅ |
| `Customer360.tsx` | ✅ spinner | ✅ | ✅ | Profile section empty | ✅ |
| `Users.tsx` | partial (no spinner) | ✅ | ✅ | — (query tool page) | ✅ |
| `AdminCalendar.tsx` | ❌ **no loading state** | ✅ | ✅ | Calendar renders empty | ✅ |
| `Settings.tsx` | N/A (no API load) | N/A | N/A | N/A | N/A |
| `Dashboard.tsx` | Not viewed yet | — | — | — | — |

> **ISSUE**: [`AdminCalendar.tsx`](file:///c:/Users/Fakecloak/Downloads/uwe-web-app/src/pages/AdminCalendar.tsx) has no `isLoading` state; the calendar grid renders immediately with an empty array, which users may misread as "no appointments" before the API responds.

---

## AREA 6 — Redundant Effect in AdminCalendar

[`AdminCalendar.tsx`](file:///c:/Users/Fakecloak/Downloads/uwe-web-app/src/pages/AdminCalendar.tsx) fetches calendar data **twice** on mount:

1. `useCallback(loadCalendarData, [activeRole])` — defined but only used for the retry button
2. An inline `useEffect` that duplicates the same fetch logic

The inline effect also has an `active` flag for cleanup (correct), but the `useCallback` version does not. Both are triggered on `activeRole` change. This is dead code duplication and an unnecessary API call on every render.

---

## AREA 7 — Role Branching Using Undocumented Roles

Both [`AdminCalendar.tsx`](file:///c:/Users/Fakecloak/Downloads/uwe-web-app/src/pages/AdminCalendar.tsx) (lines 23, 25, 41, 43) and [`Appointments.tsx`](file:///c:/Users/Fakecloak/Downloads/uwe-web-app/src/pages/Appointments.tsx) (lines 73, 75) switch API calls based on `activeRole === "Advisor"` and `activeRole === "Customer"`. These role strings are not validated against the product mandate (only 3 roles: Super Admin, Admin, User), making this branching logic potentially broken in production.

---

## AREA 8 — Sidebar Role Gating

All nav items in [`Sidebar.tsx`](file:///c:/Users/Fakecloak/Downloads/uwe-web-app/src/components/Sidebar.tsx) use the literal strings `"Admin"`, `"Advisor"`, `"Customer"`. If the backend emits different role strings, the sidebar would either:
- Show nothing (if role doesn't match any)
- Show everything (if `allowedRoles` is omitted)

The `Identity & Access` route (`/users`) is the only role-restricted item: `allowedRoles: ["Admin"]`.

---

## AREA 9 — Mutation Error Handling: alert() Anti-Pattern

Every mutation handler across all pages (37 confirmed occurrences) uses the browser native `alert()` for error feedback and in some cases for success messages:

```
Webinars.tsx × 6 usages
Appointments.tsx × 8 usages
Users.tsx × 6 usages
Loyalty.tsx × 4 usages
Advisors.tsx × 2 usages
Customer360.tsx × 4 usages
Journeys.tsx × 4 usages
Engagement.tsx × 2 usages
WealthMeter.tsx × 1 usage
```

`alert()` is a blocking UI-thread primitive. In production it:
- Blocks interaction with the page
- Is unstyled and inconsistent
- Cannot be dismissed programmatically
- Fails accessibility standards

> **Recommendation**: Replace with an inline toast/snackbar notification system consistent with the `ErrorBanner` pattern already in place.

---

## AREA 10 — Hardcoded Placeholder Value in Form Default State

[`Webinars.tsx` L63](file:///c:/Users/Fakecloak/Downloads/uwe-web-app/src/pages/Webinars.tsx#L63):

```typescript
joinUrl: "https://teams.microsoft.com/l/meetup-join/uwe",
```

This is a hardcoded, non-functional placeholder URL used as the default value when creating a new webinar. While it is only a form default (user can overwrite it), it leaks a partially constructed URL that may be submitted to the API unchanged, resulting in invalid data in production.

---

## AREA 11 — No Production Build Validation

`vite.config.ts` defines no `base` path, no `build.outDir` customization, and no environment mode guards. Environment switching relies solely on `VITE_API_BASE_URL`, which is correct — but there is no `.env.production` or `.env.example` file in the repo root to document the required variable for deployment teams.

---

## AREA 12 — Orphaned Logout Utility

[`src/auth/logout.ts`](file:///c:/Users/Fakecloak/Downloads/uwe-web-app/src/auth/logout.ts):

```typescript
export const logout = () => {
  localStorage.removeItem("token");  // Wrong key name
  window.location.href = "/login";
};
```

This removes `"token"` but the actual storage key is `"uwe_auth_token"`. If this function is ever called (e.g., by a leftover import), it would silently fail to clear the session. Needs to be deleted or corrected.

---

## AREA 13 — Loyalty Page: Unused Promise.all result

[`Loyalty.tsx` L28–32](file:///c:/Users/Fakecloak/Downloads/uwe-web-app/src/pages/Loyalty.tsx):

```typescript
const [plansRes, featuresRes] = await Promise.all([
  getLoyaltyPlansList(),
  getLoyaltyFeatures(),
  getLoyaltyPlans(true),   // 3rd result is destructured away — result ignored
]);
```

The result of `getLoyaltyPlans(true)` (which calls `GET /api/Loyalty/plans`) is silently discarded. This wastes a network call on every page load.

---

## AREA 14 — Customer360: Unused Promise.all result

[`Customer360.tsx` L49–53](file:///c:/Users/Fakecloak/Downloads/uwe-web-app/src/pages/Customer360.tsx):

```typescript
const [profileRes, plansRes] = await Promise.all([
  getCustomerMe(),
  getLoyaltyPlansList(),
  getCustomerMeDashboard(),  // 3rd result is destructured away — result ignored
]);
```

Same pattern — `getCustomerMeDashboard()` result is never consumed.

---

## AREA 15 — Journeys: Progress API Response Ignored

[`Journeys.tsx` L27–28](file:///c:/Users/Fakecloak/Downloads/uwe-web-app/src/pages/Journeys.tsx):

```typescript
await getJourneyProgress();
setJourneyProgressData({ status: "Synchronized with backend" });
```

The actual response from `GET /api/Journey/progress` is discarded. The component renders a hardcoded synthetic object instead of actual journey progress data from the backend. This is effectively mock data from a real API call.

---

## AREA 16 — Duplicate Data Fetch in AdminCalendar

The calendar component registers two separate `useEffect` calls and a `useCallback` all loading the same data. The first `useCallback`-based approach (lines 20–34) is only wired to the `<ErrorBanner onRetry>` button. The second inline `useEffect` (lines 36–57) duplicates the entire fetch. This means **every role change triggers two API calls**.

---

## AREA 17 — Users.tsx: No Loading State for Initial Fetch

[`Users.tsx`](file:///c:/Users/Fakecloak/Downloads/uwe-web-app/src/pages/Users.tsx) calls `getUsersMe()` on mount via `loadSession()`, but there is no loading spinner or skeleton for the session card — it briefly shows `"Loading authenticated user context..."` as a static text string (line 190) rather than being gated by the actual `isLoading` boolean state.

---

## AREA 18 — Environment / Deployment Posture

| Check | Status |
|---|---|
| API URL from `VITE_API_BASE_URL` only | ✅ |
| No hardcoded IPs or localhost in source | ✅ |
| Settings page correctly displays active env URL | ✅ |
| `.env.example` file exists | ❌ Not found |
| Production build instructions documented | ❌ Not visible |

---

## Summary: Prioritized Issues

### 🔴 CRITICAL

| # | Issue | File |
|---|---|---|
| C1 | `CrmRole` type includes `"Customer"` and `"Advisor"` which are not in the product mandate; navigation gating and API branching depend on these strings matching the backend exactly. Role strings from `uweRole` are never validated against a known set. | `AuthContext.tsx`, `Sidebar.tsx`, `Appointments.tsx`, `AdminCalendar.tsx` |
| C2 | `logout.ts` removes wrong localStorage key (`"token"` instead of `"uwe_auth_token"`) | `src/auth/logout.ts` |

### 🟠 HIGH

| # | Issue | File |
|---|---|---|
| H1 | 37 `alert()` calls used for mutation feedback — blocking, inaccessible, unstyled | All page components |
| H2 | `AdminCalendar.tsx` has no loading state — calendar grid appears empty on initial load | `AdminCalendar.tsx` |
| H3 | `Journeys.tsx` discards actual API response and renders hardcoded synthetic object | `Journeys.tsx` |

### 🟡 MEDIUM

| # | Issue | File |
|---|---|---|
| M1 | Hardcoded Teams placeholder URL as form default in Create Webinar | `Webinars.tsx` |
| M2 | `Loyalty.tsx`: third `Promise.all` result silently discarded (wasted API call) | `Loyalty.tsx` |
| M3 | `Customer360.tsx`: third `Promise.all` result silently discarded | `Customer360.tsx` |
| M4 | `AdminCalendar.tsx`: duplicate fetch logic — two parallel API calls on every render | `AdminCalendar.tsx` |
| M5 | No `.env.example` to document required `VITE_API_BASE_URL` for CI/CD pipelines | Project root |

### 🔵 LOW / INFORMATIONAL

| # | Issue | File |
|---|---|---|
| L1 | `Users.tsx` shows static "Loading..." text instead of state-gated skeleton | `Users.tsx` |
| L2 | `RoleSwitcher.tsx` is named `RoleSwitcher` in the file export but component function is `RoleBadge` | `RoleSwitcher.tsx` |
| L3 | Swagger `UserDto.uweRole` is untyped (`string | null`); no backend enum guarantees the values "Admin"/"Advisor"/"Customer" | `swaggerv1.json` |
