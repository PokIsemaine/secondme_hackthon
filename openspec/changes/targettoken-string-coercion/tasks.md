## 1. Fix Prisma String coercion

- [x] 1.1 In `src/app/api/candidate/route.ts` line 26, change `where: { targetToken }` to `where: { targetToken: String(targetToken) }` in the `findUnique` call
- [x] 1.2 In `src/app/api/candidate/route.ts` line 151, change `targetToken` to `String(targetToken)` in the `create` call's data object
