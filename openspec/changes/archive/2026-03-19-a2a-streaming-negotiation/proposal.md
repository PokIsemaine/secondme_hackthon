## Why

当前协商流程的 5 轮 A2A 对话在服务端完整执行完毕后才一次性返回所有结果，前端无法实时看到 Agent 的思考和输出过程。用户体验不到"两个 Agent 在对话"的感觉，降低了产品的可信度和沉浸感。

## What Changes

- **新增流式 API 端点** `GET /api/negotiation/[id]/stream`：将 SecondMe SSE token 直接转发到前端，前端通过 `fetch()` + `response.body.getReader()` 逐 token 渲染
- **新增前端 SSE 消费组件**：逐 round、逐 token 流式渲染协商过程，动态更新 DOM
- **每轮完成后显示摘要**：round 结束后自动提取 `summary` 展示，token 继续累积显示
- **保留原有阻塞端点**：`POST /api/negotiation/[id]` 保持不变，作为 fallback

## Capabilities

### New Capabilities
- `streaming-negotiation`: 流式协商能力，实时推送每轮 SSE token 到前端

### Modified Capabilities
- `a2a-negotiation`（现有 specs/a2a-negotiation/spec.md）：将协商结果的返回方式从"全部完成后 JSON 返回"改为"流式 SSE token 推送"

## Impact

- `src/app/api/negotiation/[id]/route.ts`：新增 `GET /stream` 端点，返回 `ReadableStream` SSE
- `src/app/demo/page.tsx`：Step 3 协商室组件改造，使用 SSE 流式消费并渲染
- `src/components/NegotiationRoom.tsx`：重构为支持流式渲染的组件
