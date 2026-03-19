## Why

The `/api/candidate` endpoint crashes when called with a `targetToken` that originated from the Zhihu API's `pin_id` field. The Zhihu API returns `pin_id` as a 64-bit integer, but JavaScript's `number` type (IEEE-754 double) loses precision beyond 2^53. When this imprecise value is passed to Prisma for a `String` field query, Prisma rejects it with a validation error. The entire negotiation flow (demo page → candidate API → negotiation session) is blocked.

## What Changes

- **Bug fix**: In `src/app/api/candidate/route.ts`, coerce `targetToken` to `String` at the API boundary before passing to Prisma — both in the `findUnique` call (line 26) and in the `create` call (line 151). This is a one-line fix per site.
- No new capabilities, no modified capabilities, no schema changes.

## Capabilities

### New Capabilities
None — this is a bug fix with no new feature surface.

### Modified Capabilities
None — no existing spec requirements change.

## Impact

**Files modified:**
- `src/app/api/candidate/route.ts` — two `String()` coercions (findUnique + create)

**No breaking changes.** The API contract already documents `targetToken` as a string; the fix only enforces what the contract already states.

**No new dependencies.**
