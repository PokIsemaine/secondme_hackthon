## ADDED Requirements

### Requirement: 所有帖子均返回匹配分数

系统 SHALL 对每个输入帖子返回 0-100 的匹配分数，反映用户画像与帖子的相关程度。

#### Scenario: AI 正常打分
- **WHEN** 用户进入 Step 2 AI 匹配页面
- **THEN** 所有帖子均返回匹配分数（0-100）
- **AND** 结果按分数降序排列

#### Scenario: AI 返回部分分数
- **WHEN** AI 对部分帖子返回分数，其他帖子缺失
- **THEN** 缺失的帖子以随机低分（0-10）填充
- **AND** 所有帖子均出现在结果列表中

### Requirement: 匹配结果按分数降序排序

系统 SHALL 按 `matchScore` 降序排列所有匹配结果。

#### Scenario: 结果按分数排序
- **WHEN** 匹配结果生成完毕
- **THEN** 结果数组中 `matchScore` 递减排列
