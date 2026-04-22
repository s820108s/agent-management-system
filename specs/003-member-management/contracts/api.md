# API Contracts: 會員管理頁面

**Feature**: `003-member-management` **Date**: 2026-04-22

---

## GET /api/members

取得會員列表（伺服器端分頁 + 篩選）。

**Query Parameters**

| 參數       | 型別          | 必填 | 說明                             |
| ---------- | ------------- | ---- | -------------------------------- |
| `page`     | number        | 是   | 頁碼，從 1 開始                  |
| `pageSize` | number        | 是   | 每頁筆數，預設 20                |
| `keyword`  | string        | 否   | 模糊搜尋 username 或 email       |
| `agentId`  | number/string | 否   | 篩選特定代理商，空字串表示不篩選 |

**Success Response** `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "username": "member001",
      "email": "member001@example.com",
      "agentId": 3,
      "agentName": "代理商003",
      "status": "active",
      "createdAt": "2026-03-01 10:00:00"
    }
  ],
  "total": 80,
  "page": 1,
  "pageSize": 20
}
```

---

## POST /api/members

新增會員。

**Request Body**

```json
{
  "username": "newmember",
  "email": "newmember@example.com",
  "password": "password123",
  "agentId": 3
}
```

**Success Response** `201 Created`

```json
{
  "id": 81,
  "username": "newmember",
  "email": "newmember@example.com",
  "agentId": 3,
  "agentName": "代理商003",
  "status": "active",
  "createdAt": "2026-04-22 10:00:00"
}
```

**Error Responses**

| HTTP Status                | 場景         | Body                                 |
| -------------------------- | ------------ | ------------------------------------ |
| `422 Unprocessable Entity` | 必填欄位缺漏 | `{ "message": "所有欄位為必填" }`    |
| `409 Conflict`             | Email 已存在 | `{ "message": "此 Email 已被使用" }` |

---

## GET /api/agents/all

取得所有狀態為 `active` 的代理商清單，供新增會員 Dialog 下拉選單使用（不分頁）。

**Query Parameters**: 無

**Success Response** `200 OK`

```json
{
  "data": [
    { "id": 1, "name": "代理商001" },
    { "id": 2, "name": "代理商002" }
  ]
}
```

---

## 與現有 API 對比

| 端點                  | 狀態     | 說明                 |
| --------------------- | -------- | -------------------- |
| `GET /api/agents`     | 已存在   | 代理商列表，保持不變 |
| `POST /api/agents`    | 已存在   | 新增代理商，保持不變 |
| `GET /api/agents/all` | **新增** | 代理商下拉選單專用   |
| `GET /api/members`    | **新增** | 會員列表             |
| `POST /api/members`   | **新增** | 新增會員             |
