## 1. API 层修改

- [x] 1.1 更新 `/api/circle/match` 的 AI prompt，要求返回结构化 `reason` 对象（包含 `complementType`、`thesis.forYou`、`thesis.forThem`、`detailLevel`）
- [x] 1.2 更新 `analysisResults` 解析逻辑，支持新的 reason 对象结构
- [x] 1.3 添加向后兼容 fallback：若 `reason` 为字符串，转换为对象格式
- [x] 1.4 在 `buildResults` 中传递 `detailLevel` 到返回结果

## 2. TypeScript 类型更新

- [x] 2.1 在 `route.ts` 中定义 `ReasonObject` 接口，包含 `complementType`、`thesis`、`detailLevel`
- [x] 2.2 更新 `MatchResult` 类型定义，支持新的 `reason` 对象结构

## 3. 前端 UI 修改

- [x] 3.1 在 `CircleDiscovery.tsx` 中更新 `MatchResult` 接口，支持 `reason` 对象和 `detailLevel`
- [x] 3.2 修改匹配卡片渲染逻辑，支持两级折叠展示
- [x] 3.3 根据 `detailLevel` 决定卡片默认展开/折叠状态
- [x] 3.4 添加展开/折叠交互（点击切换）

## 4. Mock 数据同步

- [x] 4.1 更新 `src/lib/mock.ts` 中的 `mockMatchResults`，使用新的 reason 对象结构
- [x] 4.2 更新 `mockMatchResults` 包含 `detailLevel` 字段

## 5. 验证

- [x] 5.1 运行 `npm run build` 验证类型检查通过
- [ ] 5.2 手动测试：85%+ 匹配默认展开，低分匹配默认折叠
- [ ] 5.3 手动测试：点击卡片可正常展开/折叠
