## Context

**当前状态：**
- Prisma 使用 SQLite：`provider = "sqlite"`, `url = "file:./dev.db"`
- 所有数据存储在本地文件

**目标：**
- 迁移到 Supabase PostgreSQL
- 准备 Vercel 部署

## Goals / Non-Goals

**Goals:**
- Prisma schema 兼容 PostgreSQL
- 环境变量配置支持 Supabase
- 部署流程文档化

**Non-Goals:**
- 不迁移现有数据（本地 SQLite 数据）
- 不修改业务逻辑代码

## Decisions

### Decision 1: Prisma provider 变更

**选择：** `sqlite` → `postgresql`

Supabase 使用 PostgreSQL，Prisma 原生支持。

### Decision 2: 连接字符串格式

**选择：** 使用 Supabase 标准 URI 格式

```
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

用户需要在 Supabase Dashboard 获取连接信息。

## Vercel 部署环境变量清单

| 变量名 | 说明 | 来源 |
|-------|------|------|
| `DATABASE_URL` | Supabase 连接字符串 | Supabase Dashboard |
| `SECONDME_CLIENT_ID` | SecondMe Client ID | 已有 |
| `SECONDME_CLIENT_SECRET` | SecondMe Secret | 已有 |
| `SECONDME_REDIRECT_URI` | 回调 URL | Vercel 部署后更新 |
| `SECONDME_API_BASE_URL` | API 地址 | 已有 |
| `SECONDME_OAUTH_URL` | OAuth URL | 已有 |
| `SECONDME_TOKEN_ENDPOINT` | Token 端点 | 已有 |
| `SECONDME_REFRESH_ENDPOINT` | Refresh 端点 | 已有 |
| `ZHIHU_APP_KEY` | 知乎 App Key | 已有 |
| `ZHIHU_APP_SECRET` | 知乎 Secret | 已有 |
