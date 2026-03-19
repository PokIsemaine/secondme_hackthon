## Why

The 5-round A2A negotiation currently runs as 5 independent LLM calls — each round's prompt only contains static profile data and post content, with no access to prior conversation turns. This causes both agents to talk past each other rather than responding to what the other said. The negotiation feels like two monologues, not a dialogue. Adding dialogue history to each round's prompt fixes this.

## What Changes

- Modify `src/app/api/negotiation/[id]/stream/route.ts` to accumulate conversation history across rounds
- Each subsequent round's prompt (rounds 2–5) prepends a `## 对话历史` block containing the full text of all previous rounds' `fullContent`, labeled by speaker
- Round 1 is unaffected (no history to prepend)
- No API contract changes, no database schema changes

## Capabilities

### New Capabilities
- `negotiation-dialogue-history`: The negotiation system now maintains full conversation context across all 5 rounds, enabling agents to reference and respond to prior turns.

### Modified Capabilities
None — the negotiation flow structure (5 rounds, SSE streaming, database persistence) is unchanged; only the prompt content per round is enriched.

## Impact

**Files modified:**
- `src/app/api/negotiation/[id]/stream/route.ts` — accumulate `fullContent` from each round and inject as `## 对话历史` block into subsequent round prompts

**No breaking changes.** Prompt size grows gradually (5 rounds × average turn length) — well within LLM context limits.
