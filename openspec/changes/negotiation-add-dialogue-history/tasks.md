## 1. Update NEGOTIATION_TEMPLATES with history parameter

- [x] 1.1 In `src/app/api/negotiation/[id]/stream/route.ts`, add `conversationHistory: string` as the 5th parameter to each template function (round1 through round5)
- [x] 1.2 Insert a `## 对话历史\n${conversationHistory}` block at the start of each template's prompt body, after the profile/post context and before the round-specific instruction

## 2. Update roundsConfig to pass conversation history

- [x] 2.1 Before the for loop in the SSE `start()` callback, initialize `let conversationHistory = ''`
- [x] 2.2 After each round's `fullContent` is received, append `用户 A（我的 Agent）: ${fullContent}` or `用户 B（对方 Agent）: ${fullContent}` to `conversationHistory` with a newline
- [x] 2.3 In `roundsConfig`, pass `conversationHistory` (the value from the previous iteration) as the 5th argument to each template function

## 3. Verify TypeScript compilation

- [x] 3.1 Run `npx tsc --noEmit` and confirm no errors
