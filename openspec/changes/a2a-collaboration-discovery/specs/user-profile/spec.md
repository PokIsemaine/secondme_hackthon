## ADDED Requirements

### Requirement: Create User Profile
用户 SHALL 能够创建和管理自己的补位画像，包含以下字段：擅长领域、近期需求、愿提供价值、希望获得帮助、合作边界。

#### Scenario: Create Profile via Form
- **WHEN** 用户主动填写补位画像表单并提交
- **THEN** 系统保存用户画像到数据库，返回保存成功状态

#### Scenario: Create Profile via Agent Conversation
- **WHEN** 用户通过与自己 Agent 的盘点式对话生成画像
- **THEN** 系统解析 Agent 对话结果，提取并保存画像字段

### Requirement: Update User Profile
用户 SHALL 能够随时更新自己的补位画像。

#### Scenario: Update Existing Profile
- **WHEN** 用户修改已有画像的任意字段并提交
- **THEN** 系统更新数据库记录，返回更新成功状态

### Requirement: Get User Profile
系统 SHALL 能够获取当前用户的补位画像。

#### Scenario: Fetch Profile
- **WHEN** 用户请求查看自己的补位画像
- **THEN** 系统返回完整的画像数据，包含各字段及画像可信度

### Requirement: Calculate Profile Confidence
系统 SHALL 根据画像数据来源计算并显示画像可信度。

#### Scenario: Calculate Confidence
- **WHEN** 画像创建或更新时
- **THEN** 系统根据数据完整度、来源可靠性等因素计算 confidence 分数 (0-1)
