## Context

Demo 页面的用户画像获取逻辑：
1. 调用 GET /api/user/profile 获取画像
2. 返回数据库缓存的数据或 SecondMe API 数据

问题：没有强制刷新机制，用户看到的是旧数据。

## Goals / Non-Goals

**Goals:**
- 添加刷新按钮触发画像重新生成
- 显示加载状态
- 成功/失败提示

**Non-Goals:**
- 不修改 API 逻辑

## Decisions

### D1: 刷新按钮位置
**选择**: 放在用户画像区域的右上角

**理由**:
- 位置显眼但不干扰主要内容
- 用户可以随时刷新

### D2: 刷新逻辑
**选择**: 调用 POST /api/user/profile 重新生成

**理由**:
- 该端点已经存在
- 会从 SecondMe 获取最新数据并更新数据库

## Risks / Trade-offs

- **风险**: 刷新可能需要较长时间
  - **缓解**: 添加加载状态提示用户等待
