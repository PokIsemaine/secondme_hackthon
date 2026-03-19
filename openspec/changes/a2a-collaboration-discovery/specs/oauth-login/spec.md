## ADDED Requirements

### Requirement: OAuth Login
用户 SHALL 能够通过 Second Me OAuth 2.0 完成身份认证并进入应用。

#### Scenario: Successful OAuth Login
- **WHEN** 用户点击"使用 Second Me 登录"按钮并完成 OAuth 流程
- **THEN** 系统获取用户身份信息并创建/更新本地用户记录，返回登录成功状态

#### Scenario: OAuth Login Failure
- **WHEN** OAuth 流程中出现错误（用户拒绝授权、服务端错误等）
- **THEN** 系统显示错误提示，并提供重新登录选项

### Requirement: Get User Agent Capability
系统 SHALL 能够调用已登录用户的 Second Me Agent 进行对话。

#### Scenario: Call User Agent
- **WHEN** 应用需要用户 Agent 参与协商或对话
- **THEN** 系统通过 Second Me Chat API 调用用户 Agent 并获取响应

### Requirement: Token Refresh
系统 SHALL 能够在 Access Token 过期后自动使用 Refresh Token 获取新令牌。

#### Scenario: Token Expired
- **WHEN** API 调用返回 token 过期错误
- **THEN** 系统使用 refresh_token 自动刷新，获取新 access_token 并重试请求
