# Demo Default Page - Routing Specification

## Overview

将 `/demo` 设为默认入口，统一用户流程到单页面。

## Requirements

### Route Changes

- `/` → 重定向到 `/demo`
- `/demo` → 主入口页面（包含完整用户流程）
- `/negotiation` → 删除
- `/negotiation/[id]` → 删除
- `/seeker` → 保留（辅助入口）

### Page Flow (Single Page)

1. 进入 `/demo`
2. 检查登录状态
3. 未登录 → 显示登录引导 + 演示模式选项
4. 已登录 → 进入步骤流程
   - 步骤1: 我的画像
   - 步骤2: 发现内容
   - 步骤3: AI匹配
   - 步骤4: 协商过程
   - 步骤5: 提案结果

### UI Components

- 登录状态检测
- 用户画像展示/编辑
- 圈子内容发现
- AI 匹配入口
- 协商过程展示
- 提案结果展示
