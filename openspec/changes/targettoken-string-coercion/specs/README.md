# Specs: targettoken-string-coercion

## No New or Modified Capabilities

This change is a pure bug fix. The proposal's Capabilities section lists:

- **New Capabilities**: none
- **Modified Capabilities**: none

There are no behavioral requirements to define or change. No spec files are required for this change.

## What This Change Affects

- `src/app/api/candidate/route.ts` — two `String()` coercions at Prisma call sites
- No new spec requirements apply; the existing API contract (`targetToken: string`) is enforced rather than changed
