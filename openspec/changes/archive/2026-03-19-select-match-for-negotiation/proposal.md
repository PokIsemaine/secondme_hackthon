## Why

当前 AI 匹配结果只能自动使用 `matches[0]`（第一个匹配），用户无法选择想要协商的帖子。这限制了用户自主性，特别是当有多个匹配结果时，用户可能对非第一个匹配更感兴趣。

## What Changes

- 在 AI 匹配结果（Step 2）中添加选择机制，用户可以点击选择想要协商的帖子
- 添加选中状态视觉反馈（高亮/边框等）
- "发起 Agent 协商"按钮使用用户选中的匹配结果，而非固定使用第一个
- 如果用户没有选择但有匹配结果，默认选中第一个

## Capabilities

### New Capabilities

- `match-selection`: 在匹配结果中选择要协商的帖子

### Modified Capabilities

- （无）

## Impact

- `src/app/demo/page.tsx` - 修改 Step 2 UI 添加选择机制，修改 Step 3 协商使用选中的匹配
