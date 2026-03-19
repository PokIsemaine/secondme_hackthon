## 1. State Refactoring

- [x] 1.1 Change `posts` state from `CirclePost[]` to `Record<string, CirclePost[]>` keyed by `ringName` or `ringId`
- [x] 1.2 Add per-panel loading state: `Record<string, boolean>` for `ringLoading`
- [x] 1.3 Add per-panel error state: `Record<string, string>` for `ringErrors`
- [x] 1.4 Add per-panel data state: `ringPosts`, `ringMeta` (ring info: name, member count)

## 2. Fetch Logic Updates

- [x] 2.1 Refactor `loadCircleContent()` to populate `ringPosts`, `ringMeta`, `ringStyles` per circle
- [x] 2.2 Add `refreshRing(ringId)` function that re-fetches only that circle's posts
- [x] 2.3 Ensure `RING_IDS` constant is used consistently for both fetch and keying

## 3. UI: Dual-Panel Layout

- [x] 3.1 Replace flat post list in Step 1 with `grid grid-cols-1 md:grid-cols-2 gap-4`
- [x] 3.2 Create reusable `CirclePanel` sub-component or inline panel with: header (name + count + refresh button), scrollable post list, loading/error/empty states
- [x] 3.3 Apply `ringStyles[ringName]` colors to panel header badge
- [x] 3.4 Connect refresh button to `refreshRing(ringId)`

## 4. Per-Panel State Handling

- [x] 4.1 Show loading animation (3-dot bounce) in panel while `ringLoading[ringId]` is true
- [x] 4.2 Show error message "加载失败，请重试" in panel when `ringErrors[ringId]` is set
- [x] 4.3 Show empty message "该圈子暂无内容" when `ringPosts[ringId]` is empty array and not loading

## 5. AI Match Integration

- [x] 5.1 Flatten `ringPosts` back to `CirclePost[]` when calling AI match API
- [x] 5.2 Ensure match results still show `ringName` label per post (already in data from API)
- [x] 5.3 Verify combined post set is passed to `/api/circle/match`

## 6. Responsive Check

- [ ] 6.1 Verify dual-panel layout on desktop (>= 768px)
- [ ] 6.2 Verify single-column stacked layout on mobile (< 768px)
- [ ] 6.3 Verify both panels scroll independently
