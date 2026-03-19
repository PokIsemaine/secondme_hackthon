## 1. Project Setup & Auth

- [x] 1.1 设置 Second Me OAuth 配置（client_id, client_secret, redirect_uri）
- [x] 1.2 实现 OAuth 登录 API 端点（/api/auth/login, /api/auth/callback）
- [x] 1.3 实现 token 刷新逻辑
- [x] 1.4 创建用户会话管理（JWT/Cookie）
- [x] 1.5 创建登录页 UI

## 2. User Profile Module

- [x] 2.1 设计并创建用户画像数据库表（UserProfile）
- [x] 2.2 实现创建/更新画像 API（/api/profile）
- [x] 2.3 实现画像生成 Agent 对话逻辑
- [x] 2.4 创建画像填写页面 UI
- [x] 2.5 实现画像可信度计算逻辑

## 3. Zhihu Integration

- [x] 3.1 实现知乎 API AK/SK 签名工具
- [x] 3.2 实现圈子内容读取 API（/api/circle/posts）
- [x] 3.3 实现评论列表 API（/api/circle/comments）
- [x] 3.4 实现热榜 API（/api/circle/hot）
- [x] 3.5 实现可信搜 API（/api/circle/search，含缓存逻辑）
- [x] 3.6 实现发帖 API（/api/circle/publish）
- [x] 3.7 创建圈子内容浏览页面 UI

## 4. Complement Recognition Engine

- [x] 4.1 设计长板/短板识别 Prompt 模板
- [x] 4.2 实现互补匹配算法
- [x] 4.3 实现协作场景识别逻辑
- [x] 4.4 创建互补发现页面 UI
- [x] 4.5 创建候选对象展示页面 UI

## 5. Candidate Agent Generator

- [x] 5.1 实现基于公开内容的画像推断逻辑
- [x] 5.2 实现候选代理可信度计算
- [x] 5.3 创建候选代理数据结构

## 6. A2A Negotiation Engine (Core)

- [x] 6.1 设计 5 轮协商 Prompt 模板（定义问题 → 交换价值 → 确认边界 → 设计最小合作 → 建议）
- [x] 6.2 实现预协商（Semi-A2A）逻辑
- [x] 6.3 实现正式协商（Full A2A）逻辑
- [x] 6.4 实现协商会话状态管理
- [x] 6.5 实现协商记录存储
- [x] 6.6 实现协商结果生成（共识、分歧、推荐）

## 7. Proposal Generation

- [x] 7.1 实现结构化提案生成逻辑
- [x] 7.2 创建提案展示页面 UI
- [x] 7.3 实现提案状态跟踪

## 8. Post Seeker

- [x] 8.1 实现 Agent 草稿生成逻辑
- [x] 8.2 创建发帖页面 UI
- [ ] 8.3 实现帖子互动追踪逻辑

## 9. Negotiation Room (Key UI)

- [x] 9.1 创建 Agent 协商室页面布局
- [x] 9.2 实现协商过程实时展示
- [x] 9.3 实现共识/分歧可视化
- [x] 9.4 实现真人决策操作按钮（接受、重新生成、请求真实协商、放弃）

## 10. Integration & Polish

- [x] 10.1 实现 MVP 完整用户旅程串联
- [x] 10.2 添加页面路由和权限控制
- [x] 10.3 添加错误处理和 Loading 状态
- [x] 10.4 添加 Demo 演示所需 Mock 数据（用于展示）
