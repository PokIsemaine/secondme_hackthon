## Why

当前 Demo 页面使用 mock 数据，无法展示真实产品体验。根据 PRD v2 要求，用户故事应该在单页面内完整展示，使用真实 API 数据串联登录→画像→发现→匹配→协商→提案的完整流程。

## What Changes

- 修改 `/demo` 页面，使用真实 API 替代 mock 数据
- 整合用户画像 API (`/api/user/profile`)
- 整合圈子内容 API (`/api/zhihu/ring`)
- 整合 AI 匹配 API (`/api/circle/match`)
- 整合 A2A 协商 API (`/api/negotiation`)
- 整合提案生成 API (`/api/proposal`)
- 添加候选互补对象展示组件
- 优化 Demo 页面与 PRD v2 页面设计的对齐

## Capabilities

### Modified Capabilities

- `demo-page`: 现有 Demo 页面从 mock 数据改为调用真实 API，完整展示 PRD v2 定义的 6 步用户旅程

## Impact

- **修改文件**: `src/app/demo/page.tsx`
- **新增组件**: `src/components/DemoJourney.tsx` (可选)
- **API 调用**: `/api/user/profile`, `/api/zhihu/ring`, `/api/circle/match`, `/api/negotiation`, `/api/proposal`
- **依赖**: 用户需要先完成 Second Me 登录才能使用完整功能
