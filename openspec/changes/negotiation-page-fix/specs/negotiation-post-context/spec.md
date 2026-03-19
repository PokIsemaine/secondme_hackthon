## ADDED Requirements

### Requirement: Negotiation round anchored in post content
Each of the five A2A negotiation rounds SHALL include the matched post's original content as context in the prompt sent to the LLM, so that generated dialogue stays relevant to the post's discussion topic rather than drifting into generic capability exchange.

#### Scenario: Round 1 prompt includes post content
- **WHEN** the stream route builds the Round 1 prompt for `my_agent`
- **THEN** the prompt SHALL contain the full post text in a `## 用户 B 的帖子原文` block, along with `authorName`, `ringName`, and `topic`

#### Scenario: Round 2 prompt includes post content
- **WHEN** the stream route builds the Round 2 prompt for `peer_proxy`
- **THEN** the prompt SHALL contain the full post text and ask the LLM to infer the author's potential needs from the post

#### Scenario: Round 3 prompt includes post content
- **WHEN** the stream route builds the Round 3 prompt for `my_agent`
- **THEN** the prompt SHALL contain the full post text and ask the LLM to propose a specific value exchange based on the post topic

#### Scenario: Round 4 prompt includes post content
- **WHEN** the stream route builds the Round 4 prompt for `peer_proxy`
- **THEN** the prompt SHALL contain the full post text and ask the LLM to design a minimum viable collaboration action related to the post

#### Scenario: Round 5 prompt includes post content
- **WHEN** the stream route builds the Round 5 prompt for `my_agent`
- **THEN** the prompt SHALL contain the full post text and ask for a JSON decision grounded in the post discussion

### Requirement: Peer proxy display name is author's username
The negotiation UI SHALL display the post author's username (e.g., "雁字回时") as the speaker label for `peer_proxy` messages, instead of the hardcoded string "候选代理".

#### Scenario: Negotiation rounds show author name
- **WHEN** the demo page renders negotiation round messages
- **THEN** the `peer_proxy` speaker label SHALL be `${targetPost.author_name}` from the selected match

### Requirement: Candidate proxy created before negotiation
Before a negotiation session is created, the demo page SHALL call `/api/candidate` with the matched post's content and `targetToken` to obtain an estimated profile (`estimatedStrengths`, `estimatedNeeds`, `estimatedOffers`, `communicationStyle`).

#### Scenario: Candidate API called with post data
- **WHEN** the user reaches the negotiation step after selecting a match
- **THEN** the demo page SHALL first call `POST /api/candidate` with `targetToken` and `posts: [{ content, author }]` for the selected match

#### Scenario: Candidate result passed as peerProxyData
- **WHEN** the demo page creates a negotiation session via `POST /api/negotiation`
- **THEN** it SHALL include `peerProxyData` containing `authorName`, `postContent`, `ringName`, `topic`, and the estimated profile fields from the candidate response

### Requirement: peerProxyData stored in negotiation session
The negotiation session SHALL store the complete `peerProxyData` (including post content and author name) in the `peerProxyData` JSON column, and the stream route SHALL read these fields to build round prompts.

#### Scenario: Session stores post context
- **WHEN** a negotiation session is created via `POST /api/negotiation`
- **THEN** the `peerProxyData` field in the session SHALL contain `authorName`, `postContent`, `ringName`, `topic`, and the estimated profile

#### Scenario: Stream route reads post context from session
- **WHEN** the stream route fetches the negotiation session
- **THEN** it SHALL read `session.peerProxyData.authorName`, `.postContent`, `.ringName`, and `.topic` to build round prompts

### Requirement: Dead template code removed
The unused `NEGOTIATION_PROMPTS` in `src/app/api/negotiation/route.ts` and the unused `NEGOTIATION_TEMPLATES` in `src/app/api/negotiation/[id]/route.ts` SHALL be removed.

#### Scenario: Dead code removed
- **WHEN** the fix is implemented
- **THEN** `route.ts` SHALL NOT contain `NEGOTIATION_PROMPTS` and `[id]/route.ts` SHALL NOT contain `NEGOTIATION_TEMPLATES`
