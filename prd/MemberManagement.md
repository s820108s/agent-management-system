# Feature Specification: 會員管理頁面

**Feature Branch**: `003-member-management`  
**Created**: 2026-04-22  
**Status**: Draft  
**Input**: User description: "新增會員管理頁面，一個會員會有所屬的代理商，admin 這個帳號不參與任何會員相關的事項，只用來管理。"

---

## 背景與角色說明

本系統存在兩種使用者類型：

- **admin（系統管理員）**: 唯一的超級管理員帳號，可管理代理商與查看所有會員資料，但本身不屬於任何代理商，也不代表任何業務關係。admin 帳號的職責是系統層級的維護，不參與會員的歸屬或業務運作。
- **代理商（Agent）**: 業務實體，每位會員必須歸屬於某一個代理商。

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 查看會員列表 (Priority: P1)

登入後的管理員（admin）可在會員管理頁中查看所有會員資料，每筆會員資料顯示其所屬代理商，支援分頁與條件搜尋。

**Why this priority**: 會員列表是會員管理的基礎視圖，後續新增、編輯操作皆以此為起點。

**Independent Test**: 登入後訪問 `/members`，可看到含代理商欄位的會員資料表格（含分頁），即視為可獨立測試的功能切片。

**Acceptance Scenarios**:

1. **Given** admin 已登入，**When** 訪問 `/members`，**Then** 頁面顯示會員資料表格，欄位包含：會員 ID、使用者名稱、Email、所屬代理商、狀態、建立時間、操作。
2. **Given** 會員列表頁，**When** 系統載入資料，**Then** 資料依建立時間降冪排列，每頁預設顯示 20 筆。
3. **Given** 會員列表頁，**When** 管理員在搜尋列輸入會員名稱或 Email 並點擊搜尋，**Then** 表格僅顯示符合關鍵字的會員，分頁重置至第一頁。
4. **Given** 會員列表頁，**When** 管理員從代理商下拉選單選擇特定代理商，**Then** 表格僅顯示屬於該代理商的會員。
5. **Given** 會員列表有多頁資料，**When** 管理員切換頁碼，**Then** 表格載入對應頁的資料並顯示總筆數。
6. **Given** 資料載入中，**When** API 請求尚未完成，**Then** 表格顯示 loading 狀態。

---

### User Story 2 - 新增會員 (Priority: P1)

管理員點擊「新增會員」按鈕，系統彈出對話框，填寫會員資料（含選擇所屬代理商）後送出，系統建立新會員並刷新列表。

**Why this priority**: 新增會員是會員管理的核心 CRUD 操作，且需明確指定所屬代理商，確保資料歸屬正確。

**Independent Test**: 點擊「新增會員」，填寫資料並選擇代理商後送出，列表出現新會員記錄，即視為功能完整可測試。

**Acceptance Scenarios**:

1. **Given** 管理員在會員列表頁，**When** 點擊「新增會員」按鈕，**Then** 系統彈出對話框，包含：使用者名稱、Email、密碼、所屬代理商（下拉選單）欄位。
2. **Given** 對話框已開啟，**When** 所屬代理商下拉選單展開，**Then** 列出所有狀態為 `active` 的代理商供選擇。
3. **Given** 對話框已開啟，**When** 填寫所有必填欄位並選擇代理商後點擊「確認」，**Then** 系統呼叫新增 API、關閉對話框、刷新會員列表。
4. **Given** 對話框已開啟，**When** 未填寫必填欄位或未選擇代理商直接點擊「確認」，**Then** 顯示對應欄位的驗證錯誤，不送出請求。
5. **Given** 管理員正在送出請求，**When** API 請求尚未完成，**Then** 確認按鈕進入 loading 狀態，防止重複送出。
6. **Given** 管理員送出請求，**When** API 回應錯誤（如 Email 重複），**Then** 顯示錯誤提示，對話框保持開啟。
7. **Given** 對話框已開啟，**When** 點擊「取消」或關閉按鈕，**Then** 對話框關閉，列表不刷新，已填寫內容不保留。

---

### Edge Cases

