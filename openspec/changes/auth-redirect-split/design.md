## Context

Currently the entire application lives in `src/app/demo/page.tsx` (1236 lines), which conflates:
- Unauthenticated login landing (with a "体验演示模式" demo bypass button)
- Authenticated multi-step application (Steps 0–4)
- Demo mode state (`demoMode` flag) that forks every data-loading function

The root `/` always redirects to `/demo` with no server-side auth check. `src/lib/mock.ts` provides mock data for the demo bypass.

## Goals / Non-Goals

**Goals:**
- Unauthenticated users always see a clean login page (`/demo`)
- Authenticated users go directly to the app (`/app`)
- No demo mode — no mock data, no `demoMode` state
- Clear separation: login route vs app route

**Non-Goals:**
- Not redesigning the app UI itself (steps, components stay the same)
- Not adding new authentication logic — OAuth flow already works
- Not changing API routes

## Decisions

### 1. Use Next.js Middleware for auth routing at `/`

**Decision:** Add `src/middleware.ts` that reads the `user_id` cookie and redirects.

**Rationale:** This is the idiomatic Next.js App Router approach for server-side routing logic. It runs edge-side before any page renders, so there are no flash-of-wrong-content issues. Alternatives considered:
- Client-side redirect in `layout.tsx` — causes flicker, auth state only available after JS loads
- Server Component in `page.tsx` — works but middleware is cleaner for a simple redirect

### 2. Keep `/demo` as the login page URL

**Decision:** The login landing page stays at `/demo`, not a new path like `/login`.

**Rationale:** Preserves the existing URL structure. The callback route already redirects to `/` which will go to `/demo` for unauthenticated users.

### 3. Create `/app/page.tsx` for the authenticated app

**Decision:** New file at `src/app/app/page.tsx` rather than in-place modification of `/demo/page.tsx`.

**Rationale:** Lower risk — `/demo` is stripped down to login only, the authenticated app gets its own clean file. Easier to review diffs.

### 4. Delete `src/lib/mock.ts`

**Decision:** Remove the mock data file entirely.

**Rationale:** No demo mode means no mock data consumption. The file is only imported by `demo/page.tsx`.

### 5. `layout.tsx` simplifies to pass-through

**Decision:** `src/app/layout.tsx` removes the `redirect('/demo')` line entirely.

**Rationale:** Middleware handles routing; `layout.tsx` should just render children.

### 6. `callback/route.ts` redirects to `/app`

**Decision:** OAuth success redirect changes from `/` → `/app`.

**Rationale:** After successful OAuth, user is authenticated — go directly to app.

### 7. `logout/route.ts` redirects to `/demo`

**Decision:** After clearing session, redirect to `/demo`.

**Rationale:** User is unauthenticated — show login page.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Breaking existing `/demo` bookmarks for demo-mode users | Acceptable — demo mode was always a bypass, not a primary flow |
| Cookie read in middleware may miss some edge cases | `user_id` cookie is `httpOnly: true` — middleware can read it via `request.cookies.get()` |
| `middleware.ts` at root covers `/app` too | Use `matcher: ['/']` only — or chain: if path is `/app` and no cookie, redirect to `/demo` |

## Open Questions

- Should middleware matcher be `/` only, or also protect `/app`? (If someone navigates directly to `/app` without auth, should it redirect to `/demo`? **Yes** — added to tasks.)
- Should the old `/demo` page be deleted entirely or kept as a redirect? (Kept as clean login page per the design.)
