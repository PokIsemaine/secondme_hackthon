## Why

当前推荐系统擅长找"相似的人"，但不擅长找"互补的人"。用户在真实讨论中暴露的"问题"和"长板"信号通常不会被转化为合作机会。本产品解决的核心问题是：**如何让"谁能补谁"的关系在真实讨论中被识别出来，并由双方 Agent 先完成低成本协商**。黑客松要求作品必须体现 A2A，知乎开放了两个专属圈子的内容读写能力，Second Me 提供用户身份与 Agent 对话能力，这为 A2A 协作发现产品提供了完美的技术基础。

## What Changes

- 新增 Second Me OAuth 登录能力，用户通过 OAuth 绑定真实 Agent
- 新增用户补位画像模块，用户可主动填写或通过 Agent 对话生成"擅长什么、需要什么、愿提供什么"
- 新增知乎圈子内容读取能力，仅限两个白名单圈子 (2001009660925334090, 2015023739549529606)
- 新增互补识别引擎，基于讨论信号识别长板标签与短板标签
- 新增候选代理生成器，根据对方公开内容构建"候选代理画像"用于预协商
- **新增双 Agent 协商引擎（核心）**，实现两阶段 A2A：预协商(Semi-A2A)和正式协商(Full A2A)
- 新增协作提案生成器，将协商结果沉淀为结构化提案
- 新增"求补位发帖"功能，Agent 生成草稿后发布到指定圈子
- 新增 Agent 协商室页面，可视化展示双 Agent 协商过程

## Capabilities

### New Capabilities

- `oauth-login`: Second Me OAuth 2.0 认证登录，获取用户身份与 Agent 调用能力
- `user-profile`: 用户补位画像管理，包含长板/短板/愿提供/需获得/合作边界
- `circle-content`: 知乎指定圈子内容读取，包括帖子、评论、热榜
- `complement-recognition`: 互补识别引擎，识别长板标签、短板标签、协作场景
- `candidate-agent`: 候选代理生成器，基于公开内容构建对方代理画像
- `a2a-negotiation`: 双 Agent 协商引擎，核心功能，支持预协商与正式协商
- `proposal-generation`: 协作提案生成，将协商结果输出为结构化提案
- `post-seeker`: 求补位发帖，Agent 生成草稿后发布到白名单圈子
- `negotiation-room`: Agent 协商室页面，可视化 A2A 协商过程

### Modified Capabilities

- (无) 全新项目，无现有能力修改

## Impact

- **后端 API**: 新增 /api/auth, /api/profile, /api/circle, /api/negotiation, /api/proposal 等端点
- **数据库**: 新增用户画像、候选代理、协商记录、合作提案等表
- **前端页面**: 新增登录页、画像页、圈子发现页、协商室、提案页、发帖页
- **外部集成**: Second Me OAuth + Agent Chat API，知乎开放平台 API
- **依赖**: 需要应用侧 LLM 用于总结/判断（Second Me 仅提供 Agent chat 能力）
