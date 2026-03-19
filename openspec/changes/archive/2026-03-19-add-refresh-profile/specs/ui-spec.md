# Refresh Profile UI Specification

## Overview

在 Demo 页面的用户画像区域添加刷新功能。

## Requirements

### UI 组件

- 刷新按钮（位于画像标题右侧）
- 加载状态指示器
- 成功/失败提示

### 交互流程

1. 用户点击刷新按钮
2. 显示加载状态
3. 调用 POST /api/user/profile
4. 成功后更新画像显示
5. 失败时显示错误提示
