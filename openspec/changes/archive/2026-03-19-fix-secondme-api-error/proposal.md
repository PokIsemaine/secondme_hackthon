## Why

用户在 Demo 页面执行 AI 匹配时，SecondMe API 返回 `{"detail":"Not Found"}` 错误，导致匹配功能无法使用。根据 CLAUDE.md 中的 API 文档参考，需要检查并修正 SecondMe API 端点调用方式。

## What Changes

- 检查并修正 `/api/circle/match` 中的 SecondMe API 端点路径
- 检查并修正 `/api/negotiation/[id]` 中的 SecondMe API 端点路径
- 检查并修正 `/api/candidate` 中的 SecondMe API 端点路径
- 检查并修正所有调用 SecondMe 的 API 端点
- 添加更健壮的错误处理和降级逻辑

## Capabilities

### Modified Capabilities

- `secondme-api-integration`: 修正所有 SecondMe API 调用的端点路径和错误处理

## Impact

- **修改文件**:
  - `src/app/api/circle/match/route.ts`
  - `src/app/api/negotiation/[id]/route.ts`
  - `src/app/api/candidate/route.ts`
  - 其他调用 SecondMe API 的文件
- **影响功能**: AI 匹配、候选代理生成、A2A 协商
