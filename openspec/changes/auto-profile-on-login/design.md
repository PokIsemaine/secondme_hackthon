## Goals / Non-Goals

**Goals:**
- 首次访问的用户看到"AI 分身正在分析中"的乐观 UI，而不是"请手动刷新"的提示
- 画像生成期间展示 loading 状态
- 生成完成后自动切换为正式展示，无需用户操作
- 已有画像用户行为不变

**Non-Goals:**
- 不修改 OAuth callback 逻辑
- 不修改 `/api/user/profile/generate` 接口
- 不添加数据库字段

## Decisions

### D1: 轮询策略
**选择**: 首次加载且 `has_profile=false` 时，自动触发 POST 生成 + 轮询 GET

**理由**:
- 与提案 `avatar-profile-generation` 中"登录时自动触发"的设计一致，只是把"等待"从登录流程移到页面渲染
- 用户无感知，体验流畅

### D2: 轮询参数
- **间隔**: 3000ms
- **最大次数**: 10 次（30s 后放弃，避免无限轮询）
- **放弃后**: 降级显示"刷新画像"按钮（现有行为）

### D3: isGenerating 状态
在 UserInfo 接口中增加 `is_generating?: boolean` 字段，或在前端用独立 state 跟踪：

```typescript
const [isAutoGenerating, setIsAutoGenerating] = useState(false)
const [pollCount, setPollCount] = useState(0)
```

前端 state 更轻量，不依赖 API 改动。

### D4: 现有 userInfo?.profile?.naturalLanguagePreview 条件不变
- 有 naturalLanguagePreview → 正常展示
- 无 naturalLanguagePreview + isAutoGenerating=true → 展示 loading
- 无 naturalLanguagePreview + isAutoGenerating=false → 展示"刷新画像"提示

## UX 状态机

```
页面加载
   │
   ▼
fetchUserInfo()
   │
   ├── has_profile=true ──────────────────→ 展示分身自我介绍 ✓
   │
   └── has_profile=false
           │
           ▼
     isAutoGenerating = true
     调用 POST /api/user/profile/generate
           │
           ▼
     显示: "AI 分身正在分析你的数据，稍等..."
           │
           ▼
     轮询 GET /api/user/profile (每3s)
           │
           ├── has_profile=true → 停止轮询，isAutoGenerating=false，展示 ✓
           │
           └── pollCount >= 10 → 停止轮询，显示"刷新画像"按钮
```

## UI 文案

| 场景 | 文案 |
|------|------|
| 首次加载（自动生成中） | AI 分身正在分析你的数据，稍等... |
| 轮询中（已等待一段时间） | 仍在分析中...（第 N/10 次） |
| 放弃轮询 | 画像生成有点慢，试试手动刷新 |
