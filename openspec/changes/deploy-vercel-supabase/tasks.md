## 1. Update Prisma schema for PostgreSQL

- [x] 1.1 Change provider from "sqlite" to "postgresql" in prisma/schema.prisma
- [x] 1.2 Added directUrl field for migration connections

## 2. Create .env.example for reference

- [x] 2.1 Create .env.example with all required environment variables
- [x] 2.2 Document Supabase connection string format

## 3. Update .env for Supabase

- [x] 3.1 Update .env with Supabase connection string
- [ ] 3.2 Run `npx prisma db push` to sync schema with Supabase (manual step - network timeout)

## 4. Vercel Deployment

- [ ] 4.1 Push to GitHub and import to Vercel
- [ ] 4.2 Set environment variables in Vercel Dashboard
