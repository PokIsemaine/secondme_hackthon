## 1. SSE Parsing Fix

- [x] 1.1 Add buffer leftover processing after the SSE read loop in `/api/circle/match/route.ts` (process remaining buffer content after loop exits)
- [x] 1.2 Remove temporary `_debug_rawContent` field from API response

## 2. API Route — Payload and Prompt

- [x] 2.1 Extend `PostData` interface to include `ringName?: string`
- [x] 2.2 Extend `ProfileData` interface to include `bio?: string`
- [x] 2.3 Implement `extractBioFields()` function to parse MBTI, personality, values, overview from bio Markdown
- [x] 2.4 Rewrite the analysis prompt to use bio-extracted fields and include explicit complementary match instructions
- [x] 2.5 Update AI response parsing to extract `complementType` from JSON response, with fallback to "相关"
- [x] 2.6 Extend match result objects to include `complementType` field

## 3. Demo Page — Pass Bio to Match API

- [x] 3.1 Add `bio` field to `ProfileData` interface in `src/app/demo/page.tsx`
- [x] 3.2 Include `bio` in the `profile` object sent to `/api/circle/match`
- [x] 3.3 Extend `MatchResult` interface to include `complementType?: string`
- [x] 3.4 Display `complementType` in the Step 2 match result cards (e.g., as a colored badge)

## 4. Verification

- [ ] 4.1 Run matching end-to-end: Step 0 (refresh profile with bio) → Step 1 (load posts) → Step 2 (AI match) and confirm non-empty results
- [ ] 4.2 Verify complementType badge displays correctly on match result cards
