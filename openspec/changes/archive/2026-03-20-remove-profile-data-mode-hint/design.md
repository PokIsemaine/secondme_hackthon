## Context

在 `src/app/demo/page.tsx` 的用户互补画像展示区域，第 851-853 行有一段根据 `demoMode` 状态显示"（演示数据）"或"（真实数据）"的提示文字。

## Goals / Non-Goals

**Goals:**
- 移除该提示文本，还原简洁的 UI 界面

**Non-Goals:**
- 不修改 `demoMode` 变量或相关逻辑
- 不改变其他 UI 元素

## Decisions

直接删除 `<p className="text-sm text-gray-500">...</p>` 块（3 行代码），无其他替代方案。

## Risks / Trade-offs

无风险，这是纯 UI 文本移除，不涉及功能逻辑。
