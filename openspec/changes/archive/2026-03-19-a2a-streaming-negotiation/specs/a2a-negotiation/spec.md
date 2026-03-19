## MODIFIED Requirements

### Requirement: Execute 5-Round Negotiation Template

**原行为**：5 轮协商在服务端全部执行完毕后，通过 `POST /api/negotiation/[id]` 返回包含所有 round 完整内容的 JSON 数组。

**新行为**：5 轮协商通过 `GET /api/negotiation/[id]/stream` SSE 端点流式执行，每轮的 token 实时推送到前端，round 完成后推送 `done:true` 和 `summary`。

#### Scenario: 流式执行 Round 1
- **WHEN** 前端连接 `GET /api/negotiation/[id]/stream`
- **THEN** 系统执行 Round 1 并将每个 token 实时推送，Round 完成后推送 summary

#### Scenario: Round 2-5 顺序流式执行
- **WHEN** Round 1 完成后
- **THEN** 系统继续执行 Round 2-5，每个 token 实时推送，每个 Round 完成后推送 summary

#### Scenario: 5 轮全部完成
- **WHEN** Round 5 完成后
- **THEN** 系统推送 `[DONE]` 并关闭 SSE 流

### Requirement: Generate Negotiation Summary

**原行为**：协商完成后通过 `POST /api/negotiation/[id]` 返回结构化 JSON。

**新行为**：协商完成后，通过 SSE 流推送最终结构化数据 `{status:"completed", consensus, recommendedForm, shouldContinue}`。

#### Scenario: 流式完成后推送最终结果
- **WHEN** 5 轮流式执行完毕
- **THEN** 系统在 `[DONE]` 之前推送 `data: {"type":"result","status":"completed","consensus":"...","recommendedForm":"...","shouldContinue":true}\n`
