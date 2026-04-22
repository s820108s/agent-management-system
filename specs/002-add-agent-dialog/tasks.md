# Tasks: 新增代理商（開窗表單）

**Input**: Design documents from `specs/002-add-agent-dialog/` **Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/)

**Tests**: Not included (not requested in feature specification).

**Organization**: 本功能僅有一個 User Story，分為：Setup（型別）、Foundational（API + Store）、US1（UI 元件 + 整合）、Polish。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to ([US1])
- Exact file paths included in every description

---

## Phase 1: Setup

**Purpose**: 在既有型別定義中新增 CreateAgentRequest 介面。

- [x] T001 在 `src/types/index.ts` 新增 `CreateAgentRequest` interface：`{ name: string; contactPerson: string; contactPhone: string }`

**Checkpoint**: `pnpm ts:check` 無型別錯誤。

---

## Phase 2: Foundational（Blocking Prerequisites）

**Purpose**: API 函式與 Store action，後續 UI 元件均依賴此層。

⚠️ **CRITICAL**: T002 與 T003 可並行；T003 需在 T004 之前完成。

- [x] T002 [P] 在 `src/api/agents/index.ts` 新增 `createAgent(data: CreateAgentRequest): Promise<Agent>` — 呼叫 `POST /api/agents`，使用 shared Axios instance
- [x] T003 [P] 在 `mock/agents/index.mock.ts` 新增 `POST /api/agents` rawResponse handler：讀取 body，產生新代理商（自動遞增 id、status: 'active'、createdAt 為當前時間），回傳 201
- [x] T004 在 `src/store/modules/agents.ts` 新增 `createAgent(data: CreateAgentRequest)` action：呼叫 `createAgent` API；成功後呼叫 `updateParams({ page: 1 })` + `fetchAgents()`；失敗顯示 `el-message` 錯誤訊息

**Checkpoint**: API 函式、mock handler、store action 均就緒，`pnpm ts:check` 無錯誤。

---

## Phase 3: User Story 1 — 新增代理商 (Priority: P1) 🎯 MVP

**Goal**: 管理員可在代理商列表頁點擊「新增代理商」開啟 Dialog，填寫並送出表單後，新代理商出現在列表第一頁。

**Independent Test**: 啟動 `pnpm dev`，登入後至 `/agents/list`，點擊「新增代理商」→ Dialog 出現；填寫有效資料送出 → Dialog 關閉，列表顯示新資料；空白欄位送出 → 顯示驗證錯誤；取消 → Dialog 關閉且資料不保留。

- [x] T005 [US1] 建立 `src/views/Agents/components/AddAgentDialog.vue`：`el-dialog` 包含 `el-form`（ref="formRef"），三個 `el-form-item`（name、contactPerson、contactPhone），底部「取消」與「確認」按鈕；透過 `defineProps<{ visible: boolean }>()` + `defineEmits(['update:visible', 'success'])` 控制開關
- [x] T006 [US1] 在 `AddAgentDialog.vue` 實作表單驗證規則：name required「請輸入代理商名稱」；contactPerson required「請輸入聯絡人」；contactPhone required + regex `/^[0-9+\-\s()]{7,20}$/`「請輸入有效的聯絡電話」
- [x] T007 [US1] 在 `AddAgentDialog.vue` 實作送出邏輯：呼叫 `formRef.validate()`；驗證通過後呼叫 `agentStore.createAgent(form)`；`submitting` ref 控制確認按鈕 `:loading`；成功後 emit `update:visible(false)` + emit `success`；失敗保持 Dialog 開啟（錯誤由 store 顯示）
- [x] T008 [US1] 在 `AddAgentDialog.vue` 實作關閉重置：監聽 `el-dialog` 的 `@closed` 事件，呼叫 `formRef.resetFields()` 清空所有欄位
- [x] T009 [US1] 在 `src/views/Agents/AgentList.vue` 整合 Dialog：import `AddAgentDialog`；新增 `dialogVisible` ref（初始 false）；在搜尋列右側新增「新增代理商」`el-button`（type="primary"）；`v-model:visible="dialogVisible"` + `@success="handleCreateSuccess"`；`handleCreateSuccess` 觸發列表刷新（agentStore 的 createAgent action 已在 store 層處理刷新，此處僅需確保 Dialog 關閉）

**Checkpoint**: User Story 1 完整可用 — Dialog 開關、表單驗證、送出、錯誤處理、列表刷新均正常。

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: 驗證整合流程、確認 spec 驗收條件均達成。

- [ ] T010 [P] 驗證正常流程（FR-001 ~ FR-005）：點擊按鈕 → Dialog 開啟；填寫有效資料送出 → 201 → Dialog 關閉 → 列表第一頁出現新資料
- [ ] T011 [P] 驗證驗證錯誤（FR-003）：空白送出顯示三個欄位錯誤；電話格式錯誤顯示格式提示
- [ ] T012 [P] 驗證邊界情境：取消關閉不刷新列表；重開 Dialog 欄位為空；確認按鈕 loading 狀態防重複送出
- [ ] T013 [P] TypeScript 型別檢查：執行 `pnpm ts:check`，確認無型別錯誤

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 無依賴 — 立即開始
- **Phase 2 (Foundational)**: 依賴 Phase 1 — 阻塞後續所有任務
- **Phase 3 (US1)**: 依賴 Phase 2 完成
- **Phase 4 (Polish)**: 依賴 Phase 3 完成

### Within Each Phase

- **Phase 2**: T002 + T003 可並行（不同檔案）；T004 需等 T002 完成（需 import createAgent API）
- **Phase 3**: T005 → T006 → T007 → T008（同一元件，逐步累加）；T009 需等 T005-T008 完成
- **Phase 4**: T010、T011、T012、T013 全部可並行

### Parallel Opportunities

```text
Phase 2:
  Parallel group:  T002 (api/agents/index.ts) + T003 (mock handler)
  Sequential after: T004 (store，import T002)

Phase 3:
  Sequential: T005 → T006 → T007 → T008 → T009

Phase 4:
  Parallel: T010 + T011 + T012 + T013
```

---

## Implementation Strategy

### Single Developer Order

T001 → T002/T003（並行）→ T004 → T005 → T006 → T007 → T008 → T009 → **[MVP 驗證]** → T010/T011/T012/T013（並行）

### MVP Scope

完成 T001–T009 即為可 Demo 的 MVP：新增按鈕出現、Dialog 可用、驗證有效、列表刷新正確。

---

## Notes

- `[P]` = 不同檔案或獨立關注點，可安全並行
- `[US1]` = 可追溯至 spec.md 的 User Story 1
- 無測試任務（spec 未要求；如需加入 Vitest 測試，使用 TDD flag 重新產生）
- 每個 Phase Checkpoint 後至少 commit 一次以便回滾
