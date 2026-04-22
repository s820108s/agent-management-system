# Tasks: 會員管理頁面

**Input**: Design documents from `specs/003-member-management/` **Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅

**Organization**: Tasks grouped by user story. Each phase is independently testable.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1 = 查看會員列表, US2 = 新增會員)

---

## Phase 1: Setup

> This phase is skipped — the project structure already exists. Proceed directly to Phase 2.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure that BOTH user stories depend on. Must complete before any story work begins.

**⚠️ CRITICAL**: US1 and US2 cannot be started until this phase is complete.

- [x] T001 Add `Member`, `CreateMemberRequest`, `MemberListParams`, `AgentOption` interfaces to `src/types/index.ts`
- [x] T002 [P] Create `mock/members/index.mock.ts` with handlers for `GET /api/members` (80 mock members with agentId 1–50, keyword + agentId filter), `POST /api/members` (validates required fields, returns 409 if email duplicate), and `GET /api/agents/all` (returns active agents as `{ id, name }[]`)

**Checkpoint**: Type definitions and mock data ready — US1 and US2 can now begin.

---

## Phase 3: User Story 1 - 查看會員列表 (Priority: P1) 🎯 MVP

**Goal**: 管理員可訪問 `/members` 列表頁，查看含代理商欄位的會員資料，支援分頁、關鍵字搜尋、代理商篩選。

**Independent Test**: 登入後訪問 `/#/members/list`，可看到含代理商欄位的會員資料表格（含分頁）且搜尋/篩選功能正常運作。

### Implementation for User Story 1

- [x] T003 [P] [US1] Create `src/api/members/index.ts` with `getMembers(params: MemberListParams)` calling `GET /api/members`
- [x] T004 [US1] Create `src/store/modules/members.ts` Pinia store (`useMemberStore`) with state (`list`, `total`, `loading`, `params`), actions `fetchMembers` and `updateParams` — mirrors `src/store/modules/agents.ts` pattern
- [x] T005 [US1] Create `src/views/Members/MemberList.vue` with `ElTable` (columns: 會員 ID、使用者名稱、Email、所屬代理商、狀態、建立時間、操作), keyword search input, agent filter `ElSelect`, `ElPagination`, and loading state — mirrors `src/views/Agents/AgentList.vue` pattern
- [x] T006 [US1] Add `/members` route entry to `asyncRouterMap` in `src/router/index.ts` with title `'會員管理'`, icon `'vi-ep:user-filled'`, and child route `list` pointing to `MemberList.vue`

**Checkpoint**: US1 complete — `/#/members/list` fully functional with pagination and filtering.

---

## Phase 4: User Story 2 - 新增會員 (Priority: P1)

**Goal**: 管理員點擊「新增會員」按鈕開啟 Dialog，選擇代理商並填寫資料後送出，列表自動刷新。

**Independent Test**: 點擊「新增會員」，Dialog 出現，代理商下拉選單顯示所有 active 代理商，填寫並送出後列表出現新記錄。

### Implementation for User Story 2

- [x] T007 [P] [US2] Add `createMember(data: CreateMemberRequest)` and `getAgentOptions()` functions to `src/api/members/index.ts` (extend existing file: `createMember` calls `POST /api/members`; `getAgentOptions` calls `GET /api/agents/all`)
- [x] T008 [US2] Add `createMember(data: CreateMemberRequest)` action and `agentOptions: AgentOption[]` + `agentOptionsLoading: boolean` state to `src/store/modules/members.ts`; add `fetchAgentOptions` action that calls `getAgentOptions()` API
- [x] T009 [US2] Create `src/views/Members/components/AddMemberDialog.vue` with `ElDialog`, `ElForm` containing username/email/password/agentId fields, `ElSelect` (bound to `agentOptions`, loads on `@open`), validation rules (email format, password ≥ 8 chars, all required), loading button state, and `handleClosed` to reset fields — mirrors `src/views/Agents/components/AddAgentDialog.vue` pattern
- [x] T010 [US2] Wire `AddMemberDialog` into `src/views/Members/MemberList.vue`: import component, add `dialogVisible` ref, add「新增會員」button, mount `<AddMemberDialog v-model:visible="dialogVisible" />`

**Checkpoint**: US2 complete — full add-member flow works end-to-end.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T011 [P] Verify sidebar navigation shows「會員管理 > 會員列表」entry after logging in
- [ ] T012 [P] Verify edge case: no active agents → agent dropdown shows「暫無可用代理商」and confirm button is disabled
- [ ] T013 Verify email duplicate error (409) displays「此 Email 已被使用」toast and dialog stays open

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately
- **US1 (Phase 3)**: Depends on Phase 2 completion (T001, T002)
- **US2 (Phase 4)**: Depends on Phase 3 completion (T003, T004, T005 must exist before extending them)
- **Polish (Phase 5)**: Depends on Phase 4 completion

### Within Each User Story

- T003 before T004 (store imports API types)
- T004 before T005 (view imports store)
- T005 before T006 (route imports view)
- T007 and T008 can run in parallel (different files)
- T007 + T008 before T009 (dialog uses store + API)
- T009 before T010 (list imports dialog)

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T003 can start in parallel with T002 (T003 only needs T001)
- T007 and T008 can run in parallel within Phase 4

---

## Parallel Example: Phase 2 (Foundational)

```text
Parallel launch:
  Task T001: Add interfaces to src/types/index.ts
  Task T002: Create mock/members/index.mock.ts
```

## Parallel Example: Phase 4 (US2)

```text
Parallel launch (after Phase 3 complete):
  Task T007: Add createMember + getAgentOptions to src/api/members/index.ts
  Task T008: Add createMember action + agentOptions state to src/store/modules/members.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001, T002)
2. Complete Phase 3: US1 (T003 → T004 → T005 → T006)
3. **STOP and VALIDATE**: Browse `/#/members/list` — table, pagination, search, agent filter all work
4. Demo if ready, then continue to Phase 4

### Incremental Delivery

1. Phase 2 → Foundation ready
2. Phase 3 → List page live (MVP)
3. Phase 4 → Add dialog live (full feature)
4. Phase 5 → Polish and edge-case verification

---

## Notes

- All new files mirror the Agents module pattern (`src/api/agents/index.ts`, `src/store/modules/agents.ts`, `src/views/Agents/`) — use them as reference
- Mock files are auto-discovered: any `*.mock.ts` not starting with `_` in `mock/` is automatically registered
- `admin` account restriction is enforced by the existing route guard (`asyncRouterMap`); no additional access-control code is needed
- `agentOptions` loading happens on Dialog `@open` event, not on page mount
