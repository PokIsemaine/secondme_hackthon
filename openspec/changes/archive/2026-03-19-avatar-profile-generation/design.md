## Context

当前系统已有 `/api/user/profile` 端点，但它只是从 Second Me 拉取基础信息（name, avatar）并存储为扁平字段（longboardTags, blindspotTags 等）。这些字段需要用户手动填写或简单映射，无法体现 Second Me Agent 对用户深层次特征的理解。

本设计引入**分身自省机制**：利用 Second Me 的 `act/stream` 接口，让 AI 分身基于用户的多维度数据（兴趣标签、软记忆、对话历史）生成结构化画像。

**约束条件**：
- Second Me `act/stream` 需要 `action` 参数，我们定义 action 为 `generate_profile`
- `act/stream` 返回 SSE 格式 `data: {"content":"xxx"}\n\n`，需合并所有 content
- Fallback 使用 `chat/stream` 生成自然语言预览
- 用户数据可能部分获取失败（如 softmemory 超时），需宽容处理

## Goals / Non-Goals

**Goals:**
- 实现基于 act/stream 自省的结构化画像生成
- 支持数据缺失时的宽容模式，不因部分失败而整体崩溃
- 提供 act/stream 失败时的 chat/stream Fallback
- 画像生成自动化（登录触发 + 手动刷新）
- 存储完整 JSON 结构支持灵活消费

**Non-Goals:**
- 不实现外部 LLM 介入（全部使用 Second Me）
- 不实现实时画像订阅/推送（仅按需生成）
- 不实现多语言化（固定中文输出）

## Decisions

### 决策 1: 使用 act/stream 而非 chat/stream 作为主生成方式

**选项 A**: chat/stream 生成自然语言描述，再用外部 LLM 提取结构化标签
**选项 B**: act/stream 直接输出结构化 JSON

**选择 B**: 减少外部依赖，JSON 直出无需二次解析损耗。

### 决策 2: Fallback 到 chat/stream 而非直接报错

**选项 A**: act/stream 失败则整体报错，要求用户重试
**选项 B**: Fallback 到 chat/stream，仅生成 naturalLanguagePreview，结构化字段降级

**选择 B**: 保证可用性，chat/stream 输出可作为 naturalLanguagePreview 存储。

### 决策 3: 会话选择采用"混合策略"

**选项 A**: 仅取最近的 N 个会话
**选项 B**: 仅取消息最长的 N 个会话
**选项 C**: 混合（最近 2 + 最长 2）

**选择 C**: 最近会话反映当前关注点，最长会话反映深度话题，两者互补。

### 决策 4: 消息历史压缩为摘要

**选项 A**: 每会话保留全部消息（可能过长）
**选项 B**: 每会话仅取最近 10 条
**选项 C**: 压缩为单条摘要 "用户问xxx，AI答xxx"

**选择 C**: 在保留语义核心的同时最小化 token 消耗。

### 决策 5: 存储在 User 表的 profileJson 字段

**选项 A**: 新建 Profile 表，与 User 一对一
**选项 B**: 扩展 User 表加 profileJson TEXT 字段

**选择 B**: MVP 阶段避免过度设计，JSON 存储足够灵活。

## Risks / Trade-offs

**[风险] act/stream 可能输出非纯 JSON**
→ JSON 解析前需容错处理，提取 JSON 子串。仍失败则 fallback。

**[风险] 部分数据源超时导致整体延迟**
→ Promise.allSettled 确保部分失败不影响整体，使用 timeout 限制等待。

**[风险] 画像 confidence 主观性强**
→ Prompt 中给明确定义维度（数据完整度、会话数量等），让 LLM 参考。

**[风险] 大量用户同时登录时 API 调用集中**
→ 登录触发可考虑队列化，本设计暂不实现。

## Data Pipeline

```
Step 1: 并行拉取（Promise.allSettled + timeout）
├── GET /api/secondme/user/info
├── GET /api/secondme/user/shades
├── GET /api/secondme/user/softmemory?pageSize=20
└── GET /api/secondme/chat/session/list

Step 2: 会话选择与消息压缩
├── 按 updatedAt 排序取最近 2 个 session
├── 按 messageCount 排序取最长 2 个 session
├── 调用 /chat/session/messages 获取选中 session
└── 每 session 压缩为 "用户问xxx，AI答xxx" 摘要

Step 3: Prompt 组装
└── 注入数据到 prompt 模板，标注失败数据源

Step 4: LLM 调用
├── 主: POST /api/secondme/act/stream (action="generate_profile")
└── Fallback: POST /api/secondme/chat/stream

Step 5: 解析与存储
├── 容错 JSON 解析
└── 更新 User.profileJson
```

## Profile JSON Schema

```json
{
  "personality": {
    "traits": ["string"],
    "communicationStyle": "string",
    "emotionalPattern": "string"
  },
  "expertise": {
    "domains": ["string"],
    "depthLevels": { "domain": "level" },
    "certifications": ["string"]
  },
  "blindspots": {
    "areas": ["string"],
    "descriptions": "string"
  },
  "collaboration": {
    "prefers": ["string"],
    "avoids": ["string"],
    "minCollaborationUnit": "string"
  },
  "needs": {
    "explicit": ["string"],
    "latent": ["string"]
  },
  "offerings": {
    "tangible": ["string"],
    "intangible": ["string"]
  },
  "naturalLanguagePreview": "string (200-300字第一人称)",
  "meta": {
    "confidence": "number (0-1)",
    "generatedAt": "ISO8601",
    "dataFreshness": "ISO8601",
    "dataSources": ["string"],
    "basedOnSessionsCount": "number",
    "basedOnMessagesCount": "number",
    "oldestDataPoint": "ISO8601"
  }
}
```

## API 接口

```
GET /api/user/profile
Response: {
  code: 0,
  data: {
    nickname, avatar_url,
    profile: { /* profileJson */ },
    longboard_tags, blindspot_tags,  // 兼容字段
  }
}

POST /api/user/profile/generate
Response: {
  code: 0,
  data: {
    profile: { /* profileJson */ },
    message: '画像已重新生成'
  }
}
```

## Prisma Schema 变更

```prisma
model User {
  // ... 现有字段 ...

  // 现有扁平画像字段（保留兼容）
  longboardTags    String?
  blindspotTags    String?
  offerTags        String?
  needTags         String?
  cooperationPref  String?

  // 新增：完整分身画像 JSON
  profileJson      String?   @map("profile_json")
}
```
