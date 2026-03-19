## Context

当前 `demo/page.tsx` 中 logout 按钮的实现：

```tsx
<button
  onClick={() => {
    setDemoMode(false)
    setIsLoggedIn(false)
    window.location.href = '/api/auth/logout'
  }}
```

问题：
1. `window.location.href` 触发 GET 请求，但 `/api/auth/logout` 只接受 POST
2. 页面立即导航，React 状态更新被丢弃
3. 所有会话状态（profile, posts, matches 等）未清除

## Goals / Non-Goals

**Goals:**
- 点击退出登录后正确清除服务端 Session Cookie
- 重置所有客户端状态到初始值
- 界面立即显示未登录状态（登录引导页）

**Non-Goals:**
- 不改变 logout API 端点的 HTTP 方法（POST 已正确）
- 不添加额外的确认对话框

## Decisions

### Decision 1: 使用 fetch POST 替代 window.location.href

**选择：** 改造 logout 按钮 onClick，使用 `fetch('/api/auth/logout', { method: 'POST' })`

**替代方案：**
- `window.location.href` 发送 GET → API 返回 405 Method Not Allowed ❌
- `router.push('/api/auth/logout')` 同样发送 GET ❌
- `form` + POST submit → 可行但需要额外的 form 元素

**结论：** `fetch` + async/await 是最简洁的客户端方案

### Decision 2: 重置所有客户端状态

**选择：** 定义 `resetAllState()` 函数，统一重置：

```tsx
const resetAllState = () => {
  setIsLoggedIn(false)
  setDemoMode(false)
  setProfile(null)
  setPosts([])
  setMatches([])
  setNegotiationRounds([])
  setNegotiationResult(null)
  setCurrentStep(0)
}
```

**理由：** logout 后用户应该看到干净的开始页面，与首次访问无登录状态一致

### Decision 3: logout 后不额外 redirect

**选择：** 重置状态后，利用 React 条件渲染自动显示未登录页面

**理由：** 组件已有完整的未登录状态渲染逻辑（`!isLoggedIn && !demoMode` 分支），无需额外跳转

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| fetch 失败（网络问题） | logout 仍清除本地状态，用户刷新后恢复未登录状态 |
| API 返回非 200 | 静默失败，体验略有瑕疵但不影响核心流程 |
