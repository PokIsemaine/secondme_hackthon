## Why

The current dual-circle implementation (`dual-circle-discovery`) merges posts from both circles into a single interleaved timeline. This makes it hard to compare the distinct character of each circle's discussions. Separating them into a 50/50 side-by-side layout gives users immediate visual clarity on what each circle is about, and enables each column to refresh independently.

## What Changes

- Replace the unified interleaved post timeline in `/demo` Step 1 with a 50/50 side-by-side dual-panel layout
- Each panel has its own scrollable post feed with a fixed header showing: circle name, member count, and per-panel refresh button
- Each panel supports independent pull-to-refresh (or button-based refresh) — refreshing one does not affect the other
- Empty or error states show a friendly inline message within the affected panel only
- AI matching button remains at the bottom and matches against the combined posts from both circles (unchanged behavior)
- No changes to API contracts or matching logic

## Capabilities

### New Capabilities

- `circle-split-view`: Display circle posts in a 50/50 side-by-side panel layout with independent scroll and per-panel refresh. Each panel header shows circle name and member count.

### Modified Capabilities

- `dual-circle-discovery`: Change display mode from interleaved single timeline to split-panel view. No change to fetch logic (still parallel fetch), only to rendering layout.

## Impact

- **Modified**: `src/app/demo/page.tsx` — Replace the flat post list in Step 1 with a dual-panel grid layout; add per-panel refresh state management
- **No new API routes** — uses existing `/api/zhihu/ring` endpoint
- **No API contract changes** — same request/response shape
- **AI matching**: Unchanged — still matches against all posts from both circles
