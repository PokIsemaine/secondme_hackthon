# dual-circle-discovery

## ADDED Requirements

### Requirement: Parallel dual-circle fetch
The system SHALL fetch posts from both supported circles (IDs `2001009660925334090` and `2015023739549529606`) in parallel when the user enters Step 1 (发现内容).

#### Scenario: Both circles fetch successfully
- **WHEN** the user navigates to Step 1 (发现内容) with network connectivity
- **THEN** posts from both circles are fetched simultaneously
- **AND** the combined posts are displayed in a single timeline

#### Scenario: One circle fetch fails
- **WHEN** one circle's API call fails (network error, timeout, or non-200 response)
- **THEN** the other circle's posts SHALL still be displayed
- **AND** the failed circle's posts are omitted from the timeline
- **AND** no error message is shown to the user (silent partial failure)

### Requirement: Posts merged and deduplicated
The system SHALL merge posts from both circles into a single list, deduplicated by `pin_id`.

#### Scenario: No duplicate posts in timeline
- **WHEN** posts from both circles are fetched
- **THEN** if a post with the same `pin_id` appears in both circles, it SHALL appear only once in the merged timeline

### Requirement: Each post displays source circle label
Each post displayed in the Step 1 timeline SHALL show a visible label indicating its source circle name, as returned by the zhihu API in the `ring_info.ring_name` field.

#### Scenario: Post shows its circle's API-returned name
- **WHEN** a post is fetched from a circle
- **THEN** a label displaying the `ring_info.ring_name` for that circle is shown on the post card

#### Scenario: Labels are visually distinguishable between circles
- **WHEN** posts from both circles are displayed
- **THEN** the labels for each circle are visually distinguishable (different colors or styles)
