# Data Model: 代理商管理後台系統

**Phase**: 1 — Design  
**Date**: 2026-04-21  
**Feature**: [spec.md](spec.md)

## Entities

---

### Admin (管理員)

Represents a backend administrator. Authenticated via username + password; receives a JWT token valid for 8 hours.

| Field      | Type     | Constraints                          | Notes                        |
|------------|----------|--------------------------------------|------------------------------|
| `id`       | `number` | Required, unique                     | Server-assigned               |
| `username` | `string` | Required                             | Used as login identifier      |
| `email`    | `string` | Required, valid email format         |                              |
| `token`    | `string` | Required after login; stored locally | JWT; 8h TTL enforced by API  |

**State transitions**: Unauthenticated → Authenticated (on login success) → Unauthenticated (on logout or 401).

**Persistence**: `token` and `{ id, username, email }` persisted to `localStorage` on login; cleared on logout or 401.

---

### Agent (代理商)

The core business entity managed by the system. v1 supports read + status toggle only.

| Field           | Type                       | Constraints           | Notes                              |
|-----------------|----------------------------|-----------------------|------------------------------------|
| `id`            | `string \| number`         | Required, unique      | Server-assigned; format TBD by API |
| `name`          | `string`                   | Required              | Searchable by keyword (server-side)|
| `contactPerson` | `string`                   | Required              |                                    |
| `contactPhone`  | `string`                   | Required              |                                    |
| `status`        | `'active' \| 'inactive'`   | Required              | Toggleable via FR-011              |
| `createdAt`     | `string` (ISO 8601)        | Required              | Default sort: descending           |

**Status transition** (v1):
```
active ⟷ inactive   (toggled by admin via PATCH /api/agents/:id/status)
```

**Sortable fields** (all columns): `id`, `name`, `contactPerson`, `contactPhone`, `status`, `createdAt`

**Filterable fields**: `name` (keyword, partial match), `status` (exact: `active` | `inactive`)

---

### PaginatedResponse\<T\> (分頁回應)

Generic wrapper returned by list endpoints.

| Field      | Type       | Constraints           | Notes                        |
|------------|------------|-----------------------|------------------------------|
| `data`     | `T[]`      | Required              | Array of entities for page   |
| `total`    | `number`   | Required, ≥ 0         | Total matching record count  |
| `page`     | `number`   | Required, ≥ 1         | Current page number          |
| `pageSize` | `number`   | Required, default 20  | Records per page             |

---

## Pinia Store Schemas

### authStore

```typescript
interface AuthState {
  token: string | null        // JWT; null = unauthenticated
  user: {
    id: number
    username: string
    email: string
  } | null
}
```

**Actions**: `login(username, password)`, `logout()`, `handleUnauthorized()` (called by Axios interceptor on 401)

---

### agentStore

```typescript
interface AgentQueryParams {
  page: number          // default: 1
  pageSize: number      // default: 20
  name: string          // default: '' (empty = no filter)
  status: 'active' | 'inactive' | ''  // default: '' = all
  sortField: string     // default: 'createdAt'
  sortOrder: 'asc' | 'desc'  // default: 'desc'
}

interface AgentState {
  list: Agent[]
  total: number
  loading: boolean
  params: AgentQueryParams
}
```

**Actions**: `fetchAgents()`, `updateParams(partial)`, `toggleStatus(agentId, currentStatus)`

---

## TypeScript Interfaces (`src/types/index.ts`)

```typescript
export interface Admin {
  id: number
  username: string
  email: string
  token: string
}

export interface Agent {
  id: string | number
  name: string
  contactPerson: string
  contactPhone: string
  status: 'active' | 'inactive'
  createdAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: Omit<Admin, 'token'>
}

export interface AgentListParams {
  page: number
  pageSize: number
  name?: string
  status?: 'active' | 'inactive'
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UpdateAgentStatusRequest {
  status: 'active' | 'inactive'
}
```
