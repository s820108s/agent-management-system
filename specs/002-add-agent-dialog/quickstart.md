# Quickstart: 新增代理商（開窗表單）

**Date**: 2026-04-21

## Prerequisites

- 功能一（代理商列表）已完成並可正常執行
- `pnpm dev` 可啟動開發伺服器（port 4000）
- Mock 模式已啟用（`VITE_USE_MOCK=true`）

## Development

```bash
pnpm dev
# → http://localhost:4000
```

## Key Entry Points

| Path                                             | Purpose                                      |
| ------------------------------------------------ | -------------------------------------------- |
| `src/views/Agents/AgentList.vue`                 | 列表頁：新增「新增代理商」按鈕 + 引入 Dialog |
| `src/views/Agents/components/AddAgentDialog.vue` | 新增：Dialog + Form 元件                     |
| `src/api/agents/index.ts`                        | 新增 `createAgent()` API 函式                |
| `src/store/modules/agents.ts`                    | 新增 `createAgent` action                    |
| `src/types/index.ts`                             | 新增 `CreateAgentRequest` interface          |
| `mock/agents/index.mock.ts`                      | 新增 `POST /api/agents` mock handler         |

## Manual Test Scenarios

### 正常流程

1. 登入（admin / admin）
2. 訪問代理商列表 `/agents/list`
3. 點擊「新增代理商」按鈕 → Dialog 開啟
4. 填寫：名稱「測試代理商」、聯絡人「測試員」、電話「0912345678」
5. 點擊「確認」→ Dialog 關閉，列表刷新，新資料出現在第一頁

### 驗證錯誤

1. 開啟 Dialog，不填任何欄位
2. 點擊「確認」→ 三個欄位下方顯示紅色錯誤訊息，不呼叫 API

### 取消操作

1. 開啟 Dialog，填寫部分資料
2. 點擊「取消」→ Dialog 關閉，列表無變化
3. 再次點擊「新增代理商」→ 表單欄位應為空白

### 電話格式驗證

1. 開啟 Dialog，電話欄位輸入「abc」
2. 點擊「確認」→ 顯示「請輸入有效的聯絡電話」

## Common Issues

**Dialog 開啟後表單有舊資料** → 確認 `@closed` 事件有呼叫 `formRef.resetFields()`（非 `@close`）

**新增成功但列表未出現新資料** → 確認 `agentStore.updateParams({ page: 1 })` 在 `fetchAgents()` 前執行

**確認按鈕無 loading 狀態** → 確認 `submitting` ref 在 try/finally 中正確設定
