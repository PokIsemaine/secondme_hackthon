## ADDED Requirements

### Requirement: Generate Avatar Profile via Self-Introspection
系统 SHALL 能够根据 Second Me 多维度数据，通过 act/stream 自省生成结构化分身画像 JSON。

#### Scenario: Successful profile generation with act/stream
- **WHEN** 用户触发画像生成（登录或手动刷新）
- **THEN** 系统并行拉取 user/info、user/shades、user/softmemory、chat/session/list
- **AND** 系统选择最近 2 + 最长 2 个会话获取消息并压缩为摘要
- **AND** 系统组装 prompt 并调用 act/stream (action="generate_profile")
- **AND** 系统解析 JSON 输出并存储到 User.profileJson

#### Scenario: Fallback to chat/stream when act/stream fails
- **WHEN** act/stream 调用失败或 JSON 解析失败
- **THEN** 系统 fallback 到 chat/stream 生成自然语言预览
- **AND** naturalLanguagePreview 字段被填充，结构化字段记录降级状态

#### Scenario: Partial data source failure (graceful degradation)
- **WHEN** 部分数据源获取失败（如 softmemory 超时）
- **THEN** 系统继续处理可用的数据
- **AND** Prompt 中标注数据可用性声明
- **AND** LLM 根据可用数据推断 confidence 分数

### Requirement: Retrieve Avatar Profile
系统 SHALL 能够返回当前用户的完整分身画像。

#### Scenario: Fetch cached profile
- **WHEN** GET /api/user/profile 被调用
- **THEN** 系统返回 profileJson 中的完整画像数据
- **AND** 返回兼容字段 longboard_tags、blindspot_tags（从 profileJson 映射）

### Requirement: Manual Profile Regeneration
系统 SHALL 支持用户手动触发画像重新生成。

#### Scenario: User triggers manual regeneration
- **WHEN** 用户点击"刷新画像"按钮
- **THEN** POST /api/user/profile/generate 被调用
- **AND** 旧画像被新画像替换
- **AND** 返回新的 profileJson 和成功消息

### Requirement: Profile Generation Triggered on Login
系统 SHALL 在用户 OAuth 登录成功后自动触发画像生成。

#### Scenario: Auto-generate profile after first login
- **WHEN** 用户完成 OAuth 登录回调
- **THEN** 系统自动调用画像生成 pipeline
- **AND** 新用户获得基于初始数据的分身画像

### Requirement: JSON Schema Structure
分身画像 JSON SHALL 包含以下顶层字段：personality、expertise、blindspots、collaboration、needs、offerings、naturalLanguagePreview、meta。

#### Scenario: Profile contains all required fields
- **WHEN** 画像生成成功
- **THEN** 返回的 profileJson 包含 personality（traits, communicationStyle, emotionalPattern）
- **AND** expertise（domains, depthLevels, certifications）
- **AND** blindspots（areas, descriptions）
- **AND** collaboration（prefers, avoids, minCollaborationUnit）
- **AND** needs（explicit, latent）
- **AND** offerings（tangible, intangible）
- **AND** naturalLanguagePreview（200-300 字第一人称描述）
- **AND** meta（confidence, generatedAt, dataSources, basedOnSessionsCount, basedOnMessagesCount, oldestDataPoint）

### Requirement: Confidence Score Calculation
系统 SHALL 让 LLM 根据数据完整度自行判断 confidence 分数（0-1）。

#### Scenario: Confidence reflects data completeness
- **WHEN** LLM 生成画像时
- **THEN** confidence 应考虑：字段缺失情况、会话数量级、softmemory 可用性、bio/self_introduction 是否填写
- **AND** 数据越完整 confidence 越高
