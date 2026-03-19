## MODIFIED Requirements

### Requirement: Find Complementary Users

系统 SHALL 能够在圈子中识别与当前用户互补的潜在对象。

#### Scenario: Match Complement with Structured Reason
- **WHEN** 用户 A 的长板匹配用户 B 的短板，且双方处于同一讨论语境
- **THEN** 系统输出互补匹配结果，包含匹配度评分（0-100）和结构化互补理由对象

#### Scenario: Structured Reason Object Format
- **WHEN** AI 完成互补分析后
- **THEN** `reason` 字段为对象而非字符串，包含：
  - `complementType`：类型标签（"能力互补" | "认知互补" | "双向互助" | "相关"）
  - `thesis.forYou`：你能帮对方的论点（string）
  - `thesis.forThem`：对方能帮你的论点（string）
  - `detailLevel`：建议详略程度（"detailed" | "brief"）

#### Scenario: Detail Level Based on Score
- **WHEN** `matchScore >= 85`
- **THEN** `detailLevel` 为 `"detailed"`，AI 应生成详细双向论点
- **WHEN** `matchScore < 85`
- **THEN** `detailLevel` 为 `"brief"`，AI 可生成简短单向论点

#### Scenario: Backward Compatible Fallback
- **WHEN** AI 返回的 `reason` 为字符串而非对象
- **THEN** 系统将字符串作为 `thesis.forYou` 回退使用
- **AND** `complementType` 默认为 "相关"
