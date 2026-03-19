## 1. Interface Update

- [x] 1.1 Add `ringName?: string` field to `CirclePost` interface in `src/app/demo/page.tsx`

## 2. Data Fetching

- [x] 2.1 Define `RINGS` constant array with both circle IDs and names
- [x] 2.2 Replace single `fetch` in `loadCircleContent` with `Promise.all` fetching both circles
- [x] 2.3 Annotate each fetched post with its `ringName`
- [x] 2.4 Merge results and deduplicate by `pin_id`
- [x] 2.5 Switch to `Promise.allSettled` so partial failures don't block display

## 3. UI Rendering

- [x] 3.1 Add circle label rendering in Step 1 post cards (styled chip with circle name)
- [x] 3.2 Apply distinct visual style per circle (different bg/text colors)
