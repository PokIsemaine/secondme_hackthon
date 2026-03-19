## ADDED Requirements

### Requirement: 流式协商 SSE 端点

系统 SHALL 提供 `GET /api/negotiation/[id]/stream` 端点，以 SSE 格式流式推送每轮 token 到前端。

#### Scenario: 流式返回 Round 1 token
- **WHEN** 前端请求 `GET /api/negotiation/[id]/stream`
- **THEN** 系统立即开始流式返回 Round 1 的 token，每个 token 格式为 `data: {"round":1,"speaker":"my_agent","done":false,"content":"xxx"}\n`

#### Scenario: Round 完成时返回 summary
- **WHEN** Round 1 所有 token 发送完毕
- **THEN** 系统发送 `data: {"round":1,"speaker":"my_agent","done":true,"summary":"摘要内容"}\n`

#### Scenario: 5 轮全部完成后发送 DONE
- **WHEN** 5 轮协商全部完成
- **THEN** 系统发送 `data: [DONE]\n` 并关闭流

### Requirement: 前端实时渲染协商过程

前端 SHALL 在接收到 SSE token 时实时渲染到 DOM，用户无需等待即可看到对话过程。

#### Scenario: Token 实时追加到 DOM
- **WHEN** 前端收到 `{"round":1,"speaker":"my_agent","done":false,"content":"token"}`
- **THEN** token 被追加到当前 round 的内容显示区域

#### Scenario: Round 完成显示 summary
- **WHEN** 前端收到 `{"round":1,"speaker":"my_agent","done":true,"summary":"..."}`
- **THEN** 当前 round 显示 summary 高亮，并开始显示下一个 round
