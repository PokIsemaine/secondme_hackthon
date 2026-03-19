## Why

The `/demo` page Step 1 (发现内容) is hardcoded to only fetch posts from the 产品经理 circle (`2001009660925334090`). Users who want to explore both supported circles must manually switch contexts. By fetching both circles simultaneously and surfacing source labels, users get a unified discovery experience that surfaces complementary opportunities across both communities without manual switching.

## What Changes

- Fetch posts from both supported circles (产品经理 + 互联网职场) in parallel on Step 1 load
- Merge and deduplicate posts by `pin_id`
- Display each post with a source label showing the circle name returned by the zhihu API (`ring_info.ring_name`), not hardcoded labels
- `/seeker` page remains as-is but is effectively superseded by the unified `/demo` flow (no migration needed)
- No changes to AI matching logic or API contracts

## Capabilities

### New Capabilities

- `dual-circle-discovery`: Fetches posts from both configured circles simultaneously and displays each post with a clear source label. Merges results into a single timeline with deduplication.

### Modified Capabilities

- `circle-discovery` (existing in demo page, not a formal spec): Expanded from single-circle to dual-circle fetch. No formal spec exists for this capability — treating as an enhancement to existing behavior.

## Impact

- **Modified**: `src/app/demo/page.tsx` — `loadCircleContent()` and post rendering in Step 1
- **No new API routes** — uses existing `/api/zhihu/ring` endpoint
- **No API contract changes** — same request/response shape
- **Seeker page**: No changes, effectively unused
