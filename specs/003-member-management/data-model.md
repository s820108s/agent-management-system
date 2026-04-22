# Data Model: 會員管理頁面

**Feature**: `003-member-management` **Date**: 2026-04-22

---

## 新增 TypeScript Interfaces（`src/types/index.ts` 追加）

### Member

```typescript
export interface Member {
  id: string | number
  username: string
  email: string
  agentId: string | number
  agentName: string
  status: 'active' | 'inactive'
  createdAt: string
}
```

### CreateMemberRequest

```typescript
export interface CreateMemberRequest {
  username: string
  email: string
  password: string
  agentId: string | number
}
```

### MemberListParams

```typescript
export interface MemberListParams {
  page: number
  pageSize: number
  keyword?: string // 搜尋 username 或 email
  agentId?: string | number | ''
}
```

### AgentOption（代理商下拉選單用）

```typescript
export interface AgentOption {
  id: string | number
  name: string
}
```

---

## 實體關聯

```
Admin (1) ─── manages ──► Member (N)
Agent  (1) ─── owns ─────► Member (N)
Member.agentId → Agent.id  (必填，不可為 null)
```

- `Admin` 帳號與 `Member` 無外鍵關係；admin 只做管理操作。
- 每個 `Member` 必須有且僅有一個 `agentId`，對應一個 `active` 的 `Agent`。

---

## 驗證規則

| 欄位       | 規則                                     |
| ---------- | ---------------------------------------- |
| `username` | 必填，非空字串                           |
| `email`    | 必填，符合 Email 格式（RFC 5322 簡化版） |
| `password` | 必填，至少 8 個字元                      |
| `agentId`  | 必填，必須從下拉選單選取有效代理商 ID    |

---

## 狀態轉換

會員在本期只有初始建立（`active`）狀態，無狀態切換操作（停用/啟用留待後續迭代）。
