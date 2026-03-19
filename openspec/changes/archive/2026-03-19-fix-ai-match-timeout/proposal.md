# Proposal: Fix AI Match Timeout Issue

## 1. Summary

修复智能匹配（AI Match）长时间等待无响应的问题，添加请求超时和更好的错误处理。

## 2. Problem Statement

当前智能匹配功能存在以下问题：
1. 调用 SecondMe API 时没有设置超时，可能无限等待
2. API 响应时间较长时，前端无进度反馈
3. API 调用失败时错误信息不够明确

## 3. Proposed Solution

### 3.1 后端修复
- 为 `/api/circle/match` API 添加请求超时（30秒）
- 添加更详细的错误日志
- 返回更有意义的错误信息

### 3.2 前端优化
- 添加加载超时提示
- 显示更友好的等待信息

## 4. Success Criteria

- API 请求有 30 秒超时限制
- 超时时返回明确错误信息
- 用户知道等待时间
