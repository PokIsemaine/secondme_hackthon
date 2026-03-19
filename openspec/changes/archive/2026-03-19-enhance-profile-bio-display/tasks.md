## 1. Dependencies

- [x] 1.1 Install `react-markdown` and `remark-gfm` packages

## 2. BioRenderer Component

- [x] 2.1 Create `BioRenderer.tsx` component with Markdown rendering via react-markdown + remark-gfm
- [x] 2.2 Implement MBTI badge extraction (regex on `### MBTI ###` section)
- [x] 2.3 Implement one-line summary extraction (from `### 总体概述 ###`)
- [x] 2.4 Implement personality trait chips extraction (from `### 性格特征 ###` and `### 价值观 ###`)
- [x] 2.5 Add "AI分身自我介绍" visual label with icon
- [x] 2.6 Handle empty/malformed bio gracefully (no render, plain text fallback)

## 3. Integration

- [x] 3.1 Import BioRenderer into `UserProfileCard.tsx`
- [x] 3.2 Replace existing bio section (lines 226-231) with BioRenderer component
- [x] 3.3 Ensure existing shades, soft_memories, and other sections remain unchanged
- [x] 3.4 Verify visual hierarchy: summary line → trait chips → full Markdown below

## 4. Polish

- [x] 4.1 Style the "AI分身自我介绍" card with distinct background/accent
- [x] 4.2 Style MBTI badge as a prominent chip
- [x] 4.3 Style trait chips as inline tags
- [x] 4.4 Verify empty bio state (no block rendered when bio is empty)
- [x] 4.5 Verify malformed Markdown fallback (renders as plain text, no crash)
