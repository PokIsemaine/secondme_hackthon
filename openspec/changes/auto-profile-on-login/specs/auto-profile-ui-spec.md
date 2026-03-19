## Auto Profile UI Spec

### Trigger Condition

首次访问 `/seeker` 页面，且 `GET /api/user/profile` 返回 `has_profile=false`

### Behavior

1. **Auto-trigger**: 立即调用 `POST /api/user/profile/generate`
2. **Polling**: 每 3000ms 调用 `GET /api/user/profile`，最多 10 次
3. **Timeout**: 30s 后停止轮询，降级为显示"刷新画像"按钮

### States

| State | Condition | Display |
|-------|-----------|---------|
| Loaded with profile | `has_profile=true` | 展示分身自我介绍 |
| Auto-generating | `has_profile=false` && `isAutoGenerating=true` | "AI 分身正在分析你的数据，稍等..." |
| Polling | `has_profile=false` && `pollCount > 0` | "仍在分析中...（第 N/10 次）" |
| Timeout | `pollCount >= 10` | "画像生成有点慢，试试手动刷新" |
| No profile, idle | `has_profile=false` && `isAutoGenerating=false` | existing yellow prompt |

### No Breaking Changes

- Existing users with profile: same behavior
- API contracts unchanged
- Database unchanged
