## Why

当前 AI 匹配逻辑过于严格，只返回存在明确互补关系的帖子，导致结果为空。用户期望尽可能多地匹配帖子并按匹配程度排序展示。

## What Changes

- **修改匹配评分逻辑**：AI 对所有帖子打分（0-100），而非仅返回有互补关系的帖子
- **修改返回结构**：AI 返回每个帖子的 `score`（0-100）和 `reason`，`complementType` 作为辅助标签
- **前端排序**：按 `score` 降序排列所有匹配结果
- **保持向后兼容**：`complementType` 字段仍保留，但不再用于过滤

## Capabilities

### New Capabilities
- `match-scoring`: 通用匹配评分能力，对每个帖子输出 0-100 的相关性分数

### Modified Capabilities
- `circle-match`（现有接口 `/api/circle/match`）：匹配逻辑从"筛选互补"改为"全员打分排序"

## Impact

- `src/app/api/circle/match/route.ts`：修改 prompt 和解析逻辑
- `src/app/demo/page.tsx`：Step 2 匹配结果排序和展示逻辑调整
