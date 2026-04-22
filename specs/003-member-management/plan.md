# Implementation Plan: 會員管理頁面

**Branch**: `003-member-management` | **Date**: 2026-04-22 | **Spec**: [spec.md](./spec.md) **Input**: Feature specification from `specs/003-member-management/spec.md`

## Summary

為後台新增會員管理模組：包含會員列表頁（分頁、關鍵字搜尋、代理商篩選）與新增會員 Dialog（含所屬代理商下拉選單）。完全複用現有 Agents 模組的架構模式（View + Pinia Store + API layer + Mock），並擴充共用型別定義與路由設定。

## Technical Context

**Language/Version**: TypeScript 5.7.3 / Vue 3.5.13 **Primary Dependencies**: Element Plus 2.9.2, Pinia 2.3.0, Axios (custom wrapper `@/axios`), vue-router 4.5 **Storage**: N/A（前端狀態由 Pinia 管理，資料來自後端 API） **Testing**: 無自動化測試框架（使用 vite-plugin-mock 進行開發期 mock） **Target Platform**: 桌面瀏覽器（Chrome / Edge 最新版） **Project Type**: Admin Web Application（SPA，Vue 3 + Element Plus Admin 架構） **Performance Goals**: 列表初次載入 ≤ 2s，搜尋回饋 ≤ 1s（API 回應後） **Constraints**: 僅支援桌面，不要求 RWD；所有受保護路由已有 Navigation Guard **Scale/Scope**: 預估會員數量 ≤ 100,000 筆，伺服器端分頁已足夠

## Constitution Check

無正式 Constitution 設定（constitution.md 為空白模板）。依現有專案模式自我約束：

| Gate             | Status  | Notes                                         |
| ---------------- | ------- | --------------------------------------------- |
| 遵循現有目錄結構 | ✅ PASS | 沿用 `views/`, `api/`, `store/`, `mock/` 分層 |
| 使用現有元件庫   | ✅ PASS | Element Plus，不引入新 UI 依賴                |
| 型別安全         | ✅ PASS | 所有新介面定義於 `src/types/index.ts`         |
| Mock 完整性      | ✅ PASS | 新增對應 mock handler                         |
| 不破壞現有功能   | ✅ PASS | 僅新增路由與模組，不修改現有 Agents 模組      |

## Project Structure

### Documentation (this feature)

```text
specs/003-member-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/
│   └── api.md           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── index.ts                          # 新增 Member, MemberListParams,
│                                         #   CreateMemberRequest, AgentOption
├── api/
│   └── members/
│       └── index.ts                      # getMembers, createMember, getAgentOptions
├── store/
│   └── modules/
│       └── members.ts                    # useMemberStore (Pinia)
├── views/
│   └── Members/
│       ├── MemberList.vue                # 列表頁
│       └── components/
│           └── AddMemberDialog.vue       # 新增會員 Dialog
└── router/
    └── index.ts                          # 新增 /members 路由至 asyncRouterMap

mock/
└── members/
    └── index.mock.ts                     # GET /api/members, POST /api/members,
                                          #   GET /api/agents/all
```

**Structure Decision**: 單一前端專案，採用 Option 1（Single project）。完全複製 Agents 模組的 View / Store / API / Mock 四層分離模式。

## Complexity Tracking

無需記錄（無 Constitution 違規）。
