# API Contract: Authentication

**Service**: Backend Auth API  
**Consumed by**: `src/api/auth.ts`  
**Date**: 2026-04-21

---

## POST /api/auth/login

Login with username and password. Returns a JWT token valid for 8 hours.

### Request

```
POST /api/auth/login
Content-Type: application/json
```

**Body**:

```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

### Response — 200 OK

```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  }
}
```

### Response — 401 Unauthorized

```json
{
  "message": "Invalid username or password"
}
```

**Frontend handling**:
- 200 → store token + user in localStorage, redirect to `/agents`
- 401 → show error message "帳號或密碼錯誤", remain on login page
- 5xx / network error → show generic error message, remain on login page

---

## Axios Interceptor: 401 Global Handler

All API calls (not just login) share a single Axios instance. The response interceptor handles 401 globally:

```
On any 401 response (except POST /api/auth/login):
  → authStore.handleUnauthorized()
  → clear localStorage token + user
  → router.push('/login')
```

The login endpoint's 401 is handled locally (show error message, do not redirect).
