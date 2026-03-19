## ADDED Requirements

### Requirement: SSE event parsing for SecondMe API
The system SHALL parse SSE events from SecondMe `/api/secondme/chat/stream` using the correct format `data.choices[0].delta.content`.

#### Scenario: Parse streaming content from SecondMe API
- **WHEN** SSE event `{"choices": [{"delta": {"content": "some text"}}]}` is received
- **THEN** the system SHALL extract `content` value `some text`
- **AND** the system SHALL append it to the current round's content
- **AND** the system SHALL send SSE event with `content` to client

#### Scenario: Parse round completion event
- **WHEN** SSE event `{"choices": [{"delta": null}]}` or similar end marker is received
- **THEN** the system SHALL finalize the round with accumulated content
- **AND** the system SHALL save round to database

### Requirement: peerProxyData persistence and retrieval
The system SHALL persist `peerProxyData` when creating a negotiation session and retrieve it during stream execution.

#### Scenario: Create negotiation with peerProxyData
- **WHEN** client creates negotiation with `{ topic, peerProxyData: {...} }`
- **THEN** the system SHALL save `peerProxyData` to `NegotiationSession.peerProxyData`
- **AND** the system SHALL return sessionId successfully

#### Scenario: Stream with saved peerProxyData
- **WHEN** streaming execution retrieves negotiation session
- **THEN** the system SHALL load saved `peerProxyData` from session
- **AND** the system SHALL use it to generate peer profile in prompts
- **AND** the system SHALL NOT fall back to hardcoded "未知" values
