# Data Model: 新增代理商（開窗表單）

**Date**: 2026-04-21

---

## 新增實體 / 介面

### CreateAgentRequest

新增代理商的 API 請求主體。

| 欄位          | 型別   | 必填 | 說明                   |
| ------------- | ------ | ---- | ---------------------- |
| name          | string | ✓    | 代理商名稱，不得重複   |
| contactPerson | string | ✓    | 聯絡人姓名             |
| contactPhone  | string | ✓    | 聯絡電話，基本格式驗證 |

```ts
export interface CreateAgentRequest {
  name: string
  contactPerson: string
  contactPhone: string
}
```

---

## 既有實體（沿用，無變更）

### Agent

```ts
export interface Agent {
  id: string | number
  name: string
  contactPerson: string
  contactPhone: string
  status: 'active' | 'inactive'
  createdAt: string
}
```

新增代理商後，後端回傳完整 `Agent` 物件，`status` 預設為 `'active'`，`createdAt` 由後端產生。

---

## Form State（元件內部，非 Store）

AddAgentDialog.vue 維護的本地表單狀態：

```ts
interface AddAgentForm {
  name: string // 初始值: ''
  contactPerson: string // 初始值: ''
  contactPhone: string // 初始值: ''
}
```

---

## agentStore 新增 Action

| Action | 參數 | 行為 |
| --- | --- | --- |
| `createAgent(data)` | `CreateAgentRequest` | 呼叫 POST API；成功後重置 params.page=1 並重新 fetchAgents；失敗顯示 el-message 錯誤 |

---

## 驗證規則

| 欄位          | 規則                                     | 錯誤訊息             |
| ------------- | ---------------------------------------- | -------------------- |
| name          | required, 非空字串                       | 請輸入代理商名稱     |
| contactPerson | required, 非空字串                       | 請輸入聯絡人         |
| contactPhone  | required, regex `/^[0-9+\-\s()]{7,20}$/` | 請輸入有效的聯絡電話 |
