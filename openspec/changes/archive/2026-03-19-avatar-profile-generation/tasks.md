## 1. Database Schema Update

- [x] 1.1 Add `profileJson` field to User model in prisma/schema.prisma
- [x] 1.2 Run prisma migrate or prisma db push to apply schema changes

## 2. Data Fetching Layer

- [x] 2.1 Create `/src/lib/profile-data.ts` with parallel data fetching functions (user/info, shades, softmemory, session/list)
- [x] 2.2 Implement `selectSessions()` function with mixed strategy (recent 2 + longest 2)
- [x] 2.3 Implement `compressMessages()` function to summarize session messages
- [x] 2.4 Implement `fetchSessionMessages()` to fetch and compress messages for selected sessions

## 3. Prompt Generation

- [x] 3.1 Create `/src/lib/profile-prompt.ts` with prompt template constants
- [x] 3.2 Implement `assemblePrompt()` function to inject user data into template
- [x] 3.3 Implement data availability declaration for partial failures

## 4. LLM Call Layer

- [x] 4.1 Create `/src/lib/llm-call.ts` with SSE streaming parser for act/stream
- [x] 4.2 Implement `callActStream()` function (action="generate_profile")
- [x] 4.3 Implement `callChatStreamFallback()` function for naturalLanguagePreview
- [x] 4.4 Implement JSON extraction with fault tolerance (handle pre/post text noise)

## 5. Profile Generation API

- [x] 5.1 Create `/src/app/api/user/profile/generate/route.ts` (POST)
- [x] 5.2 Implement full pipeline: fetch → select → compress → assemble → call → parse → store
- [x] 5.3 Handle Promise.allSettled for parallel data fetching
- [x] 5.4 Implement act/stream with chat/stream fallback logic
- [x] 5.5 Store result in User.profileJson

## 6. Profile Retrieval API

- [x] 6.1 Modify `/src/app/api/user/profile/route.ts` GET handler
- [x] 6.2 Return profileJson as `profile` field in response
- [x] 6.3 Map profileJson fields to compatible flat fields (longboard_tags, blindspot_tags, etc.)

## 7. Login Trigger Integration

- [x] 7.1 Modify `/src/app/api/auth/callback/route.ts`
- [x] 7.2 Add automatic profile generation call after successful OAuth login

## 8. Frontend Integration

- [x] 8.1 Add "刷新画像" button to profile page UI
- [x] 8.2 Connect button to POST /api/user/profile/generate
- [x] 8.3 Display loading state during generation
- [x] 8.4 Show naturalLanguagePreview in profile view
