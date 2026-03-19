## ADDED Requirements

### Requirement: Negotiation dialogue maintains conversation history

The negotiation system SHALL maintain a full conversation history across all 5 rounds of the A2A negotiation. Each round's prompt (rounds 2–5) SHALL include the complete content of all prior rounds, labeled by speaker.

#### Scenario: Round 2 prompt includes Round 1 content
- **WHEN** the negotiation enters Round 2
- **THEN** the LLM prompt includes a `## 对话历史` block containing the full content of Round 1, labeled as "用户 A（我的 Agent）" or "用户 B（对方 Agent）" as appropriate

#### Scenario: Round N prompt includes all prior rounds
- **WHEN** the negotiation enters Round N (3 ≤ N ≤ 5)
- **THEN** the LLM prompt includes a `## 对话历史` block containing the full content of all rounds 1 through N-1, in chronological order, each labeled by speaker

#### Scenario: Round 1 has no history
- **WHEN** the negotiation enters Round 1
- **THEN** the prompt contains no `## 对话历史` block, as no prior conversation exists
