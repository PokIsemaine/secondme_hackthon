## ADDED Requirements

### Requirement: List Circle Posts
系统 SHALL 能够获取指定知乎圈子的帖子列表。

#### Scenario: Fetch Circle Posts
- **WHEN** 用户请求浏览某圈子（ID: 2001009660925334090 或 2015023739549529606）的帖子
- **THEN** 系统返回该圈子的帖子列表，包含帖子ID、标题、作者、摘要、发布时间

### Requirement: Get Post Comments
系统 SHALL 能够获取指定帖子的评论列表。

#### Scenario: Fetch Post Comments
- **WHEN** 用户请求查看某帖子的评论
- **THEN** 系统返回该帖子的评论列表，包含评论内容、作者、发布时间

### Requirement: Get Hot Topics
系统 SHALL 能够获取知乎热榜话题。

#### Scenario: Fetch Hot Topics
- **WHEN** 用户请求获取热榜话题
- **THEN** 系统返回当前热榜话题列表（使用 /openapi/billboard/list）

### Requirement: Search Trusted Content
系统 SHALL 能够使用全网可信搜搜索相关内容（需缓存以控制调用量）。

#### Scenario: Search with Cache
- **WHEN** 用户发起可信搜请求
- **THEN** 系统先检查缓存，命中则返回缓存数据；未命中则调用 API 并缓存结果

### Requirement: Post to Circle
用户 SHALL 能够在指定圈子发布"求补位"想法。

#### Scenario: Publish Pin
- **WHEN** 用户填写问题描述、愿提供的价值、希望获得的帮助并确认发布
- **THEN** 系统调用知乎发布 API 将内容发布到白名单圈子，返回发布成功状态
