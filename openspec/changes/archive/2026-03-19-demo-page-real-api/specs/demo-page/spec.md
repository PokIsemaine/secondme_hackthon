## MODIFIED Requirements

### Requirement: Demo Page Displays Full User Journey
Demo 页面 SHALL 展示 PRD v2 定义的完整 6 步用户旅程，使用真实 API 数据。

#### Scenario: Unauthenticated User Views Demo
- **WHEN** 未登录用户访问 /demo 页面
- **THEN** 页面展示欢迎信息和登录引导，点击后可跳转登录或继续查看 Demo 介绍

#### Scenario: Authenticated User Starts Demo Journey
- **WHEN** 已登录用户开始 Demo 流程
- **THEN** 页面调用 /api/user/profile 获取用户画像并展示

#### Scenario: User Views Circle Content
- **WHEN** 用户进入"发现内容"步骤
- **THEN** 页面调用 /api/zhihu/ring 获取圈子帖子列表

#### Scenario: User Triggers AI Matching
- **WHEN** 用户点击"AI 智能匹配"按钮
- **THEN** 页面调用 /api/circle/match 进行互补匹配分析

#### Scenario: User Initiates A2A Negotiation
- **WHEN** 用户选择某候选对象并点击"发起协商"
- **THEN** 页面调用 /api/negotiation 创建协商会话，然后调用 /execute 执行 5 轮协商

#### Scenario: User Views Negotiation Results
- **WHEN** 协商完成
- **THEN** 页面展示协商结果：共识、分歧、推荐合作形式

#### Scenario: User Accepts Proposal
- **WHEN** 用户点击"接受提案"按钮
- **THEN** 页面调用 /api/proposal 创建提案，显示成功消息

### Requirement: Demo Supports Mock Data Fallback
当 API 调用失败时，Demo 页面 SHALL 降级到 mock 数据展示，保证演示可用性。

#### Scenario: API Call Fails
- **WHEN** API 调用返回错误或超时
- **THEN** 页面自动使用 mock 数据展示对应步骤内容，并显示"演示模式"提示
