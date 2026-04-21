# Feature Specification: 代理商管理後台系統

**Feature Branch**: `001-agent-management-system`  
**Created**: 2026-04-21  
**Status**: Draft  
**Input**: User description: "代理商管理後台系統，使用 Element Plus Admin 框架，包含登入功能與代理商列表頁面"

## 技術棧

- **前端框架**: Vue 3 + TypeScript
- **UI 元件庫**: Element Plus
- **後台模板**: [Element Plus Admin](https://element-plus-admin-doc.cn/) — 提供路由、權限、佈局、表格等開箱即用的後台能力
- **狀態管理**: Pinia
- **HTTP 請求**: Axios
- **建置工具**: Vite

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 管理員登入 (Priority: P1)

管理員在瀏覽器開啟後台，看到登入頁面，輸入帳號密碼後成功進入後台首頁。若帳密錯誤，系統顯示錯誤提示並保持在登入頁。

**Why this priority**: 所有後台功能皆需登入後才可存取，登入是整個系統的入口，必須最先完成。

**Independent Test**: 開啟 `/login`，輸入正確帳號密碼後被導向 `/dashboard` 或首頁，即視為可測試的 MVP。

**Acceptance Scenarios**:

1. **Given** 使用者未登入並訪問 `/login`，**When** 輸入正確的帳號與密碼並點擊登入，**Then** 系統驗證成功並將使用者導向後台主頁（如 `/dashboard`）。
2. **Given** 使用者在登入頁，**When** 輸入錯誤的帳號或密碼，**Then** 系統顯示「帳號或密碼錯誤」的 Element Plus Alert/Message 提示，並保持在登入頁。
3. **Given** 使用者已登入，**When** 直接訪問 `/login`，**Then** 系統自動導向後台主頁，不再顯示登入頁。
4. **Given** 使用者已登入，**When** 點擊登出，**Then** 清除 Token、跳回登入頁。
5. **Given** 使用者未登入，**When** 直接訪問任意後台路由（如 `/agents`），**Then** 系統自動導向 `/login`。

---

### User Story 2 - 代理商列表瀏覽 (Priority: P2)

登入後的管理員可以在代理商列表頁中查看所有代理商資料，支援分頁顯示，並可依條件搜尋。

**Why this priority**: 代理商列表是系統的核心業務頁面，是後續所有代理商管理功能（新增、編輯、停用）的基礎。

**Independent Test**: 登入後訪問 `/agents`，可看到代理商資料表格（含分頁），即視為可獨立測試的功能切片。

**Acceptance Scenarios**:

1. **Given** 管理員已登入，**When** 訪問代理商列表頁 `/agents`，**Then** 頁面顯示代理商資料表格，欄位包含：代理商 ID、代理商名稱、聯絡人、聯絡電話、狀態、建立時間、操作。
2. **Given** 代理商列表頁，**When** 系統載入資料，**Then** 顯示 Element Plus Table 元件，資料依建立時間降冪排列，每頁預設顯示 20 筆。
3. **Given** 代理商列表頁，**When** 管理員在搜尋列輸入代理商名稱並點擊搜尋，**Then** 表格僅顯示名稱符合關鍵字的代理商，分頁重置至第一頁。
4. **Given** 代理商列表有多頁資料，**When** 管理員點擊分頁元件切換頁碼，**Then** 表格載入對應頁的資料，並顯示總筆數。
5. **Given** 代理商列表資料載入中，**When** API 請求尚未完成，**Then** 表格顯示 loading 狀態（Element Plus Table loading 遮罩）。

---

### Edge Cases

- 當 API 請求逾時或失敗時，系統顯示錯誤 Message 提示，而非白頁或靜默失敗。
- 當代理商列表無資料時，Table 顯示 Element Plus 的空狀態（Empty）提示文字「暫無資料」。
- 當 Token 過期時，API 回應 401，系統自動清除 Token 並導向登入頁。
- 當使用者在搜尋欄輸入空字串並點擊搜尋時，系統重置並載入完整列表。
- 登入表單送出時防止重複點擊（按鈕在請求期間進入 loading 狀態）。

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系統 MUST 提供 `/login` 登入頁面，包含帳號（Email 或帳號）與密碼輸入欄位及登入按鈕。
- **FR-002**: 系統 MUST 在登入成功後將 JWT Token 存入 `localStorage` 或 `sessionStorage`，並導向後台主頁。
- **FR-003**: 系統 MUST 在所有需要驗證的路由上加上前置守衛（Navigation Guard），未登入者導向 `/login`。
- **FR-004**: 系統 MUST 提供 `/agents` 代理商列表頁，使用 Element Plus Table 展示代理商資料。
- **FR-005**: 代理商列表 MUST 支援伺服器端分頁，透過 API 傳遞 `page` 與 `pageSize` 參數。
- **FR-006**: 代理商列表 MUST 支援依代理商名稱進行關鍵字搜尋（伺服器端過濾）。
- **FR-007**: 系統 MUST 在 API 請求期間顯示 loading 狀態，在失敗時顯示 Element Plus Message 錯誤提示。
- **FR-008**: 系統 MUST 提供側邊欄導覽選單，包含「代理商管理 > 代理商列表」選項。
- **FR-009**: 系統 MUST 在頂部工具列提供登出功能，點擊後清除 Token 並導向 `/login`。

### Key Entities

- **管理員 (Admin)**: 後台操作使用者，擁有帳號與密碼，登入後取得 JWT Token；屬性：`id`、`username`、`email`、`token`。
- **代理商 (Agent)**: 系統管理的核心業務實體；屬性：`id`（唯一識別碼）、`name`（代理商名稱）、`contactPerson`（聯絡人）、`contactPhone`（聯絡電話）、`status`（`active` / `inactive`）、`createdAt`（建立時間）。
- **分頁回應 (Paginated Response)**: API 回應結構；屬性：`data`（列表陣列）、`total`（總筆數）、`page`（當前頁）、`pageSize`（每頁筆數）。

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 管理員可在 30 秒內完成登入並進入代理商列表頁。
- **SC-002**: 代理商列表頁初次載入時間（API 回應後渲染完成）不超過 2 秒。
- **SC-003**: 搜尋功能可在使用者點擊搜尋後 1 秒內更新表格結果（排除網路延遲）。
- **SC-004**: 所有 API 錯誤（4xx、5xx、網路斷線）皆有對應的使用者可見提示，不出現無法操作的空白狀態。
- **SC-005**: 未登入的使用者無法直接訪問任何後台路由（路由守衛 100% 覆蓋受保護路由）。

---

## Assumptions

- 後端 API 已存在或將同步開發，前端依照以下 API 契約對接：
  - `POST /api/auth/login` — 登入，Body: `{ username, password }`，回應: `{ token, user }`
  - `GET /api/agents?page=1&pageSize=20&name=keyword` — 取得代理商列表，回應: `{ data: Agent[], total: number }`
- 本階段（v1）僅實作「登入」與「代理商列表」兩個功能，不包含新增、編輯、刪除代理商。
- 使用 Element Plus Admin 提供的預設佈局（側邊欄 + 頂部導覽列），不進行深度客製化。
- 僅支援桌面瀏覽器（Chrome、Edge 最新版），不要求 RWD 響應式設計。
- 代理商資料量預估在 10,000 筆以內，分頁足以處理效能需求，無需虛擬滾動。
- 登入採用帳號密碼驗證，不涉及 SSO、OAuth 或雙因素認證（2FA）。
