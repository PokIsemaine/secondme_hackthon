## Context

The `/demo` page Step 1 (`loadCircleContent`, lines 145-168) fetches posts from a single hardcoded circle (产品经理, `2001009660925334090`). The `CirclePost` interface (lines 18-25) has no field for circle source. The Step 1 rendering (lines 563-575) displays posts as a flat list without any circle attribution.

Two circles are supported (IDs from zhihu.md): `2001009660925334090` and `2015023739549529606`. Circle names are read from the API response (`ring_info.ring_name`), not hardcoded.

## Goals / Non-Goals

**Goals:**
- Parallel fetch of both circles on Step 1 entry
- Posts merged into a single timeline, deduplicated by `pin_id`
- Each post labeled with its source circle name

**Non-Goals:**
- No circle switching UI (single unified view)
- No changes to `/api/zhihu/ring` or `/api/circle/match`
- Seeker page is untouched (superseded by demo flow)

## Decisions

### 1. Parallel fetch via `Promise.all`

Both circles are fetched simultaneously to minimize latency:

```ts
const [res1, res2] = await Promise.all([
  fetch(`/api/zhihu/ring?ring_id=2001009660925334090&page_num=1&page_size=10`),
  fetch(`/api/zhihu/ring?ring_id=2015023739549529606&page_num=1&page_size=10`),
])
```

**Alternative**: Sequential fetch — rejected because it doubles wait time unnecessarily.

### 2. Merge and deduplicate

Results from both circles are concatenated and deduplicated by `pin_id`:

```ts
const allPosts = [...postsA, ...postsB]
const unique = allPosts.filter((post, idx, arr) =>
  arr.findIndex(p => p.pin_id === post.pin_id) === idx
)
```

**Rationale**: Occasional cross-circle cross-posting is possible. Deduplication prevents the same post from appearing twice.

### 3. `ringName` field on `CirclePost`

The `CirclePost` interface is extended with an optional `ringName?: string` field. Circle names are read from the API response's `ring_info.ring_name` field (not hardcoded):

```ts
// After parsing each response
const ringName = data.data.ring_info.ring_name  // e.g., "产品经理" from API
const postsWithRing = data.data.contents.map(post => ({
  ...post,
  ringName,
}))
```

**Alternative**: Keep `ringName` as a separate lookup map (`pin_id → ringName`) — rejected as more complex and harder to maintain across the render pass.

### 4. Ring label in UI

Each post card in Step 1 renders the `ringName` label (from API) above the author name:

```tsx
<span className="text-xs px-2 py-0.5 rounded font-medium bg-blue-100 text-blue-700">
  {post.ringName}
</span>
```

**Rationale**: Immediate visual distinction without needing to expand the post. Circle names come from the API so they are always accurate.

## Risks / Trade-offs

[Risk] One circle's fetch fails while the other succeeds
→ **Mitigation**: Use `Promise.allSettled` instead of `Promise.all` so partial results still render. Log the error but don't block the user.

[Risk] 20 posts is too many for a single scroll
→ **Mitigation**: This is the same total volume as before (10 per circle). If it becomes a problem, pagination can be added later — not in scope.

## Open Questions

None — the requirements are fully specified.
