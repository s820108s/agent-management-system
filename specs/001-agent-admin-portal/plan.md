# Implementation Plan: 代理商管理後台系統

**Branch**: `001-agent-admin-portal` | **Date**: 2026-04-21 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/001-agent-admin-portal/spec.md`

## Summary

Build a Vue 3 + TypeScript single-page admin portal using the Element Plus Admin framework. v1 delivers three capabilities: admin login with route-guard access control, a paginated/filterable/sortable agent list, and inline agent status toggle. The backend API is assumed to exist and is consumed via Axios with a centralized 401 interceptor that forces re-login without token refresh.

## Technical Context

**Language/Version**: TypeScript 5.x + Vue 3.4 (Composition API)  
**Primary Dependencies**: Element Plus Admin (vue-element-plus-admin), Element Plus 2.x, Pinia 2.x, Vue Router 4.x, Axios 1.x  
**Storage**: localStorage (auth token + user info persistence across browser sessions)  
**Testing**: Vitest + Vue Test Utils (unit/component); Playwright (E2E — deferred to v2)  
**Target Platform**: Desktop browser — Chrome 120+, Edge 120+  
**Project Type**: Web SPA (admin frontend)  
**Performance Goals**: List render <2s after API response; search/filter update <1s client-side after API; login flow <30s end-to-end  
**Constraints**: Desktop-only, no RWD; no token refresh; 401 → forced re-login; token TTL = 8h (enforced by backend)  
**Scale/Scope**: ≤10,000 agents; server-side pagination (pageSize=20 default); single admin role; v1 scope = login + list + status toggle

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution (`/.specify/memory/constitution.md`) is an unfilled template — no project-specific principles are ratified. No gates to enforce. All design decisions default to industry-standard practices for Vue 3 SPA admin applications.

**Post-design re-check**: No violations identified. Architecture follows minimal-complexity SPA conventions.

## Project Structure

### Documentation (this feature)

```text
specs/001-agent-admin-portal/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── api-auth.md
│   └── api-agents.md
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── api/
│   ├── auth.ts           # POST /api/auth/login
│   └── agents.ts         # GET /api/agents, PATCH /api/agents/:id/status
├── layout/
│   └── (Element Plus Admin default layout — sidebar + topbar)
├── pages/
│   ├── login/
│   │   └── index.vue     # FR-001: login form
│   └── agents/
│       └── index.vue     # FR-004–FR-006b, FR-011: agent list + filters + toggle
├── router/
│   └── index.ts          # FR-003: navigation guards
├── stores/
│   ├── auth.ts           # FR-002, FR-009, FR-010: auth state + logout + 401 handler
│   └── agents.ts         # FR-004–FR-011: agent list state + actions
├── types/
│   └── index.ts          # Admin, Agent, PaginatedResponse interfaces
├── utils/
│   └── request.ts        # Axios instance + 401 interceptor
├── App.vue
└── main.ts

tests/
├── unit/
│   ├── stores/
│   │   ├── auth.spec.ts
│   │   └── agents.spec.ts
│   └── utils/
│       └── request.spec.ts
└── components/
    ├── LoginForm.spec.ts
    └── AgentList.spec.ts
```

**Structure Decision**: Single-project SPA. Element Plus Admin provides the layout shell (sidebar navigation, topbar with logout). Application code lives under `src/` following Vue 3 Composition API + Pinia conventions. No backend code in this repo — pure frontend.

## Complexity Tracking

No constitution violations. No complexity justification required.
