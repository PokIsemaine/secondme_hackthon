## 1. API 端点

- [x] 1.1 在 `src/app/api/negotiation/[id]/` 目录下新增 `stream/route.ts`
- [x] 1.2 实现 `ReadableStream` SSE 转发，每轮 token 按格式 `data: {"round":N,"speaker":"...","done":false,"content":"..."}` 推送
- [x] 1.3 Round 完成后推送 `data: {"round":N,"speaker":"...","done":true,"summary":"..."}`
- [x] 1.4 全部完成后推送 `data: [DONE]`

## 2. 前端 SSE 消费

- [x] 2.1 在 `src/app/demo/page.tsx` 的 `runNegotiation` 函数中，demoMode=false 时调用 `GET /api/negotiation/[id]/stream`
- [x] 2.2 使用 `response.body.getReader()` 流式消费 SSE
- [x] 2.3 解析 `done:false` token 并追加到当前 round 显示
- [x] 2.4 解析 `done:true` 时高亮显示 summary，切换到下一 round
- [x] 2.5 解析最终 result 数据并更新 `negotiationResult` 状态

## 3. Demo Mode 降级

- [x] 3.1 保留原有 demoMode 下的 mock 数据展示逻辑
- [x] 3.2 demoMode 下跳过 SSE 调用，直接使用 mock 数据模拟流式渲染
