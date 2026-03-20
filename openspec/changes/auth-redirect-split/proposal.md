## Why

Currently the app has no proper auth-gated entry. The root `/` always redirects to `/demo`, which contains both the login landing AND the full authenticated application mixed together, with a "demo mode" toggle that lets users bypass auth entirely. This conflates unauthenticated and authenticated states, making the app harder to reason about and maintain.

## What Changes

1. **Add Next.js middleware** at root `/` that reads the `user_id` cookie server-side and redirects:
   - Authenticated → `/app`
   - Unauthenticated → `/demo`
2. **Restructure `/demo/page.tsx`** to be a pure login landing page — no app steps, no demo mode toggle, no authenticated state.
3. **Create `/app/page.tsx`** as the authenticated application, migrated from the demo page's authenticated sections. No `demoMode` state.
4. **Delete `/lib/mock.ts`** — demo mode removed, no longer needed.
5. **Update `/api/auth/callback/route.ts`** redirect from `/` → `/app`.
6. **Update `/api/auth/logout/route.ts`** redirect to `/demo` after logout.

## Capabilities

### New Capabilities

- `auth-routing`: Server-side auth routing via Next.js middleware. Root `/` checks `user_id` cookie and redirects to appropriate entry point. This is a pure routing concern, not a new feature — no spec file needed.

### Modified Capabilities

- `user-auth`: Currently the auth callback redirects to `/` which always redirects to `/demo`. After this change, authenticated users land directly at `/app`. No requirement change, just a routing update.
- `demo-mode`: **Removed** — the demo mode toggle and all mock data branches are deleted. This is a removal, not a modification.

## Impact

- **New files**: `src/middleware.ts`, `src/app/app/page.tsx`
- **Modified files**: `src/app/layout.tsx` (simplify, remove redirect), `src/app/demo/page.tsx` (strip to login only), `src/app/api/auth/callback/route.ts`, `src/app/api/auth/logout/route.ts`
- **Deleted files**: `src/lib/mock.ts`
- **Breaking**: Users with existing `/demo` bookmarks who had demo mode active will now go to a clean login page.
