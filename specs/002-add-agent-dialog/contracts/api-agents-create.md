# API Contract: 新增代理商

**Date**: 2026-04-21

---

## POST /api/agents

新增一筆代理商記錄。

### Request

```http
POST /api/agents
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:

```json
{
  "name": "代理商ABC",
  "contactPerson": "王小明",
  "contactPhone": "0912-345-678"
}
```

| 欄位          | 型別   | 必填 | 說明                       |
| ------------- | ------ | ---- | -------------------------- |
| name          | string | ✓    | 代理商名稱，不得與現有重複 |
| contactPerson | string | ✓    | 聯絡人姓名                 |
| contactPhone  | string | ✓    | 聯絡電話                   |

---

### Response — 成功 (201 Created)

```json
{
  "id": 51,
  "name": "代理商ABC",
  "contactPerson": "王小明",
  "contactPhone": "0912-345-678",
  "status": "active",
  "createdAt": "2026-04-21 14:30:00"
}
```

---

### Response — 驗證失敗 (422 Unprocessable Entity)

```json
{
  "message": "代理商名稱已存在"
}
```

---

### Response — 未授權 (401 Unauthorized)

```json
{
  "message": "Unauthorized"
}
```

---

### Frontend 處理邏輯

| HTTP Status | 前端行為                                            |
| ----------- | --------------------------------------------------- |
| 201         | 關閉 Dialog，刷新列表（重置至第一頁），顯示成功提示 |
| 401         | 全域 interceptor 處理：logout → 跳回 /login         |
| 422 / 409   | Dialog 保持開啟，顯示後端錯誤訊息                   |
| 500         | Dialog 保持開啟，顯示「伺服器錯誤，請稍後再試」     |
| 網路錯誤    | Dialog 保持開啟，顯示「網路連線異常，請檢查連線」   |
