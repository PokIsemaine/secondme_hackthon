## ADDED Requirements

### Requirement: Two-Level Match Reason Display

匹配结果的理由展示分两级，第一级为类型标签，第二级为双向论点详情。

#### Scenario: Display Collapsed Reason Card
- **WHEN** 匹配结果渲染时
- **THEN** 卡片默认折叠至第一级，仅显示类型标签（如"能力互补"）和 `thesis.forYou` 单向摘要

#### Scenario: Expand Reason Card
- **WHEN** 用户点击折叠的匹配卡片
- **THEN** 卡片展开至第二级，同时显示 `thesis.forYou` 和 `thesis.forThem` 双向论点

### Requirement: Dynamic Detail Level Based on Score

匹配分数决定理由展示详细程度，85% 及以上为详细模式，以下为简短模式。

#### Scenario: High Score Detailed Display
- **WHEN** `matchScore >= 0.85`
- **THEN** `detailLevel` 为 `"detailed"`，卡片默认展开显示完整双向论点

#### Scenario: Low Score Brief Display
- **WHEN** `matchScore < 0.85`
- **THEN** `detailLevel` 为 `"brief"`，卡片默认折叠，用户需点击展开

### Requirement: Reason Object Structure

匹配理由以结构化对象形式返回，包含类型标签、双向论点和建议详略程度。

#### Scenario: AI Returns Structured Reason
- **WHEN** AI 分析完成后
- **THEN** `reason` 字段为对象，包含 `complementType`（string）、`thesis.forYou`（string）、`thesis.forThem`（string）、`detailLevel`（"detailed" | "brief"）

#### Scenario: Reason Fields Fallback
- **WHEN** `reason` 对象字段缺失或格式异常时
- **THEN** 系统使用 `matchReason` 字符串作为 `thesis.forYou` 的回退值
- **AND** `complementType` 默认为 "相关"
- **AND** `detailLevel` 默认为 "brief"
