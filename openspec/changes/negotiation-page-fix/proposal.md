## Why

The negotiation process page has three UX issues: (1) displays hardcoded "候选代理" instead of the post author's username, (2) collaboration dialogue doesn't reference post content, and (3) the AI-generated conversation is completely disconnected from the actual post being discussed. The root cause is that the demo page never calls the `/api/candidate` endpoint to analyze the matched post, never passes `peerProxyData` when creating a negotiation session, and the prompt templates lack the post's original content as context for every round.

## What Changes

- **Data flow fix**: Demo page calls `/api/candidate` to analyze the matched post and creates `peerProxyData` before creating a negotiation session
- **API payload update**: `POST /api/negotiation` body now includes full `peerProxyData` with `authorName`, `postContent`, `ringName`, and estimated profile fields
- **Prompt template rewrite**: Each of the 5 negotiation rounds includes the post's original content as context, ensuring AI responses stay anchored to the post topic
- **Display label fix**: Replace hardcoded "候选代理" with the actual author's username from `peerProxyData.authorName`
- **Dead code cleanup**: Remove unused `NEGOTIATION_PROMPTS` from `route.ts` and duplicate `NEGOTIATION_TEMPLATES` from `[id]/route.ts` (only `[id]/stream/route.ts` is used)

## Capabilities

### New Capabilities

- `negotiation-post-context`: Core negotiation capability where each round of A2A dialogue is grounded in the referenced post's original content. Includes passing post content through the API layer and rendering author name dynamically.

### Modified Capabilities

- `candidate-proxy`: No requirement change — the candidate API already exists and works correctly. The change is only in how the demo page invokes it.

## Impact

**Files modified:**
- `src/app/demo/page.tsx` — call candidate API, pass `peerProxyData`, display author name
- `src/app/api/negotiation/route.ts` — remove dead `NEGOTIATION_PROMPTS` template
- `src/app/api/negotiation/[id]/route.ts` — remove dead `NEGOTIATION_TEMPLATES` (retained as `/execute` non-streaming version, but templates are unused)
- `src/app/api/negotiation/[id]/stream/route.ts` — rewrite `NEGOTIATION_TEMPLATES` to include post content per round

**No API contract changes** — the existing `POST /api/negotiation` already accepts `peerProxyData`. Only the demo page's usage of it is new.

**No database schema changes** — existing `peerProxyData` JSON field in `NegotiationSession` model is used.
