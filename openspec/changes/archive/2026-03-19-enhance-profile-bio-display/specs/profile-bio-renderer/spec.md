# profile-bio-renderer

## ADDED Requirements

### Requirement: Render Markdown-formatted bio
The bio renderer SHALL parse and render Markdown content from the SecondMe API `bio` field, supporting headers (`###`), bold (`**`), bullet lists, and paragraph breaks.

#### Scenario: Bio with all sections renders correctly
- **WHEN** a user profile contains a bio with `### 背景与身份 ###`, `### 性格特征 ###`, `### 价值观 ###`, `### MBTI ###`, and `### 总体概述 ###` sections
- **THEN** all section headers render as visible `<h3>` elements, bold text renders as `<strong>`, and bullet points render as `<li>` elements

#### Scenario: Empty bio does not render block
- **WHEN** the bio field is `null`, `undefined`, or an empty string
- **THEN** the bio renderer block is not rendered at all (no empty card or placeholder)

#### Scenario: Malformed Markdown renders as plain text fallback
- **WHEN** the bio contains malformed or unparseable Markdown content
- **THEN** the component renders the content as plain text without crashing

### Requirement: Display AI-generated identity label
The bio renderer SHALL display a visual label indicating the content is the "AI分身自我介绍" (AI Avatar Self-Introduction), styled distinctly from raw user input.

#### Scenario: AI label is visible and styled
- **WHEN** the bio renderer is displayed
- **THEN** a label reading "AI分身自我介绍" is shown with an emoji icon (🧠 or similar) and distinct visual styling (e.g., purple/blue accent background)

### Requirement: Extract and display MBTI badge
The bio renderer SHALL extract the MBTI type from the `### MBTI ###` section and display it as a prominent badge/chip.

#### Scenario: MBTI value extracted and shown as badge
- **WHEN** the bio contains `### MBTI ###` followed by a value (e.g., "ISTJ")
- **THEN** a badge showing "ISTJ" is rendered in the summary line area

#### Scenario: Missing MBTI section shows no badge
- **WHEN** the bio does not contain an `### MBTI ###` section
- **THEN** no MBTI badge is rendered and no error occurs

### Requirement: Extract and display one-line summary
The bio renderer SHALL extract the content from the `### 总体概述 ###` (Overall Overview) section and display it as a one-line summary.

#### Scenario: Overview section shown as summary
- **WHEN** the bio contains `### 总体概述 ###` followed by content
- **THEN** that content is displayed as the summary line at the top of the bio block

#### Scenario: Missing Overview section
- **WHEN** the bio does not contain `### 总体概述 ###`
- **THEN** the summary line is not rendered and no error occurs

### Requirement: Extract and display personality trait chips
The bio renderer SHALL extract trait keywords from the `### 性格特征 ###` and `### 价值观 ###` sections and display them as inline chips.

#### Scenario: Traits displayed as chips
- **WHEN** the bio contains `### 性格特征 ###` followed by comma-separated traits (e.g., "务实, 专注, 探索性强")
- **THEN** each trait is rendered as a small chip/tag (e.g., `务实`, `专注`, `探索性强`)

#### Scenario: Missing trait sections
- **WHEN** the bio does not contain `### 性格特征 ###` or `### 价值观 ###`
- **THEN** no trait chips are rendered and no error occurs

### Requirement: Render full Markdown sections below traits
The bio renderer SHALL render the complete bio Markdown content (all sections) below the summary and trait chips, preserving all formatting.

#### Scenario: Full bio content visible below traits
- **WHEN** the bio renderer is expanded or in default view
- **THEN** the full Markdown content of all sections is visible below the summary line and trait chips
