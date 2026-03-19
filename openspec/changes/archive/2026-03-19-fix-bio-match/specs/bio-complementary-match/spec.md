# bio-complementary-match

## ADDED Requirements

### Requirement: SSE stream parsing returns non-empty assistant message
The `/api/circle/match` endpoint SHALL correctly parse the SSE stream from SecondMe's `/api/secondme/chat/stream` and populate `assistantMessage` with the AI's full response text.

#### Scenario: SSE stream parsed correctly with newline-terminated chunks
- **WHEN** the SecondMe SSE stream delivers chunks ending with `\n`
- **THEN** `assistantMessage` SHALL contain the complete AI response text
- **AND** the match results SHALL NOT be an empty array due to parse failure

#### Scenario: SSE stream parsed correctly with partial final chunk
- **WHEN** the SSE stream delivers a final chunk without a trailing newline
- **THEN** any remaining content in the parse buffer after the read loop exits SHALL be processed
- **AND** `assistantMessage` SHALL include that final content

### Requirement: Profile payload includes bio field
The `/api/circle/match` endpoint SHALL accept a `bio?: string` field in the `profile` object of the request body.

#### Scenario: Bio is present in profile payload
- **WHEN** the request body contains `profile: { shades, soft_memories, bio: "### MBTI ###\nISTJ..." }`
- **THEN** the bio string SHALL be included in the prompt sent to the AI

#### Scenario: Bio is absent from profile payload
- **WHEN** the request body contains `profile: { shades, soft_memories }` with no bio field
- **THEN** the matching SHALL proceed using only shades and soft_memories
- **AND** no error SHALL be thrown

### Requirement: Complementary matching using bio-extracted fields
The matching prompt SHALL extract and use bio fields (MBTI, personality traits, values, overview) to perform complementary matching, distinct from the topic-similarity matching using shades/soft_memories.

#### Scenario: Complementary match found — user can help poster
- **WHEN** the user's bio describes strengths in an area that matches what a post's author is seeking
- **THEN** the match result SHALL have `complementType: "你能帮他们"`
- **AND** `matchScore` SHALL reflect the complementarity strength

#### Scenario: Complementary match found — poster can help user
- **WHEN** the post author's discussion fills a gap described in the user's bio weaknesses
- **THEN** the match result SHALL have `complementType: "他们能帮你"`
- **AND** `matchScore` SHALL reflect the complementarity strength

#### Scenario: No clear complementarity
- **WHEN** the post content is related to the user but neither clearly offers nor needs what the other has
- **THEN** the match result SHALL have `complementType: "相关"`
- **AND** `matchScore` SHALL reflect topical relevance only

### Requirement: Match results include complement type
Each entry in the `matches` array SHALL include a `complementType` field with one of: `"你能帮他们"`, `"他们能帮你"`, `"双向互补"`, or `"相关"`.

#### Scenario: Match result structure is complete
- **WHEN** the AI returns a valid JSON array for a post
- **THEN** each result object SHALL contain `index`, `score`, `complementType`, and `reason`
- **AND** `complementType` SHALL be one of the four defined values

#### Scenario: AI does not return complementType
- **WHEN** the AI returns a match result without a `complementType` field
- **THEN** the system SHALL default `complementType` to `"相关"`
