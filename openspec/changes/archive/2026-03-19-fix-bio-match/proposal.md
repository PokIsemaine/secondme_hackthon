## Why

The AI matching endpoint `/api/circle/match` returns zero results because the SecondMe SSE stream parser reads zero content (`assistantMessage` is empty string). Separately, the matching logic only sends `shades` + `soft_memories` to the AI — the rich `bio` field (containing MBTI, personality traits, values, and an overall summary) is not used at all, making complementary matching weak.

## What Changes

- **Fix SSE parsing**: Diagnose and fix the `assistantMessage` empty string issue in the `/api/circle/match` stream parser so AI responses are actually received
- **Extend profile payload**: Include `bio` (full Markdown self-introduction from SecondMe) in the request body sent to `/api/circle/match`, alongside `shades` and `soft_memories`
- **Refactor matching prompt**: Rewrite the analysis prompt to use bio-extracted fields (personality traits, MBTI, values, summary) for explicit complementary matching — match posts where the author needs what the user is strong in, or offers what the user lacks
- **Add complement type to results**: Each match result includes a `complementType` field indicating whether the user can help the poster ("你能帮他们") or the poster can help the user ("他们能帮你"), or both

## Capabilities

### New Capabilities

- `bio-complementary-match`: Uses the user's SecondMe bio (MBTI, personality, values, overview) combined with post content to perform explicit complementary matching. The AI prompt instructs the model to analyze each post's topic and identify whether it represents an opportunity for the user to contribute (user's strength fills poster's gap) or for the user to learn (poster's strength fills user's gap). Results include a `complementType` label.

### Modified Capabilities

- `circle-match` (existing `/api/circle/match` endpoint): Extended to accept a `bio?: string` field in the request body and to send the enhanced complementary-matching prompt to the AI. No external API contracts change — only internal prompt and payload logic.

## Impact

- **Modified**: `src/app/api/circle/match/route.ts` — SSE parsing fix, enhanced prompt, `bio`-aware matching
- **Modified**: `src/app/demo/page.tsx` — send `bio` field when calling `/api/circle/match`
- **No new dependencies** — uses existing react-markdown already installed
