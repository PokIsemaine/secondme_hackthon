## Why

The `bio` field returned from the SecondMe API is a structured Markdown document containing AI-generated sections (Background, Personality, Values, MBTI, Overview). Currently, `UserProfileCard.tsx` renders it as raw text inside a `<p>` tag, stripping all Markdown formatting and losing the hierarchical structure. Users cannot see what their "AI avatar self-introduction" actually looks like — defeating the purpose of generating the profile in the first place.

## What Changes

- **Markdown rendering**: Replace raw text rendering of `bio` with a proper Markdown parser so `###` headers, **bold**, bullet lists, and line breaks render correctly
- **AI分身自我介绍 block**: Create a dedicated, visually distinct card section for the bio — with an icon/label indicating it's the AI avatar's self-introduction, not raw user input
- **Layered visual hierarchy**: Structure the bio display in three tiers:
  1. **One-line summary** — extracted from the Overview section
  2. **Key traits** — personality, values, MBTI displayed as inline chips
  3. **Detailed sections** — the full Markdown content collapsed or expandable
- **Markdown dependency**: Add `react-markdown` (or `remark`) for rendering

## Capabilities

### New Capabilities

- `profile-bio-renderer`: A reusable bio display component that parses Markdown and renders the AI-generated self-introduction with proper visual hierarchy. Consists of:
  - Markdown rendering layer (via react-markdown)
  - Structured display with summary/traits/detail tiers
  - Visual distinction (icon + card styling) to signal AI-origin content

### Modified Capabilities

- `user-profile-display`: Enhance existing user profile display to include the new bio renderer block alongside existing fields (shades, soft_memories, etc.). No requirements change — purely visual refinement.

## Impact

- **Files modified**: `src/components/UserProfileCard.tsx`
- **Files created**: `src/components/BioRenderer.tsx` (or inline if simpler)
- **Dependencies**: `react-markdown` package added to `package.json`
- **Consistency**: Review `UserProfile.tsx` to ensure similar bio display treatment if applicable
