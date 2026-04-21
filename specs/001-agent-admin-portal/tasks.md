# Tasks: 代理商管理後台系統

**Input**: Design documents from `specs/001-agent-admin-portal/`  
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/)

**Tests**: Not included (not requested in feature specification).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to ([US1], [US2])
- Exact file paths included in every description

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Scaffold the vue-element-plus-admin project and configure the base environment.

- [x] T001 Scaffold project using `vue-element-plus-admin` template into repo root, run `pnpm install`, and configure `.env.base` with app title and API proxy per `specs/001-agent-admin-portal/quickstart.md`
- [x] T002 [P] Configure TypeScript in `tsconfig.json`: enable `strict: true`, set path alias `@/` → `src/`
- [x] T003 [P] Remove template boilerplate from scaffold: delete demo pages, mock API handlers, and routes not needed for v1 (keep only layout shell, base config, and Pinia/Router setup)

**Checkpoint**: Project runs (`pnpm dev`), dev server starts on `http://localhost:5173`, no TypeScript errors.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Define all TypeScript interfaces in `src/types/index.ts`: `Admin`, `Agent`, `PaginatedResponse<T>`, `LoginRequest`, `LoginResponse`, `AgentListParams`, `UpdateAgentStatusRequest` — use definitions from `specs/001-agent-admin-portal/data-model.md`
- [x] T005 Create `authStore` in `src/stores/auth.ts`: state (`token: string | null`, `user: Admin | null`); actions `login(username, password)`, `logout()`, `handleUnauthorized()`; persist `token` and `user` to `localStorage` on login; clear on logout/unauthorized
- [x] T006 Create shared Axios instance in `src/utils/request.ts`: request interceptor attaches `Authorization: Bearer <token>` from `authStore.token`; response interceptor on 401 calls `authStore.handleUnauthorized()` then `router.push('/login')` (skip 401 intercept for `POST /api/auth/login` to allow login-page error handling)
- [x] T007 Configure Vue Router in `src/router/index.ts`: define `/login` route (no auth required, `meta.requiresAuth: false`) and `/agents` route (protected, `meta.requiresAuth: true`); set `/agents` as the authenticated home
- [x] T008 Add global `beforeEach` navigation guard in `src/router/index.ts`: if `meta.requiresAuth` and no token → redirect to `/login`; if route is `/login` and token exists → redirect to `/agents`
- [x] T009 Configure sidebar navigation entry in router meta / layout config: add "代理商管理 > 代理商列表" menu item pointing to `/agents` (vue-element-plus-admin generates sidebar from router `meta.title` and `meta.icon`)

**Checkpoint**: Foundation ready — routes exist, auth store initialises, Axios instance is available. User story implementation can begin.

---

## Phase 3: User Story 1 — 管理員登入 (Priority: P1) 🎯 MVP

**Goal**: Admin can log in with username + password; wrong credentials show an error; logout clears session; unauthenticated access to any protected route redirects to `/login`.

**Independent Test**: Open `http://localhost:5173/login`, enter valid credentials → redirected to `/agents`. Enter wrong credentials → error message shown, stays on login page. Enter correct credentials, click logout → redirected to `/login`.

- [x] T010 [US1] Create auth API module in `src/api/auth.ts`: export `login(data: LoginRequest): Promise<LoginResponse>` using the shared Axios instance from `src/utils/request.ts`, calling `POST /api/auth/login`
- [x] T011 [US1] Build login page in `src/pages/login/index.vue`: `el-form` with `username` and `password` `el-input` fields, login `el-button` with `:loading` state during request, `el-alert` (or `el-message`) for "帳號或密碼錯誤" error display; use `authStore` from `src/stores/auth.ts`
- [x] T012 [US1] Wire login form submission in `src/pages/login/index.vue`: call `authStore.login(username, password)` on submit; on success redirect to `/agents` via `router.push`; on 401 failure display error message; disable button during pending request to prevent double-submit

**Checkpoint**: User Story 1 fully functional — login, logout, redirect guards, and error handling all work independently.

---

## Phase 4: User Story 2 — 代理商列表瀏覽 (Priority: P2)

**Goal**: Authenticated admin can view the agent list with pagination, keyword + status filtering, column sorting, and inline status toggle. All data operations are server-side.

**Independent Test**: Log in, navigate to `/agents` → table loads with 20 agents per page. Type a name in the search bar + click search → table filters. Select "啟用" in status dropdown → filters by active agents. Click a column header → table re-sorts. Click the toggle button on a row → agent status updates in-place.