- 系統中尚無任何代理商時，新增會員對話框的代理商下拉選單顯示「暫無可用代理商」提示，確認按鈕不可點擊。
- Email 格式不符時，前端即時驗證提示格式錯誤，不等待 API。
- Email 已存在時，後端回傳 422/409，系統顯示「此 Email 已被使用」提示。
- 代理商列表 API 載入失敗時，下拉選單顯示錯誤提示，並提供重試機制。
- 搜尋欄輸入空字串並點擊搜尋時，系統重置篩選並載入完整列表。
- admin 帳號本身不出現在「所屬代理商」的選項中，也不可作為會員的代理商。

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 系統 MUST 提供 `/members` 會員管理頁面，列表欄位包含：會員 ID、使用者名稱、Email、所屬代理商名稱、狀態、建立時間、操作。
- **FR-002**: 會員列表 MUST 支援伺服器端分頁，透過 API 傳遞 `page` 與 `pageSize` 參數。
- **FR-003**: 會員列表 MUST 支援依使用者名稱或 Email 進行關鍵字搜尋（伺服器端過濾）。
- **FR-004**: 會員列表 MUST 支援依所屬代理商進行篩選（下拉選單，伺服器端過濾）。
- **FR-005**: 系統 MUST 在會員列表頁提供「新增會員」按鈕，點擊後開啟對話框（非跳頁）。
- **FR-006**: 新增會員對話框 MUST 包含以下欄位：
  - 使用者名稱（必填，文字輸入）
  - Email（必填，需符合 Email 格式）
  - 密碼（必填，至少 8 個字元）
  - 所屬代理商（必填，下拉選單，僅列出 `active` 的代理商）
- **FR-007**: 系統 MUST 在送出前進行前端表單驗證，所有必填欄位不得為空。
- **FR-008**: 系統 MUST 在驗證通過後呼叫新增 API（`POST /api/members`），請求主體包含 `username`、`email`、`password`、`agentId`。
- **FR-009**: API 成功回應後，系統 MUST 關閉對話框並重新載入會員列表（刷新至第一頁）。
- **FR-010**: API 請求期間確認按鈕 MUST 進入 loading 狀態，請求完成後恢復。
- **FR-011**: API 回應錯誤時，系統 MUST 顯示對應錯誤提示，對話框保持開啟。
- **FR-012**: 側邊欄導覽選單 MUST 新增「會員管理 > 會員列表」選項。
- **FR-013**: admin 帳號 MUST 可存取 `/members` 頁面，且為唯一有權操作此頁面的角色（本期不涉及其他角色）。

### Key Entities

- **會員 (Member)**: 系統管理的業務實體；屬性：`id`（唯一識別碼）、`username`（使用者名稱）、`email`（電子郵件）、`agentId`（所屬代理商 ID，必填，不得為 null）、`agentName`（所屬代理商名稱，由後端 join 提供）、`status`（`active` / `inactive`）、`createdAt`（建立時間）。
- **新增會員請求 (CreateMemberRequest)**: 新增操作的輸入資料；屬性：`username`、`email`、`password`、`agentId`。
- **代理商 (Agent)**: 同第一期 PRD 定義；`agentId` 為會員的必要外鍵，admin 帳號不作為代理商使用。

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 管理員可在 60 秒內完成新增會員操作（從點擊按鈕到列表顯示新資料）。
- **SC-002**: 表單驗證錯誤在點擊確認後 200ms 內顯示，不需等待 API 回應。
- **SC-003**: 新增成功後列表刷新時間不超過 2 秒（API 回應後）。
- **SC-004**: 所有 API 錯誤（4xx、5xx、網路斷線）皆有對應的使用者可見提示，不出現靜默失敗。
- **SC-005**: 確認按鈕在請求期間 100% 進入 loading 狀態，防止重複送出。
- **SC-006**: 代理商篩選下拉選單在開啟時 1 秒內完成載入（排除網路延遲）。

---

## Assumptions

- 後端 API 將新增以下端點：
  - `GET /api/members?page=1&pageSize=20&keyword=&agentId=` — 取得會員列表，回應: `{ data: Member[], total: number }`
  - `POST /api/members` — 新增會員，Body: `{ username, email, password, agentId }`，成功回應: `{ id, username, email, agentId, agentName, status: 'active', createdAt }`
  - `GET /api/agents/all` — 取得所有 active 代理商（供下拉選單使用，不分頁），回應: `{ data: { id, name }[] }`
- 新增會員的初始狀態固定為 `active`，不由前端指定。
- admin 帳號不屬於任何代理商，`agentId` 不得設為 admin。
- 本期不包含編輯會員與停用/刪除會員功能。
- 本期不涉及代理商端登入或代理商自行管理會員的場景（僅 admin 操作）。
- 密碼由前端傳送，後端負責加密儲存，前端不儲存或顯示密碼明文。
- 不需要草稿儲存功能，對話框關閉即丟棄未送出的資料。
