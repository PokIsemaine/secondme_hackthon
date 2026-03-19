## Context

The negotiation stream route (`[id]/stream/route.ts`) executes 5 rounds sequentially, but each round's LLM call is independent — it receives only the static templates with profile data and post content. After each round completes, `fullContent` is saved but never fed into subsequent rounds. This means rounds 2–5 have no awareness of what was said before, causing the dialogue to feel like two agents giving monologues rather than actually conversing.

The fix is to prepend a `## 对话历史` block to each round's prompt (rounds 2–5) containing all prior rounds' full content.

## Goals / Non-Goals

**Goals:**
- Each agent can see and respond to what the other said in prior rounds
- Round-to-round coherence without changing the 5-round structure

**Non-Goals:**
- Changing the number of rounds
- Changing the LLM API calls or response format
- Adding a separate conversation history storage

## Decisions

### Decision 1: How to format the dialogue history block

**Choice:** Append to the end of each round's template, before the round-specific instruction, a `## 对话历史` block in this format:

```
## 对话历史
用户 A（我的 Agent）: [full content of round N by my_agent]
用户 B（对方 Agent）: [full content of round N by peer_proxy]
... (all prior rounds in order)
```

**Rationale:** The round templates end with the task instruction (e.g., "请简洁说明..."). The history block should come between the context section and the round-specific instruction, so the LLM sees context → history → task.

### Decision 2: Where to accumulate history

**Choice:** Maintain a `conversationHistory` string variable in the SSE `start()` callback, updated after each round completes:

```typescript
let conversationHistory = ''

for (let i = 0; i < roundsConfig.length; i++) {
  // ... call LLM, get fullContent ...

  // Append to history
  const speakerLabel = speaker === 'my_agent' ? '用户 A（我的 Agent）' : '用户 B（对方 Agent）'
  conversationHistory += `${speakerLabel}: ${fullContent}\n\n`

  // Save round (already done)
  // Send SSE events (already done)
}
```

Then each round's prompt function receives `conversationHistory` as an additional parameter.

**Rationale:** This avoids modifying the existing `NEGOTIATION_TEMPLATES` function signatures significantly. We can add an optional 5th parameter to each template function. Round 1 gets `''` (empty history).

### Decision 3: Round 1 history

**Choice:** Round 1 always gets an empty history string (`''`).

**Rationale:** Round 1 is the opening statement — there is no prior history. Adding an empty block is cleaner than special-casing the prompt function.

## Risks / Trade-offs

**[Risk]** Prompt size grows with each round. At round 5, the prompt includes 4 prior fullContent blocks.
**Mitigation:** Zhihu posts are typically under 2KB, and LLM responses are concise. 5 rounds × ~500 chars avg = ~2.5KB additional — well within context limits.

**[Risk]** The `fullContent` may contain malformed text (e.g., JSON fragments from the stream parsing fallback path).
**Mitigation:** This is pre-existing. The history will include whatever was streamed; the LLM can handle it.

**[Risk]** Template function signatures change (4 params → 5 params).
**Mitigation:** Only in `[id]/stream/route.ts`. The dead `NEGOTIATION_TEMPLATES` in `[id]/route.ts` were already removed.
