# 代理商管理後台系統

基於 Vue 3 + Element Plus 的後台管理系統，提供代理商管理與會員管理功能。

## 技術棧

| 技術         | 版本   | 用途      |
| ------------ | ------ | --------- |
| Vue 3        | 3.5.13 | 前端框架  |
| TypeScript   | 5.7.3  | 型別系統  |
| Element Plus | 2.9.2  | UI 元件庫 |
| Pinia        | 2.3.0  | 狀態管理  |
| Vue Router   | 4.5    | 路由管理  |
| Axios        | 1.7.9  | HTTP 請求 |
| Vite         | 6.0.7  | 建置工具  |
| pnpm         | 9.15.3 | 套件管理  |

## 功能

### 登入

- 帳號密碼登入，取得 JWT Token
- 路由守衛：未登入自動導向登入頁
- 登出清除 Token

### 代理商管理（`/agents`）

- 代理商列表：分頁、名稱搜尋、狀態篩選、欄位排序
- 新增代理商：Dialog 表單（名稱、聯絡人、聯絡電話）
- 啟用 / 停用代理商

### 會員管理（`/members`）

- 會員列表：分頁、關鍵字搜尋（使用者名稱 / Email）、代理商篩選
- 新增會員：Dialog 表單（使用者名稱、Email、密碼、所屬代理商）
- 每位會員必須歸屬於一個代理商

## 快速開始

**環境需求**：Node.js ≥ 18、pnpm ≥ 8

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器（含 Mock API）
pnpm dev
```

開啟瀏覽器訪問 `http://localhost:4000`

**預設帳號**

| 帳號  | 密碼                        |
| ----- | --------------------------- |
| admin | 任意密碼（Mock 環境不驗證） |

## 常用指令

```bash
pnpm dev          # 開發模式（Mock API）
pnpm build:pro    # 正式環境建置
pnpm ts:check     # TypeScript 型別檢查
pnpm lint:eslint  # ESLint 檢查並修復
pnpm lint:format  # Prettier 格式化
```

## 專案結構

```
src/
├── api/              # API 請求層
│   ├── agents/       # 代理商相關 API
│   ├── login/        # 登入 API
│   └── members/      # 會員相關 API
├── store/
│   └── modules/      # Pinia Stores（agents, members, user…）
├── views/
│   ├── Agents/       # 代理商列表與新增 Dialog
│   ├── Login/        # 登入頁
│   └── Members/      # 會員列表與新增 Dialog
├── router/           # 路由設定（含 Navigation Guard）
└── types/            # 全域 TypeScript 介面定義

mock/
├── auth/             # 登入 Mock
├── agents/           # 代理商 Mock
└── members/          # 會員 Mock
```

## 角色說明

- **admin**：系統唯一管理員，可管理代理商與會員，本身不屬於任何代理商
- **代理商（Agent）**：業務實體，每位會員必須歸屬於一個啟用中的代理商
- **會員（Member）**：歸屬於某代理商的業務用戶

## Mock API

開發環境由 `vite-plugin-mock` 自動攔截，無需啟動後端。

| 端點                     | 方法  | 說明                             |
| ------------------------ | ----- | -------------------------------- |
| `/api/auth/login`        | POST  | 登入                             |
| `/api/agents`            | GET   | 代理商列表（分頁 + 篩選）        |
| `/api/agents`            | POST  | 新增代理商                       |
| `/api/agents/:id/status` | PATCH | 切換代理商狀態                   |
| `/api/agents/all`        | GET   | 取得所有啟用代理商（下拉選單用） |
| `/api/members`           | GET   | 會員列表（分頁 + 篩選）          |
| `/api/members`           | POST  | 新增會員                         |
