## Context

前端调用 `/api/circle/match` 时，API 返回 200 但前端无响应。问题可能是：
1. API 返回 code 非 0，前端未处理
2. 响应数据格式不符合预期

## Goals / Non-Goals

**Goals:**
- 前端添加对非零 code 的错误处理和提示
- 添加调试日志
- 改善用户体验

**Non-Goals:**
- 不修改 API 核心逻辑

## Decisions

### D1: 前端错误处理
**选择**: 在 runAIMatch 中添加 else 分支，显示错误提示

**理由**:
- 最直接解决问题
- 不影响现有功能

## Risks / Trade-offs

- **风险**: 错误信息可能暴露敏感信息
  - **缓解**: 只显示 message 字段，不显示详情
