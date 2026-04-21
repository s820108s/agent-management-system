# Research: 代理商管理後台系統

**Phase**: 0 — Outline & Research  
**Date**: 2026-04-21  
**Feature**: [spec.md](spec.md)

## Decision Log

---

### D-001: Admin Template — vue-element-plus-admin vs. bare Element Plus

**Decision**: Use [vue-element-plus-admin](https://element-plus-admin-doc.cn/) as the scaffolding base.

**Rationale**: The spec explicitly calls out Element Plus Admin as the framework. It provides out-of-the-box: Vue Router 4 integration, Pinia-based auth store scaffolding, sidebar navigation config, topbar layout with user dropdown, and route-level permission guard hooks. Using the template avoids re-implementing these cross-cutting concerns and aligns with the assumption that layout customisation is minimal.

**Alternatives considered**:
- Bare Vue 3 + Element Plus without admin template — rejected: would require building layout, auth scaffold, and routing from scratch, significantly increasing scope.
- Naive UI Admin — rejected: spec explicitly specifies Element Plus.

---

### D-002: State Management — Pinia stores structure

**Decision**: Two Pinia stores — `authStore` and `agentStore`.

**Rationale**: `authStore` owns login/logout, token persistence (localStorage), and the 401 forced-logout action called by the Axios interceptor. `agentStore` owns agent list state, pagination params, filter/sort params, and the status-toggle action. Keeping them separate enforces single responsibility and makes unit testing straightforward.

**Alternatives considered**:
- Single combined store — rejected: mixes auth lifecycle with business data, harder to test.
- Vuex — rejected: Pinia is the Vue 3 standard successor, already used by vue-element-plus-admin.

---

### D-003: HTTP Layer — Axios instance + interceptor pattern

**Decision**: Single shared Axios instance (`src/utils/request.ts`) with:
1. Request interceptor: attaches `Authorization: Bearer <token>` header from `authStore.token`.
2. Response interceptor: on 401 → calls `authStore.logout()` → redirects to `/login`.

**Rationale**: Centralised interceptor means every API module (`auth.ts`, `agents.ts`) automatically gets auth headers and 401 handling without per-call boilerplate. This directly implements FR-010 (force re-login on 401) and matches the spec clarification that no token refresh is performed.

**Alternatives considered**:
- Per-request header attachment — rejected: repetitive, error-prone.
- Silent token refresh on 401 — explicitly ruled out by spec (Clarification Q2).

---

### D-004: Route Guards — Navigation guard strategy

**Decision**: Global `beforeEach` guard in `src/router/index.ts`. Logic:
- If route requires auth (`meta.requiresAuth = true`) and `authStore.token` is absent → redirect to `/login`.
- If route is `/login` and `authStore.token` exists → redirect to `/agents` (home).

**Rationale**: Global guard covers all protected routes with zero per-route boilerplate, satisfying FR-003 and SC-005. `meta.requiresAuth` flag keeps the guard declarative and easy to extend when new routes are added in v2.

**Alternatives considered**:
- Per-route `beforeEnter` guards — rejected: requires annotation on every route, easy to miss.
- Middleware-style router plugin — overkill for v1 with two routes.

---

### D-005: Agent List — Server-side pagination, filter, and sort

**Decision**: All pagination, filtering, and sorting are server-side. The `agentStore` holds query params (`page`, `pageSize`, `name`, `status`, `sortField`, `sortOrder`) as reactive state. Any param change triggers a fresh API call; pagination resets to page 1 on filter/sort change.

**Rationale**: The spec requires server-side pagination (FR-005) and server-side filtering (FR-006, FR-006a, FR-006b) for correctness with up to 10,000 records. Client-side filtering would require fetching all records upfront, which violates performance goals.

**Query param mapping**:
```
GET /api/agents?page=1&pageSize=20&name=keyword&status=active&sortField=createdAt&sortOrder=desc
```

**Alternatives considered**:
- Client-side sort/filter with full data fetch — rejected: poor performance at 10K records, contradicts FR-005/006.

---

### D-006: Status Toggle — Optimistic vs. pessimistic update

**Decision**: Pessimistic update — wait for API success before updating the row in the table.

**Rationale**: Agent status changes are business-critical; showing an incorrect state briefly and then reverting (optimistic) creates confusion for admins. The spec's acceptance scenario 10 explicitly requires the state to remain unchanged on failure, which aligns naturally with pessimistic update. The toggle button shows a loading spinner during the request to prevent double-clicks (edge case from spec).

**Alternatives considered**:
- Optimistic update with rollback — rejected: unnecessary complexity for v1; admin tools prioritise correctness over perceived speed.

---

### D-007: Token Storage — localStorage vs. sessionStorage

**Decision**: `localStorage` for token and user info.

**Rationale**: The spec states an 8-hour token TTL enforced by the backend. Using `localStorage` allows the admin to close and reopen the browser tab within the 8-hour window without re-authenticating, which aligns with SC-001 (login in <30s implies minimising unnecessary logins). The backend's 401 response is the authoritative expiry signal.

**Alternatives considered**:
- `sessionStorage` — rejected: forces re-login on every new tab/browser restart within the 8-hour window, adding friction.
- In-memory only — rejected: lost on page refresh.

---

### D-008: Testing Strategy — Vitest + Vue Test Utils

**Decision**: Vitest for unit and component tests. No E2E in v1.

**Rationale**: Vitest integrates natively with Vite (same config, instant HMR). Vue Test Utils is the official testing library for Vue 3 components. Key test targets: `authStore` (login/logout/401 flow), `agentStore` (list fetch, filter, sort, toggle), Axios interceptor (401 redirect), and the login form component (form validation, submit state).

**Alternatives considered**:
- Jest — rejected: requires separate transform config for Vite projects; Vitest is the idiomatic choice.
- Playwright E2E — deferred to v2: sufficient value from unit/component tests for v1 scope.
