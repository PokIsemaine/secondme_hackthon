## MODIFIED Requirements

### Requirement: SecondMe API Endpoint Fix
所有调用 SecondMe AI 功能的 API SHALL 使用正确的端点路径。

#### Scenario: Circle Match API
- **WHEN** 调用 /api/circle/match 进行 AI 匹配
- **THEN** 使用正确的 SecondMe API 端点，返回匹配结果

#### Scenario: Negotiation API
- **WHEN** 调用 /api/negotiation/[id]/execute 执行 A2A 协商
- **THEN** 使用正确的 SecondMe API 端点，返回协商结果

#### Scenario: Candidate Proxy API
- **WHEN** 调用 /api/candidate 创建候选代理
- **THEN** 使用正确的 SecondMe API 端点，返回候选代理画像

#### Scenario: Seeker Draft API
- **WHEN** 调用 /api/seeker/draft 生成发帖草稿
- **THEN** 使用正确的 SecondMe API 端点，返回草稿内容
