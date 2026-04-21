# Quickstart: 代理商管理後台系統

**Date**: 2026-04-21

## Prerequisites

- Node.js 18+ and npm/pnpm
- Backend API running (see [api-auth.md](contracts/api-auth.md), [api-agents.md](contracts/api-agents.md))

## Setup

```bash
# 1. Install dependencies (scaffold already applied)
cd agent-management-system

# 2. Install dependencies
pnpm install

# 3. Configure API base URL
# Edit .env.development:
VITE_API_BASE_URL=http://localhost:3000
```

## Development

```bash
# Start dev server (Vite HMR)
pnpm dev
# → http://localhost:5173

# Run unit tests (watch mode)
pnpm test

# Type check
pnpm type-check
```

## Build

```bash
pnpm build
# Output: dist/
```

## Key Entry Points

| Path                         | Purpose                                          |
| ---------------------------- | ------------------------------------------------ |
| `src/main.ts`                | App bootstrap (Vue + Pinia + Router)             |
| `src/router/index.ts`        | Route definitions + navigation guard             |
| `src/utils/request.ts`       | Axios instance + 401 interceptor                 |
| `src/stores/auth.ts`         | Auth state: login / logout / 401 handler         |
| `src/stores/agents.ts`       | Agent list state: fetch / filter / sort / toggle |
| `src/pages/login/index.vue`  | Login page                                       |
| `src/pages/agents/index.vue` | Agent list page                                  |

## Environment Variables

| Variable            | Description          | Example                 |
| ------------------- | -------------------- | ----------------------- |
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000` |

## Test Accounts (Development)

Provided by the backend team. Ask for a dev admin credential when setting up.

## Common Issues

**Login redirects to `/login` immediately after success**  
→ Check that `VITE_API_BASE_URL` is set and the backend returns a valid token in the `token` field.

**401 on every API call**  
→ Token may not be in `localStorage`. Open DevTools → Application → Local Storage and verify `token` key exists.

**Agent list shows no data**  
→ Verify the backend `/api/agents` endpoint is running and CORS is configured for `http://localhost:5173`.
