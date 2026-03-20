## 1. Create Middleware for Auth Routing

- [ ] 1.1 Create `src/middleware.ts` at project root
- [ ] 1.2 Export `config` with `matcher: ['/']` to intercept root path only
- [ ] 1.3 Read `user_id` cookie from `request.cookies.get('user_id')`
- [ ] 1.4 If authenticated (cookie exists) → redirect to `/app`
- [ ] 1.5 If unauthenticated → redirect to `/demo`
- [ ] 1.6 Also protect `/app`: if no `user_id` cookie and navigating directly to `/app`, redirect to `/demo`

## 2. Strip `/demo` to Pure Login Page

- [ ] 2.1 Remove `demoMode` state and all `demoMode` branches throughout the file
- [ ] 2.2 Remove all step-related code (Steps 0–4, step navigation, loading indicators for steps)
- [ ] 2.3 Remove imports: `mockCirclePosts`, `mockMatchResults`, `mockNegotiationRounds`, `mockNegotiationResult` from `@/lib/mock`
- [ ] 2.4 Remove all per-panel ring state: `ringPosts`, `ringLoading`, `ringErrors`, `ringMeta`, `ringStyles`
- [ ] 2.5 Remove functions: `loadProfile`, `refreshProfile`, `loadCircleContent`, `refreshRing`, `runAIMatch`, `runNegotiation`, `acceptProposal`
- [ ] 2.6 Remove `handleStepChange`, `STEPS` array, `currentStep` state
- [ ] 2.7 Remove `triggerAutoGenerate`, `isAutoGenerating`, `pollCount` state
- [ ] 2.8 Remove `streamingRounds`, `negotiationRounds`, `negotiationResult`, `selectedMatchIndex`, `matches` state
- [ ] 2.9 Remove `handleLogout` button from header
- [ ] 2.10 Keep only the unauthenticated login landing UI (lines 702–771 original), removing the `!demoMode` condition
- [ ] 2.11 Remove the "体验演示模式" button from login landing
- [ ] 2.12 Keep `LoginButton` component, remove "或" separator and demo button
- [ ] 2.13 Update `checkLoginStatus` — if not logged in, stay on login page (no demo mode)

## 3. Create `/app/page.tsx` Authenticated Application

- [ ] 3.1 Create `src/app/app/page.tsx`
- [ ] 3.2 Copy the authenticated portion of original `/demo/page.tsx` (everything after the `!isLoggedIn && !demoMode` guard)
- [ ] 3.3 Remove all `demoMode` branches — use only real API calls
- [ ] 3.4 Remove `demoMode` state declaration
- [ ] 3.5 Remove the entire "Unauthenticated state: show login" block — this page is only for authenticated users
- [ ] 3.6 Remove `mockCirclePosts`, `mockMatchResults`, `mockNegotiationRounds`, `mockNegotiationResult` imports
- [ ] 3.7 Ensure header still has logout button and user nickname display
- [ ] 3.8 Migrate `checkLoginStatus` → since this page is auth-protected by middleware, simplify: always assume `isLoggedIn = true` or redirect to `/demo` if no cookie client-side
- [ ] 3.9 Remove "（演示数据）" / "（真实数据）" labels — all real data now

## 4. Update Auth Callback and Logout Redirects

- [ ] 4.1 Update `src/app/api/auth/callback/route.ts` — change `NextResponse.redirect(new URL('/', request.url))` → `NextResponse.redirect(new URL('/app', request.url))`
- [ ] 4.2 Update `src/app/api/auth/logout/route.ts` — change redirect target from `/` → `/demo`

## 5. Simplify Root Layout

- [ ] 5.1 Update `src/app/layout.tsx` — remove `redirect('/demo')`, just render `{children}`

## 6. Delete Mock Data

- [ ] 6.1 Delete `src/lib/mock.ts`
- [ ] 6.2 Verify no other files import from `@/lib/mock`

## 7. Verify No Breaking References

- [ ] 7.1 Grep for any remaining `demoMode` references in codebase — should return no results
- [ ] 7.2 Grep for any remaining imports from `@/lib/mock` — should return no results
- [ ] 7.3 Verify `/app` route works when authenticated (cookie present)
- [ ] 7.4 Verify `/demo` shows clean login when unauthenticated
- [ ] 7.5 Verify root `/` redirects correctly in both cases
