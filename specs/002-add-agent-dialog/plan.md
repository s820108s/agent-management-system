# Implementation Plan: 新增代理商（開窗表單）

**Branch**: `002-add-agent-dialog` | **Date**: 2026-04-21 | **Spec**: [spec.md](spec.md) **Input**: Feature specification from `specs/002-add-agent-dialog/spec.md`

## Summary

在代理商列表頁新增「新增代理商」按鈕，點擊後彈出 Element Plus Dialog，內含三欄必填表單（代理商名稱、聯絡人、聯絡電話）。前端驗證通過後呼叫 `POST /api/agents`，成功後關閉 Dialog 並重新載入列表至第一頁。

## Technical Context

**Language/Version**: TypeScript 5.7 + Vue 3.5 **Primary Dependencies**: Element Plus 2.9.2、Pinia 2.x、Axios 1.x、vue-element-plus-admin scaffold **Storage**: N/A（無新增持久化層，auth token 沿用 localStorage） **Testing**: 不含測試（spec 未要求） **Target Platform**: Web browser（Chrome / Edge 最新版） **Project Type**: SPA admin panel（既有專案上的增量功能） **Performance Goals**: Dialog 開啟 < 100ms；送出後列表刷新 < 2s **Constraints**: 必須沿用 vue-element-plus-admin 的 Layout、el-dialog、el-form 慣例；不引入新 UI 元件庫 **Scale/Scope**: 單一 Dialog 表單，3 個欄位，1 個 API 端點

## Constitution Check

Constitution 為未填寫的範本（無具體原則），無 Gate 需要評估。

## Project Structure

### Documentation (this feature)

```text
specs/002-add-agent-dialog/
├── plan.md              ← 本檔案
├── research.md          ← Phase 0 輸出
├── data-model.md        ← Phase 1 輸出
├── quickstart.md        ← Phase 1 輸出
├── contracts/
│   └── api-agents-create.md  ← Phase 1 輸出
└── tasks.md             ← /speckit-tasks 產生
```

### Source Code (增量變更)

```text
src/
├── api/agents/index.ts          # 新增 createAgent() export
├── store/modules/agents.ts      # 新增 createAgent action
├── types/index.ts               # 新增 CreateAgentRequest interface
├── views/Agents/
│   ├── AgentList.vue            # 新增按鈕 + 引入 Dialog 元件
│   └── components/
│       └── AddAgentDialog.vue   # 新增：Dialog + Form 元件
└── ...

mock/agents/index.mock.ts        # 新增 POST /api/agents handler
```

**Structure Decision**: 使用獨立元件 `AddAgentDialog.vue`，由 `AgentList.vue` 透過 `v-model` 控制開關，符合既有專案的元件分層慣例。

## Complexity Tracking

無 Constitution 違規，略。
