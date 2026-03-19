## ADDED Requirements

### Requirement: Side-by-side circle panels display

The system SHALL display posts from both supported circles in a 50/50 side-by-side dual-panel layout within the `/demo` page Step 1 (发现内容) section. Each panel occupies equal width and scrolls independently.

#### Scenario: Dual panels render on desktop
- **WHEN** the user navigates to Step 1 (发现内容) on a screen 768px or wider
- **THEN** the system displays two equal-width panels side by side using a 2-column CSS grid
- **AND** each panel shows posts from one circle only

#### Scenario: Panels stack on mobile
- **WHEN** the user navigates to Step 1 on a screen narrower than 768px
- **THEN** the system displays a single column with circles stacked vertically

### Requirement: Per-panel header with circle metadata

Each panel header SHALL display the circle name, member count, and a refresh button. The circle name SHALL be styled with the color mapping already defined in `ringStyles`.

#### Scenario: Panel header displays correct circle info
- **WHEN** the panel for a given circle renders
- **THEN** the header shows the circle's `ring_name` and `membership_num`
- **AND** the refresh button (↻) is visible in the header

#### Scenario: Refresh button triggers per-panel reload
- **WHEN** the user clicks the refresh button on Circle A's panel
- **THEN** only Circle A's posts are re-fetched and updated
- **AND** Circle B's posts remain unchanged
- **AND** Circle A's panel shows its own loading indicator

### Requirement: Per-panel loading and error states

Each panel SHALL manage its own loading and error states independently. A loading panel SHALL show an animated skeleton or spinner within that panel only. An error panel SHALL show a friendly error message within that panel only.

#### Scenario: Panel shows loading state during fetch
- **WHEN** a panel is fetching posts
- **THEN** the panel displays a centered loading animation
- **AND** the other panel remains interactive

#### Scenario: Panel shows error state on fetch failure
- **WHEN** a panel's fetch request fails
- **THEN** the panel displays an error message: "加载失败，请重试"
- **AND** the refresh button remains visible to allow retry

#### Scenario: Panel shows empty state when no posts
- **WHEN** a panel's fetch returns an empty content array
- **THEN** the panel displays: "该圈子暂无内容"

### Requirement: Unified AI match across both circles

The AI matching button at the bottom of Step 1 SHALL trigger matching against all posts collected from both circles, regardless of which panel they appear in.

#### Scenario: AI match uses combined post set
- **WHEN** the user clicks the AI matching button
- **THEN** the system sends all posts from both circles to the matching API
- **AND** results are displayed in a combined match list (Step 2)
