## ADDED Requirements

### Requirement: Identify User Strengths
系统 SHALL 能够基于用户在圈子中的讨论行为识别其能力长板标签。

#### Scenario: Recognize Strength Tags
- **WHEN** 系统分析用户在圈子的帖子、评论内容
- **THEN** 系统输出长板标签列表（如：PRD梳理、技术架构判断、增长实验设计），包含置信度

### Requirement: Identify User Weaknesses
系统 SHALL 能够基于用户讨论中的求助、追问、困惑信号识别其认知短板。

#### Scenario: Recognize Weakness Tags
- **WHEN** 系统分析用户在圈子中的求助帖、追问、卡点表达
- **THEN** 系统输出短板标签列表（如：技术落地、商业化视角、产品表达），包含置信度

### Requirement: Find Complementary Users
系统 SHALL 能够在圈子中识别与当前用户互补的潜在对象。

#### Scenario: Match Complement
- **WHEN** 用户 A 的长板匹配用户 B 的短板，且双方处于同一讨论语境
- **THEN** 系统输出互补匹配结果，包含匹配度评分和互补理由

### Requirement: Get Collaboration Scenarios
系统 SHALL 能够识别双方可能的协作场景标签。

#### Scenario: Identify Scenarios
- **WHEN** 系统识别出互补匹配后
- **THEN** 系统输出建议的协作场景（如：30分钟问题对焦、PRD评审、技术方案讨论）
