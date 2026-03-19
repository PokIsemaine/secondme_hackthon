## 1. Demo page: call candidate API and pass peerProxyData

- [x] 1.1 In `runNegotiation` in `src/app/demo/page.tsx`, before `POST /api/negotiation`, call `POST /api/candidate` with `{ targetToken: targetPost.pin_id, posts: [{ content: targetPost.content, author: targetPost.author_name }] }`
- [x] 1.2 Capture the candidate response: `{ estimatedStrengths, estimatedNeeds, estimatedOffers, communicationStyle }`
- [x] 1.3 In the `POST /api/negotiation` body, add `peerProxyData` field containing `{ authorName: targetPost.author_name, postContent: targetPost.content, ringName: targetPost.ringName, topic: targetPost.topic || targetPost.title, estimatedStrengths, estimatedNeeds, estimatedOffers, communicationStyle }`
- [x] 1.4 In the UI render at line ~970, replace `"候选代理"` with `${targetPost.author_name}` for the `peer_proxy` speaker label

## 2. Stream route: rewrite prompt templates with post context

- [x] 2.1 Update `NEGOTIATION_TEMPLATES` function signatures in `src/app/api/negotiation/[id]/stream/route.ts` to accept a `postContext` object: `{ authorName, postContent, ringName, topic }`
- [x] 2.2 Rewrite `round1` template: add `## 用户 B 的帖子原文\n"""\n${postContent}\n"""` block, include `authorName`, `ringName`, `topic`, ask LLM to understand post and find connection to my profile
- [x] 2.3 Rewrite `round2` template: add post context block, ask LLM to infer author's potential needs from the post (1-2 sentences)
- [x] 2.4 Rewrite `round3` template: add post context block, ask LLM to propose specific value exchange based on post topic (1-2 sentences)
- [x] 2.5 Rewrite `round4` template: add post context block, ask LLM to design minimum viable collaboration action related to the post (1 sentence)
- [x] 2.6 Rewrite `round5` template: add post context block, ask for JSON decision grounded in post discussion
- [x] 2.7 Update the `roundsConfig` array to pass `postContext` from `peerProxyData` to each template function

## 3. Stream route: read post context from session

- [x] 3.1 In the GET handler of `[id]/stream/route.ts`, extract `postContext` fields from `session.peerProxyData` (they may be null for old sessions — provide graceful fallback)
- [x] 3.2 If `postContent` is missing/null, use `session.topic` as a fallback display topic and set empty string for content (backward compatibility with existing sessions)

## 4. Remove dead template code

- [x] 4.1 Remove the entire `NEGOTIATION_PROMPTS` block and its comment from `src/app/api/negotiation/route.ts`
- [x] 4.2 Remove the entire `NEGOTIATION_TEMPLATES` block and its comment from `src/app/api/negotiation/[id]/route.ts` (keep the `parseLLMResponse` helper function). Note: the POST /execute handler that referenced NEGOTIATION_TEMPLATES was also removed since it became broken dead code.

## 5. Verify end-to-end

- [ ] 5.1 Run the demo flow in browser: login → profile → AI match → select match → start negotiation
- [ ] 5.2 Confirm negotiation rounds show the author's username (not "候选代理")
- [ ] 5.3 Confirm negotiation dialogue references content from the matched post
