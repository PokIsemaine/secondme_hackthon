## ADDED Requirements

### Requirement: Logout flow completeness
The system SHALL provide a complete logout flow that clears server-side session and client-side state, returning the user to an unauthenticated state.

#### Scenario: User clicks logout button
- **WHEN** user clicks the "退出登录" button while logged in
- **THEN** the system SHALL send a POST request to `/api/auth/logout`
- **AND** the system SHALL clear all client-side session state (profile, posts, matches, negotiationRounds, negotiationResult)
- **AND** the system SHALL set `isLoggedIn` to `false`
- **AND** the system SHALL set `demoMode` to `false`
- **AND** the system SHALL display the unauthenticated login prompt page

#### Scenario: Logout API call fails
- **WHEN** user clicks the "退出登录" button and the POST to `/api/auth/logout` fails
- **THEN** the system SHALL still clear all client-side session state
- **AND** the system SHALL still display the unauthenticated login prompt page
