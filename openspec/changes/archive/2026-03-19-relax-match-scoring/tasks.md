## 1. API Route 修改

- [x] 1.1 修改 `route.ts` 中的 prompt，指示 AI 对每个帖子输出 score（0-100）
- [x] 1.2 更新解析逻辑，为每个帖子提取 score、complementType、reason
- [x] 1.3 添加 `.sort((a, b) => b.matchScore - a.matchScore)` 降序排列

## 2. Fallback 逻辑调整

- [x] 2.1 当 analysisResults 为空时，为所有帖子生成随机低分（0-10）填充
