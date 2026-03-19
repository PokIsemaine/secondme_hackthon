## Why

当前项目使用 SQLite 本地数据库，无法部署到 Vercel（使用临时文件系统，文件会丢失）。需要迁移到 Supabase PostgreSQL 才能实现生产环境部署。

## What Changes

- 修改 `prisma/schema.prisma` 的 datasource provider 从 `sqlite` 改为 `postgresql`
- 更新 `.env` 文件使用 Supabase 连接字符串
- 创建 Vercel 部署所需的 vercel.json 配置（如需要）
- 确保所有 API routes 兼容 PostgreSQL

## Capabilities

### New Capabilities

- `vercel-deployment`: Vercel + Supabase 部署配置

### Modified Capabilities

- （无）

## Impact

- `prisma/schema.prisma` - provider 改为 postgresql
- `.env` - DATABASE_URL 改为 Supabase 连接字符串
- 部署到 Vercel 需要的环境变量配置
