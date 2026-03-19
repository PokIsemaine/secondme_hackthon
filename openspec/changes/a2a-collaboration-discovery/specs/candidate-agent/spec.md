## ADDED Requirements

### Requirement: Generate Candidate Proxy
当对方用户尚未登录时，系统 SHALL 能够基于其公开内容构建"候选代理画像"。

#### Scenario: Build from Posts
- **WHEN** 系统获取目标用户在圈子的帖子内容
- **THEN** 系统使用 LLM 推断其可能擅长的领域、当前在意的问题、沟通风格

#### Scenario: Build from Comments
- **WHEN** 系统获取目标用户的评论历史
- **THEN** 系统分析其评论模式，补充推断画像

### Requirement: Calculate Proxy Confidence
系统 SHALL 计算候选代理画像的可信度分数。

#### Scenario: Calculate Confidence
- **WHEN** 候选代理画像生成时
- **THEN** 系统根据数据来源数量、内容质量推断可信度 (0-1)

### Requirement: Use Candidate for Pre-negotiation
候选代理 SHALL 仅用于预协商阶段，不视为真实授权 Agent。

#### Scenario: Pre-negotiation Mode
- **WHEN** 对方用户未登录时发起协商
- **THEN** 系统使用候选代理参与协商，并明确标注为"候选代理"
