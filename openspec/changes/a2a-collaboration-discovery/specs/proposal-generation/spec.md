## ADDED Requirements

### Requirement: Generate Collaboration Proposal
协商结束后，系统 SHALL 生成结构化合作提案。

#### Scenario: Generate Proposal
- **WHEN** 双 Agent 协商完成
- **THEN** 系统生成包含以下字段的结构化提案：协作主题、互补原因、双方各自提供的价值、推荐开始方式、风险与边界、建议下一步行动

### Requirement: Display Proposal to User
系统 SHALL 将合作提案展示给用户，供其决策。

#### Scenario: Show Proposal
- **WHEN** 用户查看协商结果
- **THEN** 系统展示完整的合作提案页面，包含接受、重新生成、请求真实协商、放弃等操作选项

### Requirement: Track Proposal Status
系统 SHALL 跟踪提案状态：generated → viewed → accepted/rejected。

#### Scenario: Update Status
- **WHEN** 用户对提案进行操作
- **THEN** 系统更新提案状态并记录时间戳
