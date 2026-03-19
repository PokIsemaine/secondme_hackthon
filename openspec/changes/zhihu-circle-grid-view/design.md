## Context

Currently, `demo/page.tsx` Step 1 renders posts from both circles in a single interleaved timeline. The `loadCircleContent()` function already fetches both circles in parallel and stores them as a merged, deduplicated array with `ringName` labels. The rendering simply maps over this flat array.

The change transforms this flat list into a side-by-side split-panel layout, keeping all fetch logic identical.

## Goals / Non-Goals

**Goals:**
- 50/50 split-panel layout with independent scroll per circle
- Each panel header: circle name, member count, refresh button
- Per-panel empty/error states
- Unified bottom AI match button (matches all combined posts)
- Responsive: on narrow screens, collapse to single column with tabs

**Non-Goals:**
- Changing fetch logic (parallel fetch already implemented)
- Changing AI matching behavior
- Adding new API routes
- Supporting more than 2 circles (only 2 are whitelisted)

## Decisions

**1. CSS Grid over Flexbox for the split layout**

Using `grid grid-cols-2 gap-4` is the cleanest way to get a true 50/50 split with equal heights. Flexbox would require additional work to ensure equal column heights.

```
div className="grid grid-cols-1 md:grid-cols-2 gap-4"
```

**2. Per-panel state: `ringPosts` as a `Record<ringId, CirclePost[]>` instead of a flat array**

Currently posts are stored as `CirclePost[]` and deduped. To support independent refresh and per-panel loading states, refactor to `Record<string, CirclePost[]>` keyed by `ringId` (or `ringName`). This avoids searching the flat array when refreshing just one circle.

Each panel also gets its own `loading` and `error` state flags.

**3. Per-panel refresh is button-based, not pull-to-refresh**

Implementing pull-to-refresh requires non-trivial touch event handling in React. A simple refresh button (↻ icon) per panel header is sufficient and consistent with the existing refresh UX elsewhere in the app (e.g., profile refresh).

**4. Responsive: `grid-cols-1` on mobile → `grid-cols-2` on md+**

On screens < 768px, show a single column with the two circles stacked (or add tab switching). For MVP, stacked single column is acceptable — the primary value is the desktop split view.

**5. `ringStyles` mapping by `ringName` is already implemented**

The existing `ringStyles` map (ring name → bg/text color) is already built in `loadCircleContent()`. Reuse it for panel header badge styling.

## Risks / Trade-offs

- [Risk] If one circle has significantly more posts than the other, the shorter column may feel sparse → Mitigation: Acceptable for MVP; column heights are independent and naturally adapt
- [Risk] Two simultaneous refresh requests on slow network → Mitigation: Per-panel loading state handles this gracefully; each panel updates independently
- [Risk] Mobile view with stacked columns becomes very long → Mitigation: Future enhancement could add tab switching for mobile

## Open Questions

1. Should the per-panel refresh button be an icon-only button or show "↻ 刷新" text?
2. On mobile, should we show tabs to switch between circles instead of stacking?
