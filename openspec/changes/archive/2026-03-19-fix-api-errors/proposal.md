## Why

用户测试时发现两个问题：
1. SSE 响应解析时遇到 `[DONE]` 导致 JSON 解析错误
2. Demo 页面调用错误的协商执行端点导致 404

## What Changes

- 修正 `/api/circle/match` 的 SSE 响应解析，过滤 `[DONE]` 信号
- 修正 `/api/negotiation/[id]` 的 SSE 响应解析，过滤 `[DONE]` 信号
- 修正 `/api/candidate` 的 SSE 响应解析，过滤 `[DONE]` 信号
- 修正 `/api/seeker` 的 SSE 响应解析，过滤 `[DONE]` 信号
- 修正 Demo 页面调用协商执行的端点路径

## Impact

- 修改 4 个 API route 文件的 SSE 解析逻辑
- 修改 Demo 页面调用 `/api/negotiation/[id]` 端点
