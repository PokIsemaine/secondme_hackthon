## Context

当前代码中使用 `/act/chat/completions` 端点调用 SecondMe API，但该端点返回 404 Not Found。经验证，现有的 `/api/chat` 使用的是 `/api/secondme/chat/stream` 端点，可以正常工作。

**当前错误**:
```
SecondMe API error: {"detail":"Not Found"}
```

**受影响的文件**:
- `src/app/api/circle/match/route.ts`
- `src/app/api/negotiation/[id]/route.ts`
- `src/app/api/candidate/route.ts`
- `src/app/api/seeker/route.ts`

## Goals / Non-Goals

**Goals:**
- 修正所有 SecondMe API 端点路径
- 确保 AI 匹配、候选代理生成、协商、草稿生成功能正常工作

**Non-Goals:**
- 不修改 API 响应格式
- 不添加新功能

## Decisions

### 决策 1: API 端点路径修正

**问题**: 当前使用 `/act/chat/completions` 返回 404
**正确路径**: 根据 `/api/chat` 的实现，应该使用 `/api/secondme/chat/stream`

**修复方案**: 将所有 `/act/chat/completions` 替换为 `/api/secondme/chat/stream`

### 决策 2: 请求格式调整

**当前格式**:
```json
{
  "model": "claude-sonnet-4-20250514",
  "messages": [{ "role": "user", "content": "..." }],
  "temperature": 0.3,
  "max_tokens": 1000
}
```

**正确格式** (根据 chat API):
```json
{
  "message": "...",
  "sessionId": null
}
```

## Risks / Trade-offs

### 风险 1: API 行为差异
[风险] 流式 API 和 completions API 行为可能不同
[mitigation] 调整代码处理流式响应，或使用非流式端点

### 风险 2: 现有 chat 功能受影响
[风险] 修改可能影响现有聊天功能
[mitigation] 只修改其他 API 调用的端点，不修改 /api/chat
