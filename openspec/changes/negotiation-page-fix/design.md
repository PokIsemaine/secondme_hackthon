## Context

The negotiation page (`src/app/demo/page.tsx`) is the MVP demo flow that guides a user through: (1) OAuth login, (2) profile setup, (3) AI matching against Zhihu circle posts, (4) A2A negotiation with the matched post's author. Step 4 (negotiation) is broken because:

- `peerProxyData` is never created — the candidate API (`/api/candidate`) exists but is never called
- Only a `topic` string (`"author_name 的讨论互补分析"`) is passed to the negotiation session, no post content
- All five round templates in `[id]/stream/route.ts` lack the post's original content as context
- The display label for `peer_proxy` speaker is hardcoded as "候选代理" in `demo/page.tsx:1108`

The negotiation session already stores `peerProxyData` as a JSON field — no schema change needed.

## Goals / Non-Goals

**Goals:**
- Negotiation dialogue is anchored in the matched post's actual content, not abstract capability labels
- Each round's prompt includes the post's original text so LLM responses stay relevant
- The "候选代理" label is replaced with the post author's actual username
- Candidate API is called before negotiation session creation to populate `peerProxyData`

**Non-Goals:**
- No changes to the candidate API itself — it already works
- No changes to the `/api/negotiation` POST endpoint contract — it already accepts `peerProxyData`
- No changes to the 5-round A2A negotiation structure
- No changes to the non-streaming `/execute` endpoint in `[id]/route.ts`

## Decisions

### Decision 1: Where to call candidate API

**Choice:** Call `/api/candidate` in `demo/page.tsx` in the `runNegotiation` function, before `POST /api/negotiation`.

**Rationale:** The candidate API requires `targetToken` and `posts[]` from the matched result. The match result already contains `pin_id` and `content` for the target post. Calling it before session creation keeps the flow sequential and obvious. Alternative of calling it from the `/api/negotiation` POST endpoint would require passing full post data through that endpoint unnecessarily.

### Decision 2: Payload structure for passing post context to stream route

**Choice:** Store post context inside `peerProxyData` as additional fields: `authorName`, `postContent`, `ringName`, `topic`. The stream route reads from `session.peerProxyData` — no new database fields.

**Structure:**
```typescript
peerProxyData: {
  authorName: string       // e.g., "雁字回时"
  postContent: string     // full post text for LLM context
  ringName: string        // circle name
  topic: string           // post's actual subject (not "xxx的讨论互补分析")
  estimatedStrengths: string
  estimatedNeeds: string
  estimatedOffers: string
  communicationStyle: string
}
```

**Rationale:** Reuses the existing `peerProxyData` JSON column already in `NegotiationSession`. No Prisma schema change. The stream route already reads `session.peerProxyData` — just needs to extract more fields from it.

### Decision 3: Prompt template rewrite

**Choice:** Rewrite each of the 5 round templates to accept `postContent`, `authorName`, `ringName`, and `topic` as additional parameters. Every round's prompt includes the post's original text as a `## 用户 B 的帖子原文` block.

**Rationale:** Short prompts (1-2 sentences expected output) with the post text anchored in context prevent the LLM from drifting into generic capability-exchange talk. Making post content explicit every round (not just round 1) keeps all 5 rounds grounded.

### Decision 4: Display name for peer_proxy

**Choice:** In `demo/page.tsx:970-971`, replace the hardcoded `"候选代理"` with `${targetPost.author_name}` which is already available in scope at that point.

**Rationale:** Trivial one-line fix. The author name is already captured in `matches[selectedMatchIndex].post.author_name`.

## Risks / Trade-offs

**[Risk]** The candidate API's `sourcePosts` field only stores the first 100 characters of each post — long posts may have insufficient content for LLM to work with.
→ **Mitigation:** When calling candidate API, pass the full `post.content` in the `posts[]` array. The 100-character truncation only affects what is stored in the database, not what is passed in the API call. For the negotiation prompt, we pass the full content directly via `peerProxyData.postContent`.

**[Risk]** The `/api/negotiation/[id]/stream` route's templates will have a different signature than the existing (unused) `NEGOTIATION_TEMPLATES` in `[id]/route.ts` and `NEGOTIATION_PROMPTS` in `route.ts`.
→ **Mitigation:** The unused templates are dead code. Remove them during implementation to avoid confusion. The stream route is the only one actually called by the demo.

**[Risk]** Passing full `postContent` in `peerProxyData` increases session payload size.
→ **Mitigation:** Negotiation sessions are one-off per match; post content is typically under 2KB. No performance concern.

## Open Questions

- Should the non-streaming `/execute` endpoint (`[id]/route.ts`) also be updated to use the new templates, or is it considered deprecated in favor of the stream version?
- The `topic` field in `NegotiationSession` currently receives `"xxx的讨论互补分析"`. Should we store the actual post topic instead, or is the current usage acceptable as-is?
