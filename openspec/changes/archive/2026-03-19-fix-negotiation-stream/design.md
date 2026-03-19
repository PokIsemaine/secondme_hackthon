## Context

**问题 1: SSE 格式解析错误**

SecondMe API `/api/secondme/chat/stream` 返回的 SSE 格式：
```json
{"choices": [{"delta": {"content": "聊天内容"}}]}
```

代码当前期望的格式：
```json
{"content": "聊天内容"}
```

**问题 2: peerProxyData 没有持久化**

客户端在创建协商会话时传递 `peerProxyData`：
```tsx
const createRes = await fetch('/api/negotiation', {
  method: 'POST',
  body: JSON.stringify({
    topic: `${targetPost.author_name} 的讨论互补分析`,
    peerProxyData: candidateProfile,  // ← 传递了但没保存
  }),
})
```

服务端创建 session 时没有将 `peerProxyData` 存入数据库，导致后续流式执行时 `peerProfile` 全是"未知"。

## Goals / Non-Goals

**Goals:**
- 修正 SSE 事件解析，正确提取 `choices[0].delta.content`
- 在 `NegotiationSession` 中保存 `peerProxyData`
- 在流式执行时加载保存的 `peerProxyData`

**Non-Goals:**
- 不修改 SecondMe API 的请求格式
- 不改变客户端的 API 调用方式
- 不添加新的数据库表

## Decisions

### Decision 1: 修改 Prisma schema 添加 peerProxyData 字段

**选择：** 在 `NegotiationSession` 模型中添加可选字段 `peerProxyData Json?`

**理由：** 直接保存候选用户画像，无需额外关联表

**迁移：**
```prisma
model NegotiationSession {
  // ... existing fields
  peerProxyData Json?
}
```

### Decision 2: 修正 SSE 解析逻辑

**选择：** 修改解析代码从 `data.choices[0].delta.content` 提取内容

**当前代码 (stream/route.ts:171-181):**
```tsx
const data = JSON.parse(dataStr)
if (data.content) {  // ← 永远是 undefined
  fullContent += data.content
  sendEvent({ ... content: data.content })
}
```

**修正后:**
```tsx
const data = JSON.parse(dataStr)
const content = data.choices?.[0]?.delta?.content
if (content) {
  fullContent += content
  sendEvent({ ... content })
}
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| peerProxyData 为空时流式执行失败 | 添加空值检查，默认使用占位符 |
| 数据库迁移需要重启 | Prisma migrate 一次完成 |
