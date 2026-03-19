## ADDED Requirements

### Requirement: Initiate Pre-negotiation (Semi-A2A)
当对方用户未登录时，系统 SHALL 发起预协商，使用用户真实 Agent 与候选代理进行协商。

#### Scenario: Start Semi-A2A
- **WHEN** 用户选择与某潜在互补对象发起协商，且对方未登录
- **THEN** 系统创建协商会话，使用用户真实 Agent 与候选代理进行 5 轮固定模板协商

### Requirement: Initiate Full A2A
当对方用户已登录并授权后，系统 SHALL 发起正式双 Agent 协商。

#### Scenario: Start Full A2A
- **WHEN** 对方用户接受邀请并完成登录授权
- **THEN** 系统将协商会话升级为 Full A2A，使用双方真实 Agent 进行协商

### Requirement: Execute 5-Round Negotiation Template
协商 SHALL 遵循固定 5 轮模板：定义问题 → 交换价值 → 确认边界 → 设计最小合作形式 → 建议继续/终止。

#### Scenario: Round 1 - Define Problem
- **WHEN** 协商第 1 轮
- **THEN** Agent 明确当前要解决的具体问题是什么

#### Scenario: Round 2 - Exchange Value
- **WHEN** 协商第 2 轮
- **THEN** 双方 Agent 各自说明能提供什么价值

#### Scenario: Round 3 - Confirm Boundaries
- **WHEN** 协商第 3 轮
- **THEN** 双方 Agent 明确各自的合作边界和限制

#### Scenario: Round 4 - Design Minimum Collaboration
- **WHEN** 协商第 4 轮
- **THEN** Agent 提出最低成本可执行的协作形式

#### Scenario: Round 5 - Recommend Continuation
- **WHEN** 协商第 5 轮
- **THEN** Agent 给出继续或终止的建议及理由

### Requirement: Generate Negotiation Summary
协商完成后，系统 SHALL 输出协商记录、共识摘要、分歧点摘要、推荐合作形式。

#### Scenario: Output Summary
- **WHEN** 5 轮协商结束
- **THEN** 系统输出结构化协商结果，包含共识、分歧、推荐形式、建议投入时长、是否建议真人接入
