# API Contract: Agents

**Service**: Backend Agents API  
**Consumed by**: `src/api/agents.ts`  
**Date**: 2026-04-21

---

## GET /api/agents

Fetch a paginated, filterable, sortable list of agents.

### Request

```
GET /api/agents
Authorization: Bearer <token>
```

**Query Parameters**:

| Parameter   | Type     | Required | Default      | Description                                      |
|-------------|----------|----------|--------------|--------------------------------------------------|
| `page`      | integer  | No       | `1`          | Page number (1-based)                            |
| `pageSize`  | integer  | No       | `20`         | Records per page                                 |
| `name`      | string   | No       | (none)       | Partial keyword match on agent name              |
| `status`    | string   | No       | (none = all) | Filter by status: `active` or `inactive`         |
| `sortField` | string   | No       | `createdAt`  | Field to sort by (any Agent field name)          |
| `sortOrder` | string   | No       | `desc`       | Sort direction: `asc` or `desc`                  |

**Example**:
```
GET /api/agents?page=1&pageSize=20&name=test&status=active&sortField=name&sortOrder=asc
```

### Response — 200 OK

```json
{
  "data": [
    {
      "id": "1",
      "name": "Agent Name",
      "contactPerson": "Contact Person",
      "contactPhone": "0912-345-678",
      "status": "active",
      "createdAt": "2026-04-01T08:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 20
}
```

### Response — 401 Unauthorized

Global 401 interceptor handles: clears token, redirects to `/login`.

### Response — 5xx / Network Error

Frontend shows error toast message; table retains previous state (or shows empty state on first load).

---

## PATCH /api/agents/:id/status

Toggle an agent's status between `active` and `inactive`.

### Request

```
PATCH /api/agents/:id/status
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters**:

| Parameter | Type            | Required | Description        |
|-----------|-----------------|----------|--------------------|
| `id`      | string / number | Yes      | Agent unique ID    |

**Body**:

```json
{
  "status": "active" | "inactive"
}
```

### Response — 200 OK

```json
{
  "id": "1",
  "status": "inactive"
}
```

Returns the updated agent ID and new status. Frontend updates the corresponding row in the table without re-fetching the full list.

### Response — 400 Bad Request

```json
{
  "message": "Invalid status value"
}
```

### Response — 404 Not Found

```json
{
  "message": "Agent not found"
}
```

### Response — 401 Unauthorized

Global 401 interceptor handles.

**Frontend handling (pessimistic update)**:
- During request: toggle button shows loading spinner, disabled
- On 200: update the agent's status in `agentStore.list` in-place
- On error (4xx / 5xx / network): show error toast, no state change
