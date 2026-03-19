## ADDED Requirements

### Requirement: Draft Seek Help Post
用户 SHALL 能够填写"求补位"内容并由 Agent 生成发帖草稿。

#### Scenario: Generate Draft
- **WHEN** 用户填写：当前卡住的问题、能提供的交换价值、希望获得的帮助
- **THEN** 系统调用用户 Agent 生成自然语言发帖草稿

### Requirement: Edit and Publish Draft
用户 SHALL 能够编辑 Agent 生成的草稿并发布到指定圈子。

#### Scenario: Publish Pin
- **WHEN** 用户确认草稿内容并选择发布圈子
- **THEN** 系统调用知乎发布 API 将内容发布到白名单圈子

### Requirement: Track Post Engagement
系统 SHALL 追踪用户发布的帖子收到的评论和互动。

#### Scenario: Monitor Comments
- **WHEN** 用户发布的帖子有新评论
- **THEN** 系统记录评论内容，并触发互补识别逻辑检测潜在补位者
