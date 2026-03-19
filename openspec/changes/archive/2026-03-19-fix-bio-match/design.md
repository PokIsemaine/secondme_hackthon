## Context

The `/api/circle/match` endpoint takes `{ profile: { shades, soft_memories }, posts: [...] }` and sends a prompt to `POST /api/secondme/chat/stream`. The response body is an SSE stream. The current SSE parser reads zero content, returning an empty `assistantMessage`, causing all matches to be `[]`.

The matching is also semantically weak: `shades` and `soft_memories` are tag arrays without richer context. The `bio` field — a structured Markdown document with personality, MBTI, values, and overview — is not sent at all.

## Goals / Non-Goals

**Goals:**
- Fix the SSE stream parsing so `assistantMessage` actually receives content
- Add `bio` to the profile payload sent to the matching endpoint
- Rewrite the matching prompt to explicitly do complementary matching using bio fields
- Add `complementType` to match results ("你能帮他们" / "他们能帮你" / "双向互补")

**Non-Goals:**
- Not building a new matching algorithm — use existing SecondMe chat/stream API
- Not changing the `/api/circle/match` response API contract (still returns `{ matches, total }`)
- Not adding a vector embedding step — rely on the AI's semantic understanding
- Not changing how posts are fetched or displayed

## Decisions

### 1. SSE Parsing Fix

The current code reads SSE lines incrementally during the stream, but `assistantMessage` ends up empty. The fix: compare against the working `/api/chat` implementation which handles the stream correctly.

**Key difference in `/api/chat` vs current `/api/circle/match`**:
- `/api/chat` handles the final `buffer` leftover after the loop exits (lines 89-99)
- Current code does `buffer = lines.pop() || ''` inside the loop, but the SSE stream might not end with a newline — the last chunk may sit in `buffer` unprocessed

```ts
// Current (broken): last buffer chunk may not be processed
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  const chunk = decoder.decode(value, { stream: true })
  buffer += chunk
  const lines = buffer.split('\n')
  buffer = lines.pop() || ''  // ← leftover in buffer not processed
}
```

**Fix**: After the loop, process any remaining `buffer` content (same logic as `/api/chat` lines 89-99):
```ts
// After loop:
if (buffer.startsWith('data: ')) {
  const data = JSON.parse(buffer.slice(6))
  if (data.content) assistantMessage += data.content
}
```

### 2. Profile Payload Extension

Add `bio?: string` to `ProfileData` interface in the API route. Extend the request body sent from the demo page:

```ts
// Interface in route.ts
interface ProfileData {
  shades?: string[]
  soft_memories?: string[]
  bio?: string  // NEW
}

// In demo page call:
body: JSON.stringify({
  profile: {
    shades: profile.shades || [],
    soft_memories: profile.soft_memories || [],
    bio: profile.bio,  // NEW — may be undefined for older profiles
  },
  posts: posts.map(p => ({ pin_id: p.pin_id, content: p.content, author_name: p.author_name })),
})
```

### 3. Bio Extraction and Prompt Rewriting

The `bio` is a Markdown string. Before building the prompt, extract key sections:

```ts
function extractBioFields(bio: string) {
  const mbtiMatch = bio.match(/###\s*MBTI\s*###\s*\n([^\n]+)/i)
  const personalityMatch = bio.match(/###\s*性格特征\s*###\s*\n([\s\S]+?)(?=###|$)/i)
  const valuesMatch = bio.match(/###\s*价值观\s*###\s*\n([\s\S]+?)(?=###|$)/i)
  const overviewMatch = bio.match(/###\s*总体概述\s*###\s*\n([\s\S]+)/i)

  return {
    mbti: mbtiMatch?.[1]?.trim() || null,
    personality: personalityMatch?.[1]?.trim() || null,
    values: valuesMatch?.[1]?.trim() || null,
    overview: overviewMatch?.[1]?.trim() || null,
  }
}
```

Build the prompt using these extracted fields:

```
用户画像：
- MBTI：{mbti}
- 性格特征：{personality}
- 价值观：{values}
- 总体概述：{overview}
- 擅长领域：{shades}
- 个人特点：{soft_memories}

帖子列表：...

互补匹配判断：
1. "你能帮他们"：帖子作者在讨论/求助的领域，恰好是用户的擅长/专长
2. "他们能帮你"：帖子作者分享的内容/经验，能填补用户的短板或认知盲区
3. "双向互补"：双方既能互相帮助

对每条帖子输出：{index, score, complementType, reason}
```

### 4. Result Schema Extension

Extend `MatchResult` interface to include `complementType`:

```ts
// In route.ts response mapping:
.matches.map(r => ({
  post: posts[r.index],
  matchScore: r.score / 100,
  matchReason: r.reason,
  complementType: r.complementType || '相关',  // "你能帮他们" | "他们能帮你" | "双向互补" | "相关"
}))
```

Update demo page `MatchResult` interface:
```ts
interface MatchResult {
  post: CirclePost
  matchScore: number
  matchReason: string
  complementType?: string  // NEW
}
```

## Risks / Trade-offs

[Risk] SSE buffer leftover issue may not be the only cause of empty `assistantMessage`
→ **Mitigation**: First apply the buffer leftover fix and test. If still empty, also try logging the raw `buffer` before SSE parsing to see if the stream is arriving at all.

[Risk] `bio` may be undefined for users who haven't refreshed their profile
→ **Mitigation**: `bio` is optional in the interface. The prompt falls back to "未设置" for bio-derived fields if bio is absent, so matching still works (with degraded quality).

[Risk] `complementType` parsing depends on AI following instructions precisely
→ **Mitigation**: Use a regex to extract `complementType` from the AI response alongside JSON. Fall back to "相关" if extraction fails.

## Open Questions

- Should `complementType` be a required field in the response, or optional with fallback?
  - Decision: optional with fallback "相关"
- Should we also pass `ringName` from each post to the AI?
  - Yes — add `ringName` to `PostData` so the AI knows which circle each post came from
