## ADDED Requirements

### Requirement: Display Negotiation Room
系统 SHALL 提供可视化的 Agent 协商室页面，展示双 Agent 协商过程。

#### Scenario: Show Negotiation UI
- **WHEN** 用户进入协商室
- **THEN** 系统展示左侧用户 Agent、右侧对方 Agent/候选代理、中间协商回合流

### Requirement: Show Negotiation Rounds
协商室 SHALL 展示每轮协商的发言摘要。

#### Scenario: Display Rounds
- **WHEN** 协商进行中或结束后
- **THEN** 页面展示每轮的发言内容、发言者、关键摘要

### Requirement: Show Consensus and Disagreements
协商室 SHALL 清晰展示共识点和分歧点。

#### Scenario: Display Results
- **WHEN** 协商完成
- **THEN** 页面突出显示共识摘要、分歧点摘要、推荐合作形式

### Requirement: User Decision Actions
协商室 SHALL 提供真人决策操作按钮。

#### Scenario: Show Actions
- **WHEN** 协商结果展示给用户
- **THEN** 页面提供：接受提案、重新生成、请求真实双 Agent 协商、放弃连接 等按钮

### Requirement: Real-time Negotiation Updates
协商过程 SHALL 支持实时或近实时更新。

#### Scenario: Real-time Updates
- **WHEN** 协商进行中
- **THEN** 页面通过轮询或 WebSocket 获取最新协商状态并更新显示
