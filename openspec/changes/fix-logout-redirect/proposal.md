## Why

退出登录按钮点击后无法正确回到未登录状态。当前实现使用 `window.location.href` 跳转，但：
1. logout API 端点只接受 POST 请求
2. React 状态重置（`setIsLoggedIn(false)`）在页面跳转前未生效
3. 缺少退出后的状态重置逻辑

导致用户点击"退出登录"后，看到的仍然是有用户信息的页面。

## What Changes

- 修复 logout 按钮使用 `fetch` + POST 调用 API
- 清除所有客户端状态（profile, posts, matches, negotiationRounds 等）
- 重置 `demoMode` 为 `false`
- 保留 `currentStep` 在第一步（可选）

## Capabilities

### New Capabilities

- `logout-flow`: 完整的退出登录流程，包括 API 调用、Cookie 清除、状态重置、UI 更新

### Modified Capabilities

- （无）

## Impact

- `src/app/demo/page.tsx` - logout 按钮 onClick 处理器
- `src/app/api/auth/logout/route.ts` - 确认只接受 POST（已确认）
