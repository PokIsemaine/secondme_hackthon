## Why

当前用户画像依赖手动表单填写或简单的 API 数据拉取，无法生成深度的"分身 Agent 画像"。通过让 Second Me Agent 自省（self-introspection）生成结构化画像，可以更准确地反映用户的真实能力、盲区和协作偏好，为 A2A 协商和候选代理匹配提供更可靠的数据基础。

## What Changes

- 新增 `POST /api/user/profile/generate` 接口，触发分身画像实时生成
- 改造 `GET /api/user/profile` 接口，返回完整的 `profileJson` 结构
- 扩展 Prisma `User` 表，新增 `profileJson` TEXT 字段存储完整画像
- 实现数据拉取 pipeline：并行获取 user/info、shades、softmemory、chat/sessions 并压缩
- 使用 `act/stream` (action="generate_profile") 输出结构化 JSON
- Fallback 到 `chat/stream` 生成 `naturalLanguagePreview` 备选描述
- 画像生成在用户登录时自动触发，也支持用户手动刷新

## Capabilities

### New Capabilities

- `avatar-profile`: 分身画像生成能力。根据 Second Me 多维度数据（基本信息、兴趣标签、软记忆、对话历史），通过 act/stream 自省生成结构化 JSON 画像和自然语言预览，包含 personality、expertise、blindspots、collaboration、needs、offerings 等维度。

### Modified Capabilities

- `user-profile`: 修改画像生成方式，从"用户手动填写+简单 API 拉取"改为"基于 act/stream 自省的实时生成"。不影响现有 GET 接口的返回结构，但 profile 数据来源和 confidence 计算方式有变化。

## Impact

- **新增 API**: `POST /api/user/profile/generate`
- **修改 API**: `GET /api/user/profile` (返回结构扩展)
- **数据库**: Prisma User 表新增 `profileJson` 字段
- **外部依赖**: Second Me API `/act/stream` (action=generate_profile) 和 `/chat/stream`
- **触发点**: OAuth 登录成功回调 + 用户手动刷新按钮
