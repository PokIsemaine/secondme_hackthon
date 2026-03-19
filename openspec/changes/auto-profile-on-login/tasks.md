## 1. 改造 seeker/page.tsx 加载逻辑

- [ ] 1.1 添加 `isAutoGenerating` state 和 `pollCount` state
- [ ] 1.2 修改 `fetchUserInfo()` 逻辑：has_profile=false 时设置 isAutoGenerating=true
- [ ] 1.3 添加 `triggerAutoGenerate()` 函数：调用 POST /api/user/profile/generate
- [ ] 1.4 添加 `pollProfile()` 轮询函数：每 3s 调用 GET /api/user/profile，最多 10 次
- [ ] 1.5 修改渲染逻辑：根据 has_profile + isAutoGenerating 组合决定展示哪种 UI

## 2. UI 文案和样式

- [ ] 2.1 添加 loading 文案："AI 分身正在分析你的数据，稍等..."
- [ ] 2.2 添加轮询进度文案："仍在分析中...（第 N/10 次）"
- [ ] 2.3 添加超时降级文案："画像生成有点慢，试试手动刷新"

## 3. 测试验证

- [ ] 3.1 新用户首次登录访问 /seeker：自动触发生成并展示乐观 UI
- [ ] 3.2 老用户（有 profile）访问 /seeker：直接展示分身自我介绍
- [ ] 3.3 生成超时（30s）：降级显示刷新按钮
