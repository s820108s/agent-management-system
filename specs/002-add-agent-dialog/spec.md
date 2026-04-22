# Feature Specification: 新增代理商（開窗表單）

**Feature Branch**: `002-add-agent-dialog` **Created**: 2026-04-21 **Status**: Draft **Input**: prd/AddAgent.md

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 新增代理商 (Priority: P1)

登入後的管理員在代理商列表頁點擊「新增代理商」按鈕，系統彈出對話框，管理員填寫代理商名稱、聯絡人、聯絡電話後送出，系統建立新代理商並關閉對話框，列表自動刷新顯示新增的資料。

**Why this priority**: 新增代理商是代理商管理的核心 CRUD 操作，讓管理員能透過後台界面建立新代理商記錄，是業務擴展的基本需求。

**Independent Test**: 在代理商列表頁點擊「新增代理商」按鈕，對話框出現，填寫有效資料後送出，列表出現新增的代理商記錄，即視為功能完整可測試。

**Acceptance Scenarios**:

1. **Given** 管理員已登入並在代理商列表頁，**When** 點擊「新增代理商」按鈕，**Then** 系統彈出包含代理商名稱、聯絡人、聯絡電話欄位的對話框。
2. **Given** 對話框已開啟，**When** 填寫所有必填欄位並點擊「確認」，**Then** 系統呼叫新增 API、關閉對話框、刷新代理商列表，新增的代理商出現在列表中。
3. **Given** 對話框已開啟，**When** 未填寫必填欄位直接點擊「確認」，**Then** 系統在對應欄位下方顯示驗證錯誤訊息，不送出請求。
4. **Given** 對話框已開啟，**When** 點擊「取消」或右上角關閉按鈕，**Then** 對話框關閉，列表不刷新，已填寫內容不保留。
5. **Given** 管理員正在送出新增請求，**When** API 請求尚未完成，**Then** 確認按鈕進入 loading 狀態，防止重複送出。
6. **Given** 管理員送出新增請求，**When** API 回應錯誤，**Then** 系統顯示錯誤提示訊息，對話框保持開啟讓管理員修正。

---

### Edge Cases

- 代理商名稱已存在時，後端回傳錯誤，系統顯示「代理商名稱已存在」提示。
- 聯絡電話格式不符時，前端驗證即時提示格式錯誤，不等待 API 回應。
- 網路中斷時，系統顯示「網路異常，請稍後再試」，對話框保持開啟。
- 對話框已開啟時再次點擊「新增代理商」，不重複開啟第二個對話框。
- 對話框關閉後重新開啟，表單欄位應為空白初始狀態。

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 代理商列表頁 MUST 顯示「新增代理商」按鈕。
- **FR-002**: 點擊「新增代理商」MUST 開啟對話框（非跳頁），含三個必填欄位：代理商名稱、聯絡人、聯絡電話。
- **FR-003**: 系統 MUST 在送出前進行前端驗證，所有必填欄位不得為空；聯絡電話不得為空且需符合電話格式。
- **FR-004**: 驗證通過後 MUST 呼叫 `POST /api/agents`，請求主體含 `name`、`contactPerson`、`contactPhone`。
- **FR-005**: API 成功後 MUST 關閉對話框並重新載入列表（重置至第一頁）。
- **FR-006**: API 請求期間確認按鈕 MUST 進入 loading 狀態，請求完成後恢復。
- **FR-007**: API 回應錯誤時 MUST 顯示錯誤提示，對話框保持開啟。
- **FR-008**: 點擊「取消」或關閉按鈕 MUST 關閉對話框且不送出請求。
- **FR-009**: 對話框關閉後重新開啟時 MUST 清空所有表單欄位。

### Key Entities

- **CreateAgentRequest**: 新增操作輸入；`name`（必填）、`contactPerson`（必填）、`contactPhone`（必填）。
- **Agent**: 同第一期定義；新增後初始 `status` 為 `active`，`createdAt` 由後端產生。

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 管理員可在 60 秒內完成新增代理商操作（從點擊按鈕到列表顯示新資料）。
- **SC-002**: 表單驗證錯誤在點擊確認後 200ms 內出現，不需等待 API 回應。
- **SC-003**: 新增成功後列表刷新時間不超過 2 秒（API 回應後）。
- **SC-004**: 所有 API 錯誤皆有對應的使用者可見提示，無靜默失敗。
- **SC-005**: 確認按鈕在請求期間 100% 進入 loading 狀態，防止重複送出。

---

## Assumptions

- 後端將新增 `POST /api/agents` 端點：Body `{ name, contactPerson, contactPhone }`，成功回應 `{ id, name, contactPerson, contactPhone, status: 'active', createdAt }`。
- 新增代理商初始狀態固定為 `active`，不由前端指定。
- 聯絡電話前端驗證採寬鬆規則（非空且符合基本電話格式），精確驗證由後端負責。
- 本期不包含編輯與刪除代理商功能。
- 對話框為單層，不含多步驟或子對話框。
- 對話框關閉即丟棄未送出資料，無草稿儲存需求。
