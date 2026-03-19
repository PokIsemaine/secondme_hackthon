## ADDED Requirements

### Requirement: Match result selection
The system SHALL allow users to select one match result from the AI match list to proceed with negotiation.

#### Scenario: User selects a match
- **WHEN** user clicks on a match result card
- **THEN** the system SHALL highlight the selected card with visual feedback (border, checkmark)
- **AND** the system SHALL deselect any previously selected card
- **AND** the system SHALL store the selection

#### Scenario: User proceeds without selection
- **WHEN** user clicks "发起 Agent 协商" without explicitly selecting any match
- **THEN** the system SHALL automatically select the first match (matches[0])
- **AND** the system SHALL proceed to negotiation with the selected match

#### Scenario: User changes selection
- **WHEN** user selects a different match after previously selecting one
- **THEN** the system SHALL update the selection to the newly clicked match
- **AND** the previous selection SHALL be deselected
