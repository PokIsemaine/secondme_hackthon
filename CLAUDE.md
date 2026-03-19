# SecondMe 集成项目 - 认知盲区拼图

## 应用信息

- **App Name**: secondme_hackthon
- **项目名称**: 认知盲区拼图 (Blindspot Puzzle)
- **Client ID**: eedfc0d1-ef8a-43b8-950e-f33d3b1856e0
- **一句话定位**: 在知乎指定圈子的真实讨论里，识别"谁缺什么、谁会什么"，让 Second Me 分身先完成互补分析与协作撮合，再决定真人是否连接。

## API 文档

开发时请参考官方文档（从 `.secondme/state.json` 的 `docs` 字段读取）：

| 文档 | 配置键 |
|------|--------|
| 快速入门 | `docs.quickstart` |
| OAuth2 认证 | `docs.oauth2` |
| API 参考 | `docs.api_reference` |
| 错误码 | `docs.errors` |

## 关键信息

- API 基础 URL: https://api.mindverse.com/gate/lab
- OAuth 授权 URL: https://go.second.me/oauth/
- Access Token 有效期: 2 小时
- Refresh Token 有效期: 30 天

> 所有 API 端点配置请参考 `.secondme/state.json` 中的 `api` 和 `docs` 字段

## 已选模块

- auth - OAuth 认证
- profile - 用户信息展示 (user.info.shades, user.info.softmemory)
- chat - 聊天功能
- act - 结构化动作判断
- note - 笔记功能

## 权限列表 (Scopes)

根据 App Info 中的 Allowed Scopes：

| 权限 | 说明 | 状态 |
|------|------|------|
| user.info | 用户基础信息 | ✅ 已授权 |
| user.info.shades | 用户兴趣标签 | ✅ 已授权 |
| user.info.softmemory | 用户软记忆 | ✅ 已授权 |
| chat | 聊天功能 | ✅ 已授权 |
| note.add | 添加笔记 | ✅ 已授权 |
| voice | 语音功能 | ℹ️ 暂不生成代码 |

## 产品需求 (PRD)

### 目标用户
有明确专业长板的人、有现实问题待解决的人、不擅长主动社交但愿意合作的人、希望借助 Agent 完成前置沟通的人

### 核心功能
1. Second Me OAuth 登录
2. 用户互补画像生成（长板/短板识别）
3. 知乎指定圈子内容读取
4. 基于帖子/评论的互补分析
5. Agent 合作提案生成
6. 发帖「求补位」功能

### MVP 范围
**必做：**
- Second Me OAuth 登录
- 用户画像表单 + 分身盘点
- 指定圈子帖子流读取
- 基于帖子/评论的互补分析
- 输出合作提案
- 发帖「求补位」能力

**可选增强：**
- 热榜增强上下文
- 可信搜增强提案依据
- 评论互动闭环
- 点赞反馈机制

### 知乎圈子限制
- 只支持两个指定圈子: `2001009660925334090`, `2015023739549529606`
- 仅支持在这两个圈子里发内容
- 点赞仅对白名单圈子内容生效
