## Why

当前用户首次登录后，AI 分身自我介绍（naturalLanguagePreview）在页面加载时不显示，必须手动点"刷新画像"才出现。这是因为 OAuth 回调虽然触发了异步画像生成，但：

1. 画像生成是 fire-and-forget，不阻塞页面跳转
2. 生成需要数秒（调用 SecondMe API 获取数据 + act/stream）
3. 页面抢先渲染时 profileJson 还是空的

## What Changes

- 改造 `src/app/seeker/page.tsx` 的加载逻辑：
  - 首次加载 `has_profile=false` 时，自动触发 POST `/api/user/profile/generate`
  - 显示乐观 UI："AI 分身正在分析你的数据，稍等..."
  - 轮询 GET `/api/user/profile` 直到画像生成完成
  - 生成期间显示 polling loading 状态，完成后切换为正式展示
- 已生成过画像的用户：直接展示，无变化

## Capabilities

### Modified Capabilities

- `user-profile`: 首次访问时自动触发画像生成，通过轮询确保画像就绪后再展示分身自我介绍

## Impact

- **UI 变化**: seeker/page.tsx 新增 isAutoGenerating 状态和轮询逻辑
- **API 调用**: 新增轮询 GET /api/user/profile（间隔 3s，最多 10 次）
- **无 DB 改动**
- **向后兼容**: 已有画像用户无感知变化
