# Proposal: Add Refresh Profile Feature

## 1. Summary

在 Demo 页面添加"刷新画像"功能，允许用户从 SecondMe API 获取最新的用户画像数据。

## 2. Problem Statement

当前 Demo 页面存在以下问题：
1. 用户画像数据是旧的或缓存的
2. 没有刷新画像的入口
3. 用户无法获取最新的 SecondMe 数据

## 3. Proposed Solution

### 3.1 Demo 页面改进
- 在用户画像区域添加"刷新"按钮
- 点击后调用 POST /api/user/profile 重新生成画像
- 显示加载状态和成功/失败提示

### 3.2 API 说明
- 已有 POST /api/user/profile 端点用于生成画像
- 调用该端点会从 SecondMe API 获取最新数据并更新数据库

## 4. Success Criteria

- 用户可以点击按钮刷新画像
- 刷新过程中显示加载状态
- 刷新成功后更新页面显示
