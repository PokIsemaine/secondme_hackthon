## Why

AI 匹配结果当前以单一字符串返回匹配理由，显示时用小号斜体放在最下方。用户无法快速理解匹配逻辑，信任度低，协作撮合的交接点失效。匹配理由需要结构化分级展示，让用户既能"一眼扫过"快速筛选，也能在感兴趣时"展开验证"。

## What Changes

- **分级展示**：匹配理由分两级 —— 第一级类型标签（能力互补/认知互补/双向互助），第二级双向论点（"你能帮他..." + "他能帮你..."）
- **折叠交互**：默认折叠第二级，用户点击展开完整理由
- **分数动态详细度**：匹配分数 85% 以上详细展开，低于 85% 简短展示
- **API 结构化返回**：AI 返回结构化 reason 对象（typeTag + thesis + detailLevel），而非单一字符串

## Capabilities

### New Capabilities

- `match-reason-display`: 匹配理由的两级展示规范，包括类型标签、双向论点文本、折叠/展开交互、以及按分数动态调整详细度的显示逻辑

### Modified Capabilities

- `match-scoring`: 现有匹配评分能力需要扩展 AI prompt，要求输出结构化 reason 对象（包含 complementType、summary、forYou、forThem、detailLevel），而非当前单一 reason 字符串

## Impact

- `/api/circle/match` route — AI prompt 和响应解析逻辑需要调整
- `CircleDiscovery.tsx` — 匹配卡片 UI 需要重构，支持两级折叠展示
- `src/lib/mock.ts` — mock 数据结构需要同步更新
