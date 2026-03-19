## Context

当前 `POST /api/negotiation/[id]` 执行 5 轮 SSE 调用，每轮等待完整响应后累积到数组，最后一次性返回 JSON。前端 `runNegotiation()` 用 `fetch()` 等待完整结果，渲染时所有 round 同时出现，用户看不到实时对话过程。

目标：前端实时看到每个 round 的 token 流式输出，像打字机一样逐字显示。

## Goals / Non-Goals

**Goals:**
- 前端 SSE 流式消费，每轮 token 实时渲染到 DOM
- 每个 round 的 `summary` 在 round 完成后提取并高亮
- 保留原有阻塞端点作为 fallback
- 支持 demo mode 下直接使用 mock 数据

**Non-Goals:**
- 不修改数据库 schema
- 不改变 5 轮协商的 prompt 模板
- 不实现 WebSocket，只用 SSE over HTTP

## Decisions

### 1. 新增 `GET /api/negotiation/[id]/stream` 端点

Next.js App Router 中返回流式 SSE：

```typescript
// GET /api/negotiation/[id]/stream
return new Response(
  new ReadableStream({
    start(controller) {
      // for each round:
      //   1. call SecondMe SSE stream
      //   2. pipe tokens: reader.read() → controller.enqueue()
      //   3. format: data: {"round":1,"speaker":"my_agent","done":false,"content":"token"}\n
      //   4. round结束时: data: {"round":1,"speaker":"my_agent","done":true,"summary":"..."}\n
    }
  }),
  { headers: { 'Content-Type': 'text/event-stream', ... } }
)
```

### 2. SSE 事件格式设计

每个 token 是一个 SSE data line：

```
data: {"round":1,"speaker":"my_agent","done":false,"content":"用户"}
data: {"round":1,"speaker":"my_agent","done":false,"content":"你好"}
...
data: {"round":1,"speaker":"my_agent","done":true,"summary":"问题的定义是..."}
data: {"round":2,"speaker":"peer_proxy","done":false,"content":"我"}
data: {"round":2,"speaker":"peer_proxy","done":false,"content":"可以"}
...
data: {"round":2,"speaker":"peer_proxy","done":true,"summary":"价值交换内容..."}
data: [DONE]
```

### 3. 前端 SSE 消费

```typescript
const stream = await fetch(`/api/negotiation/${sessionId}/stream`)
const reader = stream.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  const line = decoder.decode(value)
  if (line.startsWith('data: ')) {
    const data = JSON.parse(line.slice(6))
    if (!data.done) {
      // 追加 token 到当前 round 的显示
    } else {
      // 显示 summary 高亮
    }
  }
}
```

### 4. 轮次累积逻辑

服务端 stream 按顺序执行 5 轮，每轮内部 pipe token 到前端。不需要并发，前端也不需要缓冲。

### 5. 保留原有端点

`POST /api/negotiation/[id]` 保持不变，demo mode 和兼容场景继续使用。

## Risks / Trade-offs

- [Risk] 前端 fetch SSE 过程中网络中断 → 重试逻辑或 fallback 到原阻塞端点
- [Risk] 某些浏览器对 SSE 支持不完整 → 使用 `fetch` + `ReadableStream` 方式，兼容性更好
- [Trade-off] 服务端 SSE pipe 增加了复杂性，但用户感知价值高
