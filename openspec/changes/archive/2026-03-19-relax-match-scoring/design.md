## Context

当前 `/api/circle/match` 的 AI 匹配 prompt 只返回存在明确互补关系的帖子，其他帖子被丢弃，导致结果为空。

现有逻辑：
1. AI 返回 JSON 数组，只包含有互补关系的帖子
2. 如果 AI 返回空数组或解析失败，所有帖子得到 50% 分数
3. 前端按插入顺序展示，无排序

目标：AI 对所有帖子打分（0-100），按分数降序排列展示。

## Goals / Non-Goals

**Goals:**
- 对每个帖子输出 0-100 的匹配分数
- 分数反映"用户画像与帖子的相关程度"
- 按分数降序排列所有结果
- 保持 `complementType` 作为辅助信息展示

**Non-Goals:**
- 不改变 API 响应结构（仍返回 `matches` 数组）
- 不改变前端 UI 卡片样式（只调整排序）

## Decisions

### 1. 修改 AI prompt，改为全员打分

**方案**：prompt 指示 AI 对每个帖子输出 `score`（0-100）和 `reason`，`complementType` 作为参考标签。

```typescript
// 每个帖子返回：
{ index: 0, score: 85, complementType: "双向互补", reason: "..." }
// 而非仅返回有互补关系的帖子
```

### 2. 解析与降序排序

```typescript
const matches = analysisResults
  .filter(r => r.index >= 0 && r.index < posts.length)
  .map(r => ({
    post: posts[r.index],
    matchScore: r.score / 100,
    matchReason: r.reason,
    complementType: r.complementType,
  }))
  .sort((a, b) => b.matchScore - a.matchScore) // 降序
```

### 3. 放宽 fallback 逻辑

当 AI 返回为空或解析失败时，生成 0-10 的随机分数（而非固定 50%），保证总有一些低分结果可供展示。

## Risks / Trade-offs

- [Risk] AI 打分标准不一致 → 最低分数兜底
- [Risk] 分数都很低导致体验差 → UI 可考虑按阈值分组展示
