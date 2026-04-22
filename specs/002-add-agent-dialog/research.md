# Research: 新增代理商（開窗表單）

**Date**: 2026-04-21 **Feature**: specs/002-add-agent-dialog/spec.md

---

## D-001: Dialog 元件策略 — 獨立元件 vs 內嵌於 AgentList

**Decision**: 建立獨立元件 `src/views/Agents/components/AddAgentDialog.vue`

**Rationale**: AgentList.vue 已包含表格、搜尋列、分頁、排序等邏輯，再內嵌 Dialog + Form 會使單一檔案過長。獨立元件可獨立測試（若日後加入測試）、易於複用（未來編輯 Dialog 可沿用相同結構）。

**Alternatives considered**:

- 內嵌於 AgentList.vue：簡單但使檔案職責過重
- 使用 Teleport + composable：過度設計，當前僅一個 Dialog

**Interface**: `AddAgentDialog` 透過 `v-model:visible` 接收開關狀態，emit `success` 事件通知父元件刷新列表。

---

## D-002: 表單驗證策略 — el-form :rules

**Decision**: 使用 Element Plus `el-form` 的 `:rules` prop 搭配 `FormInstance.validate()` 方法

**Rationale**: 專案既有 LoginForm.vue 已採用相同模式（`el-form` + `el-form-item` + rules），保持一致性。無需引入額外驗證庫。

**Validation rules**:

- `name`：required，非空
- `contactPerson`：required，非空
- `contactPhone`：required，非空，regex 基本電話格式（`/^[0-9+\-\s()]{7,20}$/`）

---

## D-003: Store 整合 — 在 agentStore 新增 createAgent action

**Decision**: 在 `src/store/modules/agents.ts` 新增 `createAgent(data: CreateAgentRequest)` action

**Rationale**: 與既有 `fetchAgents`、`toggleStatus` 同置於 agentStore，保持資料操作集中。成功後直接呼叫 `updateParams({ page: 1 })` + `fetchAgents()` 重置列表。

**Alternatives considered**:

- 在元件內直接呼叫 API：繞過 store，破壞既有架構一致性

---

## D-004: Mock 擴充 — POST /api/agents

**Decision**: 在 `mock/agents/index.mock.ts` 新增 `POST /api/agents` 的 `rawResponse` handler

**Rationale**: 與既有 PATCH mock 相同模式（rawResponse，因需讀取 body 並控制 status code）。自動產生 id（`allAgents.length + 1`）、設定 `status: 'active'`、`createdAt` 為當前時間。

---

## D-005: Dialog 關閉後重置表單

**Decision**: 監聽 `el-dialog` 的 `@closed` 事件（動畫結束後），呼叫 `formRef.resetFields()`

**Rationale**: 使用 `@close` 時動畫未結束即重置，畫面會閃爍。`@closed` 在關閉動畫完成後才重置，使用者體驗較佳。

---

## D-006: 新增成功後的列表刷新策略

**Decision**: 關閉 Dialog → emit `success` → AgentList 呼叫 `agentStore.updateParams({ page: 1 })` + `agentStore.fetchAgents()`

**Rationale**: 重置至第一頁確保新增的資料（依 createdAt 降冪）出現在列表最前面，符合使用者預期。
