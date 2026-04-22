# Research: 會員管理頁面

**Feature**: `003-member-management` **Date**: 2026-04-22

---

## Decision 1: 架構模式

**Decision**: 完全沿用現有 Agents 模組的四層模式（View → Store → API → Mock）。

**Rationale**: AgentList + AddAgentDialog 已驗證此模式可行，且可保持程式碼一致性。新增 MemberList + AddMemberDialog，結構對稱。

**Alternatives considered**: 使用通用 CRUD composable 抽象層——此次不採用，因只有一個新模組，過早抽象增加複雜度；若未來出現第三個列表模組可再評估。

---

## Decision 2: 代理商下拉選單資料來源

**Decision**: 新增 `GET /api/agents/all` 端點，回傳所有 `active` 代理商的 `{ id, name }` 清單（不分頁）。

**Rationale**: 下拉選單需要一次取得全部選項，現有 `GET /api/agents` 分頁介面不適合直接複用。另開 `/all` 端點語意清晰，且 mock 層也易於實作。

**Alternatives considered**: 複用現有 `GET /api/agents` 並傳 `pageSize=9999`——不採用，語意不明確且未來若資料量大效能不佳。

---

## Decision 3: 代理商下拉選單載入時機

**Decision**: 在 AddMemberDialog **開啟時（`@open` 事件）** 呼叫 API 載入代理商清單，不在頁面 mount 時預載。

**Rationale**: 代理商列表可能隨時新增/停用，在 Dialog 開啟時載入可確保資料最新。避免頁面 mount 時不必要的 API 呼叫（使用者可能不開 Dialog）。

**Alternatives considered**: 頁面 mount 時預載——不採用，浪費請求且可能顯示過期資料。

---

## Decision 4: 會員狀態初始值

**Decision**: 新增會員時初始 `status` 固定為 `'active'`，由 mock / 後端決定，前端不傳遞此欄位。

**Rationale**: Spec FR-008 與 Assumptions 已明確規定，與 Agent 模組的設計一致。

---

## Decision 5: 型別定義位置

**Decision**: 所有新 interface（`Member`, `MemberListParams`, `CreateMemberRequest`, `AgentOption`）統一加入 `src/types/index.ts`。

**Rationale**: 現有型別全部集中在此檔案，保持一致性。未來若型別過多可再拆分為 `src/types/member.ts` 等。

---

## Decision 6: Mock 資料策略

**Decision**: 在 `mock/members/index.mock.ts` 中以 mockjs 產生 80 筆假會員資料，關聯至現有 `allAgents` 的 id（1–50），支援關鍵字搜尋與代理商篩選。

**Rationale**: 與 Agents mock 模式一致，80 筆足以測試分頁（預設 20 筆/頁）。

---

## No NEEDS CLARIFICATION items

所有設計決策已依現有程式碼模式解決，無需額外確認。