- [x] T013 [P] [US2] Create agents API module in `src/api/agents.ts`: export `getAgents(params: AgentListParams): Promise<PaginatedResponse<Agent>>` calling `GET /api/agents` with all query params; export `updateAgentStatus(id: string | number, status: 'active' | 'inactive'): Promise<{ id: string | number, status: string }>` calling `PATCH /api/agents/:id/status` — both use the shared Axios instance from `src/utils/request.ts`
- [x] T014 [US2] Create `agentStore` in `src/stores/agents.ts`: state (`list: Agent[]`, `total: number`, `loading: boolean`, `params: AgentQueryParams` with defaults `page=1, pageSize=20, name='', status='', sortField='createdAt', sortOrder='desc'`); action `fetchAgents()` calls `getAgents(params)`, updates state; action `updateParams(partial)` merges params and resets `page` to 1 when filter/sort changes; action `toggleStatus(id, currentStatus)` calls `updateAgentStatus`, on success updates matching row in `list` in-place, on failure shows `el-message` error
- [x] T015 [US2] Build agent list page skeleton in `src/pages/agents/index.vue`: `el-table` with columns for代理商 ID, 代理商名稱, 聯絡人, 聯絡電話, 狀態, 建立時間, 操作; bind `v-loading` to `agentStore.loading`; add `el-pagination` component bound to `agentStore.params.page`, `agentStore.params.pageSize`, and `agentStore.total`; call `agentStore.fetchAgents()` on `onMounted`
- [x] T016 [US2] Add search bar and status filter to `src/pages/agents/index.vue` above the table: `el-input` for name keyword bound to local `searchName` ref; `el-select` for status (options: 全部/啟用/停用) bound to local `searchStatus` ref; 搜尋 `el-button` that calls `agentStore.updateParams({ name: searchName, status: searchStatus })` then `agentStore.fetchAgents()`; clear/reset button restores defaults
- [x] T017 [US2] Implement column sorting in `src/pages/agents/index.vue`: add `sortable="custom"` to all sortable `el-table-column` elements; handle `@sort-change` event, map `{ prop, order }` to `agentStore.updateParams({ sortField: prop, sortOrder: order === 'ascending' ? 'asc' : 'desc' })` then `agentStore.fetchAgents()`
- [x] T018 [US2] Implement status toggle in 操作 column of `src/pages/agents/index.vue`: render `el-button` labelled "停用" (when active) or "啟用" (when inactive) with `:loading` bound to a per-row loading ref; on click call `agentStore.toggleStatus(row.id, row.status)`; button disabled during pending request (pessimistic — UI only updates after API success per D-006 in `research.md`)
- [x] T019 [US2] Add empty state and error handling to `src/pages/agents/index.vue`: use `el-table` empty slot to display "暫無資料" when `agentStore.list` is empty and not loading; in `agentStore.fetchAgents()` catch block show `el-message({ type: 'error', message: '載入失敗，請稍後再試' })`; also handle network timeout

**Checkpoint**: User Story 2 fully functional — list loads, pagination works, search/filter/sort all trigger server-side fetches, status toggle updates in-place, errors are handled gracefully.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validate integrated flows, clean up scaffold, confirm spec acceptance criteria are met.

- [x] T020 [P] Validate end-to-end auth flows: (1) unauthenticated visit to `/agents` → `/login`; (2) successful login → `/agents`; (3) visit `/login` while authenticated → `/agents`; (4) logout from topbar → `/login`; (5) direct URL to `/agents` after logout → `/login`
- [x] T021 [P] Validate 401 interceptor: simulate expired token (manually clear valid token and replace with invalid one in localStorage), navigate to `/agents` → Axios intercepts 401 → localStorage cleared → redirected to `/login`
- [x] T022 Run full `specs/001-agent-admin-portal/quickstart.md` validation: `pnpm dev` starts without errors; login → agent list loads within 2s (SC-002); search updates within 1s (SC-003); all backend errors show toast (SC-004); access control blocks unauthenticated routes (SC-005)
- [x] T023 [P] Code cleanup: remove unused vue-element-plus-admin demo components, mock data files, placeholder routes, and any template-generated pages not part of v1 scope

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user stories**
- **Phase 3 (US1 — Login)**: Depends on Phase 2 completion
- **Phase 4 (US2 — Agent List)**: Depends on Phase 2 completion; may start in parallel with Phase 3 after Phase 2
- **Phase 5 (Polish)**: Depends on Phases 3 and 4 completion

### User Story Dependencies

- **US1 (P1 — Login)**: No dependency on US2; independently testable after Phase 2
- **US2 (P2 — Agent List)**: No dependency on US1 for implementation; requires Phase 2 foundation; integration assumes login works (for auth token)

### Within Each Phase

- **Phase 2**: T004 first (types needed by stores); T005 before T006 (store needed by interceptor); T006 before T007/T008 (Axios instance needed by API modules); T007 before T008 (routes needed before guard); T009 last (depends on routes)
- **Phase 3**: T010 → T011 → T012 (API module → page scaffold → wiring)
- **Phase 4**: T013 [P with T014] → T014 → T015 → T016 → T017 → T018 → T019

### Parallel Opportunities

Within Phase 2: T004 can start alongside T005 (different files); T007 + T009 can proceed once T006 is done  
Within Phase 4: T013 (api module) and T014 (store) can be written in parallel  
Within Phase 5: T020, T021, T023 are independent and can run in parallel

---

## Parallel Example: Phase 4 (User Story 2)

```text
After T014 (agentStore) is complete:

Parallel group 1 — can launch together:
  T015: Build agent list page skeleton in src/pages/agents/index.vue
  (no other parallel at this step — T016–T019 all build on T015)

Sequential thereafter:
  T016 → T017 → T018 → T019 (all in same file, add features incrementally)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Login)
4. **STOP and VALIDATE**: Open browser, test login/logout/redirect flows
5. Demo if ready — a working login with route guards is a deployable increment

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Phase 3 → Login works → Demo (MVP)
3. Phase 4 → Agent list, filter, sort, status toggle → Demo
4. Phase 5 → Polish + validation → Production-ready v1

### Single Developer Order

T001 → T002/T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012 → **[MVP validation]** → T013 → T014 → T015 → T016 → T017 → T018 → T019 → **[US2 validation]** → T020 → T021 → T022 → T023

---

## Notes

- `[P]` = different files or independent concerns — safe to parallelize
- `[US1]` / `[US2]` = traceability to user story in spec.md
- No test tasks generated (not requested in spec; add `/speckit-tasks` with TDD flag for Vitest tasks)
- Commit after each phase checkpoint at minimum; commit after each task for fine-grained rollback
- vue-element-plus-admin generates sidebar entries from router `meta` — do not manage menu config separately
