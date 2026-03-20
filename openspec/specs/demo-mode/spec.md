# demo-mode

## REMOVED Requirements

### Requirement: Demo Mode Toggle

**Reason**: Demo mode allowed unauthenticated users to experience the full application with mock data, bypassing the OAuth login flow. This conflates unauthenticated and authenticated states, making the app harder to reason about and maintain. The new architecture requires all users to authenticate via SecondMe OAuth before accessing application features.

**Migration**: Users who previously used demo mode should log in via the SecondMe OAuth flow to access the application. Mock data (`src/lib/mock.ts`) has been removed — the application now only operates with real data from the authenticated SecondMe account.

---

### Requirement: Mock Data for Circle Posts

**Reason**: Mock circle post data (`mockCirclePosts`) was only consumed by demo mode. With demo mode removed, there is no longer a scenario where mock posts should be displayed instead of real Zhihu circle content.

**Migration**: Authenticated users see real Zhihu circle posts fetched from `/api/zhihu/ring`. Unauthenticated users see the login page, not any content.

---

### Requirement: Mock Match Results

**Reason**: Mock AI match results (`mockMatchResults`) were fallback data shown when the `/api/circle/match` API failed in demo mode. Demo mode always used mock data regardless of API success.

**Migration**: In authenticated mode, if `/api/circle/match` fails, an error message is shown. No mock fallback is provided.

---

### Requirement: Mock Negotiation Data

**Reason**: Mock negotiation rounds (`mockNegotiationRounds`, `mockNegotiationResult`) were used in demo mode to simulate A2A negotiation. With demo mode removed, there is no scenario where mock negotiation data should be used.

**Migration**: Authenticated users engage in real A2A negotiation via `/api/negotiation`. If the API fails, an error is shown and the user may retry.

---

### Requirement: Demo Mode Indicator Badge

**Reason**: The UI displayed a "演示模式" (Demo Mode) badge in the header when `demoMode` was active. This badge is no longer relevant since demo mode has been removed.

**Migration**: No badge is displayed in the authenticated app. The header shows only the user nickname and logout button.
