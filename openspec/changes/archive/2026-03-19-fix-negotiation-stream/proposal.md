## Why

真实登录后的协商流式功能无法正常工作。SecondMe API 返回的 SSE 格式为 `{ "choices": [{ "delta": { "content": "..." } }] }`，但代码期望的是 `{ "content": "..." }`，导致流式内容无法解析，"打字中..." 永远显示。

同时，客户端传递的 `peerProxyData`（候选用户画像信息）在创建协商会话时没有被保存，导致协商时无法使用正确的对方画像。

## What Changes

- 修复 `/api/negotiation/[id]/stream` 中 SSE 事件的解析逻辑，正确提取 `data.choices[0].delta.content`
- 在创建协商会话时保存 `peerProxyData`（候选用户画像）
- 在流式执行时从数据库加载保存的 `peerProxyData` 用于生成对方画像

## Capabilities

### New Capabilities

- `negotiation-stream-fix`: 修复协商流式功能的数据解析和传递问题

### Modified Capabilities

- （无）

## Impact

- `src/app/api/negotiation/route.ts` - 创建会话时保存 peerProxyData
- `src/app/api/negotiation/[id]/stream/route.ts` - 修正 SSE 解析逻辑，加载保存的 peerProxyData
- SecondMe API 文档参考：`POST /api/secondme/chat/stream` SSE 格式
