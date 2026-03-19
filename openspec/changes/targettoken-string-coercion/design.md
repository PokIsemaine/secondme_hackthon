## Context

The `/api/candidate` endpoint accepts a `targetToken` field (declared as `string` in the API contract) and uses it to query the `candidateProxy` Prisma model where `targetToken` is stored as `@unique @map("target_token") String`. When `targetToken` originates from the Zhihu API's `pin_id` field (a 64-bit integer), JavaScript's `number` type (IEEE-754 double, safe integer range: -2^53+1 to 2^53-1) loses precision, resulting in values like `2018067565130306800` becoming `2018067565130307000` before reaching the API. Prisma then rejects the integer with: `Argument 'targetToken': Invalid value provided. Expected String, provided Int.`

The fix must be at the **API boundary** (where external data enters the system), not at the data source. Fixing the Zhihu API response parsing would be ideal but is not always possible (the data comes from an external service). Coercing at the `/api/candidate` endpoint is the correct layer because:
1. It enforces the declared API contract (string type)
2. It protects the Prisma layer from type mismatches
3. It is a minimal, safe change with no side effects

## Goals / Non-Goals

**Goals:**
- Fix the Prisma validation error by ensuring `targetToken` is always a string when passed to Prisma

**Non-Goals:**
- Fixing how the Zhihu API returns `pin_id` (external service, out of scope)
- Adding new capabilities or changing existing behavior
- Modifying the Prisma schema

## Decisions

### Decision 1: Where to apply the String coercion

**Choice:** Apply `String(targetToken)` at both Prisma call sites in `src/app/api/candidate/route.ts`:
- Line 26: `prisma.candidateProxy.findUnique({ where: { targetToken: String(targetToken) } })`
- Line 151: `prisma.candidateProxy.create({ data: { targetToken: String(targetToken), ... } })`

**Rationale:** The API boundary is where external/untyped data enters the system. Coercing here is the most defensive and least surprising approach. The declared API contract already says `targetToken: string`, so this is enforcing the contract, not changing it.

### Decision 2: Why not fix it at the Zhihu API parsing layer

**Choice:** Do not modify `src/app/api/zhihu/ring/route.ts` or `src/lib/zhihu.ts` to coerce `pin_id` to string.

**Rationale:** The Zhihu API response type declares `pin_id?: string` — the external API contract says it's a string. The precision loss happens at `response.json()` parsing, which is deep in the fetch implementation. Fixing it at the candidate API boundary is more targeted and avoids potentially breaking other callers of the zhihu helper that may expect a number.

## Risks / Trade-offs

**[Risk]** If a caller legitimately passes a numeric `targetToken` (not from Zhihu), it will now be coerced to `"123"` instead of being rejected.
**Mitigation:** The API contract already specifies `string`. Any caller passing a number is itself non-compliant. Coercion is the correct behavior per the contract.

**[Risk]** None. This is a one-line change at a known call site with no side effects.
