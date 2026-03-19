## Context

The `UserProfileCard` component (`src/components/UserProfileCard.tsx`) displays a user's SecondMe-generated profile. The API returns a `bio` field containing a structured Markdown document with sections like:

```markdown
### 背景与身份 ###
### 性格特征 ###
务实, 专注, 探索性强
### 价值观 ###
注重实用性, 强调效率, 关注个人发展
### MBTI ###
ISTJ
### 总体概述 ###
...
```

Currently, this is rendered as `{profile.bio}` inside a plain `<p>` tag — losing all Markdown formatting and structural meaning. Users see a wall of text with `###` symbols.

The `UserProfile` component (`src/components/UserProfile.tsx`) already has a `naturalLanguagePreview` section (lines 262-276) styled as a dedicated card with metadata footer. The `UserProfileCard` lacks equivalent treatment for its bio field.

## Goals / Non-Goals

**Goals:**
- Render `bio` as properly formatted Markdown (headers, bold, lists)
- Create a visually distinct "AI分身自我介绍" card block that signals this is AI-generated content
- Show layered hierarchy: one-line summary → key traits → detailed sections
- Maintain backward compatibility — if bio is empty or malformed, component still renders gracefully

**Non-Goals:**
- This is purely a display enhancement — no changes to API, database schema, or backend behavior
- Not building a full Markdown editor (read-only rendering only)
- Not modifying `UserProfile.tsx` or other components (only `UserProfileCard.tsx`)
- Not changing how shades/soft_memories are displayed

## Decisions

### 1. Markdown rendering library: `react-markdown` + `remark-gfm`

**Decision**: Use `react-markdown` with `remark-gfm` plugin.

**Rationale**:
- `react-markdown` is the standard React library for rendering Markdown in Next.js
- `remark-gfm` adds GitHub Flavored Markdown support (tables, strikethrough, task lists)
- Both are lightweight, tree-shakeable, and have good TypeScript support
- `react-markdown` v6+ supports Next.js App Router without issues

**Alternative considered**: `react-markdown` alone (without remark-gfm) — rejected because the bio may contain lists and other GFM syntax, and we want consistent rendering.

### 2. Bio display structure: Three-tier layout

```
┌─────────────────────────────────────────┐
│ 🧠 AI 分身自我介绍                        │
├─────────────────────────────────────────┤
│ ISTJ · 务实且专注                        │  ← Extracted summary line
│                                         │
│ 性格 务实 │ 专注 │ 探索性强  │          │  ← Key traits as chips
│ 价值观 注重实用性 │ 效率  │            │
├─────────────────────────────────────────┤
│ ## 背景与身份                           │
│ ## 性格特征                             │  ← Full Markdown sections
│ ## 价值观                               │
│ ## MBTI                                 │
│ ## 总体概述                             │
└─────────────────────────────────────────┘
```

**Implementation approach**:
- Parse the bio Markdown string
- Extract the MBTI value (via regex `/### MBTI ###\s*\n(.+)/`) → displayed as badge
- Extract the Overview content (last `###` section) → displayed as summary line
- Extract traits from `### 性格特征 ###` and `### 价值观 ###` sections → displayed as chips
- Render remaining sections as full Markdown below a divider

**Rationale**: This matches the mental model users have of "a bio" — a quick one-liner summary + optional deeper read. Mirrors the pattern already used in `UserProfile.tsx` with `naturalLanguagePreview`.

### 3. Error/empty state handling

If `bio` is:
- `null` / `undefined` / empty string → don't render the block at all (consistent with existing behavior)
- Malformed Markdown → render as plain text fallback (don't break the UI)
- Contains only short content → render as-is without expand/collapse

**Rationale**: The component already has an empty state ("点击上方按钮生成画像"). We just don't add the bio block when there's no bio.

### 4. Dependency injection point

**Decision**: Modify `UserProfileCard.tsx` to replace the existing bio section (lines 226-231) with the new `BioRenderer` component.

**Rationale**: Keeps changes minimal and localized. The bio already exists in the data model and is already being conditionally rendered — we're just enhancing the rendering, not changing the data flow.

## Risks / Trade-offs

[Risk] `react-markdown` bundle size
→ **Mitigation**: Both packages are small (~5KB each gzipped). Next.js tree-shaking will eliminate unused code. Acceptable for a display-only feature.

[Risk] Bio Markdown structure varies (not all bios have MBTI, etc.)
→ **Mitigation**: Regex extraction is lenient — if a section is missing, just don't show that specific element. The full Markdown is always rendered below as fallback.

[Risk] XSS in user-provided Markdown
→ **Mitigation**: `react-markdown` sanitizes HTML by default. No `dangerouslySetInnerHTML` used.

## Open Questions

- Should the detailed sections be collapsible (expand/collapse toggle)?
  - Default: expanded (user wants to see the full bio, that's the point)
  - Can revisit if bio content becomes very long in production
- Does `UserProfile.tsx` need the same enhancement for consistency?
  - Currently it uses `naturalLanguagePreview` which is already structured text, not Markdown
  - Not in scope for this change, but worth noting for a future pass
